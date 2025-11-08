import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { generatePrompt, generateImage } from './imageGeneration.js';
import {
  getAllBuilds,
  getBuildsByType,
  getBuildById,
  createBuild,
  updateBuild,
  deleteBuild,
  getCarcassMaterials,
  getHardwareItems,
  getDoorDrawerProducts,
  getSuppliers
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from Vite build
const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');

// Serve generated images
const imagesDir = path.join(__dirname, '..', 'public', 'generated-images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
app.use('/generated-images', express.static(imagesDir));

// Serve public assets (data files, images)
app.use('/data', express.static(path.join(publicDir, 'data')));
app.use('/generated_images', express.static(path.join(publicDir, 'generated_images')));

// Serve static frontend files (built by Vite)
app.use(express.static(distDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== Materials Endpoints ====================

// Get sheet goods materials with pricing
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

// Get all hardware items
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

// Get all door/drawer products with multi-supplier pricing
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

// Get all suppliers (optionally filtered by type)
app.get('/api/suppliers', async (req, res) => {
  try {
    const type = req.query.type; // Optional: 'SHEET_GOODS', 'DOORS_DRAWERS'
    const suppliers = await getSuppliers(type);
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// ==================== Build CRUD Endpoints ====================

// Get all builds
app.get('/api/builds', async (req, res) => {
  try {
    const builds = await getAllBuilds();
    res.json(builds);
  } catch (error) {
    console.error('Error fetching builds:', error);
    res.status(500).json({ error: 'Failed to fetch builds' });
  }
});

// Get builds by furniture type
app.get('/api/builds/type/:type', async (req, res) => {
  try {
    const furnitureType = req.params.type;
    const builds = await getBuildsByType(furnitureType);
    res.json(builds);
  } catch (error) {
    console.error('Error fetching builds by type:', error);
    res.status(500).json({ error: 'Failed to fetch builds by type' });
  }
});

// Get single build
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

// Create new build
app.post('/api/builds', async (req, res) => {
  try {
    const build = await createBuild(req.body);
    res.status(201).json(build);
  } catch (error) {
    console.error('Error creating build:', error);
    res.status(500).json({ error: 'Failed to create build' });
  }
});

// Update build
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

// Delete build
app.delete('/api/builds/:id', async (req, res) => {
  try {
    const success = await deleteBuild(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Build not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting build:', error);
    res.status(500).json({ error: 'Failed to delete build' });
  }
});

// ==================== AI Generation Endpoints ====================

// Generate prompt from materials
app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { materials, buildName, buildCharacter, hardware, doors, furnitureType, configuration } = req.body;

    if (!materials || !Array.isArray(materials)) {
      return res.status(400).json({ error: 'Materials array is required' });
    }

    const prompt = await generatePrompt({
      materials,
      buildName,
      buildCharacter,
      hardware,
      doors,
      furnitureType: furnitureType || 'wardrobe',
      configuration
    });

    res.json({ prompt });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ error: error.message || 'Failed to generate prompt' });
  }
});

// Generate image from prompt and add to gallery
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, buildId } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await generateImage(prompt);

    // Save image to disk
    const filename = `build-${buildId || Date.now()}-${Date.now()}.png`;
    const filepath = path.join(imagesDir, filename);

    // Convert base64 to buffer and save
    if (result.imageData) {
      const base64Data = result.imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filepath, buffer);

      // Return public URL
      result.imageUrl = `/generated-images/${filename}`;

      // Add to build's image gallery if buildId provided
      if (buildId) {
        const build = await getBuildById(parseInt(buildId));
        if (build) {
          const gallery = build.image_gallery || [];

          // Add new image to gallery
          gallery.push({
            url: result.imageUrl,
            prompt: prompt,
            created_at: new Date().toISOString(),
            is_primary: gallery.length === 0 // First image is primary
          });

          await updateBuild(parseInt(buildId), {
            image_gallery: JSON.stringify(gallery)
          });
        }
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

// Set primary image in gallery
app.post('/api/builds/:id/gallery/set-primary', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const buildId = parseInt(req.params.id);

    const build = await getBuildById(buildId);
    if (!build) {
      return res.status(404).json({ error: 'Build not found' });
    }

    const gallery = build.image_gallery || [];

    // Set all to non-primary, then set the selected one as primary
    const updatedGallery = gallery.map(img => ({
      ...img,
      is_primary: img.url === imageUrl
    }));

    await updateBuild(buildId, {
      image_gallery: JSON.stringify(updatedGallery)
    });

    res.json({ success: true, gallery: updatedGallery });
  } catch (error) {
    console.error('Error setting primary image:', error);
    res.status(500).json({ error: error.message || 'Failed to set primary image' });
  }
});

// Delete image from gallery
app.post('/api/builds/:id/gallery/delete', async (req, res) => {
  try {
    const buildId = parseInt(req.params.id);
    const { imageUrl } = req.body;

    const build = await getBuildById(buildId);
    if (!build) {
      return res.status(404).json({ error: 'Build not found' });
    }

    let gallery = build.image_gallery || [];

    // Remove the image
    const removedImage = gallery.find(img => img.url === imageUrl);
    gallery = gallery.filter(img => img.url !== imageUrl);

    // If we removed the primary image, set first image as primary
    if (removedImage && removedImage.is_primary && gallery.length > 0) {
      gallery[0].is_primary = true;
    }

    await updateBuild(buildId, {
      image_gallery: JSON.stringify(gallery)
    });

    // Delete the physical file
    if (removedImage) {
      const filename = removedImage.url.split('/').pop();
      const filepath = path.join(imagesDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    res.json({ success: true, gallery });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: error.message || 'Failed to delete image' });
  }
});

// Legacy endpoint (for backwards compatibility)
app.post('/api/generate-mockup', async (req, res) => {
  try {
    const { materials, buildName, buildCharacter } = req.body;

    if (!materials || !Array.isArray(materials)) {
      return res.status(400).json({ error: 'Materials array is required' });
    }

    const prompt = await generatePrompt({ materials, buildName, buildCharacter });
    res.json({ prompt });
  } catch (error) {
    console.error('Error generating mockup:', error);
    res.status(500).json({ error: error.message || 'Failed to generate mockup' });
  }
});

// Serve index.html for all non-API routes (client-side routing)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Images directory: ${imagesDir}`);
  console.log(`🔑 OpenRouter API Key: ${process.env.OPENROUTER_API_KEY ? '✓ Set' : '✗ Not set'}`);
});
