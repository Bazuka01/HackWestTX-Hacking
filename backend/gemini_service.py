import os
import json
from pathlib import Path
from dotenv import load_dotenv
from google import genai

    
# Load the API key from .env and create the Gemini client.
load_dotenv(Path(__file__).parent / ".env")
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is missing from your .env file.")

client = genai.Client(api_key=api_key)


def recommend_orgs(student_profile, organizations):
    # Combine the student's answers and available organizations into a prompt.
    prompt = f"""
    Recommend exactly three distinct organizations for this student.

    Use only organizations from the supplied list.
    Consider the student's major, interests, hobbies, optional class year,
    and optional ethnicity.

    Use ethnicity only to help identify relevant cultural communities.
    Do not restrict the student to cultural organizations or assume their
    interests based on ethnicity.

    Use only facts contained in the supplied organization data.
    Do not invent events, activities, eligibility requirements, or details.
    Return each organization's ID and a one-sentence explanation.

    Student profile:
    {json.dumps(student_profile)}

    Available organizations:
    {json.dumps(organizations)}
    """

    # Make one Gemini call. The schema requires three matches in JSON format
    # and limits organization IDs to the ones in our supplied list.
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
                                    "enum": [org["id"] for org in organizations]
                                },
                                "reason": {"type": "string"}
                            },
                            "required": ["org_id", "reason"],
                            "additionalProperties": False
                        }
                    }
                },
                "required": ["recommendations"],
                "additionalProperties": False
            }
        }
    )

    # Convert the response into a Python dictionary and reject duplicate IDs.
    result = json.loads(response.output_text)

    ids = [item["org_id"] for item in result["recommendations"]]
    if len(set(ids)) != 3:
        raise ValueError("Gemini returned duplicate organizations.")

    return result


    # Load organizations only for the standalone test.
    with (Path(__file__).parent / "org.json").open(
        encoding="utf-8"
    ) as file:
        organizations = json.load(file)

    # Keep your sample student profile and print statements here.
    