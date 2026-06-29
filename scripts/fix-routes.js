const fs = require('fs');
const path = require('path');

const apiPath = path.join('G:', 'vibe2ship', 'vibeshift', 'src', 'app', 'api', 'v1');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('route.ts')) {
      results.push(file);
    }
  });
  return results;
}

const routes = walk(apiPath);

routes.forEach(route => {
  let content = fs.readFileSync(route, 'utf8');
  if (content.includes('{ params }: { params: { id: string } }')) {
    content = content.replace('{ params }: { params: { id: string } }', '{ params }: { params: Promise<{ id: string }> }');
    // Replace all params.id with (await params).id
    content = content.replace(/params\.id/g, '(await params).id');
    fs.writeFileSync(route, content);
    console.log('Fixed', route);
  }
});
