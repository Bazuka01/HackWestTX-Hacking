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

# Accounts. The id is the Auth0 user id (e.g. "auth0|abc123"), so there are
# no passwords here; Auth0 handles sign in.
CREATE_USERS_TABLE = """
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT,
    name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""

# The onboarding answers, one row per user.
CREATE_STUDENT_PROFILES_TABLE = """
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    major TEXT NOT NULL,
    class_year TEXT,
    ethnicity TEXT,
    interests TEXT[] NOT NULL DEFAULT '{}',
    hobbies TEXT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""

# The organizations on each user's home page: Gemini's 3 recommendations and
# 2-3 suggestions (in the order Gemini ranked them), plus ones the user added
# from Browse. Kept organizations stay when the user gets new picks or changes
# their answers; the rest are replaced.
CREATE_USER_MATCHES_TABLE = """
CREATE TABLE IF NOT EXISTS user_matches (
    user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    org_id TEXT NOT NULL REFERENCES orgs (id) ON DELETE CASCADE,
    kind TEXT NOT NULL CONSTRAINT user_matches_kind_check
        CHECK (kind IN ('recommendation', 'suggestion', 'added')),
    rank SMALLINT NOT NULL,
    -- Gemini's explanation; empty for organizations the user added.
    reason TEXT,
    kept BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, org_id)
);
"""

# Bring user_matches tables created before "Keep" and "Add" up to date.
# On a fresh table these change nothing.
UPGRADE_USER_MATCHES_TABLE = """
ALTER TABLE user_matches ADD COLUMN IF NOT EXISTS kept BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE user_matches ALTER COLUMN reason DROP NOT NULL;
ALTER TABLE user_matches DROP CONSTRAINT IF EXISTS user_matches_kind_check;
ALTER TABLE user_matches ADD CONSTRAINT user_matches_kind_check
    CHECK (kind IN ('recommendation', 'suggestion', 'added'));
"""

# Events each user saved.
CREATE_SAVED_EVENTS_TABLE = """
CREATE TABLE IF NOT EXISTS saved_events (
    user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    event_id TEXT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, event_id)
);
"""

# Organizations each user marked "Not interested". They're left out of the
# user's matches and of new picks until the user shows them again.
CREATE_HIDDEN_ORGS_TABLE = """
CREATE TABLE IF NOT EXISTS hidden_orgs (
    user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    org_id TEXT NOT NULL REFERENCES orgs (id) ON DELETE CASCADE,
    hidden_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, org_id)
);
"""


def create_tables():
    with closing(get_connection()) as conn:
        with conn, conn.cursor() as cursor:
            cursor.execute(CREATE_ORGS_TABLE)
            cursor.execute(ADD_INSTAGRAM_COLUMN)
            cursor.execute(CREATE_EVENTS_TABLE)
            cursor.execute(CREATE_USERS_TABLE)
            cursor.execute(CREATE_STUDENT_PROFILES_TABLE)
            cursor.execute(CREATE_USER_MATCHES_TABLE)
            cursor.execute(UPGRADE_USER_MATCHES_TABLE)
            cursor.execute(CREATE_SAVED_EVENTS_TABLE)
            cursor.execute(CREATE_HIDDEN_ORGS_TABLE)

    print(
        "Tables 'orgs', 'events', 'users', 'student_profiles', "
        "'user_matches', 'saved_events' and 'hidden_orgs' are ready."
    )


if __name__ == "__main__":
    create_tables()
