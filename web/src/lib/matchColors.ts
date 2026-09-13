import type { Matches } from "@/lib/api";

// Each matched organization gets a color that follows it across the home page
// and calendar: warm-to-cool for the top 3, a second set for suggestions.
const RECOMMENDATION_COLORS = ["#DC143C", "#3B82F6", "#22C55E"];
const SUGGESTION_COLORS = ["#F59E0B", "#A855F7", "#14B8A6"];

// For saved events from organizations that are no longer matches.
export const OTHER_ORG_COLOR = "#8C8785";

export function matchColors({ recommendations, suggestions }: Matches) {
  const colors = new Map<string, string>();
  recommendations.forEach((match, i) =>
    colors.set(match.org_id, RECOMMENDATION_COLORS[i % RECOMMENDATION_COLORS.length])
  );
  suggestions.forEach((match, i) =>
    colors.set(match.org_id, SUGGESTION_COLORS[i % SUGGESTION_COLORS.length])
  );
  return colors;
}
