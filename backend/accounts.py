import os
import secrets
from pathlib import Path
from typing import Literal
from urllib.parse import unquote
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, Header, HTTPException, Response
from psycopg2.extras import execute_values
from pydantic import BaseModel
from database import (
    EVENT_FIELDS,
    ORG_FIELDS,
    UPCOMING,
    attach_details,
    connect,
    fetch_orgs,
)
from gemini_service import recommend_orgs
from matching import candidate_orgs
from models import StudentProfile

# Load the key the Next.js server uses to call these endpoints.
load_dotenv(Path(__file__).parent / ".env")
internal_api_key = os.getenv("INTERNAL_API_KEY")

if not internal_api_key:
    raise ValueError("INTERNAL_API_KEY is missing from your .env file.")

router = APIRouter(prefix="/users/me")


class User(BaseModel):
    id: str
    email: str | None = None
    name: str | None = None


# The Next.js server signs students in with Auth0 and calls these endpoints on
# their behalf. It proves it's the caller with the shared INTERNAL_API_KEY and
# names the user in the X-User-* headers, so the key must never reach a browser.
def current_user(
    x_internal_api_key: str | None = Header(default=None),
    x_user_id: str | None = Header(default=None),
    x_user_email: str | None = Header(default=None),
    x_user_name: str | None = Header(default=None),
) -> User:
    if not x_internal_api_key or not secrets.compare_digest(
        x_internal_api_key.encode(), internal_api_key.encode()
    ):
        raise HTTPException(status_code=401, detail="Invalid internal API key.")

    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing X-User-Id header.")

    # Values are URL-encoded so names with accents survive HTTP headers.
    return User(
        id=unquote(x_user_id),
        email=unquote(x_user_email) if x_user_email else None,
        name=unquote(x_user_name) if x_user_name else None,
    )


# Create the account on first use and keep its email and name current.
UPSERT_USER = """
INSERT INTO users (id, email, name)
VALUES (%(id)s, %(email)s, %(name)s)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = now()
WHERE (users.email, users.name) IS DISTINCT FROM (EXCLUDED.email, EXCLUDED.name)
"""

SELECT_PROFILE = """
SELECT major, interests, hobbies, class_year, ethnicity
FROM student_profiles
WHERE user_id = %s
"""

UPSERT_PROFILE = """
INSERT INTO student_profiles (user_id, major, interests, hobbies, class_year, ethnicity)
VALUES (%(user_id)s, %(major)s, %(interests)s, %(hobbies)s, %(class_year)s, %(ethnicity)s)
ON CONFLICT (user_id) DO UPDATE SET
    major = EXCLUDED.major,
    interests = EXCLUDED.interests,
    hobbies = EXCLUDED.hobbies,
    class_year = EXCLUDED.class_year,
    ethnicity = EXCLUDED.ethnicity,
    updated_at = now()
"""

# Organizations marked "Not interested" stay stored but are left out, so
# showing them again brings the match back.
SELECT_MATCHES = """
SELECT kind, org_id, reason
FROM user_matches m
WHERE m.user_id = %(user_id)s
  AND NOT EXISTS (
    SELECT 1 FROM hidden_orgs h WHERE h.user_id = m.user_id AND h.org_id = m.org_id
  )
ORDER BY kind, rank
"""

SELECT_MATCHED_ORG_IDS = "SELECT org_id FROM user_matches WHERE user_id = %s"

SELECT_HIDDEN_ORG_IDS = "SELECT org_id FROM hidden_orgs WHERE user_id = %s"

SELECT_ORG = "SELECT 1 FROM orgs WHERE id = %s"

HIDE_ORG = """
INSERT INTO hidden_orgs (user_id, org_id)
VALUES (%s, %s)
ON CONFLICT DO NOTHING
"""

UNHIDE_ORG = "DELETE FROM hidden_orgs WHERE user_id = %s AND org_id = %s"

SELECT_ALL_ORGS = f"""
SELECT {ORG_FIELDS}
FROM orgs o
ORDER BY o.name
"""

SELECT_ALL_UPCOMING_EVENTS = f"""
SELECT {EVENT_FIELDS}
FROM events e
WHERE {UPCOMING}
ORDER BY e.start_date, e.id
"""

