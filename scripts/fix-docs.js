const fs = require('fs');
const path = require('path');

const files = [
  'G:/vibe2ship/vibeshift/src/app/api/v1/buffers/analyze-and-inject/route.ts',
  'G:/vibe2ship/vibeshift/src/app/api/v1/buffers/insights/route.ts',
  'G:/vibe2ship/vibeshift/src/app/api/v1/context/geofence-breach/route.ts',
  'G:/vibe2ship/vibeshift/src/app/api/v1/delegation/initialize/route.ts',
  'G:/vibe2ship/vibeshift/src/app/api/v1/drafts/pending/route.ts'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/docs\.map\(\s*doc\s*=>/g, 'docs.map((doc: any) =>');
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
