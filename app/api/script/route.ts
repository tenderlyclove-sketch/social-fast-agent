import { NextResponse } from "next/server";
import { callOpenRouter, MissingApiKeyError } from "@/lib/openrouter";
import { buildContinuityBrief } from "@/lib/continuity";
import type { Episode, SeriesBible } from "@/lib/types";

const SYSTEM_PROMPT = `You are the scriptwriter for a Bible-based video series.
You write narration that will be read aloud by a text-to-speech voice.
The narrator must sound exactly the same in every episode: same voice, same pace, same vocabulary.
Output plain narration text only.
No headings, no scene labels, no shot numbers, no stage directions, no speaker labels, no timestamps, no markdown, no emojis, no bullet points.
Write complete sentences with natural pauses so the narration flows when spoken.
Spell out numbers, dates and abbreviations so a TTS voice reads them correctly.`;

export async function POST(req: Request) {
  try {
    const { bible, episode } = (await req.json()) as {
      bible: SeriesBible;
      episode: Episode;
    };

    if (!episode?.outline?.trim()) {
      return NextResponse.json(
        { error: "Add an episode outline before generating a narration script." },
        { status: 400 }
      );
    }

    const content = await callOpenRouter(
      [
        {
          role: "system",
          content: `${SYSTEM_PROMPT}

Series continuity brief (the narration voice must match this):
${buildContinuityBrief(bible)}`,
        },
        {
          role: "user",
          content: `Episode ${episode.number}: ${episode.title || "Untitled"}
${episode.scripture ? `Scripture: ${episode.scripture}\n` : ""}
Outline:
${episode.outline}

Write the narration voice-over for this episode for a video of about 60 seconds (roughly 150 to 200 words).
Return only the narration text.`,
        },
      ],
      { temperature: 0.7, maxTokens: 1200 }
    );

    const script = content.trim();

    if (!script) {
      return NextResponse.json(
        { error: "The model returned an empty script. Try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ script });
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("script generation failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not generate the script." },
      { status: 502 }
    );
  }
}