SELECT_SAVED_EVENT_IDS = "SELECT event_id FROM saved_events WHERE user_id = %s"

DELETE_MATCHES = "DELETE FROM user_matches WHERE user_id = %s"

INSERT_MATCHES = """
INSERT INTO user_matches (user_id, org_id, kind, rank, reason)
VALUES %s
"""

SELECT_ORGS_BY_ID = f"""
SELECT {ORG_FIELDS}
FROM orgs o
WHERE o.id = ANY(%s)
"""

SELECT_UPCOMING_EVENTS = f"""
SELECT {EVENT_FIELDS}
FROM events e
WHERE e.org_id = ANY(%s) AND {UPCOMING}
ORDER BY e.start_date, e.id
"""

SELECT_SAVED_EVENTS = f"""
SELECT {EVENT_FIELDS}, o.name AS org_name
FROM saved_events s
JOIN events e ON e.id = s.event_id
JOIN orgs o ON o.id = e.org_id
WHERE s.user_id = %s
ORDER BY e.start_date, e.id
"""

SELECT_EVENT = "SELECT 1 FROM events WHERE id = %s"

SAVE_EVENT = """
INSERT INTO saved_events (user_id, event_id)
VALUES (%s, %s)
ON CONFLICT DO NOTHING
"""

UNSAVE_EVENT = "DELETE FROM saved_events WHERE user_id = %s AND event_id = %s"


def upsert_user(cursor, user):
    cursor.execute(UPSERT_USER, user.model_dump())


def read_profile(cursor, user_id):
    cursor.execute(SELECT_PROFILE, (user_id,))
    row = cursor.fetchone()
    return dict(row) if row else None


# The saved matches, each with its organization's details and upcoming events.
def read_matches(cursor, user_id):
    cursor.execute(SELECT_MATCHES, {"user_id": user_id})
    rows = [dict(row) for row in cursor.fetchall()]
    if not rows:
        return {"recommendations": [], "suggestions": []}

    org_ids = [row["org_id"] for row in rows]
    cursor.execute(SELECT_ORGS_BY_ID, (org_ids,))
    orgs_by_id = {org["id"]: dict(org) for org in cursor.fetchall()}
    cursor.execute(SELECT_UPCOMING_EVENTS, (org_ids,))
    events = [dict(event) for event in cursor.fetchall()]

    matches = [{"org_id": row["org_id"], "reason": row["reason"]} for row in rows]
    attach_details(matches, orgs_by_id, events)

    return {
        "recommendations": [
            match for match, row in zip(matches, rows) if row["kind"] == "recommendation"
        ],
        "suggestions": [
            match for match, row in zip(matches, rows) if row["kind"] == "suggestion"
        ],
    }


# Return the student's saved answers, or null before onboarding.
@router.get("/profile")
def get_profile(user: User = Depends(current_user)):
    with connect() as cursor:
        return {"profile": read_profile(cursor, user.id)}


# Save the onboarding answers. Changed answers clear the old matches, so the
# next POST /users/me/matches asks Gemini again.
@router.put("/profile")
def save_profile(profile: StudentProfile, user: User = Depends(current_user)):
    answers = profile.model_dump()

    with connect() as cursor:
        upsert_user(cursor, user)
        if read_profile(cursor, user.id) != answers:
            cursor.execute(UPSERT_PROFILE, {"user_id": user.id, **answers})
            cursor.execute(DELETE_MATCHES, (user.id,))

    return {"profile": answers}


def read_ids(cursor, query, user_id):
    cursor.execute(query, (user_id,))
    return [next(iter(row.values())) for row in cursor.fetchall()]


# The languages the frontend offers, and their names for the Gemini prompt.
LANGUAGE_NAMES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "hi": "Hindi",
    "pt": "Portuguese",
}


class MatchesRequest(BaseModel):
    # True asks Gemini for different organizations than the current matches.
    refresh: bool = False
    # The language the reasons are written in.
    language: Literal["en", "es", "fr", "hi", "pt"] = "en"


