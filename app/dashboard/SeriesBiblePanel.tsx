"use client";

import { buildContinuityBrief } from "@/lib/continuity";
import type { SeriesBible } from "@/lib/types";
import { createId } from "./store";

type Props = {
  bible: SeriesBible;
  onChange: (patch: Partial<SeriesBible>) => void;
};

const FIELDS: { key: keyof SeriesBible; label: string; placeholder: string; area?: boolean }[] = [
  {
    key: "title",
    label: "Series title",
    placeholder: "e.g. The Gospel of Mark",
  },
  {
    key: "premise",
    label: "Premise",
    placeholder: "What the series is about, in one or two lines.",
    area: true,
  },
  {
    key: "audience",
    label: "Audience",
    placeholder: "e.g. families, first-time readers of the Bible",
  },
  {
    key: "tone",
    label: "Tone",
    placeholder: "e.g. reverent, cinematic, hopeful",
  },
  {
    key: "visualStyle",
    label: "Visual style",
    placeholder: "e.g. cinematic realism, warm golden light, first-century Judea",
    area: true,
  },
  {
    key: "narratorVoice",
    label: "Narrator voice",
    placeholder: "e.g. calm, authoritative male voice, measured pace",
  },
];

export default function SeriesBiblePanel({ bible, onChange }: Props) {
  function updateCharacter(id: string, patch: { name?: string; description?: string }) {
    onChange({
      characters: bible.characters.map((character) =>
        character.id === id ? { ...character, ...patch } : character
      ),
    });
  }

  return (
    <details className="panel" open>
      <summary>Series Bible — the continuity lock</summary>
      <div className="panel-body">
        <p className="hint">
          Everything here is sent with each generation, so characters, look and narration stay
          identical across episodes. Fill this in once.
        </p>

        <div className="grid two" style={{ marginTop: 14 }}>
          {FIELDS.map((field) => (
            <div className="field" key={field.key}>
              <label htmlFor={`bible-${field.key}`}>{field.label}</label>
              {field.area ? (
                <textarea
                  id={`bible-${field.key}`}
                  value={bible[field.key] as string}
                  placeholder={field.placeholder}
                  onChange={(event) => onChange({ [field.key]: event.target.value })}
                />
              ) : (
                <input
                  id={`bible-${field.key}`}
                  value={bible[field.key] as string}
                  placeholder={field.placeholder}
                  onChange={(event) => onChange({ [field.key]: event.target.value })}
                />
              )}
            </div>
          ))}
        </div>

        <div className="section-label">Characters</div>
        <div className="chars">
          {bible.characters.map((character) => (
            <div className="char-row" key={character.id}>
              <input
                className="inp"
                aria-label="Character name"
                value={character.name}
                placeholder="Name"
                onChange={(event) => updateCharacter(character.id, { name: event.target.value })}
              />
              <input
                className="inp"
                aria-label="Character description"
                value={character.description}
                placeholder="Age, appearance, wardrobe — repeated in every shot"
                onChange={(event) =>
                  updateCharacter(character.id, { description: event.target.value })
                }
              />
              <button
                type="button"
                className="btn ghost small"
                onClick={() =>
                  onChange({
                    characters: bible.characters.filter((c) => c.id !== character.id),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="actions">
          <button
            type="button"
            className="btn ghost small"
            onClick={() =>
              onChange({
                characters: [
                  ...bible.characters,
                  { id: createId(), name: "", description: "" },
                ],
              })
            }
          >
            + Add character
          </button>
        </div>

        <div className="section-label">Sent with every generation</div>
        <div className="prompt">{buildContinuityBrief(bible)}</div>
      </div>
    </details>
  );
}
