// Unified Data Service - Baserow mit Google Sheets Fallback
// Drop-in Replacement für sheets.ts mit intelligenter Fallback-Logik

import { 
  Recipe, 
  IngredientPreference, 
  WeekPlan,
  RecipeSheetRow,
  PreferenceSheetRow,
  WeekPlanSheetRow 
} from './types'
import { baserowService } from './baserow'
import { sheetsService } from './sheets'

// Configuration
const USE_BASEROW = process.env.NEXT_PUBLIC_ENABLE_BASEROW === 'true'
const FALLBACK_TO_STATIC = true

class UnifiedDataService {
  private isBaserowAvailable: boolean | null = null
  private lastHealthCheck = 0
  private readonly HEALTH_CHECK_INTERVAL = 30000 // 30 seconds

  constructor() {
    console.log(`🔧 Data Service initialized - Baserow: ${USE_BASEROW ? 'enabled' : 'disabled'}`)
  }

  // Health Check mit Caching
  private async checkBaserowHealth(): Promise<boolean> {
    if (!USE_BASEROW) return false
    
    const now = Date.now()
    if (this.isBaserowAvailable !== null && now - this.lastHealthCheck < this.HEALTH_CHECK_INTERVAL) {
      return this.isBaserowAvailable
    }

    try {
      // Quick health check
      await baserowService.apiCall('/health/', {}, false)
      this.isBaserowAvailable = true
      this.lastHealthCheck = now
      console.log('✅ Baserow health check passed')
    } catch (error) {
      console.warn('⚠️  Baserow health check failed, falling back to sheets/static:', error.message)
      this.isBaserowAvailable = false
      this.lastHealthCheck = now
    }

    return this.isBaserowAvailable
  }

  // === RECIPES OPERATIONS ===

  async getAllRecipes(): Promise<Recipe[]> {
    try {
      // Try Baserow first
      if (await this.checkBaserowHealth()) {
        console.log('📊 Loading recipes from Baserow...')
        return await baserowService.getAllRecipes()
      }
      
      // Fallback to Google Sheets
      console.log('📊 Loading recipes from Google Sheets fallback...')
      return await sheetsService.getAllRecipes()
      
    } catch (error) {
      console.error('❌ Failed to load recipes from primary source:', error)
      
      if (FALLBACK_TO_STATIC) {
        console.log('📊 Loading recipes from static fallback...')
        return this.getStaticRecipeFallback()
      }
      
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
      if (await this.checkBaserowHealth()) {
        return await baserowService.getRecipesPaginated(page, size, search, filters)
      }
      
      // Fallback: simulate pagination with full dataset
      const allRecipes = await sheetsService.getAllRecipes()
      const filteredRecipes = this.applyClientSideFilters(allRecipes, search, filters)
      
      const start = (page - 1) * size
      const end = start + size
      
      return {
        recipes: filteredRecipes.slice(start, end),
        total: filteredRecipes.length,
        hasNext: end < filteredRecipes.length
      }
      
    } catch (error) {
      console.error('❌ Failed to get paginated recipes:', error)
      throw error
    }
  }

  async addRecipe(recipe: Recipe): Promise<Recipe> {
    try {
      if (await this.checkBaserowHealth()) {
        return await baserowService.addRecipe(recipe)
      }
      
      // Fallback to Google Sheets
      const success = await sheetsService.addRecipe(recipe)
      if (success) {
        return recipe
      } else {
        throw new Error('Failed to add recipe to sheets')
      }
      
    } catch (error) {
      console.error('❌ Failed to add recipe:', error)
      throw error
    }
  }

  async updateRecipe(recipeId: string, updates: Partial<Recipe>): Promise<Recipe> {
    try {
      if (await this.checkBaserowHealth()) {
        return await baserowService.updateRecipe(recipeId, updates)
      }
      
      // Google Sheets doesn't have direct update, would need implementation
      throw new Error('Recipe update not supported with Google Sheets fallback')
      
    } catch (error) {
      console.error('❌ Failed to update recipe:', error)
      throw error
    }
  }

  async deleteRecipe(recipeId: string): Promise<boolean> {
    try {
      if (await this.checkBaserowHealth()) {
        return await baserowService.deleteRecipe(recipeId)
      }
      
      // Google Sheets doesn't have direct delete, would need implementation
      throw new Error('Recipe deletion not supported with Google Sheets fallback')
      
    } catch (error) {
      console.error('❌ Failed to delete recipe:', error)
      throw error
    }
  }

  // === PREFERENCES OPERATIONS ===

  async getPreferences(): Promise<IngredientPreference[]> {
    try {
      if (await this.checkBaserowHealth()) {
        return await baserowService.getPreferences()
      }
      
      return await sheetsService.getPreferences()
      
    } catch (error) {
      console.error('❌ Failed to get preferences:', error)
      return [] // Return empty array as safe fallback
    }
  }

