from contextlib import closing

import psycopg2

from db import get_connection

CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS campus_orgs (
    id SERIAL PRIMARY KEY,
    org_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    meeting_info TEXT,
    CONSTRAINT campus_orgs_org_name_key UNIQUE (org_name)
);
"""

# Brings tables created before the UNIQUE constraint existed up to date.
# A fresh CREATE TABLE above already builds this index, so this is a no-op there.
CREATE_UNIQUE_INDEX = """
CREATE UNIQUE INDEX IF NOT EXISTS campus_orgs_org_name_key
    ON campus_orgs (org_name);
"""

DEDUPE_HINT = """
The campus_orgs table already contains duplicate org_name values, so the
unique index could not be created. Remove the duplicates, keeping the
earliest row of each name:

    DELETE FROM campus_orgs a
    USING campus_orgs b
    WHERE a.id > b.id AND a.org_name = b.org_name;

Then run this script again.
"""


def create_tables():
    with closing(get_connection()) as conn:
        with conn, conn.cursor() as cursor:
            cursor.execute(CREATE_TABLE)
        print("Table 'campus_orgs' is ready.")

        try:
            with conn, conn.cursor() as cursor:
                cursor.execute(CREATE_UNIQUE_INDEX)
        except psycopg2.errors.UniqueViolation:
            print(DEDUPE_HINT)
        else:
            print("Unique index on org_name is in place.")


if __name__ == "__main__":
    create_tables()
