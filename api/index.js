import express from 'express';
import cors from 'cors';
import { generatePrompt, generateImage } from '../server/imageGeneration.js';
import {
  getAllBuilds,
  getBuildById,
  createBuild,
  updateBuild,
  deleteBuild,
  getCarcassMaterials,
  getHardwareItems,
  getDoorDrawerProducts,
  getSuppliers
} from '../server/db.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== Materials Endpoints ====================

app.get('/api/materials/sheet-goods', async (req, res) => {
  try {
    const materials = await getCarcassMaterials();
    res.json({
      materials: materials,
      defaultMaterial: 'Moisture Resistant MDF',
      recommendedThickness: '18mm'
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// ==================== Hardware Endpoints ====================

app.get('/api/hardware', async (req, res) => {
  try {
    const hardware = await getHardwareItems();
    res.json(hardware);
  } catch (error) {
    console.error('Error fetching hardware:', error);
    res.status(500).json({ error: 'Failed to fetch hardware items' });
  }
});

// ==================== Doors/Drawers Endpoints ====================

app.get('/api/doors-drawers', async (req, res) => {
  try {
    const products = await getDoorDrawerProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching doors/drawers:', error);
    res.status(500).json({ error: 'Failed to fetch door/drawer products' });
  }
});

// ==================== Suppliers Endpoints ====================

app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await getSuppliers();
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// ==================== Builds CRUD Endpoints ====================

app.get('/api/builds', async (req, res) => {
  try {
    const builds = await getAllBuilds();
    res.json(builds);
  } catch (error) {
    console.error('Error fetching builds:', error);
    res.status(500).json({ error: 'Failed to fetch builds' });
  }
});

app.get('/api/builds/:id', async (req, res) => {
  try {
    const build = await getBuildById(parseInt(req.params.id));
    if (!build) {
      return res.status(404).json({ error: 'Build not found' });
    }
    res.json(build);
  } catch (error) {
    console.error('Error fetching build:', error);
    res.status(500).json({ error: 'Failed to fetch build' });
  }
});

app.post('/api/builds', async (req, res) => {
  try {
    const build = await createBuild(req.body);
    res.status(201).json(build);
  } catch (error) {
    console.error('Error creating build:', error);
    res.status(500).json({ error: 'Failed to create build' });
  }
});

app.put('/api/builds/:id', async (req, res) => {
  try {
    const build = await updateBuild(parseInt(req.params.id), req.body);
    if (!build) {
      return res.status(404).json({ error: 'Build not found' });
    }
    res.json(build);
  } catch (error) {
    console.error('Error updating build:', error);
    res.status(500).json({ error: 'Failed to update build' });
  }
});

app.delete('/api/builds/:id', async (req, res) => {
  try {
    const success = await deleteBuild(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Build not found' });
    }
    res.json({ message: 'Build deleted successfully' });
  } catch (error) {
    console.error('Error deleting build:', error);
    res.status(500).json({ error: 'Failed to delete build' });
  }
});

// ==================== AI Image Generation ====================

app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { materials, buildName, buildCharacter, hardware, doors } = req.body;
    const prompt = await generatePrompt(materials, buildName, buildCharacter, hardware, doors);
    res.json({ prompt });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({
      error: 'Failed to generate prompt',
      details: error.message
    });
  }
});

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, buildId } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await generateImage(prompt, buildId);
    res.json(result);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({
      error: 'Failed to generate image',
      details: error.message
    });
  }
});

// Export for Vercel serverless
export default app;
