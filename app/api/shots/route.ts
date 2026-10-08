import { NextResponse } from "next/server";
import { callOpenRouter, extractJson, MissingApiKeyError } from "@/lib/openrouter";
import { buildContinuityBrief } from "@/lib/continuity";
import type { Episode, SeriesBible, Shot } from "@/lib/types";

const SYSTEM_PROMPT = `You are a film director and storyboard supervisor for a Bible-based video series.
You turn episode outlines into shootable shot lists for short social videos.
Keep characters, wardrobe, locations, lighting and visual style identical across every shot and every episode.
Never invent characters that are not listed in the continuity brief.
Reply with JSON only. No commentary, no markdown, no code fences.`;

const str = (value: unknown, fallback = ""): string =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

export async function POST(req: Request) {
  try {
    const { bible, episode } = (await req.json()) as {
      bible: SeriesBible;
      episode: Episode;
    };

    if (!episode?.outline?.trim()) {
      return NextResponse.json(
        { error: "Add an episode outline before generating a shot list." },
        { status: 400 }
      );
    }

    const content = await callOpenRouter(
      [
        {
          role: "system",
          content: `${SYSTEM_PROMPT}

Series continuity brief (every shot must match this):
${buildContinuityBrief(bible)}`,
        },
        {
          role: "user",
          content: `Episode ${episode.number}: ${episode.title || "Untitled"}
${episode.scripture ? `Scripture: ${episode.scripture}\n` : ""}
Outline:
${episode.outline}

Break this outline into 6 to 12 shots for a short video of about 60 seconds.
Return ONLY this JSON shape:
{"shots":[{"shot":"1","description":"what happens on screen","visualPrompt":"a generation-ready image or video prompt that repeats the exact characters, wardrobe, location, lighting and style from the continuity brief","camera":"shot size and movement","durationSec":6,"audio":"narration, dialogue or sound cue"}]}`,
        },
      ],
      { temperature: 0.6, maxTokens: 3000 }
    );

    const parsed = extractJson<{ shots?: Record<string, unknown>[] }>(content);

    const shots: Shot[] = (parsed.shots ?? []).map((raw, index) => {
      const seconds = Number(raw?.durationSec);
      return {
        shot: str(raw?.shot, String(index + 1)),
        description: str(raw?.description),
        visualPrompt: str(raw?.visualPrompt),
        camera: str(raw?.camera),
        durationSec: Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : 6,
        audio: str(raw?.audio),
      };
    });

    if (!shots.length) {
      return NextResponse.json(
        { error: "The model returned an empty shot list. Try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ shots });
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("shot list generation failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not generate the shot list." },
      { status: 502 }
    );
  }
}
