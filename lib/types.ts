export type Character = {
  id: string;
  name: string;
  description: string;
};

// The series bible is the continuity lock: it is sent with every generation so
// shots and narration stay identical from episode to episode.
export type SeriesBible = {
  title: string;
  premise: string;
  audience: string;
  tone: string;
  visualStyle: string;
  narratorVoice: string;
  characters: Character[];
};

export type Shot = {
  shot: string;
  description: string;
  visualPrompt: string;
  camera: string;
  durationSec: number;
  audio: string;
};

export type Episode = {
  id: string;
  number: number;
  title: string;
  scripture: string;
  outline: string;
  shots: Shot[];
  script: string;
};

export type Workspace = {
  bible: SeriesBible;
  episodes: Episode[];
};
