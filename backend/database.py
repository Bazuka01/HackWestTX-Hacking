import os
from contextlib import closing
from pathlib import Path
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load the TigerData database URL from the .env file in the project root.
load_dotenv(Path(__file__).parent.parent / ".env")
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
    meeting_time AS "meetingTime"
FROM orgs
ORDER BY id
"""


# Read every organization from the orgs table.
def fetch_orgs():
    with closing(psycopg2.connect(db_url)) as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(SELECT_ORGS)
            return [dict(row) for row in cursor.fetchall()]
