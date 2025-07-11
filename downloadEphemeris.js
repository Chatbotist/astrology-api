const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');

async function downloadEphemeris() {
  try {
    const epheDir = path.join(__dirname, 'node_modules', 'swisseph', 'ephe');
    
    // Создаем папку, если ее нет
    if (!fs.existsSync(epheDir)) {
      fs.mkdirSync(epheDir, { recursive: true });
    }

    // Скачиваем архив с эфемеридами
    console.log('Скачивание эфемерид...');
    const response = await axios.get('https://www.astro.com/ftp/swisseph/ephe/archive_ephe_2020.zip', {
      responseType: 'arraybuffer'
    });

    // Сохраняем архив
    const zipPath = path.join(epheDir, 'ephe.zip');
    fs.writeFileSync(zipPath, response.data);

    // Распаковываем
    console.log('Распаковка...');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(epheDir, true);

    // Удаляем архив
    fs.unlinkSync(zipPath);
    console.log('Эфемериды успешно установлены!');

  } catch (error) {
    console.error('Ошибка при загрузке эфемерид:', error.message);
    process.exit(1);
  }
}

downloadEphemeris();
