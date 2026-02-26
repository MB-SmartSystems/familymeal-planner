// Google Sheets Integration für FamilyMeal Planner

import { 
  Recipe, 
  IngredientPreference, 
  WeekPlan,
  RecipeSheetRow,
  PreferenceSheetRow,
  WeekPlanSheetRow 
} from './types'

// Google Sheets Konfiguration
const SPREADSHEET_ID = '1FamilyMealPlannerTestSheet' // Wird durch echte ID ersetzt
const SHEETS_SCOPE = ['https://www.googleapis.com/auth/spreadsheets']

// Tabellen-Namen
const SHEETS = {
  RECIPES: 'Rezepte',
  PREFERENCES: 'Präferenzen', 
  WEEKPLANS: 'Wochenpläne',
  SHOPPING: 'Einkaufslisten'
} as const

class GoogleSheetsService {
  private sheets: any
  private auth: any

  constructor() {
    // Für Development: Mock Service
    // Für Production: Echte Google Sheets API
    this.initializeAuth()
  }

  private async initializeAuth() {
    try {
      // TODO: Service Account Key für Production
      // Für jetzt: Mock-Implementierung
      this.sheets = {
        spreadsheets: {
          values: {
            get: this.mockGet.bind(this),
            append: this.mockAppend.bind(this),
            update: this.mockUpdate.bind(this)
          }
        }
      }
    } catch (error) {
      console.error('Google Sheets Auth failed:', error)
      // Fallback zu Mock-Daten
    }
  }

  // Premium 100 Recipes Implementation
  private async mockGet({ spreadsheetId, range }: any) {
    console.log(`Mock GET: ${range}`)
    
    if (range.includes('Rezepte')) {
      // Import der DEMO-Rezepte mit Placeholder-Links
      const { EXPANDED_DEMO_RECIPES, RECIPE_COUNT } = await import('../data/demo-recipes-with-placeholders')
      
      // Konvertiere Recipe-Objekte zu Tabellen-Format
      const headers = ['ID', 'Titel', 'URL', 'Quelle', 'Bewertung', 'Anzahl_Bewertungen', 'Kochzeit', 'Portionen', 'Schwierigkeit', 'Kategorie', 'Küche', 'Zutaten', 'Bild_URL', 'Beschreibung', 'Tags', 'Hinzugefügt', 'Zuletzt_verwendet', 'Familien_Bewertung']
      
      const rows = EXPANDED_DEMO_RECIPES.map(recipe => [
        recipe.id,
        recipe.title,
        recipe.url,
        recipe.source,
        recipe.rating.toString(),
        recipe.reviewCount.toString(),
        recipe.cookTime.toString(),
        recipe.servings.toString(),
        recipe.difficulty,
        recipe.category,
        recipe.cuisine,
        recipe.ingredients.join(','),
        recipe.imageUrl || '',
        recipe.description || '',
        recipe.tags.join(','),
        recipe.addedDate,
        recipe.lastUsed || '',
        recipe.familyRating?.toString() || ''
      ])
      
      return {
        data: {
          values: [headers, ...rows]
        }
      }
    }
    
    if (range.includes('Präferenzen')) {
      return {
        data: {
          values: [
            ['Zutat', 'Status', 'Notizen'],
            ['Zwiebeln', 'selten', 'Manu mag nicht so gerne'],
            ['Paprika', 'verboten', 'Allergisch'],
            ['Hähnchen', 'oft', 'Familienliebling'],
            ['Nudeln', 'oft', 'Kinder lieben Nudeln'],
            ['Fisch', 'selten', 'Nur 1x pro Woche']
          ]
        }
      }
    }

    return { data: { values: [] } }
  }

  private async mockAppend({ spreadsheetId, range, resource }: any) {
    console.log(`Mock APPEND: ${range}`, resource.values)
    return { data: {} }
  }

  private async mockUpdate({ spreadsheetId, range, resource }: any) {
    console.log(`Mock UPDATE: ${range}`, resource.values)
    return { data: {} }
  }

