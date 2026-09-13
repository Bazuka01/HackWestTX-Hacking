from contextlib import closing
from db import get_connection

# Create the orgs table in the same shape as backend/org.json.
# Column names use snake_case and tag lists are text arrays.
CREATE_ORGS_TABLE = """
CREATE TABLE IF NOT EXISTS orgs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    interest_tags TEXT[] NOT NULL DEFAULT '{}',
    hobby_tags TEXT[] NOT NULL DEFAULT '{}',
    culture_tag TEXT,
    contact TEXT,
    meeting_time TEXT,
    instagram_username TEXT UNIQUE
);
"""

# Add the Instagram column to orgs tables created before it existed.
# A fresh table above already has it, so this does nothing there.
ADD_INSTAGRAM_COLUMN = """
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS instagram_username TEXT UNIQUE;
"""

# Create the events table in the same shape as backend/events.json.
# Deleting an organization also deletes its events.
CREATE_EVENTS_TABLE = """
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES orgs (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TEXT,
    end_time TEXT,
    timezone TEXT NOT NULL DEFAULT 'America/Chicago',
    location TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled',
    details_complete BOOLEAN NOT NULL DEFAULT FALSE,
    source_username TEXT,
    source_url TEXT,
    source_posted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS events_org_id_idx ON events (org_id);
"""


def create_tables():
    with closing(get_connection()) as conn:
        with conn, conn.cursor() as cursor:
            cursor.execute(CREATE_ORGS_TABLE)
            cursor.execute(ADD_INSTAGRAM_COLUMN)
            cursor.execute(CREATE_EVENTS_TABLE)

    print("Tables 'orgs' and 'events' are ready.")


if __name__ == "__main__":
    create_tables()
