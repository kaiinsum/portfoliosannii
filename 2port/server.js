const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('dist/routing'));

// Helper function to ensure directory exists
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Helper function to write file
async function writeJsonFile(filePath, data) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const dir = path.dirname(fullPath);
    
    await ensureDir(dir);
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ Successfully wrote to: ${filePath}`);
    return { success: true, message: `File saved to ${filePath}` };
  } catch (error) {
    console.error(`❌ Error writing to ${filePath}:`, error);
    throw new Error(`Failed to write file: ${error.message}`);
  }
}

// API Routes for asset_main file operations
app.post('/api/assets/:mode/about.json', async (req, res) => {
  try {
    const { mode } = req.params;
    const filePath = `src/asset_main/data/${mode}/about.json`;
    
    await writeJsonFile(filePath, req.body);
    res.json({ success: true, message: `About data saved for ${mode} mode` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assets/:mode/contact.json', async (req, res) => {
  try {
    const { mode } = req.params;
    const filePath = `src/asset_main/data/${mode}/contact.json`;
    
    await writeJsonFile(filePath, req.body);
    res.json({ success: true, message: `Contact data saved for ${mode} mode` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assets/:mode/projects.json', async (req, res) => {
  try {
    const { mode } = req.params;
    const filePath = `src/asset_main/data/${mode}/projects.json`;
    
    await writeJsonFile(filePath, req.body);
    res.json({ success: true, message: `Projects data saved for ${mode} mode` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assets/portfolio-data.json', async (req, res) => {
  try {
    const filePath = `src/asset_main/portfolio-data.json`;
    
    await writeJsonFile(filePath, req.body);
    res.json({ success: true, message: `Portfolio data saved` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Image handling endpoint
app.post('/api/assets/images', async (req, res) => {
  try {
    const { path, data } = req.body;
    
    if (!path || !data) {
      return res.status(400).json({ error: 'Path and data are required' });
    }
    
    const filePath = `src/asset_main/${path}`;
    
    // Handle base64 data
    if (data.startsWith('data:')) {
      const matches = data.match(/^data:(.+?);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 data format' });
      }
      
      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fullPath = path.join(__dirname, filePath);
      const dir = path.dirname(fullPath);
      
      await ensureDir(dir);
      await fs.writeFile(fullPath, buffer);
      
      console.log(`✅ Successfully wrote image to: ${filePath}`);
      res.json({ success: true, message: `Image saved to ${path}` });
    } else {
      res.status(400).json({ error: 'Invalid image data format' });
    }
  } catch (error) {
    console.error(`❌ Error writing image:`, error);
    res.status(500).json({ error: error.message });
  }
});


// Specific GET endpoints for reading asset files
app.get('/api/assets/design/about.json', async (req, res) => {
  try {
    const fullPath = path.join(__dirname, 'src/asset_main/data/design/about.json');
    const data = await fs.readFile(fullPath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assets/design/contact.json', async (req, res) => {
  try {
    const fullPath = path.join(__dirname, 'src/asset_main/data/design/contact.json');
    const data = await fs.readFile(fullPath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assets/design/projects.json', async (req, res) => {
  try {
    const fullPath = path.join(__dirname, 'src/asset_main/data/design/projects.json');
    const data = await fs.readFile(fullPath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assets/technical/about.json', async (req, res) => {
  try {
    const fullPath = path.join(__dirname, 'src/asset_main/data/technical/about.json');
    const data = await fs.readFile(fullPath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assets/technical/contact.json', async (req, res) => {
  try {
    const fullPath = path.join(__dirname, 'src/asset_main/data/technical/contact.json');
    const data = await fs.readFile(fullPath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assets/technical/projects.json', async (req, res) => {
  try {
    const fullPath = path.join(__dirname, 'src/asset_main/data/technical/projects.json');
    const data = await fs.readFile(fullPath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assets/portfolio-data.json', async (req, res) => {
  try {
    const fullPath = path.join(__dirname, 'src/asset_main/portfolio-data.json');
    const data = await fs.readFile(fullPath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Asset server running on port ${PORT}`);
  console.log(`📁 Serving assets from: ${path.join(__dirname, 'src/asset_main')}`);
  console.log(`🌐 Angular app available at: http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});
