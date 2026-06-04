const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { execSync } = require('child_process');

// Scripts are now in the project root
const PROJECT_ROOT = __dirname;
const PORTFOLIO_DIR = path.join(PROJECT_ROOT, 'img', 'portfolio');
const SERVICOS_DIR = path.join(PROJECT_ROOT, 'img', 'logotipos_servicos');

if (!fs.existsSync(PORTFOLIO_DIR)) {
  console.error(`❌ Portfolio directory not found: ${PORTFOLIO_DIR}`);
  process.exit(1);
}
if (!fs.existsSync(SERVICOS_DIR)) {
  console.error(`❌ Serviços directory not found: ${SERVICOS_DIR}`);
  process.exit(1);
}

// Debounce configuration
let debounceTimer = null;
const DEBOUNCE_DELAY = 1000; // 1 second

function isImageFile(filePath) {
  return /.(jpe?g|png|gif|jfif|webp)$/i.test(filePath);
}

function regeneratePortfolio() {
  const timestamp = new Date().toLocaleTimeString('en-GB');
  console.log(`[${timestamp}] 🔄 Regenerating portfolio data...`);
  
  try {
    // Run the generator script from the scripts_locais directory
    execSync('node generate_portfolio.js', { 
      cwd: __dirname,
      stdio: 'pipe'
    });
    console.log(`[${new Date().toLocaleTimeString('en-GB')}] ✅ Portfolio data updated successfully!`);
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString('en-GB')}] ❌ Generator failed:`, error.message);
  }
}

function triggerRegeneration() {
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  // Set new timer
  debounceTimer = setTimeout(() => {
    regeneratePortfolio();
    debounceTimer = null;
  }, DEBOUNCE_DELAY);
}

// Initial generation
console.log('📁 Portfolio Watch System Started\n');
regeneratePortfolio();

// Setup watcher with chokidar (much more reliable than FileSystemWatcher)
const watcher = chokidar.watch([PORTFOLIO_DIR, SERVICOS_DIR], {
  ignored: (path) => {
    // Ignore system files and non-image files
    return /(^|[\/\]).|Thumbs.db|desktop.ini/.test(path);
  },
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100
  },
  ignoreInitial: true,
  alwaysStat: true,
  usePolling: false,
  depth: 10
});

let isReady = false;

watcher
  .on('add', (filePath) => {
    if (isReady && isImageFile(filePath)) {
      const timestamp = new Date().toLocaleTimeString('en-GB');
      console.log(`[${timestamp}] ➕ File added: ${path.relative(__dirname, filePath)}`);
      triggerRegeneration();
    }
  })
  .on('change', (filePath) => {
    if (isReady && isImageFile(filePath)) {
      const timestamp = new Date().toLocaleTimeString('en-GB');
      console.log(`[${timestamp}] ✏️  File changed: ${path.relative(__dirname, filePath)}`);
      triggerRegeneration();
    }
  })
  .on('unlink', (filePath) => {
    if (isReady && isImageFile(filePath)) {
      const timestamp = new Date().toLocaleTimeString('en-GB');
      console.log(`[${timestamp}] 🗑️  File deleted: ${path.relative(__dirname, filePath)}`);
      triggerRegeneration();
    }
  })
  .on('addDir', (dirPath) => {
    if (isReady) {
      const timestamp = new Date().toLocaleTimeString('en-GB');
      console.log(`[${timestamp}] 📁 Folder added: ${path.relative(__dirname, dirPath)}`);
      triggerRegeneration();
    }
  })
  .on('unlinkDir', (dirPath) => {
    if (isReady) {
      const timestamp = new Date().toLocaleTimeString('en-GB');
      console.log(`[${timestamp}] 🗑️  Folder deleted: ${path.relative(__dirname, dirPath)}`);
      triggerRegeneration();
    }
  })
  .on('ready', () => {
    isReady = true;
    console.log('\n📡 Watching for changes...');
    console.log(`   📂 ${PORTFOLIO_DIR}`);
    console.log(`   📂 ${SERVICOS_DIR}`);
    console.log('\nPress Ctrl+C to stop.\n');
  })
  .on('error', (error) => {
    console.error('❌ Watcher error:', error);
  });

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping watch...');
  watcher.close();
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  process.exit(0);
});

