from contextlib import closing

from db import get_connection


def check_connection():
    """Verify that the configured database is reachable."""
    with closing(get_connection()) as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()

    print("Successfully connected to:", db_version[0])


if __name__ == "__main__":
    check_connection()
