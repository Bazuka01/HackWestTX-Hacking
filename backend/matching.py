import re

# Before asking Gemini, narrow the 451 organizations down to the ones that fit
# the student's major, picks, and background. A smaller list makes the prompt
# faster and cheaper and keeps Gemini focused on relevant organizations.

MAX_CANDIDATES = 60
MIN_CANDIDATES = 15

# (pattern matched against the major, categories that fit it)
MAJOR_CATEGORIES = [
    (r"engineer|computer|data|information tech|software|cyber", ["Engineering / Computer Science"]),
    (r"business|financ|accounting|marketing|management|econom", ["Business"]),
    (r"nurs|health|kinesiology|nutrition|pre-?med|human development|hospitality|dietetic", ["Health & Human Sciences"]),
    (r"biolog|chemi|physics|math|psycholog|sociolog|english|history|philosoph|anthropolog|political|criminal|international relations|environmental|geo|language|social work", ["Arts & Sciences"]),
    (r"educat|teach", ["Education"]),
    (r"communicat|journalism|advertising|media|public relations", ["Media & Communication"]),
    (r"music|\bart\b|design|architect|theat|danc", ["Music/Art"]),
    (r"agri|animal|plant|wildlife|natural resource|food science|range|environmental", ["Agricultural Sciences & Natural Resources"]),
    (r"\blaw\b|legal|political|criminal", ["Law"]),
    (r"veterin|pre-?vet", ["Veterinary Medicine"]),
]

# The frontend's ethnicity options and the culture tags that fit each one.
CULTURES_BY_ETHNICITY = {
    "Hispanic or Latino": {"Hispanic/Latino"},
    "Black or African American": {"African/Black", "Caribbean"},
    "Asian": {"Asian/Pacific Islander", "Filipino"},
    "Native Hawaiian or Other Pacific Islander": {"Asian/Pacific Islander"},
    "American Indian or Alaska Native": {"Native American"},
}

# Checklist labels that don't lowercase straight to an org tag.
TAG_ALIASES = {"academics": "academic"}

# Only the fields Gemini needs to choose; the rest just makes the prompt longer.
GEMINI_FIELDS = ("id", "name", "category", "interestTags", "hobbyTags", "cultureTag")


def categories_for_major(major):
    return {
        category
        for pattern, categories in MAJOR_CATEGORIES
        if re.search(pattern, major, re.IGNORECASE)
        for category in categories
    }


def student_tags(profile):
    picks = [*profile.get("interests", []), *profile.get("hobbies", [])]
    return {TAG_ALIASES.get(pick.lower(), pick.lower()) for pick in picks}


# Return up to MAX_CANDIDATES organizations, best fits first, trimmed to the
# fields Gemini needs. Organizations in exclude_ids are never included.
def candidate_orgs(profile, organizations, exclude_ids=()):
    exclude_ids = set(exclude_ids)
    tags = student_tags(profile)
    major_categories = categories_for_major(profile.get("major", ""))
    cultures = CULTURES_BY_ETHNICITY.get(profile.get("ethnicity") or "", set())

    scored = []
    for org in organizations:
        if org["id"] in exclude_ids:
            continue

        org_tags = set(org.get("interestTags") or []) | set(org.get("hobbyTags") or [])
        score = 2 * len(tags & org_tags)
        if org.get("category") in major_categories:
            score += 3
        if org.get("cultureTag") in cultures:
            score += 4
        scored.append((score, org))

    # Best score first; ties keep the catalog order.
    scored.sort(key=lambda item: -item[0])
    candidates = [org for score, org in scored if score > 0][:MAX_CANDIDATES]

    # Always give Gemini enough to choose from, even for unusual answers.
    if len(candidates) < MIN_CANDIDATES:
        chosen = {org["id"] for org in candidates}
        candidates += [org for _, org in scored if org["id"] not in chosen][
            : MIN_CANDIDATES - len(candidates)
        ]

    return [{field: org.get(field) for field in GEMINI_FIELDS} for org in candidates]
