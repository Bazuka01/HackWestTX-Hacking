# ConnectX
Find your place. Build your circle.

ConnectX is a campus organization and event discovery platform. It helps incoming students find communities that match their major, interests, hobbies, and optional cultural preferences—without searching through scattered social-media pages and university directories.

The problem

Information about campus organizations is often spread across Instagram, university portals, flyers, and word of mouth. New students may not know what to search for, and scrolling through dozens of accounts makes relevant opportunities easy to miss.

ConnectX gives each student a short, personalized list of organizations and a focused calendar of upcoming events.

Features

Secure login and signup through Auth0

Student questionnaire covering major, interests, and hobbies

Optional class-year and cultural-identity preferences

Three primary organization recommendations

Two or three secondary suggestions that explore additional interests

One-sentence explanation for every match

Calendar of relevant upcoming events

Organization and event data stored in TigerData

Structured Gemini output restricted to verified organization IDs

How it works

The React frontend collects the student's preferences.

The frontend sends the profile to the FastAPI backend as JSON.

FastAPI retrieves the available organizations from TigerData.

The backend supplies the student profile and verified organization records to Gemini.

Gemini selects the strongest matches and returns structured organization IDs with explanations.

The backend attaches trusted organization data and sends the result to the frontend.

Upcoming events are retrieved separately for the calendar.

Gemini does not invent organizations or act as the source of truth. Its response schema limits it to IDs supplied by the backend, while TigerData stores the authoritative organization and event information.

Tech stack

Frontend

React / Next.js

JavaScript

Auth0

CSS

Figma

Backend

Python

FastAPI

Uvicorn

Pydantic

Google Gemini API

Data

TigerData / PostgreSQL

Organization and event datasets

Deployment

Vercel

Project structure

ConnectX/
├── backend/
│   ├── main.py
│   ├── gemini_service.py
│   ├── database.py
│   ├── requirements.txt
│   └── .env.example
├── web/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md

The exact frontend folders may vary depending on the current Next.js structure.

Running locally

Prerequisites

Python 3.12 or newer

Node.js and npm

Gemini API key

TigerData PostgreSQL connection URL

Auth0 application credentials

Backend setup

From the repository root:

cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt

Create backend/back.env and add:

GEMINI_API_KEY=your_gemini_api_key
TIGER_DATA_URL=your_tigerdata_connection_url

Do not commit this file or any real credentials.

Start the backend:

python -m uvicorn main:app --reload

The API will be available at:

http://127.0.0.1:8000

FastAPI's interactive documentation is available at:

http://127.0.0.1:8000/docs

Frontend setup

Open another terminal from the repository root:

cd web
npm install
npm run dev

Add the required Auth0 settings and backend URL to the frontend environment file. The variable names must match those used by the frontend code.

Example:

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_AUTH0_DOMAIN=your_auth0_domain
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_auth0_client_id

Then open:

http://localhost:3000

API overview

Health check

GET /

Example response:

{
  "message": "Our backend is running!"
}

Organization recommendations

POST /recommendations

Example request:

{
  "major": "Computer Science",
  "interests": ["technology", "community service"],
  "hobbies": ["gaming", "drawing"],
  "class_year": "Freshman",
  "ethnicity": null
}

The endpoint returns primary recommendations and secondary suggestions containing verified organization IDs and personalized explanations.

Recommendation safeguards

Gemini receives only organizations supplied by the backend.

The JSON schema restricts responses to valid organization IDs.

All recommendations must be distinct.

Organization details come from TigerData rather than generated text.

Cultural identity is optional and used only as a positive matching preference.

Events are displayed only when they exist in the event dataset.

Data pipeline

ConnectX keeps organization profiles and events as separate datasets.

Organization records contain fields such as:

Name and category

Interest and hobby tags

Optional cultural tag

Contact and meeting information

Event records contain fields such as:

Associated organization ID

Title, date, and time

Location and status

Original public source

For the prototype, public event information was cleaned, matched to organization IDs, and filtered to remove expired, canceled, postponed, and non-event posts.

Limitations

Organization and event information may become outdated.

Some organizations do not consistently publish events online.

Gemini requests are subject to latency and rate limits.

The current dataset covers a limited number of organizations.

Recommendation quality depends on the completeness of organization tags.

Future improvements

Organization dashboards for self-service updates and verification

Last-verified timestamps and automatic stale-data warnings

Scheduled event-ingestion and moderation pipeline

Deterministic recommendation fallback when Gemini is unavailable

Recommendation caching to reduce cost and latency

Student feedback on recommendation quality

Walking directions and interactive campus building maps

Calendar export and personalized event notifications

Security

API keys and database credentials are stored in environment variables.

Secret environment files are excluded through .gitignore.

Authentication is handled by Auth0.

Gemini and TigerData credentials remain on the backend and are never exposed through public frontend variables.

Team

ConnectX was created as a collaborative HackWesTX project by a team working across frontend development, backend APIs, database integration, authentication, design, and event-data collection.

License

This project was created as a hackathon prototype. Add your team's preferred license before distributing or reusing the project publicly.
