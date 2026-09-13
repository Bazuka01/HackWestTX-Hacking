import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    """Open a connection to the ConnectX database.

    Raises RuntimeError if TIGER_DATA_URL is missing so a config problem
    reports itself clearly instead of surfacing as a connection error.
    """
    db_url = os.environ.get("TIGER_DATA_URL")
    if not db_url:
        raise RuntimeError(
            "TIGER_DATA_URL is not set. Copy .env.example to .env and fill in "
            "your database connection string."
        )
    return psycopg2.connect(db_url)
