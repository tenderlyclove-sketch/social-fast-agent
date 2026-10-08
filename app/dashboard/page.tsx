"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Episode, SeriesBible, Workspace } from "@/lib/types";
import EpisodeWorkspace from "./EpisodeWorkspace";
import SeriesBiblePanel from "./SeriesBiblePanel";
import { emptyEpisode, loadWorkspace, newWorkspace, saveWorkspace } from "./store";
import "./dashboard.css";

export default function DashboardPage() {
  const [workspace, setWorkspace] = useState<Workspace>(() => newWorkspace());
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"shots" | "script" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadWorkspace();
    setWorkspace(loaded);
    setSelectedId(loaded.episodes[0]?.id ?? null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveWorkspace(workspace);
  }, [workspace, hydrated]);

  const selected =
    workspace.episodes.find((episode) => episode.id === selectedId) ??
    workspace.episodes[0] ??
    null;

  function updateBible(patch: Partial<SeriesBible>) {
    setWorkspace((current) => ({ ...current, bible: { ...current.bible, ...patch } }));
  }

  function updateEpisode(id: string, patch: Partial<Episode>) {
    setWorkspace((current) => ({
      ...current,
      episodes: current.episodes.map((episode) =>
        episode.id === id ? { ...episode, ...patch } : episode
      ),
    }));
  }

  function addEpisode() {
    const nextNumber =
      workspace.episodes.reduce((max, episode) => Math.max(max, episode.number), 0) + 1;
    const episode = emptyEpisode(nextNumber);
    setWorkspace((current) => ({ ...current, episodes: [...current.episodes, episode] }));
    setSelectedId(episode.id);
    setError(null);
  }

  function removeEpisode(id: string) {
    const remaining = workspace.episodes.filter((episode) => episode.id !== id);
    const next = remaining.length ? remaining : [emptyEpisode(1)];
    setWorkspace((current) => ({ ...current, episodes: next }));
    setSelectedId((current) => (current === id ? next[0].id : current));
    setError(null);
  }

  function selectEpisode(id: string) {
    setSelectedId(id);
    setError(null);
  }

  async function generate(kind: "shots" | "script", episode: Episode) {
    setBusy(kind);
    setError(null);

    try {
      const response = await fetch(`/api/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bible: workspace.bible, episode }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      if (kind === "shots") {
        updateEpisode(episode.id, { shots: data.shots });
      } else {
        updateEpisode(episode.id, { script: data.script });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Generation failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="dash">
      <header className="dash-head">
        <div>
          <p className="eyebrow">Phase 1 · Outline studio</p>
          <h1>{workspace.bible.title || "Bible Series"}</h1>
          <p className="muted">
            Outline an episode, then generate a consistent shot list and TTS narration script.
          </p>
        </div>
        <Link className="link" href="/">
          ← Ideas generator
        </Link>
      </header>

      <SeriesBiblePanel bible={workspace.bible} onChange={updateBible} />

      <section className="panel">
        <div className="panel-head">
          <h2>Episodes</h2>
          <button type="button" className="btn small" onClick={addEpisode}>
            + New episode
          </button>
        </div>

        <div className="ep-chips">
          {workspace.episodes.map((episode) => (
            <button
              key={episode.id}
              type="button"
              className={`chip${episode.id === selected?.id ? " active" : ""}`}
              onClick={() => selectEpisode(episode.id)}
            >
              Ep {episode.number}
              {episode.title ? ` · ${episode.title}` : ""}
            </button>
          ))}
        </div>

        {selected ? (
          <EpisodeWorkspace
            episode={selected}
            busy={busy}
            error={error}
            canRemove={workspace.episodes.length > 1}
            onUpdate={(patch) => updateEpisode(selected.id, patch)}
            onGenerateShots={() => generate("shots", selected)}
            onGenerateScript={() => generate("script", selected)}
            onRemove={() => removeEpisode(selected.id)}
          />
        ) : (
          <div className="empty">Add an episode to get started.</div>
        )}
      </section>

      <p className="hint">
        Saved in this browser. Video generation (Phase 3) plugs into the same shot prompts.
      </p>
    </main>
  );
}
