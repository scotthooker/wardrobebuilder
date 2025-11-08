import { openrouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import fetch from 'node-fetch';

/**
 * Generate a detailed prompt for furniture mockup using AI
 * Supports both wardrobes and desks
 */
export async function generatePrompt({ materials, buildName, buildCharacter, hardware, doors, furnitureType = 'wardrobe', configuration }) {
  try {
    const isDesk = furnitureType === 'desk';

    // Use AI to generate a refined prompt
    const systemPrompt = isDesk
      ? `You are an expert interior designer and architectural visualizer. Generate a detailed, professional image generation prompt for an AI image model to create a photorealistic home office desk visualization.

The prompt should include:
- Professional home office photography style
- Specific material descriptions and textures
- Lighting and workspace ambiance
- Composition and viewpoint (3/4 angle showing full desk)
- Level of detail and finish quality
- Workspace organization and accessories

Keep the prompt concise but highly descriptive (2-3 sentences maximum).`
      : `You are an expert interior designer and architectural visualizer. Generate a detailed, professional image generation prompt for an AI image model to create a photorealistic wardrobe visualization.

The prompt should include:
- Architectural and professional photography style
- Specific material descriptions and textures
- Lighting and mood
- Composition and viewpoint
- Level of detail and finish quality

Keep the prompt concise but highly descriptive (2-3 sentences maximum).`;

    let userPrompt;

    if (isDesk) {
      // Desk-specific prompt generation
      const desktopMaterial = materials.find(m => m.component?.toLowerCase().includes('desktop'));
      const baseMaterial = materials.find(m =>
        m.component?.toLowerCase().includes('pedestal') ||
        m.component?.toLowerCase().includes('panel')
      );
      const deskShape = configuration?.deskShape || 'straight';
      const baseType = configuration?.base?.type || 'legs';
      const hasOverhead = configuration?.overhead?.enabled || false;
      const accessories = configuration?.accessories || {};

      userPrompt = `Create an image generation prompt for a desk called "${buildName}" with character: "${buildCharacter}".

Desk specifications:
- Shape: ${deskShape.replace('_', '-')}
- Base: ${baseType.replace('_', ' ')}
- Desktop material: ${desktopMaterial?.material || 'Oak Veneered MDF'} (${desktopMaterial?.thickness || '25mm'})
${baseMaterial ? `- Base material: ${baseMaterial.material} (${baseMaterial.thickness})` : ''}
${hasOverhead ? `- Overhead storage: ${configuration.overhead.type.replace('_', ' ')}` : ''}
${Object.keys(accessories).filter(k => accessories[k]).length > 0 ? `- Accessories: ${Object.keys(accessories).filter(k => accessories[k]).join(', ').replace(/_/g, ' ')}` : ''}

Generate a prompt that captures the essence of this desk build while being suitable for an AI image generator. Focus on workspace organization and home office aesthetics.`;
    } else {
      // Wardrobe-specific prompt generation
      const carcassMaterial = materials.find(m =>
        m.category === 'CARCASS' || m.component?.toLowerCase().includes('carcass')
      );
      const liningMaterial = materials.find(m =>
        m.category === 'LINING' || m.component?.toLowerCase().includes('lining')
      );
      const drawerMaterial = materials.find(m =>
        m.category === 'DRAWER' || m.component?.toLowerCase().includes('drawer')
      );
      const doorCount = doors ? Object.values(doors).reduce((sum, door) => sum + (door.qty || 0), 0) : 0;

      userPrompt = `Create an image generation prompt for a wardrobe called "${buildName}" with character: "${buildCharacter}".

Materials used:
- Carcass: ${carcassMaterial?.material || 'Standard MDF'} (${carcassMaterial?.thickness || '18mm'})
${liningMaterial ? `- Interior lining: ${liningMaterial.material} (${liningMaterial.thickness})` : ''}
${drawerMaterial ? `- Drawer boxes: ${drawerMaterial.material} (${drawerMaterial.thickness})` : ''}

${doorCount ? `Total doors/drawer fronts: ${doorCount}` : ''}
${hardware ? `Hardware items: ${Object.keys(hardware).length}` : ''}

Generate a prompt that captures the essence of this build while being suitable for an AI image generator.`;
    }

    const response = await generateText({
      model: openrouter('anthropic/claude-3.5-sonnet'),
      prompt: userPrompt,
      system: systemPrompt,
      temperature: 0.7,
      maxTokens: 300
    });

    return response.text.trim();

  } catch (error) {
    console.error('Error generating prompt with AI:', error);

    // Fallback to template-based prompt based on furniture type
    if (furnitureType === 'desk') {
      return generateDeskFallbackPrompt({ materials, buildName, buildCharacter, configuration });
    } else {
      return generateWardrobeFallbackPrompt({ materials, buildName, buildCharacter, hardware });
    }
  }
}

/**
 * Fallback prompt generation for desks
 */
function generateDeskFallbackPrompt({ materials, buildName, buildCharacter, configuration }) {
  const desktopMaterial = materials.find(m => m.component?.toLowerCase().includes('desktop'));
  const deskShape = configuration?.deskShape || 'straight';
  const baseType = configuration?.base?.type || 'legs';

  let prompt = `Professional product photography of a ${deskShape.replace('_', '-')} home office desk. ${buildCharacter || 'Modern functional design'}. `;

  if (desktopMaterial) {
    const matName = desktopMaterial.material.toLowerCase();
    if (matName.includes('oak')) {
      prompt += `Premium oak veneered desktop with rich natural grain and protective coating. `;
    } else if (matName.includes('walnut')) {
      prompt += `Luxury walnut veneered desktop with deep brown tones. `;
    } else {
      prompt += `Quality engineered wood desktop surface. `;
    }
  }

  if (baseType === 'pedestals') {
    prompt += `Pedestal storage units with soft-close drawer systems. `;
  } else if (baseType === 'panel_sides') {
    prompt += `Solid panel sides for clean minimalist aesthetic. `;
  } else if (baseType === 'trestle') {
    prompt += `Industrial trestle base with modern appeal. `;
  } else {
    prompt += `Adjustable metal legs for ergonomic comfort. `;
  }

  if (configuration?.overhead?.enabled) {
    prompt += `Overhead storage ${configuration.overhead.type.replace('_', ' ')} for organization. `;
  }

  prompt += `Front 3/4 angled view showing full workspace setup. Photorealistic rendering, contemporary home office setting with neutral walls. Natural lighting from window with soft shadows. Clean organized workspace with monitor, keyboard, and office accessories visible. Professional furniture catalog photography style. High resolution, detailed textures. Style: architectural visualization, home office photography.`;

  return prompt;
}

/**
 * Fallback prompt generation for wardrobes
 */
function generateWardrobeFallbackPrompt({ materials, buildName, buildCharacter, hardware }) {
  const carcassMaterial = materials.find(m =>
    m.category === 'CARCASS' || m.component?.toLowerCase().includes('carcass')
  );
  const liningMaterial = materials.find(m =>
    m.category === 'LINING' || m.component?.toLowerCase().includes('lining')
  );
  const drawerMaterial = materials.find(m =>
    m.category === 'DRAWER' || m.component?.toLowerCase().includes('drawer')
  );

  let prompt = `Professional architectural visualization of a luxury fitted wardrobe system. ${buildCharacter || 'Modern minimalist design'}. `;

  if (carcassMaterial) {
    prompt += `Built with ${carcassMaterial.material} panels in ${carcassMaterial.thickness} thickness. `;
  }

  if (liningMaterial) {
    const materialName = liningMaterial.material.toLowerCase();
    if (materialName.includes('oak')) {
      prompt += `Interior surfaces finished in elegant oak veneer with rich grain pattern. `;
    } else if (materialName.includes('ash')) {
      prompt += `Interior surfaces finished in elegant ash veneer with light blonde color and distinctive grain. `;
    } else if (materialName.includes('walnut')) {
      prompt += `Interior surfaces finished in rich walnut veneer with deep brown tones. `;
    } else {
      prompt += `Interior surfaces with premium veneer finish. `;
    }
  }

  if (drawerMaterial) {
    const materialName = drawerMaterial.material.toLowerCase();
    if (materialName.includes('birch') || materialName.includes('plywood')) {
      prompt += `Premium birch plywood drawer boxes with dovetail joinery visible. `;
    } else {
      prompt += `Quality drawer boxes with visible craftsmanship. `;
    }
  }

  prompt += `Photorealistic rendering, studio lighting with soft shadows. Interior view showing open wardrobe with visible shelving, hanging rails, and drawer details. Focus on material quality and wood grain texture. Clean lines. Depth of field emphasizing material craftsmanship. Professional furniture catalog photography style. High resolution, detailed textures.`;

  return prompt;
}

/**
 * Generate image using OpenRouter chat completions with image-capable model
 */
export async function generateImage(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set. Please add it to your .env file.');
  }

  try {
    // Use OpenRouter's chat completions endpoint with image model
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Wardrobe Builder'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview', // Gemini Flash Image - supports image generation
        modalities: ['image', 'text'], // Required for image generation
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('OpenRouter response:', JSON.stringify(data, null, 2));

    // Extract image from response - OpenRouter returns images in message.images array
    let imageData = null;

    if (data.choices && data.choices[0]) {
      const message = data.choices[0].message;

      // Check for images in the images field (OpenRouter multimodal format)
      if (message.images && Array.isArray(message.images) && message.images.length > 0) {
        const firstImage = message.images[0];
        if (firstImage.image_url && firstImage.image_url.url) {
          imageData = firstImage.image_url.url; // This is already a base64 data URL
          console.log('Found image in message.images field');
        }
      }
    }

    if (!imageData) {
      console.error('No image found in response. Full response:', JSON.stringify(data, null, 2));
      throw new Error('No image generated in response');
    }

    return {
      success: true,
      imageData, // Base64 data URL (data:image/png;base64,...)
      model: data.model || 'google/gemini-2.5-flash-image-preview',
      usage: data.usage
    };

  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}

/**
 * Legacy function for backwards compatibility
 */
export async function generateMockup({ materials, buildName, buildCharacter }) {
  const prompt = await generatePrompt({ materials, buildName, buildCharacter });
  return { prompt };
}
