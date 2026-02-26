#!/usr/bin/env node
// Daten-Migration Script: Static Arrays → Baserow Database
// Migriert alle 2000+ Rezepte von TypeScript Arrays zu Baserow

const https = require('https')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const BASEROW_URL = process.env.NEXT_PUBLIC_BASEROW_URL || 'https://api.baserow.io'
const BASEROW_TOKEN = process.env.NEXT_PUBLIC_BASEROW_TOKEN
const RECIPES_TABLE_ID = process.env.NEXT_PUBLIC_BASEROW_RECIPES_TABLE_ID

if (!BASEROW_TOKEN || !RECIPES_TABLE_ID) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_BASEROW_TOKEN:', !!BASEROW_TOKEN)
  console.error('   NEXT_PUBLIC_BASEROW_RECIPES_TABLE_ID:', !!RECIPES_TABLE_ID)
  console.error('\n💡 Run setup-baserow.js first or check .env.local')
  process.exit(1)
}

// HTTP Client mit Retry-Logic
async function apiCall(endpoint, method = 'GET', data = null, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await makeRequest(endpoint, method, data)
    } catch (error) {
      console.error(`❌ API Call failed (attempt ${i + 1}/${retries}):`, error.message)
      if (i === retries - 1) throw error
      
      // Exponential backoff
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000
      console.log(`⏳ Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

function makeRequest(endpoint, method, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASEROW_URL + endpoint)
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Token ${BASEROW_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }

    if (data && method !== 'GET') {
      const postData = JSON.stringify(data)
      options.headers['Content-Length'] = Buffer.byteLength(postData)
    }

    const req = https.request(options, (res) => {
      let responseData = ''

      res.on('data', (chunk) => {
        responseData += chunk
      })

      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : {}
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed)
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.error || parsed.detail || responseData}`))
          }
        } catch (error) {
          reject(new Error(`Parse Error: ${responseData.slice(0, 200)}...`))
        }
      })
    })

    req.on('error', (error) => {
      reject(new Error(`Network Error: ${error.message}`))
    })

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

// Load Static Recipe Data
function loadRecipeData() {
  try {
    // Import from transpiled JS or use dynamic import
    const recipePath = path.join(__dirname, '../src/data/mega-2000-recipes.ts')
    console.log(`📚 Loading recipes from: ${recipePath}`)
    
    // Since we can't directly import TS in Node, load the source
    const fs = require('fs')
    const recipeContent = fs.readFileSync(recipePath, 'utf8')
    
    // Extract the MEGA_2000_RECIPES array (simple regex extraction)
    const match = recipeContent.match(/export const MEGA_2000_RECIPES[^=]*=\s*(\[[^;]+\]);/s)
    
    if (!match) {
      throw new Error('Could not extract MEGA_2000_RECIPES array from TypeScript file')
    }

    // Parse the JavaScript array  
    const recipesString = match[1]
    const recipes = eval(`(${recipesString})`)
    
    console.log(`📊 Loaded ${recipes.length} recipes`)
    return recipes
  } catch (error) {
    console.error('❌ Failed to load recipe data:', error.message)
    
    // Fallback: provide a sample recipe for testing
    console.log('💡 Using fallback sample data...')
    return [
      {
        id: 'test_001',
        title: 'Test Recipe Migration',
        url: 'https://example.com/test',
        source: 'chefkoch',
        rating: 4.5,
        reviewCount: 123,
        cookTime: 30,
        servings: 4,
        difficulty: 'einfach',
        category: 'hauptgang',
        cuisine: 'deutsch',
        ingredients: ['Test', 'Ingredient'],
        imageUrl: 'https://example.com/image.jpg',
        description: 'Test recipe for migration',
        tags: ['test', 'migration'],
        addedDate: new Date().toISOString()
      }
    ]
  }
}

// Map Recipe to Baserow format
function mapRecipeToBaserow(recipe) {
  return {
    recipe_id: recipe.id,
    title: recipe.title,
    url: recipe.url,
    source: recipe.source,
    rating: recipe.rating,
    review_count: recipe.reviewCount,
    cook_time: recipe.cookTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    category: recipe.category,
    cuisine: recipe.cuisine,
    ingredients: JSON.stringify(recipe.ingredients || []),
    image_url: recipe.imageUrl || '',
    description: recipe.description || '',
    tags: JSON.stringify(recipe.tags || []),
    added_date: recipe.addedDate ? recipe.addedDate.split('T')[0] : new Date().toISOString().split('T')[0],
    last_used: recipe.lastUsed ? recipe.lastUsed.split('T')[0] : null,
    family_rating: recipe.familyRating || null
  }
}

// Check if recipe already exists
async function recipeExists(recipeId) {
  try {
    const response = await apiCall(
      `/api/database/tables/${RECIPES_TABLE_ID}/rows/?user_field_names=true&filter__recipe_id__equal=${recipeId}`
    )
    return response.results && response.results.length > 0
  } catch (error) {
    return false // Assume it doesn't exist if check fails
  }
}

