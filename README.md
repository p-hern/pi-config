# my `pi` coding agent configuration

This repository holds my `pi` (https://pi.dev) configuration.

## Prerequisites

The config was built on Windows. Other platforms may work but aren't tested.

- **git**
- **npm**
- **An OpenRouter API key** (or swap to a different provider — see below)

## Quick start

### 1. Install pi

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
```

Alternative:

```bash
curl -fsSL https://pi.dev/install.sh | sh
```

### 2. Clone this repo as `~/.pi`

```bash
# back up existing ~/.pi first if you want (should be pretty empty after a fresh install)
mv .pi .pi.bak

git clone https://github.com/p-hern/pi-config.git .pi

cd .pi
```

### 3. Install extension dependencies

```bash
pi npm install
```

This installs the packages listed in `agent/npm/package.json` — `pi-web-access`, `context-mode`, `pi-markdown-preview` — plus their transitive dependencies.

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

> Don't commit `agent/auth.json`.

### 5. Launch pi

```bash
pi
```

On the first launch pi should download `rg` and `fd` binaries into `agent/bin/`. You should be greeted with the interactive editor.

## Using a different provider

See [pi docs](https://pi.dev) for the full list.
