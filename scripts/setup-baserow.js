#!/usr/bin/env node
// Setup Script für Baserow Database-Struktur
// Erstellt automatisch alle benötigten Tabellen und Felder

const https = require('https')
const { promisify } = require('util')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const BASEROW_URL = process.env.NEXT_PUBLIC_BASEROW_URL || 'https://api.baserow.io'
const BASEROW_TOKEN = process.env.NEXT_PUBLIC_BASEROW_TOKEN

if (!BASEROW_TOKEN) {
  console.error('❌ NEXT_PUBLIC_BASEROW_TOKEN nicht gefunden in .env.local')
  console.error('💡 Erstelle .env.local von .env.example und trage deinen Token ein')
  process.exit(1)
}

// HTTP Client
async function apiCall(endpoint, method = 'GET', data = null) {
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
          const parsed = JSON.parse(responseData)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed)
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.error || parsed.detail || responseData}`))
          }
        } catch (error) {
          reject(new Error(`Parse Error: ${responseData}`))
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

// Database-Schema Definition
const DATABASE_SCHEMA = {
  name: 'FamilyMeal Planner',
  tables: [
    {
      name: 'Recipes',
      fields: [
        { name: 'recipe_id', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'url', type: 'url' },
        { name: 'source', type: 'single_select', options: ['chefkoch', 'kochbar', 'eatsmarter', 'marions-kochbuch', 'other'] },
        { name: 'rating', type: 'number', number_decimal_places: 1 },
        { name: 'review_count', type: 'number' },
        { name: 'cook_time', type: 'number' },
        { name: 'servings', type: 'number' },
        { name: 'difficulty', type: 'single_select', options: ['einfach', 'mittel', 'schwer'] },
        { name: 'category', type: 'single_select', options: ['hauptgang', 'vorspeise', 'nachspeise', 'dessert', 'suppe', 'salat', 'snack', 'beilage', 'frühstück', 'getränk'] },
        { name: 'cuisine', type: 'single_select', options: ['deutsch', 'bayerisch', 'schwäbisch', 'rheinisch', 'österreichisch', 'schweizer', 'italienisch', 'französisch', 'spanisch', 'griechisch', 'türkisch', 'indisch', 'chinesisch', 'japanisch', 'thailändisch', 'mexikanisch', 'amerikanisch', 'russisch', 'ungarisch', 'polnisch', 'tschechisch', 'kroatisch', 'asiatisch', 'vegetarisch', 'mediterran', 'orientalisch', 'skandinavisch', 'fränkisch', 'international'] },
        { name: 'ingredients', type: 'long_text' },
        { name: 'image_url', type: 'url' },
        { name: 'description', type: 'long_text' },
        { name: 'tags', type: 'long_text' },
        { name: 'added_date', type: 'date' },
        { name: 'last_used', type: 'date' },
        { name: 'family_rating', type: 'number' }
      ]
    },
    {
      name: 'Preferences',
      fields: [
        { name: 'ingredient', type: 'text' },
        { name: 'status', type: 'single_select', options: ['liebling', 'oft', 'neutral', 'selten', 'verboten'] },
        { name: 'notes', type: 'long_text' }
      ]
    },
    {
      name: 'Week_Plans',
      fields: [
        { name: 'plan_id', type: 'text' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'status', type: 'single_select', options: ['geplant', 'aktiv', 'abgeschlossen'] },
        { name: 'day_plans', type: 'long_text' },
        { name: 'total_cook_time', type: 'number' },
        { name: 'average_rating', type: 'number', number_decimal_places: 1 }
      ]
    },
    {
      name: 'Shopping_Lists',
      fields: [
        { name: 'item_id', type: 'text' },
        { name: 'ingredient', type: 'text' },
        { name: 'amount', type: 'text' },
        { name: 'unit', type: 'text' },
        { name: 'category', type: 'single_select', options: ['fleisch', 'gemüse', 'obst', 'milchprodukte', 'getreide', 'gewürze', 'sonstiges'] },
        { name: 'checked', type: 'boolean' },
        { name: 'week_plan_id', type: 'text' },
        { name: 'recipe_ids', type: 'long_text' }
      ]
    }
  ]
}

async function setupDatabase() {
  console.log('🚀 Starting Baserow Database Setup...')
  console.log(`🔗 Baserow URL: ${BASEROW_URL}`)

  try {
    // 1. Create Database
    console.log('\n📊 Creating Database...')
    const database = await apiCall('/api/database/databases/', 'POST', {
      name: DATABASE_SCHEMA.name
    })
    console.log(`✅ Database created: ${database.name} (ID: ${database.id})`)

    const databaseId = database.id
    const results = {
      database_id: databaseId,
      tables: {}
    }

    // 2. Create Tables
    console.log('\n📋 Creating Tables...')
    
    for (const tableSchema of DATABASE_SCHEMA.tables) {
      console.log(`\n🔧 Creating table: ${tableSchema.name}`)
      
      // Create table
      const table = await apiCall(`/api/database/tables/database/${databaseId}/`, 'POST', {
        name: tableSchema.name,
        init_with_data: false
      })
      
      console.log(`✅ Table created: ${table.name} (ID: ${table.id})`)
      results.tables[tableSchema.name.toLowerCase().replace('_', '')] = table.id

      // Add fields (skip the default 'Name' field)
      for (const fieldSchema of tableSchema.fields) {
        try {
          console.log(`  📝 Adding field: ${fieldSchema.name}`)
          
          const fieldData = {
            name: fieldSchema.name,
            type: fieldSchema.type
          }

          // Add type-specific options
          if (fieldSchema.options) {
            fieldData.select_options = fieldSchema.options.map((option, index) => ({
              value: option,
              color: `color_${index + 1}`
            }))
          }

          if (fieldSchema.number_decimal_places !== undefined) {
            fieldData.number_decimal_places = fieldSchema.number_decimal_places
          }

          await apiCall(`/api/database/fields/table/${table.id}/`, 'POST', fieldData)
          console.log(`    ✅ Field added: ${fieldSchema.name}`)
        } catch (error) {
          console.error(`    ❌ Failed to add field ${fieldSchema.name}:`, error.message)
        }
      }

      // Wait between tables to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // 3. Update Environment Template
    console.log('\n📝 Updating environment configuration...')
    
    let envContent = `# FamilyMeal Planner - Baserow Integration
