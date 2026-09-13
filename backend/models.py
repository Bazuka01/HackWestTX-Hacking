from typing import Annotated
from pydantic import BaseModel, Field

# Answers are short labels picked from lists, so cap their size.
ShortText = Annotated[str, Field(min_length=1, max_length=100)]


# Define the student answers the recommendation endpoints accept.
class StudentProfile(BaseModel):
    major: ShortText
    interests: list[ShortText] = Field(max_length=20)
    hobbies: list[ShortText] = Field(max_length=20)
    class_year: ShortText | None = None
    ethnicity: ShortText | None = None
