// Copies the recorded test video(s) from test-results/ into videos/ for easy sharing.
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'test-results');
const dest = path.resolve(__dirname, '..', 'videos');

function findVideos(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return findVideos(p);
    return p.endsWith('.webm') ? [p] : [];
  });
}

const videos = findVideos(src);
if (!videos.length) {
  console.log('No videos found in test-results/.');
  process.exit(0);
}
fs.mkdirSync(dest, { recursive: true });
videos.forEach((v, i) => {
  const target = path.join(dest, videos.length === 1 ? 'employee-lifecycle-run.webm' : `employee-lifecycle-run-${i + 1}.webm`);
  fs.copyFileSync(v, target);
  console.log(`Video saved: ${path.relative(process.cwd(), target)}`);
});
