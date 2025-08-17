import OpenAI from 'openai';
import { readdir, writeFile, access } from 'fs/promises';
import { join, extname, basename } from 'path';
import inquirer from 'inquirer';
import { config } from 'dotenv';

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
interface TranscriptionConfig {
  mode: 'single' | 'multiple';
  inputPath?: string;
  filePath?: string;
  outputPath: string;
  model: string;
  prompt?: string;
  selectedFiles: string[];
}

async function findMp3Files(directory: string): Promise<string[]> {
  try {
    await access(directory);
    const files = await readdir(directory);
    return files
      .filter(file => extname(file).toLowerCase() === '.mp3')
      .map(file => join(directory, file));
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
    return [];
  }
} 

async function transcribeAudio(audioPath: string, model: string, prompt?: string): Promise<string> {
  try {
    console.log(`🎵 Transcribing: ${basename(audioPath)}`);
    
    const transcriptionParams: any = {
      file: Bun.file(audioPath),
      model: model,
    };

    if (prompt && prompt.trim()) {
      transcriptionParams.prompt = prompt;
    }

    const transcription = await openai.audio.transcriptions.create(transcriptionParams);
    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

async function saveTranscription(text: string, originalFileName: string, outputPath: string): Promise<void> {
  const outputFileName = `${basename(originalFileName, '.mp3')}_transcript.txt`;
  const fullOutputPath = join(outputPath, outputFileName);
  
  try {
    await writeFile(fullOutputPath, text, 'utf-8');
    console.log(`💾 Transcription saved to: ${fullOutputPath}`);
  } catch (error) {
    console.error('Error saving transcription:', error);
    throw error;
  }
}

async function getCliConfig(): Promise<TranscriptionConfig> {
  console.log('🎙️  Welcome to Whisper Transcript CLI\n');

  // First ask if single or multiple files
  const modeChoice = await inquirer.prompt({
    type: 'list',
    name: 'mode',
    message: 'What would you like to transcribe?',
    choices: [
      { name: '📄 Single file', value: 'single' },
      { name: '📁 Multiple files from directory', value: 'multiple' }
    ]
  });

  let config: any = { mode: modeChoice.mode };
  let selectedFiles: string[] = [];

  if (modeChoice.mode === 'single') {
    // Single file mode
    const singleFileConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'filePath',
        message: 'Enter the path to your MP3 file:',
        validate: async (input: string) => {
          try {
            await access(input);
            if (!extname(input).toLowerCase().includes('.mp3')) {
              return 'Please provide a valid MP3 file path.';
            }
            return true;
          } catch {
            return 'File does not exist. Please enter a valid file path.';
          }
        }
      },
      {
        type: 'input',
        name: 'outputPath',
        message: 'Output directory path:',
        default: './outputs',
        validate: async (input: string) => {
          try {
            await access(input);
            return true;
          } catch {
            return 'Directory does not exist. Please enter a valid path.';
          }
        }
      }
    ]);
    
    config = { ...config, ...singleFileConfig };
    selectedFiles = [singleFileConfig.filePath];
  } else {
    // Multiple files mode
    const multipleFilesConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'inputPath',
        message: 'Input directory path:',
        default: './inputs',
        validate: async (input: string) => {
          try {
            await access(input);
            return true;
          } catch {
            return 'Directory does not exist. Please enter a valid path.';
          }
        }
      },
      {
        type: 'input',
        name: 'outputPath',
        message: 'Output directory path:',
        default: './outputs',
        validate: async (input: string) => {
          try {
            await access(input);
            return true;
          } catch {
            return 'Directory does not exist. Please enter a valid path.';
          }
        }
      }
    ]);

    config = { ...config, ...multipleFilesConfig };

    // Find MP3 files in the input directory
    const mp3Files = await findMp3Files(config.inputPath);
    
    if (mp3Files.length === 0) {
      console.log('❌ No MP3 files found in the input directory');
      process.exit(1);
    }

    // Let user select which files to process
    const fileChoices = mp3Files.map(file => ({
      name: basename(file),
      value: file,
      checked: true
    }));

    const fileSelection = await inquirer.prompt({
      type: 'checkbox',
      name: 'selectedFiles',
      message: 'Select files to transcribe:',
      choices: fileChoices,
      validate: (answer: any) => {
        if (answer.length < 1) {
          return 'You must choose at least one file.';
        }
        return true;
      }
    });

    selectedFiles = fileSelection.selectedFiles;
  }

  // Common configuration for both modes
  const commonConfig = await inquirer.prompt([
    {
      type: 'list',
      name: 'model',
      message: 'Select transcription model:',
      choices: [
        { name: 'gpt-4o-transcribe (Recommended)', value: 'gpt-4o-transcribe' },
        { name: 'whisper-1', value: 'whisper-1' }
      ],
      default: 'gpt-4o-transcribe'
    },
    {
      type: 'input',
      name: 'prompt',
      message: 'Optional prompt (helps with context/accuracy):',
      default: ''
    }
  ]);

  return {
    mode: config.mode,
    inputPath: config.inputPath,
    filePath: config.filePath,
    outputPath: config.outputPath,
    model: commonConfig.model,
    prompt: commonConfig.prompt,
    selectedFiles: selectedFiles
  };
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is required');
    console.log('Please set your OpenAI API key in the .env file');
    process.exit(1);
  }

  try {
    const config = await getCliConfig();

    console.log('\n📋 Configuration Summary:');
    console.log(`   Mode: ${config.mode === 'single' ? '📄 Single file' : '📁 Multiple files'}`);
    
    if (config.mode === 'single') {
      console.log(`   File: ${config.filePath}`);
    } else {
      console.log(`   Input Path: ${config.inputPath}`);
      console.log(`   Files to process: ${config.selectedFiles.length}`);
    }
    
    console.log(`   Output Path: ${config.outputPath}`);
    console.log(`   Model: ${config.model}`);
    console.log(`   Prompt: ${config.prompt || 'None'}`);

    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Proceed with transcription?',
        default: true
      }
    ]);

    if (!confirm.proceed) {
      console.log('👋 Transcription cancelled');
      return;
    }

    console.log('\n🚀 Starting transcription...\n');

    for (const mp3File of config.selectedFiles) {
      try {
        console.log(`\n📁 Processing: ${basename(mp3File)}`);
        const transcription = await transcribeAudio(mp3File, config.model, config.prompt);
        await saveTranscription(transcription, mp3File, config.outputPath);
        console.log('✅ Successfully transcribed and saved');
      } catch (error) {
        console.error(`❌ Failed to process ${basename(mp3File)}:`, error);
      }
    }

    console.log('\n🎉 All files processed!');
  } catch (error) {
    console.error('❌ An error occurred:', error);
    process.exit(1);
  }
}

main().catch(console.error);