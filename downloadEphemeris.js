const fs = require('fs');
const path = require('path');
const https = require('https');

const EPHE_URL = 'https://www.astro.com/ftp/swisseph/ephe/archive_ephe_2020.zip';
const EPHE_DIR = path.join(__dirname, 'node_modules', 'swisseph', 'ephe');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

function unzipFile(zipPath, targetDir) {
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(targetDir, true);
}

async function setupEphemeris() {
  try {
    if (!fs.existsSync(EPHE_DIR)) {
      fs.mkdirSync(EPHE_DIR, { recursive: true });
    }

    const zipPath = path.join(EPHE_DIR, 'ephe.zip');
    console.log('Downloading ephemeris...');
    await downloadFile(EPHE_URL, zipPath);
    
    console.log('Unzipping...');
    unzipFile(zipPath, EPHE_DIR);
    fs.unlinkSync(zipPath);
    
    console.log('Ephemeris installed successfully!');
  } catch (error) {
    console.error('Error setting up ephemeris:', error.message);
    process.exit(1);
  }
}

setupEphemeris();
