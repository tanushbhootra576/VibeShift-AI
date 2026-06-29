const fs = require('fs');
const path = require('path');

// 1. Remove AnimatePresence and variants from all TSX files
function fixMotionInFile(file) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf-8');
    code = code.replace(/<AnimatePresence[^>]*>/g, '');
    code = code.replace(/<\/AnimatePresence>/g, '');
    code = code.replace(/\s+variants=\{[^}]+\}/g, '');
    code = code.replace(/\s+variants=\{[^\}]+\}/g, '');
    // Catch variants={someVar} or variants={ { ... } }
    let index = 0;
    while ((index = code.indexOf('variants=')) !== -1) {
      if (index > 0 && /\w/.test(code[index - 1])) {
        index += 9;
        continue;
      }
      const start = index;
      index += 9;
      if (code[index] === '{') {
        let count = 1;
        index++;
        while (count > 0 && index < code.length) {
          if (code[index] === '{') count++;
          else if (code[index] === '}') count--;
          index++;
        }
      } else {
        while (index < code.length && /[a-zA-Z0-9_]/.test(code[index])) index++;
      }
      code = code.slice(0, start) + code.slice(index);
    }
    
    // Some places had `motion.` in code
    code = code.replace(/motion\./g, '');
    fs.writeFileSync(file, code);
  }
}

const tsxFiles = [
  'src/app/dashboard/library/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/recommendations/page.tsx',
  'src/app/dashboard/tasks/page.tsx',
  'src/app/dashboard/telemetry/page.tsx',
  'src/app/page.tsx',
  'src/components/Sidebar.tsx'
];
tsxFiles.forEach(fixMotionInFile);

// 2. Fix AI routes
const voicePath = 'src/app/api/chaos-dump/voice/route.ts';
if (fs.existsSync(voicePath)) {
  let voice = fs.readFileSync(voicePath, 'utf-8');
  voice = voice.replace(/const result = await ai\./g, 'const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });\n    const result = await genAI.');
  fs.writeFileSync(voicePath, voice);
}

const shieldPath = 'src/app/api/stakeholder-shield/route.ts';
if (fs.existsSync(shieldPath)) {
  let shield = fs.readFileSync(shieldPath, 'utf-8');
  shield = shield.replace(/const result = await ai\./g, 'const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });\n    const result = await genAI.');
  fs.writeFileSync(shieldPath, shield);
}

const geminiRoutePath = 'src/app/api/gemini/route.ts';
if (fs.existsSync(geminiRoutePath)) {
  let gemini = fs.readFileSync(geminiRoutePath, 'utf-8');
  gemini = gemini.replace(/const genAI = new GoogleGenAI\(\{ apiKey: process\.env\.GEMINI_API_KEY \}\);\n\s*const model = genAI\.getGenerativeModel\(\{ model: 'gemini-1\.5-pro' \}\);/g, 'const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });');
  gemini = gemini.replace(/const result = await model\.generateContent\(/g, 'const result = await genAI.models.generateContent({ model: "gemini-2.0-flash", contents: ');
  fs.writeFileSync(geminiRoutePath, gemini);
}

const libGeminiPath = 'src/lib/gemini.ts';
if (fs.existsSync(libGeminiPath)) {
  let lib = fs.readFileSync(libGeminiPath, 'utf-8');
  lib = lib.replace(/import { GoogleGenerativeAI } from '@google\/generative-ai';/g, "import { GoogleGenAI } from '@google/genai';");
  lib = lib.replace(/new GoogleGenerativeAI\(/g, 'new GoogleGenAI({ apiKey: ');
  lib = lib.replace(/new GoogleGenAI\(\{ apiKey: process.env.GEMINI_API_KEY \)/g, 'new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })');
  fs.writeFileSync(libGeminiPath, lib);
}

// 3. Fix calendar fetchTasks
const calendarPath = 'src/app/dashboard/calendar/page.tsx';
if (fs.existsSync(calendarPath)) {
  let cal = fs.readFileSync(calendarPath, 'utf-8');
  cal = cal.replace(/const initRealtimeListener = useTaskStore\(state => state\.initRealtimeListener\);/g, '');
  cal = cal.replace(/initRealtimeListener\(user\.uid\);/g, '');
  fs.writeFileSync(calendarPath, cal);
}
