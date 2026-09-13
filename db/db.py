import os
from pathlib import Path
import psycopg2
from dotenv import load_dotenv

# Use the same environment file as the backend application.
load_dotenv(Path(__file__).parent.parent / "backend" / ".env")


# Open a connection to the ConnectX database.
def get_connection():
    db_url = os.getenv("TIGER_DATA_URL")

    # Stop with a clear message instead of a confusing connection error.
    if not db_url:
        raise ValueError("TIGER_DATA_URL is missing from your .env file.")

    return psycopg2.connect(db_url)