  // Rezepte Operations
  async getAllRecipes(): Promise<Recipe[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.RECIPES}!A:R`
      })

      const rows = response.data.values || []
      if (rows.length <= 1) return [] // Nur Header oder leer

      return rows.slice(1).map((row: string[]): Recipe => ({
        id: row[0] || '',
        title: row[1] || '',
        url: row[2] || '',
        source: (row[3] as any) || 'chefkoch',
        rating: parseFloat(row[4]) || 0,
        reviewCount: parseInt(row[5]) || 0,
        cookTime: parseInt(row[6]) || 30,
        servings: parseInt(row[7]) || 4,
        difficulty: (row[8] as any) || 'einfach',
        category: (row[9] as any) || 'hauptgang',
        cuisine: (row[10] as any) || 'deutsch',
        ingredients: (row[11] || '').split(',').map(i => i.trim()),
        imageUrl: row[12] || '',
        description: row[13] || '',
        tags: (row[14] || '').split(',').map(t => t.trim()),
        addedDate: row[15] || new Date().toISOString(),
        lastUsed: row[16] || undefined,
        familyRating: row[17] ? parseInt(row[17]) : undefined
      }))
    } catch (error) {
      console.error('Failed to get recipes:', error)
      return []
    }
  }

  async addRecipe(recipe: Recipe): Promise<boolean> {
    try {
      const row: RecipeSheetRow = {
        id: recipe.id,
        title: recipe.title,
        url: recipe.url,
        source: recipe.source,
        rating: recipe.rating.toString(),
        reviewCount: recipe.reviewCount.toString(),
        cookTime: recipe.cookTime.toString(),
        servings: recipe.servings.toString(),
        difficulty: recipe.difficulty,
        category: recipe.category,
        cuisine: recipe.cuisine,
        ingredients: recipe.ingredients.join(', '),
        imageUrl: recipe.imageUrl || '',
        description: recipe.description || '',
        tags: recipe.tags.join(', '),
        addedDate: recipe.addedDate,
        lastUsed: recipe.lastUsed || '',
        familyRating: recipe.familyRating?.toString() || ''
      }

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.RECIPES}!A:R`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [Object.values(row)]
        }
      })

      return true
    } catch (error) {
      console.error('Failed to add recipe:', error)
      return false
    }
  }

  // Präferenzen Operations
  async getPreferences(): Promise<IngredientPreference[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.PREFERENCES}!A:C`
      })

      const rows = response.data.values || []
      if (rows.length <= 1) return []

      return rows.slice(1).map((row: string[]): IngredientPreference => ({
        ingredient: row[0] || '',
        status: (row[1] as any) || 'neutral',
        notes: row[2] || ''
      }))
    } catch (error) {
      console.error('Failed to get preferences:', error)
      return []
    }
  }

  async updatePreference(preference: IngredientPreference): Promise<boolean> {
    try {
      // Für Mock: Simuliere Update
      console.log('Updating preference:', preference)
      return true
    } catch (error) {
      console.error('Failed to update preference:', error)
      return false
    }
  }

  // Wochenpläne Operations
  async getWeekPlans(): Promise<WeekPlan[]> {
    try {
      // Mock Implementation - später echte Sheets
      return []
    } catch (error) {
      console.error('Failed to get week plans:', error)
      return []
    }
  }

  async saveWeekPlan(weekPlan: WeekPlan): Promise<boolean> {
    try {
      // Mock Implementation
      console.log('Saving week plan:', weekPlan)
      return true
    } catch (error) {
      console.error('Failed to save week plan:', error)
      return false
    }
  }

  // Helper: Neue Sheet erstellen (Setup)
  async createSheetsStructure() {
    try {
      console.log('Creating sheets structure (Mock)')
      // Hier würde die echte Sheet-Struktur erstellt
      return true
    } catch (error) {
      console.error('Failed to create sheets structure:', error)
      return false
    }
  }
}

// Singleton Instance
export const sheetsService = new GoogleSheetsService()

// Helper Functions
export function generateRecipeId(): string {
  return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateWeekPlanId(): string {
  return `week_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Export für Testing
export { GoogleSheetsService }