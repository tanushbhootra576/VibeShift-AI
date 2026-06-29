const fs = require('fs');

function fixFiles() {
  // planner route
  const plannerPath = 'src/app/api/planner/route.ts';
  if (fs.existsSync(plannerPath)) {
    let planner = fs.readFileSync(plannerPath, 'utf-8');
    planner = planner.replace(/tasksSnap\.docs\.map\(d =>/g, 'tasksSnap.docs.map((d: any) =>');
    planner = planner.replace(/const text = response\.text;/g, 'const text = response.text || "";');
    fs.writeFileSync(plannerPath, planner);
  }

  // gmail sync route
  const gmailPath = 'src/app/api/gmail/sync/route.ts';
  if (fs.existsSync(gmailPath)) {
    let gmail = fs.readFileSync(gmailPath, 'utf-8');
    gmail = gmail.replace(/const text = result\.response\.text\(\);/g, 'const text = result.response?.text() || "";');
    gmail = gmail.replace(/const text = result\.text;/g, 'const text = result.text || "";');
    fs.writeFileSync(gmailPath, gmail);
  }
}

fixFiles();
