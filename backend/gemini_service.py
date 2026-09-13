import os
import json
from pathlib import Path

from dotenv import load_dotenv
from google import genai


# Load the API key from .env and create the Gemini client.
load_dotenv(Path(__file__).parent / ".env")
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError(
        "GEMINI_API_KEY is missing from your .env file."
    )

client = genai.Client(api_key=api_key)


def recommend_orgs(student_profile, organizations):
    # Combine the student's answers and organizations into one prompt.
    prompt = f"""
    Select organizations for this student.

    Return:
    - Exactly 3 primary recommendations representing the strongest matches.
    - Return 2 or 3 secondary suggestions based on interests or hobbies not
      fully represented by the primary recommendations.

    All returned organizations must be distinct.
    Use only organizations from the supplied list.
    Consider the student's major, interests, and hobbies.
    Class year and ethnicity are optional.

    If ethnicity is provided, use it only to identify relevant cultural
    communities. Do not exclude the student from other organizations or make
    assumptions based on ethnicity.

    Do not invent organization information.
    Return each organization's ID and a one-sentence explanation.

    Student profile:
    {json.dumps(student_profile)}

    Available organizations:
    {json.dumps(organizations)}
    """

    # Make one Gemini call and require structured JSON.
    response = client.interactions.create(
        model="gemini-3.5-flash-lite",
        input=prompt,
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": {
                "type": "object",
                "properties": {
                    "recommendations": {
                        "type": "array",
                        "minItems": 3,
                        "maxItems": 3,
                        "items": {
                            "type": "object",
                            "properties": {
                                "org_id": {
                                    "type": "string",
                                    "enum": [
                                        org["id"]
                                        for org in organizations
                                    ]
                                },
                                "reason": {
                                    "type": "string"
                                }
                            },
                            "required": [
                                "org_id",
                                "reason"
                            ],
                            "additionalProperties": False
                        }
                    },
                    "suggestions": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 3,
                        "items": {
                            "type": "object",
                            "properties": {
                                "org_id": {
                                    "type": "string",
                                    "enum": [
                                        org["id"]
                                        for org in organizations
                                    ]
                                },
                                "reason": {
                                    "type": "string"
                                }
                            },
                            "required": [
                                "org_id",
                                "reason"
                            ],
                            "additionalProperties": False
                        }
                    }
                },
                "required": [
                    "recommendations",
                    "suggestions"
                ],
                "additionalProperties": False
            }
        }
    )

    # Convert Gemini's response into a Python dictionary.
    result = json.loads(response.output_text)

    recommendations = result["recommendations"]
    suggestions = result["suggestions"]

    # Combine both groups to check for duplicate organizations.
    all_matches = recommendations + suggestions
    ids = [item["org_id"] for item in all_matches]

    if len(recommendations) != 3:
        raise ValueError(
            "Gemini must return exactly three primary recommendations."
        )

    if not 2 <= len(suggestions) <= 3:
        raise ValueError(
            "Gemini must return two or three secondary suggestions."
        )

    if len(ids) != len(set(ids)):
        raise ValueError(
            "Gemini returned duplicate organizations."
        )

    return result