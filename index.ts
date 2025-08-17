import OpenAI from 'openai';
import { readdir, writeFile } from 'fs/promises';
import { join, extname, basename } from 'path';


import { config } from 'dotenv';
config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function findMp3Files(directory: string): Promise<string[]> {
  try {
    const files = await readdir(directory);
    return files
      .filter(file => extname(file).toLowerCase() === '.mp3')
      .map(file => join(directory, file));
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
}

async function transcribeAudio(audioPath: string): Promise<string> {
  try {
    console.log(`Transcribing: ${audioPath}`);
    
    const transcription = await openai.audio.transcriptions.create({
      file: Bun.file(audioPath),
      model: 'gpt-4o-transcribe',
      prompt: 'This is an audio of a presentation given by an australian Aboriginal elder. The presentation is about Aboriginal health rights.',
      timestamp_granularities: ['segment'],
    });

    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

async function saveTranscription(text: string, originalFileName: string): Promise<void> {
  const outputFileName = `${basename(originalFileName, '.mp3')}_transcript.txt`;
  const outputPath = join(process.cwd(), outputFileName);
  
  try {
    await writeFile(outputPath, text, 'utf-8');
    console.log(`Transcription saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error saving transcription:', error);
    throw error;
  }
}

async function main() {

  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  const currentDirectory = process.cwd();
  console.log(`Searching for MP3 files in: ${currentDirectory}`);


  const mp3Files = await findMp3Files(currentDirectory);

  if (mp3Files.length === 0) {
    console.log('No MP3 files found in the current directory');
    return;
  }

  console.log(`Found ${mp3Files.length} MP3 file(s):`);
  mp3Files.forEach(file => console.log(`  - ${file}`));


  for (const mp3File of mp3Files) {
    try {
      console.log(`\nProcessing: ${basename(mp3File)}`);
      const transcription = await transcribeAudio(mp3File);
      await saveTranscription(transcription, mp3File);
      console.log('✅ Successfully transcribed and saved');
    } catch (error) {
      console.error(`❌ Failed to process ${basename(mp3File)}:`, error);
    }
  }

  console.log('\n🎉 All files processed!');
}

main().catch(console.error);