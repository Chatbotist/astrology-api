const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');

async function downloadEphemeris() {
  try {
    const epheDir = path.join(__dirname, 'node_modules', 'swisseph', 'ephe');
    if (!fs.existsSync(epheDir)) {
      fs.mkdirSync(epheDir, { recursive: true });
    }

    console.log('Downloading ephemeris...');
    const response = await axios.get('https://www.astro.com/ftp/swisseph/ephe/archive_ephe_2020.zip', {
      responseType: 'arraybuffer'
    });

    const zipPath = path.join(epheDir, 'ephe.zip');
    fs.writeFileSync(zipPath, response.data);

    console.log('Unzipping...');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(epheDir, true);

    fs.unlinkSync(zipPath);
    console.log('Ephemeris installed successfully!');
  } catch (error) {
    console.error('Error downloading ephemeris:', error.message);
    process.exit(1);
  }
}

downloadEphemeris();
