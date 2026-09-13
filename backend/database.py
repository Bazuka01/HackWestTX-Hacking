import os
import queue
import time
from contextlib import contextmanager
from pathlib import Path
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load the TigerData database URL from backend/.env.
load_dotenv(Path(__file__).parent / ".env")
db_url = os.getenv("TIGER_DATA_URL")

if not db_url:
    raise ValueError("TIGER_DATA_URL is missing from your .env file.")

# Opening a TigerData connection takes about 0.4s but a query on an open one
# takes about 0.05s, so finished connections wait here to be reused.
MAX_IDLE_CONNECTIONS = 5
idle_connections = queue.LifoQueue()

# A connection unused for longer than this is checked before it's reused,
# in case the server closed it in the meantime.
IDLE_CHECK_SECONDS = 60


def open_connection():
    conn = None
    while conn is None:
        try:
            conn, last_used = idle_connections.get_nowait()
        except queue.Empty:
            # Keepalives stop idle connections from being dropped by the network.
            return psycopg2.connect(
                db_url,
                keepalives=1,
                keepalives_idle=30,
                keepalives_interval=10,
                keepalives_count=3,
            )

        if time.monotonic() - last_used > IDLE_CHECK_SECONDS:
            try:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                conn.rollback()
            except psycopg2.Error:
                conn.close()
                conn = None

    return conn


def release_connection(conn):
    if conn.closed or idle_connections.qsize() >= MAX_IDLE_CONNECTIONS:
        conn.close()
    else:
        idle_connections.put((conn, time.monotonic()))


# Borrow a connection for one unit of work. Everything inside the block runs
# in a single transaction: committed if it finishes, rolled back on an error.
@contextmanager
def connect():
    conn = open_connection()
    try:
        with conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                yield cursor
    finally:
        release_connection(conn)


# Organization columns renamed to the keys used in org.json, so Gemini and the
# frontend receive organizations in the same shape as before.
ORG_FIELDS = """
    o.id,
    o.name,
    o.category,
    o.interest_tags AS "interestTags",
    o.hobby_tags AS "hobbyTags",
    o.culture_tag AS "cultureTag",
    o.contact,
    o.meeting_time AS "meetingTime",
    o.instagram_username AS "instagramUsername"
"""

# Event columns with dates and times formatted as text exactly like
# events.json, so events can be returned or passed to json.dumps as they are.
EVENT_FIELDS = """
    e.id,
    e.org_id,
    e.title,
    to_char(e.start_date, 'YYYY-MM-DD') AS start_date,
    to_char(e.end_date, 'YYYY-MM-DD') AS end_date,
    e.start_time,
    e.end_time,
    e.timezone,
    e.location,
    e.status,
    e.details_complete,
    e.source_username,
    e.source_url,
    to_char(e.source_posted_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS source_posted_at
"""

# Events count as upcoming until their last day has passed in Lubbock.
UPCOMING = "COALESCE(e.end_date, e.start_date) >= (now() AT TIME ZONE 'America/Chicago')::date"

SELECT_ORGS = f"""
SELECT {ORG_FIELDS}
FROM orgs o
ORDER BY o.id
"""

SELECT_EVENTS = f"""
SELECT {EVENT_FIELDS}
FROM events e
WHERE e.org_id = ANY(%s)
ORDER BY e.start_date, e.id
"""


# Run a query and return each row as a dictionary.
def fetch_all(query, params=None):
    with connect() as cursor:
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


# Read every organization from the orgs table.
def fetch_orgs():
    return fetch_all(SELECT_ORGS)


# Read the events hosted by the given organizations, soonest first.
def fetch_events(org_ids):
    return fetch_all(SELECT_EVENTS, (list(org_ids),))


# Add each organization's details and events to a list of Gemini matches
# ({"org_id", "reason"} items).
def attach_details(matches, orgs_by_id, events):
    for match in matches:
        org_id = match["org_id"]
        match["organization"] = orgs_by_id.get(org_id)
        match["events"] = [event for event in events if event["org_id"] == org_id]
    return matches
