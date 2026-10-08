<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Running this app in the Base44 sandbox

- Run everything through `docker-compose.base44.yml` (a single `web` service, `node:22`):
  `docker compose -f docker-compose.base44.yml up -d --build`
  The dev server listens on host port 3000. Dependencies are installed by the
  container command (`npm ci`) into a named `node_modules` volume on startup, so
  adding a package means editing `package.json` / `package-lock.json` and
  restarting the service (no image rebuild needed).
- `next.config.ts` conditionally sets `allowedDevOrigins` to `3000-${BASE44_PUBLIC_HOST_SUFFIX}`
  so HMR/dev assets work behind the preview proxy. It only activates when
  `BASE44_PREVIEW_MODE === "1"`; leave both `BASE44_PREVIEW_MODE` and
  `BASE44_PUBLIC_HOST_SUFFIX` in the service `environment:` for it to work.
- `/api/generate` calls OpenRouter (`https://openrouter.ai/api/v1/chat/completions`,
  model `meta-llama/llama-3.3-70b-instruct`) with `process.env.OPENROUTER_API_KEY`.
  The app boots and renders the homepage without it, but generation returns
  HTTP 500 `Missing Authentication header`. The key is a user secret, delivered
  through `/run/base44/app.env`; there is no default.
  Note: the `@google/genai` dependency is **unused** — the route uses OpenRouter via `fetch`.

### Verifying

- `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` → `200`.
- `curl -s -X POST http://localhost:3000/api/generate -H 'Content-Type: application/json' -d '{"niche":"fitness"}'`
  → `{"ideas":[...]}` with a valid key (10 numbered lines), or the 500 above without one.
