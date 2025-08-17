# Whisper Transcript

A Bun TypeScript project that automatically transcribes MP3 files using OpenAI's Whisper API.

## Features

- Automatically finds all MP3 files in the current directory
- Transcribes audio using OpenAI's Whisper model
- Saves transcriptions as text files with `_transcript.txt` suffix
- Handles multiple files in batch

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

3. Place your MP3 files in the project directory

## Usage

```bash
OPENAI_API_KEY=your_api_key_here bun run index.ts
```

Or with a `.env` file:
```bash
bun run index.ts
```

## Output

For each MP3 file (e.g., `audio.mp3`), the script will create a corresponding text file (`audio_transcript.txt`) containing the transcription.

## Requirements

- OpenAI API key
- MP3 files in the project directory
- Bun runtime

This project was created using `bun init` in bun v1.2.10. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
