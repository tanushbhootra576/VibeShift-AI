const fs = require('fs');
const execSync = require('child_process').execSync;

try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log("No TypeScript errors found!");
} catch (e) {
  const output = e.stdout.toString();
  const lines = output.split('\n');
  const errors = {};

  for (const line of lines) {
    const match = line.match(/(src\/.*?):(\d+):(\d+) - error (TS\d+): (.*)/);
    if (match) {
      const file = match[1];
      const row = parseInt(match[2], 10);
      const col = parseInt(match[3], 10);
      const code = match[4];
      const msg = match[5];
      
      if (!errors[file]) errors[file] = [];
      errors[file].push({ row, col, code, msg });
    }
  }

  for (const [file, errs] of Object.entries(errors)) {
    console.log(`\n--- ${file} ---`);
    for (const err of errs) {
      console.log(`  Line ${err.row}: ${err.code} - ${err.msg}`);
    }
  }
}
