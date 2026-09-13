import json
from pathlib import Path
from fastapi import FastAPI
from pydantic import BaseModel
from gemini_service import recommend_orgs

# Load the actual organization list from our JSON file.
with (Path(__file__).parent / "org.json").open(
    encoding="utf-8"
) as file:
    organizations = json.load(file)

# Load the actual event list from our JSON file.
with (Path(__file__).parent / "events.json").open(
    encoding="utf-8"
) as file:
    events = json.load(file)

# Create the backend application.
app = FastAPI()

# Return a test message when someone visits the home URL. A small health check to make sure the backend is running.
@app.get("/")
def home():
    return {"message": "Our backend is running!"}

# Define the student answers this endpoint accepts.
class StudentProfile(BaseModel):
    major: str
    interests: list[str]
    hobbies: list[str]
    class_year: str | None = None
    ethnicity: str | None = None


# Receive answers, call Gemini, and return the recommendations with organization and event details.
@app.post("/recommendations")
def get_recommendations(profile: StudentProfile):
    result = recommend_orgs(profile.model_dump(), organizations)

    for recommendation in result["recommendations"]:
        org_id = recommendation["org_id"]

        recommendation["organization"] = next(
            (org for org in organizations if org["id"] == org_id),
            None
        )

        recommendation["events"] = [
            event for event in events
            if event["org_id"] == org_id
        ]

    return result