import type { SeriesBible } from "./types";

/**
 * Renders the series bible as a plain-text brief that is appended to every
 * generation prompt. Keeping this in one place is what makes shot lists and
 * narration consistent across episodes.
 */
export function buildContinuityBrief(bible: SeriesBible): string {
  const lines: string[] = [];
  const add = (label: string, value: string) => {
    if (value && value.trim()) lines.push(`${label}: ${value.trim()}`);
  };

  add("Series", bible.title);
  add("Premise", bible.premise);
  add("Audience", bible.audience);
  add("Tone", bible.tone);
  add("Visual style", bible.visualStyle);
  add("Narrator voice", bible.narratorVoice);

  const characters = bible.characters.filter(
    (character) => character.name.trim() || character.description.trim()
  );
  if (characters.length) {
    lines.push("Characters:");
    for (const character of characters) {
      lines.push(
        `- ${character.name.trim() || "Unnamed"}: ${
          character.description.trim() || "no description yet"
        }`
      );
    }
  }

  return lines.length ? lines.join("\n") : "No series details provided yet.";
}
