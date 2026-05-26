# my `pi` coding agent configuration

This repository holds my `pi` (https://pi.dev) configuration.

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Custom models and model presets](#custom-models-and-model-presets)

## Prerequisites

The config was built on Windows. Other platforms may work but aren't tested.

- **git**
- **npm**
- **An API key**

## Setup

### 1. Install pi

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent

# alternative:
curl -fsSL https://pi.dev/install.sh | sh
```

Then run:

```bash
pi
```

once to create `.pi/`.

### 2. Configure this repo as a remote

```bash
cd .pi/
git init # init empty repo
git remote add origin https://github.com/p-hern/pi-config
git fetch
git checkout origin/main -f # discard current changes (we don't care)
git checkout main # create main tracking origin/main
```

You should now have the whole config in `.pi/`.

### 3. Install packages and extensions

```bash
pi npm install
```

### 4. Add your API key

Inside pi, use `/login` to add your API key.

See [pi docs](https://pi.dev) for the full list of supported providers.

### 5. Congrats! You're ready to use pi

![happy](https://64.media.tumblr.com/e6abb280e3f32d29eb2d5328c1e87e1a/13702c762815cce5-42/s640x960/819c529517be9d93e78a4a11e4a95259e6a2501f.jpg)

## Custom models and model presets

In `agent/models.json` I have a few custom OpenRouter presets.

You can put your own OpenRouter presets here, or even configure local models (w/ ollama, vLLM, etc.).

Check [official docs](https://pi.dev/docs/latest/models) to learn how.
