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

# Create the backend application.
app = FastAPI()

# Return a test message when someone visits the home URL.
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


# Receive answers, call Gemini, and return the three matches.
@app.post("/recommendations")
def get_recommendations(profile: StudentProfile):
    return recommend_orgs(profile.model_dump(), organizations)