# Generated by setup-baserow.js on ${new Date().toISOString()}

# Baserow Configuration
NEXT_PUBLIC_BASEROW_URL=${BASEROW_URL}
NEXT_PUBLIC_BASEROW_TOKEN=${BASEROW_TOKEN}

# Database & Tables
NEXT_PUBLIC_BASEROW_DATABASE_ID=${results.database_id}
NEXT_PUBLIC_BASEROW_RECIPES_TABLE_ID=${results.tables.recipes || 'UPDATE_MANUALLY'}
NEXT_PUBLIC_BASEROW_PREFERENCES_TABLE_ID=${results.tables.preferences || 'UPDATE_MANUALLY'}
NEXT_PUBLIC_BASEROW_WEEK_PLANS_TABLE_ID=${results.tables.weekplans || 'UPDATE_MANUALLY'}
NEXT_PUBLIC_BASEROW_SHOPPING_TABLE_ID=${results.tables.shoppinglists || 'UPDATE_MANUALLY'}

# Development Settings
NEXT_PUBLIC_ENABLE_BASEROW=true
NEXT_PUBLIC_CACHE_TTL=300000
NEXT_PUBLIC_BATCH_SIZE=100

# For debugging
NEXT_PUBLIC_DEBUG_BASEROW=false
`

    require('fs').writeFileSync('.env.baserow', envContent)
    console.log('✅ Environment file created: .env.baserow')
    console.log('💡 Copy to .env.local to activate')

    // 4. Success Summary
    console.log('\n🎉 Setup Complete!')
    console.log('📋 Summary:')
    console.log(`  Database ID: ${results.database_id}`)
    Object.entries(results.tables).forEach(([name, id]) => {
      console.log(`  ${name.charAt(0).toUpperCase() + name.slice(1)} Table ID: ${id}`)
    })

    console.log('\n📝 Next Steps:')
    console.log('1. cp .env.baserow .env.local')
    console.log('2. npm run migrate-data (to import 2000+ recipes)')
    console.log('3. npm run dev (to test the integration)')

    return results

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason)
  process.exit(1)
})

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
}

module.exports = { setupDatabase, apiCall }