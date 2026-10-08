import type { Episode, SeriesBible, Workspace } from "@/lib/types";

const STORAGE_KEY = "social-fast-agent.bible-studio.v1";

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

export function emptyBible(): SeriesBible {
  return {
    title: "Bible Series",
    premise: "",
    audience: "",
    tone: "Reverent, cinematic, hopeful",
    visualStyle: "",
    narratorVoice: "",
    characters: [],
  };
}

export function emptyEpisode(number: number): Episode {
  return {
    id: createId(),
    number,
    title: "",
    scripture: "",
    outline: "",
    shots: [],
    script: "",
  };
}

export function newWorkspace(): Workspace {
  return { bible: emptyBible(), episodes: [emptyEpisode(1)] };
}

export function loadWorkspace(): Workspace {
  if (typeof window === "undefined") return newWorkspace();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return newWorkspace();

    const parsed = JSON.parse(raw) as Partial<Workspace>;
    const episodes = Array.isArray(parsed.episodes) ? parsed.episodes : [];

    return {
      bible: { ...emptyBible(), ...(parsed.bible ?? {}) },
      episodes: episodes.length
        ? episodes.map((episode) => ({
            ...emptyEpisode(episode?.number ?? 1),
            ...episode,
          }))
        : [emptyEpisode(1)],
    };
  } catch {
    return newWorkspace();
  }
}

export function saveWorkspace(workspace: Workspace): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}
