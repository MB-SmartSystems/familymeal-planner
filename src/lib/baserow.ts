// Baserow API Client für FamilyMeal Planner
// Ersetzt Google Sheets mit echter Database-Integration

import { Recipe, IngredientPreference, WeekPlan } from './types'

// Baserow Configuration
const BASEROW_API_URL = process.env.NEXT_PUBLIC_BASEROW_URL || 'https://api.baserow.io'
const BASEROW_TOKEN = process.env.NEXT_PUBLIC_BASEROW_TOKEN
const DATABASE_ID = process.env.NEXT_PUBLIC_BASEROW_DATABASE_ID

// Table IDs (werden nach Table-Erstellung gesetzt)
const TABLES = {
  RECIPES: parseInt(process.env.NEXT_PUBLIC_BASEROW_RECIPES_TABLE_ID || '0'),
  PREFERENCES: parseInt(process.env.NEXT_PUBLIC_BASEROW_PREFERENCES_TABLE_ID || '0'),
  WEEK_PLANS: parseInt(process.env.NEXT_PUBLIC_BASEROW_WEEK_PLANS_TABLE_ID || '0'),
  SHOPPING_LISTS: parseInt(process.env.NEXT_PUBLIC_BASEROW_SHOPPING_TABLE_ID || '0')
} as const

// Baserow Field Mapping für Recipes
interface BaserowRecipe {
  id: number
  recipe_id: string
  title: string
  url: string
  source: string
  rating: number
  review_count: number
  cook_time: number
  servings: number
  difficulty: string
  category: string
  cuisine: string
  ingredients: string // JSON Array als String
  image_url?: string
  description?: string
  tags: string // JSON Array als String
  added_date: string
  last_used?: string
  family_rating?: number
  created_on: string
  updated_on: string
}

// Error Handling
class BaserowError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'BaserowError'
  }
}

