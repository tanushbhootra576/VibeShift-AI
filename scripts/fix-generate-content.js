const fs = require('fs');

const files = [
  'src/app/api/chaos-dump/vision/route.ts',
  'src/app/api/chaos-dump/voice/route.ts',
  'src/app/api/gemini/route.ts',
  'src/app/api/stakeholder-shield/route.ts'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf-8');
    // We already replaced `new GoogleGenerativeAI` with `new GoogleGenAI`.
    // Let's replace `.getGenerativeModel` manually if any was missed
    code = code.replace(/const model = ai\.getGenerativeModel\(\{ model: [^}]+\}\);/g, '');
    code = code.replace(/const model = genAI\.getGenerativeModel\(\{ model: [^}]+\}\);/g, '');
    
    // Replace `model.generateContent` with `ai.models.generateContent({ model: 'gemini-2.0-flash', contents: ... })`
    // e.g. `await model.generateContent([prompt, ...imageParts]);`
    // or `await model.generateContent(prompt);`
    code = code.replace(/await model\.generateContent\(([^)]+)\)/g, "await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: $1 })");
    
    fs.writeFileSync(file, code);
    console.log(`Fixed generateContent in ${file}`);
  }
}
