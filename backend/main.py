from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from accounts import router as accounts_router
from database import attach_details, fetch_events, fetch_orgs
from gemini_service import recommend_orgs
from matching import candidate_orgs
from models import StudentProfile

# Create the backend application.
app = FastAPI()

# Allow the Next.js frontend in web/ to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://web-swart-beta-63y70l66qs.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Signed-in endpoints under /users/me: saved answers, matches and saved events.
app.include_router(accounts_router)

# Return a test message when someone visits the home URL. A small health check to make sure the backend is running.
@app.get("/")
def home():
    return {"message": "Our backend is running!"}


# Load the organizations from the TigerData database, call Gemini, and return
# the recommendations and suggestions with organization and event details.
# Nothing is saved; signed-in students use POST /users/me/matches instead.
@app.post("/recommendations")
def get_recommendations(profile: StudentProfile):
    organizations = fetch_orgs()
    answers = profile.model_dump()
    result = recommend_orgs(answers, candidate_orgs(answers, organizations))

    orgs_by_id = {org["id"]: org for org in organizations}
    matches = result["recommendations"] + result["suggestions"]
    events = fetch_events([match["org_id"] for match in matches])
    attach_details(matches, orgs_by_id, events)

    return result
