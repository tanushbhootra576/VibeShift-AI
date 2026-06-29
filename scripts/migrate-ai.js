const fs = require('fs');
const glob = require('glob'); // Note: we can use a simple recursive read instead

function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = findFiles('src');

for (const file of files) {
  let code = fs.readFileSync(file, 'utf-8');
  let changed = false;

  if (code.includes('@google/generative-ai')) {
    code = code.replace(/import\s+\{\s*GoogleGenerativeAI\s*\}\s+from\s+['"]@google\/generative-ai['"]/g, "import { GoogleGenAI } from '@google/genai'");
    code = code.replace(/new GoogleGenerativeAI\(/g, "new GoogleGenAI({ apiKey: ");
    code = code.replace(/new GoogleGenAI\(\{ apiKey: ([^\)]+)\)/g, "new GoogleGenAI({ apiKey: $1 })");
    code = code.replace(/\.getGenerativeModel\(\{ model: (['"][^'"]+['"]) \}\)/g, "");
    
    // We also need to fix `generateContent` calls.
    // `await model.generateContent(prompt)` becomes `await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt })`
    // This might be easier to do manually for the 3 routes that use it if regex is too complex.
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, code);
    console.log(`Updated ${file}`);
  }
}
