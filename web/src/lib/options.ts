// Answer options shown during onboarding and the organization categories.
// Values stay in English because they're saved to the account, sent to
// Gemini, and matched against organization tags; lib/i18n.ts translates the
// labels.

export const MAJORS = [
  "Computer Science",
  "Business Administration",
  "Biology",
  "Psychology",
  "Nursing",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Economics",
  "Finance",
  "Accounting",
  "Marketing",
  "Communications",
  "English",
  "Political Science",
  "Sociology",
  "Criminal Justice",
  "Education",
  "Kinesiology",
  "Biomedical Engineering",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Environmental Science",
  "History",
  "Graphic Design",
  "Architecture",
  "Public Health",
  "International Relations",
  "Journalism",
  "Music",
  "Art",
  "Philosophy",
  "Anthropology",
  "Data Science",
  "Information Technology",
  "Chemical Engineering",
] as const;

export const CLASS_YEARS = ["Freshman", "Sophomore", "Junior", "Senior"] as const;

export const ETHNICITIES = [
  "American Indian or Alaska Native",
  "Asian",
  "Black or African American",
  "Hispanic or Latino",
  "Native Hawaiian or Other Pacific Islander",
  "White",
  "Two or More Races",
  "Prefer not to say",
] as const;

// Each option lowercases to an organization tag (Academics -> academic).
export const INTERESTS = [
  "Academics",
  "Agriculture",
  "Animals",
  "Arts",
  "Backpacking",
  "Business",
  "Camping",
  "Community Service",
  "Culture",
  "Dance",
  "Engineering",
  "Entrepreneurship",
  "Environment",
  "Esports",
  "Faith",
  "Film",
  "Finance",
  "Fitness",
  "Gaming",
  "Gym",
  "Health",
  "Hiking",
  "Identity",
  "Inclusion",
  "Law",
  "Leadership",
  "Media",
  "Medicine",
  "Mentorship",
  "Military",
  "Music",
  "Outdoors",
  "Performance",
  "Photography",
  "Politics",
  "Powerlifting",
  "Research",
  "School Spirit",
  "Singing",
  "Sports",
  "STEM",
  "Technology",
  "Theater",
  "Video Games",
  "Volunteering",
  "Weightlifting",
  "Wellness",
  "Writing",
] as const;

export const CATEGORIES = [
  "Agricultural Sciences & Natural Resources",
  "Arts & Sciences",
  "Business",
  "Community Service",
  "Culture/Nationality",
  "Education",
  "Engineering / Computer Science",
  "Gaming",
  "Gym/Fitness",
  "Health & Human Sciences",
  "Hobbies/Special Interest",
  "Honor Society",
  "Law",
  "Media & Communication",
  "Military/Veterans",
  "Music/Art",
  "Outdoor Activities",
  "Political/Advocacy",
  "Religious/Spiritual",
  "Spirit/Traditions",
  "Sports",
  "Student Government/Leadership",
  "Veterinary Medicine",
] as const;

export const CULTURES = [
  "African/Black",
  "Asian/Pacific Islander",
  "Caribbean",
  "Filipino",
  "Hispanic/Latino",
  "International",
  "Native American",
] as const;

export type Major = (typeof MAJORS)[number];
export type ClassYear = (typeof CLASS_YEARS)[number];
export type Ethnicity = (typeof ETHNICITIES)[number];
export type Interest = (typeof INTERESTS)[number];
export type Category = (typeof CATEGORIES)[number];
export type Culture = (typeof CULTURES)[number];

// The organization tag each interest option corresponds to.
export function interestTag(interest: string) {
  return interest === "Academics" ? "academic" : interest.toLowerCase();
}
