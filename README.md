# Whisper Transcript CLI

A beautiful CLI application built with Bun and TypeScript that transcribes MP3 files using OpenAI's Whisper API.

## Features

- 🎙️ Interactive CLI interface with inquirer
- 📁 Configurable input and output directories
- 🤖 Multiple model options (gpt-4o-transcribe, whisper-1)
- 💬 Optional context prompts for better accuracy
- ✅ File selection with checkboxes
- 📋 Configuration summary and confirmation
- 🎯 Organized file structure with inputs/ and outputs/ folders

## Setup

1. Install dependencies:
```bash
bun install
```

2. Set up your OpenAI API key:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

3. Create directory structure:
```bash
mkdir -p inputs outputs
```

4. Place your MP3 files in the `inputs/` directory

## Usage

Simply run the CLI application:
```bash
bun run index.ts
```

The CLI will guide you through:
- **Input Path**: Where your MP3 files are located (default: `./inputs`)
- **Output Path**: Where transcriptions will be saved (default: `./outputs`)
- **Model Selection**: Choose between gpt-4o-transcribe (recommended) or whisper-1
- **Optional Prompt**: Add context to improve transcription accuracy
- **File Selection**: Choose which MP3 files to process
- **Confirmation**: Review settings before processing

## Directory Structure

```
whisper-transcript/
├── inputs/          # Place your MP3 files here
├── outputs/         # Transcriptions will be saved here
├── .env            # Your OpenAI API key
└── index.ts        # Main CLI application
```

## Output

For each MP3 file (e.g., `audio.mp3`), the script creates a corresponding text file (`audio_transcript.txt`) in the outputs directory.

## Requirements

- OpenAI API key
- MP3 files in the inputs directory
- Bun runtime

This project was created using `bun init` in bun v1.2.10. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
