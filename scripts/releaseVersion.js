const fs = require('fs');
const { execSync } = require('child_process');

const version = '2.16';
const tag = `v${version}-stable`;
const date = new Date().toISOString();

const releaseInfo = {
  version,
  tag,
  date,
  build: execSync('git rev-parse --short HEAD').toString().trim()
};

fs.writeFileSync('release.json', JSON.stringify(releaseInfo, null, 2));
console.log('✅ Release info updated:', releaseInfo);