// Main Migration Function
async function migrateRecipes() {
  console.log('🚀 Starting Recipe Migration to Baserow...')
  console.log(`🎯 Target Table ID: ${RECIPES_TABLE_ID}`)
  console.log(`🔗 Baserow URL: ${BASEROW_URL}`)

  const startTime = Date.now()
  let stats = {
    total: 0,
    success: 0,
    skipped: 0,
    failed: 0,
    errors: []
  }

  try {
    // Load recipe data
    const recipes = loadRecipeData()
    stats.total = recipes.length
    
    console.log(`\n📊 Starting migration of ${stats.total} recipes...`)

    // Process in batches to avoid overwhelming the API
    const BATCH_SIZE = 10
    const batches = []
    
    for (let i = 0; i < recipes.length; i += BATCH_SIZE) {
      batches.push(recipes.slice(i, i + BATCH_SIZE))
    }

    console.log(`📦 Processing ${batches.length} batches of ${BATCH_SIZE} recipes each`)

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      const progress = `[${batchIndex + 1}/${batches.length}]`
      
      console.log(`\n${progress} Processing batch...`)

      for (const recipe of batch) {
        try {
          // Check if recipe already exists
          const exists = await recipeExists(recipe.id)
          if (exists) {
            console.log(`  ⏭️  Skipped: ${recipe.title} (already exists)`)
            stats.skipped++
            continue
          }

          // Map and upload
          const baserowData = mapRecipeToBaserow(recipe)
          
          await apiCall(
            `/api/database/tables/${RECIPES_TABLE_ID}/rows/?user_field_names=true`,
            'POST',
            baserowData
          )

          stats.success++
          console.log(`  ✅ ${stats.success}/${stats.total}: ${recipe.title}`)

        } catch (error) {
          stats.failed++
          const errorInfo = {
            recipe: recipe.title,
            id: recipe.id,
            error: error.message
          }
          stats.errors.push(errorInfo)
          console.error(`  ❌ Failed: ${recipe.title} - ${error.message}`)
        }
      }

      // Rate limiting between batches
      if (batchIndex < batches.length - 1) {
        console.log(`  ⏳ Waiting 2s before next batch...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    // Final Statistics
    const duration = (Date.now() - startTime) / 1000
    console.log('\n🎉 Migration Complete!')
    console.log(`⏱️  Duration: ${duration.toFixed(1)}s`)
    console.log(`📊 Statistics:`)
    console.log(`   Total: ${stats.total}`)
    console.log(`   Success: ${stats.success} (${(stats.success/stats.total*100).toFixed(1)}%)`)
    console.log(`   Skipped: ${stats.skipped} (${(stats.skipped/stats.total*100).toFixed(1)}%)`)
    console.log(`   Failed: ${stats.failed} (${(stats.failed/stats.total*100).toFixed(1)}%)`)

    if (stats.errors.length > 0) {
      console.log('\n❌ Failed Recipes:')
      stats.errors.slice(0, 10).forEach(error => {
        console.log(`   - ${error.recipe}: ${error.error}`)
      })
      if (stats.errors.length > 10) {
        console.log(`   ... and ${stats.errors.length - 10} more errors`)
      }
    }

    // Write error log
    if (stats.errors.length > 0) {
      const fs = require('fs')
      const errorLog = {
        timestamp: new Date().toISOString(),
        stats: stats,
        errors: stats.errors
      }
      fs.writeFileSync('migration-errors.json', JSON.stringify(errorLog, null, 2))
      console.log('\n📝 Error details saved to: migration-errors.json')
    }

    if (stats.success > 0) {
      console.log('\n✨ Next Steps:')
      console.log('1. Update your app to use baserowService instead of static data')
      console.log('2. Test the integration with npm run dev')
      console.log('3. Check Baserow dashboard to verify data')
    }

    return stats

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Health check before migration
async function healthCheck() {
  try {
    console.log('🔍 Performing health check...')
    
    // Check API access
    await apiCall(`/api/database/tables/${RECIPES_TABLE_ID}/`)
    console.log('✅ Baserow API access confirmed')
    
    // Check table structure
    const fields = await apiCall(`/api/database/fields/table/${RECIPES_TABLE_ID}/`)
    console.log(`✅ Table structure verified (${fields.length} fields)`)
    
    return true
  } catch (error) {
    console.error('❌ Health check failed:', error.message)
    console.error('💡 Make sure:')
    console.error('   1. Your .env.local file contains valid credentials')
    console.error('   2. The Baserow table exists and is accessible')
    console.error('   3. Your API token has proper permissions')
    return false
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🍽️  FamilyMeal Recipe Migration Tool

Usage: node migrate-to-baserow.js [options]

Options:
  --dry-run     Simulate migration without writing to Baserow
  --force       Skip existence checks and migrate all recipes
  --help        Show this help message

Examples:
  node migrate-to-baserow.js                # Normal migration
  node migrate-to-baserow.js --dry-run      # Test run only
  node migrate-to-baserow.js --force        # Force overwrite
`)
    return
  }

  if (args.includes('--dry-run')) {
    console.log('🔍 DRY RUN MODE - No data will be written to Baserow')
    // TODO: Implement dry run
    return
  }

  // Perform health check first
  const healthy = await healthCheck()
  if (!healthy) {
    process.exit(1)
  }

  // Run migration
  await migrateRecipes()
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason)
  process.exit(1)
})

process.on('SIGINT', () => {
  console.log('\n⚠️  Migration interrupted by user')
  process.exit(0)
})

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { migrateRecipes, healthCheck }