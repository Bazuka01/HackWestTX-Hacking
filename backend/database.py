import os
from contextlib import closing
from pathlib import Path
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load the TigerData database URL from backend/.env.
load_dotenv(Path(__file__).parent / ".env")
db_url = os.getenv("TIGER_DATA_URL")

if not db_url:
    raise ValueError("TIGER_DATA_URL is missing from your .env file.")

# Rename the columns to the keys used in org.json, so Gemini receives
# organizations in the same shape as before.
SELECT_ORGS = """
SELECT
    id,
    name,
    category,
    interest_tags AS "interestTags",
    hobby_tags AS "hobbyTags",
    culture_tag AS "cultureTag",
    contact,
    meeting_time AS "meetingTime",
    instagram_username AS "instagramUsername"
FROM orgs
ORDER BY id
"""

# Format dates and times as text exactly like events.json, so events
# can be returned or passed to json.dumps as they are.
SELECT_EVENTS = """
SELECT
    id,
    org_id,
    title,
    to_char(start_date, 'YYYY-MM-DD') AS start_date,
    to_char(end_date, 'YYYY-MM-DD') AS end_date,
    start_time,
    end_time,
    timezone,
    location,
    status,
    details_complete,
    source_username,
    source_url,
    to_char(source_posted_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS source_posted_at
FROM events
WHERE org_id = ANY(%s)
ORDER BY start_date, id
"""


# Run a query and return each row as a dictionary.
def fetch_all(query, params=None):
    with closing(psycopg2.connect(db_url)) as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]


# Read every organization from the orgs table.
def fetch_orgs():
    return fetch_all(SELECT_ORGS)


# Read the events hosted by the given organizations, soonest first.
def fetch_events(org_ids):
    return fetch_all(SELECT_EVENTS, (list(org_ids),))
