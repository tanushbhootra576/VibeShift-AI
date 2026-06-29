const fs = require('fs');

function fixFiles() {
  const files = [
    'src/app/api/chaos-dump/vision/route.ts',
    'src/app/api/chaos-dump/voice/route.ts',
    'src/app/api/gemini/route.ts',
    'src/app/api/gmail/sync/route.ts',
    'src/app/api/stakeholder-shield/route.ts',
  ];
  
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    let content = fs.readFileSync(f, 'utf-8');
    content = content.replace(/const text = result\.text;/g, 'const text = result.text || "";');
    if (f.includes('gemini/route.ts')) {
      content = content.replace(/await model\.generateContent/g, 'await genAI.models.generateContent');
      content = content.replace(/const result = await model/g, 'const result = await genAI');
    }
    fs.writeFileSync(f, content);
  }
  
  const dashFile = 'src/app/dashboard/page.tsx';
  if (fs.existsSync(dashFile)) {
    let content = fs.readFileSync(dashFile, 'utf-8');
    content = content.replace(/const itemVariants =[^;]+;/g, '');
    content = content.replace(/const containerVariants =[^;]+;/g, '');
    content = content.replace(/const fadeIn =[^;]+;/g, '');
    fs.writeFileSync(dashFile, content);
  }
  
  const appFile = 'src/app/page.tsx';
  if (fs.existsSync(appFile)) {
    let content = fs.readFileSync(appFile, 'utf-8');
    content = content.replace(/<div className="class-removed"/g, '<div');
    fs.writeFileSync(appFile, content);
  }
  
  const geminiFile = 'src/lib/gemini.ts';
  if (fs.existsSync(geminiFile)) {
    let content = fs.readFileSync(geminiFile, 'utf-8');
    content = `import { GoogleGenAI } from '@google/genai';\n\nexport const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });\n`;
    fs.writeFileSync(geminiFile, content);
  }
}
fixFiles();
