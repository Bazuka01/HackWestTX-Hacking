from contextlib import closing
from db import get_connection


# Connect to the database and print its version to confirm it is reachable.
def check_connection():
    with closing(get_connection()) as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()

    print("Successfully connected to:", db_version[0])


if __name__ == "__main__":
    check_connection()
