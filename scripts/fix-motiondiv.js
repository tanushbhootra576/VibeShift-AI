const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.tsx', 'utf-8');
code = code.replace(/<MotionDiv/g, '<div');
code = code.replace(/<\/MotionDiv>/g, '</div>');
fs.writeFileSync('src/app/dashboard/page.tsx', code);