# Return the saved matches, asking Gemini for new ones if there are none or
# the student asked for new picks.
@router.post("/matches")
def get_or_create_matches(
    request: MatchesRequest | None = None, user: User = Depends(current_user)
):
    request = request or MatchesRequest()

    with connect() as cursor:
        profile = read_profile(cursor, user.id)
        matches = read_matches(cursor, user.id)
        hidden_ids = read_ids(cursor, SELECT_HIDDEN_ORG_IDS, user.id)
        current_ids = read_ids(cursor, SELECT_MATCHED_ORG_IDS, user.id)

    if profile is None:
        raise HTTPException(
            status_code=409, detail="Save your profile before requesting matches."
        )

    if matches["recommendations"] and not request.refresh:
        return matches

    # Leave out hidden organizations, and the current picks when asking for new ones.
    exclude_ids = set(hidden_ids) | (set(current_ids) if request.refresh else set())
    candidates = candidate_orgs(profile, fetch_orgs(), exclude_ids)

    # Gemini takes a few seconds, so call it without holding a connection.
    result = recommend_orgs(profile, candidates, LANGUAGE_NAMES[request.language])
    rows = [
        (user.id, item["org_id"], kind, rank, item["reason"])
        for kind, key in (("recommendation", "recommendations"), ("suggestion", "suggestions"))
        for rank, item in enumerate(result[key], start=1)
    ]

    with connect() as cursor:
        upsert_user(cursor, user)
        # Replace rather than add, in case another request saved matches meanwhile.
        cursor.execute(DELETE_MATCHES, (user.id,))
        execute_values(cursor, INSERT_MATCHES, rows)
        return read_matches(cursor, user.id)


# Everything the signed-in pages show: answers, matches and saved events.
@router.get("/dashboard")
def get_dashboard(user: User = Depends(current_user)):
    with connect() as cursor:
        profile = read_profile(cursor, user.id)
        matches = read_matches(cursor, user.id)
        cursor.execute(SELECT_SAVED_EVENTS, (user.id,))
        saved_events = [dict(row) for row in cursor.fetchall()]

    return {"profile": profile, **matches, "saved_events": saved_events}


@router.put("/saved-events/{event_id}")
def save_event(event_id: str, user: User = Depends(current_user)):
    with connect() as cursor:
        cursor.execute(SELECT_EVENT, (event_id,))
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Event not found.")

        upsert_user(cursor, user)
        cursor.execute(SAVE_EVENT, (user.id, event_id))

    return Response(status_code=204)


@router.delete("/saved-events/{event_id}")
def unsave_event(event_id: str, user: User = Depends(current_user)):
    with connect() as cursor:
        cursor.execute(UNSAVE_EVENT, (user.id, event_id))

    return Response(status_code=204)


# "Not interested": leave the organization out of matches and new picks.
@router.put("/hidden-orgs/{org_id}")
def hide_org(org_id: str, user: User = Depends(current_user)):
    with connect() as cursor:
        cursor.execute(SELECT_ORG, (org_id,))
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Organization not found.")

        upsert_user(cursor, user)
        cursor.execute(HIDE_ORG, (user.id, org_id))

    return Response(status_code=204)


@router.delete("/hidden-orgs/{org_id}")
def unhide_org(org_id: str, user: User = Depends(current_user)):
    with connect() as cursor:
        cursor.execute(UNHIDE_ORG, (user.id, org_id))

    return Response(status_code=204)


# Every organization with its upcoming events, for browsing and search, plus
# which ones are the student's matches, hidden, or have saved events.
@router.get("/orgs")
def browse_orgs(user: User = Depends(current_user)):
    with connect() as cursor:
        cursor.execute(SELECT_ALL_ORGS)
        orgs = [dict(org) for org in cursor.fetchall()]
        cursor.execute(SELECT_ALL_UPCOMING_EVENTS)
        events = [dict(event) for event in cursor.fetchall()]
        matches = read_matches(cursor, user.id)
        hidden_ids = read_ids(cursor, SELECT_HIDDEN_ORG_IDS, user.id)
        saved_ids = read_ids(cursor, SELECT_SAVED_EVENT_IDS, user.id)

    events_by_org = {}
    for event in events:
        events_by_org.setdefault(event["org_id"], []).append(event)
    for org in orgs:
        org["events"] = events_by_org.get(org["id"], [])

    return {
        "orgs": orgs,
        "matched_org_ids": [
            match["org_id"] for match in matches["recommendations"] + matches["suggestions"]
        ],
        "hidden_org_ids": hidden_ids,
        "saved_event_ids": saved_ids,
    }
