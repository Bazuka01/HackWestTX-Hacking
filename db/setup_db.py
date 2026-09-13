from contextlib import closing
from db import get_connection

# Create the orgs table in the same shape as backend/org.json.
# Column names use snake_case and tag lists are text arrays, matching the
# table backend/seedOrgs.js writes to.
CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS orgs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    interest_tags TEXT[] NOT NULL DEFAULT '{}',
    hobby_tags TEXT[] NOT NULL DEFAULT '{}',
    culture_tag TEXT,
    contact TEXT,
    meeting_time TEXT
);
"""


def create_tables():
    with closing(get_connection()) as conn:
        with conn, conn.cursor() as cursor:
            cursor.execute(CREATE_TABLE)

    print("Table 'orgs' is ready.")


if __name__ == "__main__":
    create_tables()
