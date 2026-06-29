const fs = require('fs');

function removeProp(code, propName) {
  let index = 0;
  while ((index = code.indexOf(propName + '=', index)) !== -1) {
    // Check if it's not preceded by a word character to avoid partial matches
    if (index > 0 && /\w/.test(code[index - 1])) {
      index += propName.length + 1;
      continue;
    }
    
    const start = index;
    index += propName.length + 1;
    
    if (code[index] === '{') {
      let braceCount = 1;
      index++;
      while (braceCount > 0 && index < code.length) {
        if (code[index] === '{') braceCount++;
        else if (code[index] === '}') braceCount--;
        index++;
      }
    } else if (code[index] === '"' || code[index] === "'") {
      const quote = code[index];
      index++;
      while (index < code.length && code[index] !== quote) {
        if (code[index] === '\\') index++; // skip escaped
        index++;
      }
      if (code[index] === quote) index++;
    } else {
      // Something else (e.g. true)
      while (index < code.length && /[a-zA-Z0-9]/.test(code[index])) {
        index++;
      }
    }
    
    // Remove the slice
    code = code.slice(0, start) + code.slice(index);
    index = start;
  }
  return code;
}

const files = [
  'src/app/auth/page.tsx',
  'src/app/dashboard/calibrate/page.tsx',
  'src/app/dashboard/habits/page.tsx',
  'src/app/dashboard/library/page.tsx',
  'src/app/dashboard/logs/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/recommendations/page.tsx',
  'src/app/dashboard/shield/page.tsx',
  'src/app/dashboard/tasks/page.tsx',
  'src/app/dashboard/telemetry/page.tsx',
  'src/app/page.tsx',
  'src/components/AgentNudge.tsx',
  'src/components/Sidebar.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf-8');
    
    // Remove imports
    code = code.replace(/import\s+(?:{[^}]*}|[a-zA-Z0-9_, *]+)\s+from\s+['"]framer-motion['"];?\n?/g, '');
    
    // Remove standalone `layout` prop which has no `=`
    code = code.replace(/\s+layout(?=[\s>])/g, '');

    // Replace tags
    code = code.replace(/<motion\.([a-zA-Z0-9]+)/g, "<$1");
    code = code.replace(/<\/motion\.([a-zA-Z0-9]+)>/g, "</$1>");
    
    // Remove props
    const propsToRemove = ['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'whileInView', 'viewport', 'layoutId'];
    for (const prop of propsToRemove) {
      code = removeProp(code, prop);
    }
    
    fs.writeFileSync(file, code);
    console.log(`Stripped motion from ${file}`);
  }
}
