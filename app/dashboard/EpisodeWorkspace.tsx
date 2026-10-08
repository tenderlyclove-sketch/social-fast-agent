"use client";

import { useState } from "react";
import type { Episode } from "@/lib/types";

type Props = {
  episode: Episode;
  busy: "shots" | "script" | null;
  error: string | null;
  canRemove: boolean;
  onUpdate: (patch: Partial<Episode>) => void;
  onGenerateShots: () => void;
  onGenerateScript: () => void;
  onRemove: () => void;
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className="btn ghost small"
      disabled={!text.trim()}
      onClick={copy}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

export default function EpisodeWorkspace({
  episode,
  busy,
  error,
  canRemove,
  onUpdate,
  onGenerateShots,
  onGenerateScript,
  onRemove,
}: Props) {
  const totalSeconds = episode.shots.reduce((sum, shot) => sum + shot.durationSec, 0);
  const allPrompts = episode.shots
    .map((shot) => `Shot ${shot.shot} — ${shot.camera}\n${shot.visualPrompt}`)
    .join("\n\n");

  return (
    <div>
      {error && <div className="alert">{error}</div>}

      <div className="grid two">
        <div className="grid two">
          <div className="field">
            <label htmlFor="ep-number">Episode</label>
            <input
              id="ep-number"
              type="number"
              min={1}
              value={episode.number}
              onChange={(event) => onUpdate({ number: Number(event.target.value) || 1 })}
            />
          </div>
          <div className="field">
            <label htmlFor="ep-scripture">Scripture</label>
            <input
              id="ep-scripture"
              value={episode.scripture}
              placeholder="e.g. Mark 4:35-41"
              onChange={(event) => onUpdate({ scripture: event.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="ep-title">Episode title</label>
          <input
            id="ep-title"
            value={episode.title}
            placeholder="e.g. Calming the Storm"
            onChange={(event) => onUpdate({ title: event.target.value })}
          />
        </div>
      </div>

      <div className="field" style={{ marginTop: 12 }}>
        <label htmlFor="ep-outline">Episode outline</label>
        <textarea
          id="ep-outline"
          value={episode.outline}
          placeholder={"Paste or write the beats of this episode, one per line.\ne.g. Storm hits the boat at night.\nDisciples wake Jesus in fear.\nJesus stills the sea."}
          onChange={(event) => onUpdate({ outline: event.target.value })}
        />
      </div>

      <div className="actions">
        <button
          type="button"
          className="btn"
          onClick={onGenerateShots}
          disabled={busy !== null || !episode.outline.trim()}
        >
          {busy === "shots" ? "Building shot list…" : "Generate shot list"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={onGenerateScript}
          disabled={busy !== null || !episode.outline.trim()}
        >
          {busy === "script" ? "Writing narration…" : "Generate TTS script"}
        </button>
        {canRemove && (
          <button type="button" className="btn ghost" onClick={onRemove} disabled={busy !== null}>
            Remove episode
          </button>
        )}
      </div>

      <div className="section-label">Shot list</div>
      {episode.shots.length ? (
        <>
          <div className="panel-head">
            <p className="hint">
              {episode.shots.length} shots · ~{totalSeconds}s total
            </p>
            <CopyButton text={allPrompts} label="Copy all prompts" />
          </div>
          {episode.shots.map((shot, index) => (
            <div className="shot" key={`${shot.shot}-${index}`}>
              <div className="shot-top">
                <span className="shot-no">Shot {shot.shot}</span>
                {shot.camera && <span className="tag">{shot.camera}</span>}
                <span className="tag">{shot.durationSec}s</span>
              </div>
              {shot.description && <p>{shot.description}</p>}
              {shot.visualPrompt && <div className="prompt">{shot.visualPrompt}</div>}
              {shot.audio && <p className="audio" style={{ marginTop: 8 }}>🔊 {shot.audio}</p>}
            </div>
          ))}
        </>
      ) : (
        <div className="empty">
          No shots yet. Write the outline above, then generate the shot list.
        </div>
      )}

      <div className="section-label">TTS narration script</div>
      {episode.script ? (
        <>
          <div className="panel-head">
            <p className="hint">Plain narration, ready to paste into a text-to-speech voice.</p>
            <CopyButton text={episode.script} label="Copy script" />
          </div>
          <div className="script">{episode.script}</div>
        </>
      ) : (
        <div className="empty">
          No script yet. Generate it from the same outline so the narrator stays consistent.
        </div>
      )}
    </div>
  );
}