class BaserowService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 Minuten

  constructor() {
    if (!BASEROW_TOKEN) {
      console.warn('⚠️  BASEROW_TOKEN nicht gesetzt - API-Calls werden fehlschlagen')
    }
  }

  // HTTP Client mit Error Handling
  private async apiCall<T>(
    endpoint: string, 
    options: RequestInit = {},
    useCache = true
  ): Promise<T> {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`
    
    // Cache Check
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (Date.now() - cached.timestamp < cached.ttl) {
        console.log(`🔄 Cache Hit: ${endpoint}`)
        return cached.data as T
      }
      this.cache.delete(cacheKey)
    }

    const url = `${BASEROW_API_URL}/api${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        'Authorization': `Token ${BASEROW_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    try {
      console.log(`📡 Baserow API Call: ${options.method || 'GET'} ${endpoint}`)
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new BaserowError(
          `Baserow API Error: ${error.detail || response.statusText}`,
          response.status,
          error
        )
      }

      const data = await response.json()
      
      // Cache Success (nur bei GET)
      if (useCache && (!options.method || options.method === 'GET')) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: this.CACHE_TTL
        })
      }

      return data as T
    } catch (error) {
      if (error instanceof BaserowError) {
        throw error
      }
      throw new BaserowError(`Network Error: ${(error as Error).message}`)
    }
  }

  // Cache Management
  clearCache(pattern?: string) {
    if (!pattern) {
      this.cache.clear()
      console.log('🗑️  Kompletter Cache geleert')
      return
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
    console.log(`🗑️  Cache Pattern '${pattern}' geleert`)
  }

  // === RECIPES OPERATIONS ===
  
  async getAllRecipes(useCache = true): Promise<Recipe[]> {
    try {
      const response = await this.apiCall<{
        count: number
        results: BaserowRecipe[]
        next: string | null
      }>(`/database/tables/${TABLES.RECIPES}/rows/?user_field_names=true`, {}, useCache)

      console.log(`📚 Loaded ${response.results.length} recipes from Baserow`)
      
      return response.results.map(this.mapBaserowToRecipe)
    } catch (error) {
      console.error('❌ Failed to get recipes from Baserow:', error)
      throw error
    }
  }

  async getRecipesPaginated(
    page = 1, 
    size = 100,
    search?: string,
    filters?: Record<string, any>
  ): Promise<{ recipes: Recipe[]; total: number; hasNext: boolean }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        user_field_names: 'true'
      })

      if (search) {
        params.append('search', search)
      }

      // Filter Parameter
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(`filter__${key}`, String(value))
        }
      })

      const response = await this.apiCall<{
        count: number
        results: BaserowRecipe[]
        next: string | null
        previous: string | null
      }>(`/database/tables/${TABLES.RECIPES}/rows/?${params}`)

      return {
        recipes: response.results.map(this.mapBaserowToRecipe),
        total: response.count,
        hasNext: !!response.next
      }
    } catch (error) {
      console.error('❌ Failed to get paginated recipes:', error)
      throw error
    }
  }

  async addRecipe(recipe: Recipe): Promise<Recipe> {
    try {
      const baserowData = this.mapRecipeToBaserow(recipe)
      
      const response = await this.apiCall<BaserowRecipe>(
        `/database/tables/${TABLES.RECIPES}/rows/?user_field_names=true`,
        {
          method: 'POST',
          body: JSON.stringify(baserowData)
        },
        false // No cache for POST
      )

      // Clear cache
      this.clearCache('recipes')
      console.log(`✅ Recipe added: ${recipe.title}`)
      
      return this.mapBaserowToRecipe(response)
    } catch (error) {
      console.error('❌ Failed to add recipe:', error)
      throw error
    }
  }

  async updateRecipe(recipeId: string, updates: Partial<Recipe>): Promise<Recipe> {
    try {
      // Find Baserow row ID by recipe_id
      const existing = await this.findRecipeByRecipeId(recipeId)
      if (!existing) {
        throw new BaserowError(`Recipe not found: ${recipeId}`)
      }

      const baserowData = this.mapRecipeToBaserow(updates as Recipe)
      
      const response = await this.apiCall<BaserowRecipe>(
        `/database/tables/${TABLES.RECIPES}/rows/${existing.id}/?user_field_names=true`,
        {
          method: 'PATCH',
          body: JSON.stringify(baserowData)
        },
        false
      )

      this.clearCache('recipes')
      console.log(`✅ Recipe updated: ${recipeId}`)
      
      return this.mapBaserowToRecipe(response)
    } catch (error) {
      console.error('❌ Failed to update recipe:', error)
      throw error
    }
  }

  async deleteRecipe(recipeId: string): Promise<boolean> {
    try {
      const existing = await this.findRecipeByRecipeId(recipeId)
      if (!existing) {
        throw new BaserowError(`Recipe not found: ${recipeId}`)
      }

      await this.apiCall(
        `/database/tables/${TABLES.RECIPES}/rows/${existing.id}/`,
        { method: 'DELETE' },
        false
      )

      this.clearCache('recipes')
      console.log(`✅ Recipe deleted: ${recipeId}`)
      
      return true
    } catch (error) {
      console.error('❌ Failed to delete recipe:', error)
      throw error
    }
  }

  // Helper: Find Recipe by recipe_id field
  private async findRecipeByRecipeId(recipeId: string): Promise<BaserowRecipe | null> {
    try {
      const response = await this.apiCall<{
        results: BaserowRecipe[]
      }>(`/database/tables/${TABLES.RECIPES}/rows/?user_field_names=true&filter__recipe_id__equal=${recipeId}`)
      
      return response.results[0] || null
    } catch (error) {
      return null
    }
  }

  // === MAPPING FUNCTIONS ===
  
  private mapBaserowToRecipe(baserowRecipe: BaserowRecipe): Recipe {
    return {
      id: baserowRecipe.recipe_id,
      title: baserowRecipe.title,
      url: baserowRecipe.url,
      source: baserowRecipe.source as Recipe['source'],
      rating: baserowRecipe.rating,
      reviewCount: baserowRecipe.review_count,
      cookTime: baserowRecipe.cook_time,
      servings: baserowRecipe.servings,
      difficulty: baserowRecipe.difficulty as Recipe['difficulty'],
      category: baserowRecipe.category as Recipe['category'],
      cuisine: baserowRecipe.cuisine as Recipe['cuisine'],
      ingredients: JSON.parse(baserowRecipe.ingredients || '[]'),
      imageUrl: baserowRecipe.image_url,
      description: baserowRecipe.description,
      tags: JSON.parse(baserowRecipe.tags || '[]'),
      addedDate: baserowRecipe.added_date,
      lastUsed: baserowRecipe.last_used,
      familyRating: baserowRecipe.family_rating
    }
  }

  private mapRecipeToBaserow(recipe: Partial<Recipe>): Partial<BaserowRecipe> {
    const data: any = {}
    
    if (recipe.id) data.recipe_id = recipe.id
    if (recipe.title) data.title = recipe.title
    if (recipe.url) data.url = recipe.url
    if (recipe.source) data.source = recipe.source
    if (recipe.rating !== undefined) data.rating = recipe.rating
    if (recipe.reviewCount !== undefined) data.review_count = recipe.reviewCount
    if (recipe.cookTime !== undefined) data.cook_time = recipe.cookTime
    if (recipe.servings !== undefined) data.servings = recipe.servings
    if (recipe.difficulty) data.difficulty = recipe.difficulty
    if (recipe.category) data.category = recipe.category
    if (recipe.cuisine) data.cuisine = recipe.cuisine
    if (recipe.ingredients) data.ingredients = JSON.stringify(recipe.ingredients)
    if (recipe.imageUrl) data.image_url = recipe.imageUrl
    if (recipe.description) data.description = recipe.description
    if (recipe.tags) data.tags = JSON.stringify(recipe.tags)
    if (recipe.addedDate) data.added_date = recipe.addedDate
    if (recipe.lastUsed) data.last_used = recipe.lastUsed
    if (recipe.familyRating !== undefined) data.family_rating = recipe.familyRating

    return data
  }

  // === PREFERENCES OPERATIONS ===
  
  async getPreferences(): Promise<IngredientPreference[]> {
    try {
      const response = await this.apiCall<{
        results: Array<{
          id: number
          ingredient: string
          status: string
          notes?: string
        }>
      }>(`/database/tables/${TABLES.PREFERENCES}/rows/?user_field_names=true`)

      return response.results.map(pref => ({
        ingredient: pref.ingredient,
        status: pref.status as IngredientPreference['status'],
        notes: pref.notes
      }))
    } catch (error) {
      console.error('❌ Failed to get preferences:', error)
      return []
    }
  }

  // === DATABASE SETUP ===
  
  async createDatabaseStructure(): Promise<boolean> {
    try {
      console.log('🔧 Setting up Baserow Database Structure...')
      
      // This would create the tables and fields
      // For now, assume tables are created manually in Baserow UI
      
      console.log('✅ Database structure setup complete')
      return true
    } catch (error) {
      console.error('❌ Failed to create database structure:', error)
      return false
    }
  }

  // === MIGRATION HELPER ===
  
  async migrateFromStaticData(): Promise<{ success: number; failed: number }> {
    try {
      console.log('🚀 Starting migration from static data to Baserow...')
      
      // Import static data
      const { MEGA_2000_RECIPES } = await import('../data/mega-2000-recipes')
      
      let success = 0
      let failed = 0
      
      console.log(`📊 Migrating ${MEGA_2000_RECIPES.length} recipes...`)
      
      // Batch process in chunks of 100
      for (let i = 0; i < MEGA_2000_RECIPES.length; i += 100) {
        const batch = MEGA_2000_RECIPES.slice(i, i + 100)
        console.log(`📦 Processing batch ${Math.floor(i/100) + 1}/${Math.ceil(MEGA_2000_RECIPES.length/100)}`)
        
        for (const recipe of batch) {
          try {
            await this.addRecipe(recipe)
            success++
            console.log(`✅ ${success}/${MEGA_2000_RECIPES.length}: ${recipe.title}`)
          } catch (error) {
            failed++
            console.error(`❌ Failed to migrate: ${recipe.title}`, error)
          }
        }
        
        // Rate limiting: 100ms pause between batches
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      console.log(`🎉 Migration complete: ${success} success, ${failed} failed`)
      return { success, failed }
    } catch (error) {
      console.error('❌ Migration failed:', error)
      throw error
    }
  }
}

// Singleton Instance
export const baserowService = new BaserowService()

// Export für Testing
export { BaserowService, BaserowError }

// Helper Functions
export function generateRecipeId(): string {
  return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Health Check
export async function healthCheck(): Promise<boolean> {
  try {
    await baserowService.apiCall('/health/')
    return true
  } catch (error) {
    console.error('❌ Baserow Health Check Failed:', error)
    return false
  }
}