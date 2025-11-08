import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function updateBuildBudgets() {
  console.log('🔧 Updating all builds with initial budgets...\n');

  try {
    // Fetch all builds
    const response = await fetch(`${API_URL}/api/builds`);
    const builds = await response.json();

    console.log(`Found ${builds.length} builds to update\n`);

    for (const build of builds) {
      // Skip if build already has a budget
      if (build.budget && build.budget !== 5000) {
        console.log(`✓ Build #${build.id} "${build.name}" already has budget: £${build.budget}`);
        continue;
      }

      // Determine appropriate budget based on grand total
      let budget;
      const grandTotal = build.costs?.grandTotal || 0;

      if (grandTotal < 3000) {
        budget = 4000;
      } else if (grandTotal < 5000) {
        budget = 6000;
      } else if (grandTotal < 7000) {
        budget = 8000;
      } else {
        budget = 10000;
      }

      // Update the build
      const updateResponse = await fetch(`${API_URL}/api/builds/${build.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...build,
          budget,
          costs: {
            ...build.costs,
            savingsVsBudget: budget - grandTotal
          }
        })
      });

      if (updateResponse.ok) {
        console.log(`✓ Build #${build.id} "${build.name}": Set budget to £${budget} (Grand Total: £${grandTotal.toFixed(2)})`);
      } else {
        console.error(`✗ Failed to update build #${build.id}`);
      }
    }

    console.log('\n✅ All builds updated successfully!');
  } catch (error) {
    console.error('❌ Error updating builds:', error);
    throw error;
  }
}

updateBuildBudgets();
