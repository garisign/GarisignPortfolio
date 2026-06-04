const fs = require('fs');
const path = require('path');

// Scripts are now in the project root
const PROJECT_ROOT = __dirname;
const PORTFOLIO_DIR = path.join(PROJECT_ROOT, 'img', 'portfolio');
const SERVICOS_DIR = path.join(PROJECT_ROOT, 'img', 'logotipos_servicos');
const OUT_DIR = path.join(PROJECT_ROOT, 'data');
const OUT_FILE = path.join(OUT_DIR, 'portfolio-data.json');

function isImage(f){
  return /.(jpe?g|png|gif|jfif|webp)$/i.test(f);
}

function getCatFromNumber(n){
  // mapping based on existing site grouping
  const num = parseInt(n,10);
  if(num >=1 && num <=4) return 'design';
  if(num >=5 && num <=8) return 'grafica';
  if(num >=9 && num <=11) return 'promo';
  if(num >=12 && num <=13) return 'ext';
  return 'other';
}

if(!fs.existsSync(PORTFOLIO_DIR)){
  console.error('Portfolio directory not found:', PORTFOLIO_DIR);
  process.exit(1);
}
if(!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR,{recursive:true});

const folders = fs.readdirSync(PORTFOLIO_DIR, { withFileTypes: true })
  .filter(d=>d.isDirectory())
  .map(d=>d.name);

const data = folders.map((folderName, idx) => {
  const folderPath = path.join(PORTFOLIO_DIR, folderName);
  const files = fs.readdirSync(folderPath).filter(f => isImage(f)).sort();
  const images = files.map(f => path.posix.join('img/portfolio', folderName, f));
  const cover = images.length ? images[0] : path.posix.join('img/portfolio', folderName, 'placeholder.webp');

  // try to find an icon in the corresponding logotipos_servicos folder
  const servicosFolderPath = path.join(SERVICOS_DIR, folderName);
  let icon = '';
  if(fs.existsSync(servicosFolderPath)){
    const servFiles = fs.readdirSync(servicosFolderPath).filter(f=>/.png$/i.test(f));
    if(servFiles.length) icon = path.posix.join('img/logotipos_servicos', folderName, servFiles[0]);
  }

  // determine numeric prefix for id and category
  const prefixMatch = folderName.match(/^\s*(\d+)\s*/);
  const num = prefixMatch ? prefixMatch[1] : String(idx+1).padStart(2,'0');
  const id = folderName.replace(/[^a-zA-Z0-9]/g,'').toLowerCase();
  const cat = getCatFromNumber(num);

  return {
    id: `${cat}${num}`,
    title: folderName,
    folder: folderName,
    cat,
    cover,
    icon,
    accent: '#8dc63f',
    images
  };
});

fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), 'utf8');
console.log('Wrote', OUT_FILE);
console.log('Folders processed:', folders.length);

