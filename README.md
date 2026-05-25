# pi coding agent — configuration

This repository holds a ready‑to‑use [pi](https://pi.dev) configuration (`~/.pi`). Clone it, add your API keys, and you're running the same setup the original author uses on Windows.

## Prerequisites

The config was built on Windows. Other platforms may work but aren't tested.

- **npm** (ships with Node.js)
- **git**
- **An OpenRouter API key** (or swap to a different provider — see below)

## Quick start

### 1. Install pi

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
```

> `--ignore-scripts` is safe — pi doesn't need install lifecycle scripts.

Alternative:

```bash
curl -fsSL https://pi.dev/install.sh | sh
```

### 2. Clone this repo as `~/.pi`

```bash
cd
# Back up existing ~/.pi first if you have one
mv .pi .pi.bak
git clone <this-repo-url> .pi
cd .pi
```

### 3. Install extension dependencies

```bash
pi npm install
```

This installs the packages listed in `agent/npm/package.json` — `pi-web-access`,
`context-mode`, `pi-markdown-preview` — plus their transitive dependencies.

### 4. Add your API key

Create `agent/auth.json` with your OpenRouter key:

```json
{
  "openrouter": {
    "type": "api_key",
    "key": "sk-or-v1-..."
  }
}
```

You can get a key at [openrouter.ai/keys](https://openrouter.ai/keys).

> **Security:** `agent/auth.json` is gitignored. It will never be committed.

### 5. Launch pi

```bash
pi
```

On the first launch pi will download `rg` and `fd` binaries into `agent/bin/`.
You should be greeted with the interactive editor. Try asking something like
`"list the files in the current directory"`.

## What's inside

| File / Dir | Purpose |
|---|---|
| `agent/settings.json` | Default provider (OpenRouter), model preset, thinking level, packages, extensions |
| `agent/models.json` | Custom model definitions (presets that reference a provider's models) |
| `agent/extensions/footer-stats.ts` | Extension showing TTFT, end‑to‑end time, cost, and token counts in the footer |
| `agent/npm/package.json` | Pinned extension dependencies (`pi-web-access`, `context-mode`, `pi-markdown-preview`) |
| `agent/npm/package-lock.json` | Deterministic lockfile for extension deps |
| `web-search.json` | Web search workflow preference (no interactive curation) |

### Excluded from version control

The `.gitignore` keeps machine‑local and regenerable data out of this repo:

| Excluded | Reason |
|---|---|
| `agent/auth.json` | Plaintext API keys — **never commit** |
| `agent/bin/` | Platform‑specific downloaded binaries (`fd.exe`, `rg.exe`) |
| `agent/sessions/` | Per‑project session history (~2.4 MB, regenerates automatically) |
| `context-mode/` | Context‑mode session databases (~840 KB, local state) |
| `cache/` | Markdown preview render cache (~300 KB, regenerated) |
| `agent/npm/node_modules/` | Installed packages — restored via `pi npm install` |
| `agent/extensions/.git/` | Git metadata for extension submodules |
| `agent/git/` | Cloned packages from git sources |

## What the model presets use

The config defines two model presets in `agent/models.json`:

| Preset | Model | When to use |
|---|---|---|
| `@preset/gpt-5-5-medium` | GPT‑5.5 Medium | Heavy coding, complex reasoning |
| `@preset/deep-seek-v4-flash-custom` | DeepSeek V4 Flash | Quick tasks, cheaper runs |

The default is `deep-seek-v4-flash-custom`. Switch at any time with `Ctrl+L`
inside pi.

## Using a different provider

This config uses OpenRouter, but pi supports many providers directly. To switch:

1. **Remove** the provider/model config from `agent/settings.json` and
   `agent/models.json`, or set a different `defaultProvider`.
2. **Add** your API key to `agent/auth.json`:

```json
{
  "anthropic": {
    "type": "api_key",
    "key": "sk-ant-..."
  }
}
```

Supported providers (see [pi docs](https://pi.dev) for the full list):
Anthropic, OpenAI, DeepSeek, Google Gemini, Groq, GitHub Copilot (subscription),
Mistral, xAI, Fireworks, Together AI, and many more.

## Restoring pi itself after a fresh machine setup

```bash
# Install pi
npm install -g --ignore-scripts @earendil-works/pi-coding-agent

# Clone config
cd && git clone <this-repo-url> .pi

# Install extension deps
pi npm install

# Add API key (edit agent/auth.json)

# Done — launch pi
pi
```

No need to restore sessions, caches, or binaries — pi recreates those on first use.

## Useful commands inside pi

| Command | Action |
|---|---|
| `Ctrl+L` | Switch model |
| `Ctrl+P` / `Shift+Ctrl+P` | Cycle through scoped models |
| `Shift+Tab` | Change thinking level |
| `/model` | Select a different model |
| `/settings` | Adjust settings interactively |
| `/compact` | Manually compact long session context |
| `/session` | Show session info (tokens, cost) |
| `/new` | Start a fresh session |
| `/resume` | Pick from past sessions |
| `/tree` | Navigate branches in the session tree |
| `/quit` | Exit pi |

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Enter` | Send message / queue steering message while agent is working |
| `Shift+Enter` | New line in editor |
| `Escape` | Cancel current generation |
| `Escape` twice | Open session tree |
| `Ctrl+C` | Clear editor |
| `Ctrl+C` twice | Quit |
| `Ctrl+O` | Collapse / expand tool output |
| `Ctrl+T` | Collapse / expand thinking blocks |
| `@` | Fuzzy‑search file to reference in prompt |

## Links

- [pi.dev](https://pi.dev) — official site
- [pi on npm](https://www.npmjs.com/package/@earendil-works/pi-coding-agent)
- [#pi on Discord](https://discord.com/invite/3cU7Bz4UPx)
- [GitHub repo](https://github.com/earendil-works/pi-coding-agent)