  async updatePreference(preference: IngredientPreference): Promise<boolean> {
    try {
      if (await this.checkBaserowHealth()) {
        // Baserow preference update would need implementation
        console.log('⚠️  Preference update not yet implemented for Baserow')
        return false
      }
      
      return await sheetsService.updatePreference(preference)
      
    } catch (error) {
      console.error('❌ Failed to update preference:', error)
      return false
    }
  }

  // === WEEK PLANS OPERATIONS ===

  async getWeekPlans(): Promise<WeekPlan[]> {
    try {
      if (await this.checkBaserowHealth()) {
        // Week plans in Baserow would need implementation
        console.log('⚠️  Week plans not yet implemented for Baserow, using sheets')
        return await sheetsService.getWeekPlans()
      }
      
      return await sheetsService.getWeekPlans()
      
    } catch (error) {
      console.error('❌ Failed to get week plans:', error)
      return []
    }
  }

  async saveWeekPlan(weekPlan: WeekPlan): Promise<boolean> {
    try {
      if (await this.checkBaserowHealth()) {
        // Week plans in Baserow would need implementation
        console.log('⚠️  Week plans not yet implemented for Baserow, using sheets')
        return await sheetsService.saveWeekPlan(weekPlan)
      }
      
      return await sheetsService.saveWeekPlan(weekPlan)
      
    } catch (error) {
      console.error('❌ Failed to save week plan:', error)
      return false
    }
  }

  // === FALLBACK & UTILITY METHODS ===

  private async getStaticRecipeFallback(): Promise<Recipe[]> {
    try {
      console.log('🔄 Loading static recipe fallback...')
      
      // Import from the mega recipes file
      const { MEGA_2000_RECIPES } = await import('../data/mega-2000-recipes')
      
      console.log(`✅ Loaded ${MEGA_2000_RECIPES.length} static recipes`)
      return MEGA_2000_RECIPES
      
    } catch (error) {
      console.error('❌ Failed to load static recipes:', error)
      
      // Last resort: demo recipes
      const { DEMO_RECIPES } = await import('../data/demo-recipes-with-placeholders')
      console.log(`⚠️  Using demo recipes (${DEMO_RECIPES.length} items)`)
      return DEMO_RECIPES
    }
  }

  private applyClientSideFilters(
    recipes: Recipe[],
    search?: string,
    filters?: Record<string, any>
  ): Recipe[] {
    let filtered = [...recipes]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.description?.toLowerCase().includes(searchLower) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchLower)) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Additional filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          switch (key) {
            case 'category':
              filtered = filtered.filter(recipe => recipe.category === value)
              break
            case 'cuisine':
              filtered = filtered.filter(recipe => recipe.cuisine === value)
              break
            case 'difficulty':
              filtered = filtered.filter(recipe => recipe.difficulty === value)
              break
            case 'maxCookTime':
              filtered = filtered.filter(recipe => recipe.cookTime <= value)
              break
            case 'minRating':
              filtered = filtered.filter(recipe => recipe.rating >= value)
              break
          }
        }
      })
    }

    return filtered
  }

  // === ADMIN & MIGRATION ===

  async migrateToBaserow(): Promise<{ success: number; failed: number }> {
    if (!await this.checkBaserowHealth()) {
      throw new Error('Baserow is not available for migration')
    }

    console.log('🚀 Starting migration from current data source to Baserow...')
    return await baserowService.migrateFromStaticData()
  }

  async getDataSourceStatus(): Promise<{
    baserow: boolean
    sheets: boolean
    static: boolean
    current: 'baserow' | 'sheets' | 'static'
  }> {
    const baserowAvailable = await this.checkBaserowHealth()
    
    let sheetsAvailable = false
    try {
      await sheetsService.getAllRecipes()
      sheetsAvailable = true
    } catch (error) {
      // Sheets not available
    }

    const current = baserowAvailable ? 'baserow' : 
                   sheetsAvailable ? 'sheets' : 'static'

    return {
      baserow: baserowAvailable,
      sheets: sheetsAvailable,
      static: true,
      current
    }
  }

  // Cache management
  clearCache() {
    if (this.isBaserowAvailable) {
      baserowService.clearCache()
    }
    // Reset health check
    this.isBaserowAvailable = null
    this.lastHealthCheck = 0
  }
}

// Singleton Instance
export const dataService = new UnifiedDataService()

// Backward compatibility exports
export const getAllRecipes = () => dataService.getAllRecipes()
export const addRecipe = (recipe: Recipe) => dataService.addRecipe(recipe)
export const getPreferences = () => dataService.getPreferences()
export const getWeekPlans = () => dataService.getWeekPlans()
export const saveWeekPlan = (plan: WeekPlan) => dataService.saveWeekPlan(plan)

// Helper functions
export function generateRecipeId(): string {
  return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateWeekPlanId(): string {
  return `week_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Export für Testing & Admin
export { UnifiedDataService }