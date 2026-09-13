from contextlib import closing

from db import get_connection

# Sample data representing distinct campus groups
ORGS = [
    ("National Society of Black Engineers", "Engineering/Professional", "Supporting the academic and professional success of Black engineering students.", "Thursdays at 6 PM"),
    ("ASME Robotics Team", "Engineering/Competition", "Designing autonomous robotic platforms for the PODIUM Student Design Competition.", "Saturdays at 10 AM, Product Design Lab"),
    ("Texas Society of Professional Engineers", "Professional/Networking", "Connecting student engineers with industry professionals and outreach programs.", "Tuesdays at 7 PM"),
    ("Campus Calisthenics & Lifting", "Athletics", "Group training focused on L-sit progressions, barbell lifts, and track sprints.", "Daily at the Rec Center"),
]

# ON CONFLICT makes re-seeding safe: rerunning this script will not duplicate rows.
INSERT_QUERY = """
INSERT INTO campus_orgs (org_name, category, description, meeting_info)
VALUES (%s, %s, %s, %s)
ON CONFLICT (org_name) DO NOTHING
"""


def seed_database():
    with closing(get_connection()) as conn:
        with conn, conn.cursor() as cursor:
            cursor.executemany(INSERT_QUERY, ORGS)
            inserted = cursor.rowcount

    skipped = len(ORGS) - inserted
    print(f"Seeding complete: {inserted} inserted, {skipped} already present.")


if __name__ == "__main__":
    seed_database()
