from fastapi import FastAPI
from pydantic import BaseModel
from database import fetch_orgs
from gemini_service import recommend_orgs

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


# Load the organizations from the TigerData database, call Gemini, and return the three matches.
@app.post("/recommendations")
def get_recommendations(profile: StudentProfile):
    organizations = fetch_orgs()
    return recommend_orgs(profile.model_dump(), organizations)
