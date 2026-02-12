// Intelligente Wochenplan-Engine für FamilyMeal Planner

import { 
  Recipe, 
  WeekPlan, 
  DayPlan, 
  IngredientPreference, 
  FamilyProfile,
  PlannerConfig 
} from './types'
import { sheetsService, generateWeekPlanId } from './sheets'

interface PlannerOptions {
  startDate: Date
  preferences: IngredientPreference[]
  existingRecipes?: Recipe[]
  config?: Partial<PlannerConfig>
}

interface RecipeScore {
  recipe: Recipe
  score: number
  reasons: string[]
}

class WeekPlannerEngine {
  private defaultConfig: PlannerConfig = {
    // Ausgewogenheits-Regeln
    maxSameCuisinePerWeek: 2,     // Max 2x italienisch pro Woche
    minVegetarianPerWeek: 1,      // Min 1x vegetarisch pro Woche
    maxCookTimeWeekdays: 45,      // Max 45 Min Mo-Fr
    maxCookTimeWeekends: 90,      // Max 90 Min Sa-So
    
    // Qualitäts-Filter
    minRating: 4.0,               // Min 4.0 Sterne
    minReviewCount: 10,           // Min 10 Bewertungen
    
    // Familien-Anpassungen
    preferredDifficulty: ['einfach', 'mittel'],
    avoidIngredients: [],         // Aus Präferenzen gefüllt
    preferIngredients: []         // Aus Präferenzen gefüllt
  }

  constructor() {}

  // Hauptfunktion: Intelligente Wochenplanung
  async generateWeekPlan(options: PlannerOptions): Promise<WeekPlan> {
    const { startDate, preferences, existingRecipes = [], config = {} } = options
    const plannerConfig = { ...this.defaultConfig, ...config }
    
    // Präferenzen in Config integrieren
    this.updateConfigWithPreferences(plannerConfig, preferences)
    
    try {
      // 1. Rezept-Pool aufbauen
      let recipePool = existingRecipes.length > 0 
        ? existingRecipes 
        : await this.buildRecipePool(plannerConfig)
      
      // 2. Rezepte bewerten und filtern
      const scoredRecipes = this.scoreRecipes(recipePool, plannerConfig, preferences)
      
      // 3. 7-Tage-Plan optimieren
      const dayPlans = this.optimizeWeeklySelection(scoredRecipes, plannerConfig, startDate)
      
      // 4. WeekPlan-Objekt erstellen
      const weekPlan: WeekPlan = {
        id: generateWeekPlanId(),
        startDate: startDate.toISOString(),
        endDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        days: dayPlans,
        created: new Date().toISOString(),
        status: 'geplant'
      }

      // 5. Plan speichern
      await sheetsService.saveWeekPlan(weekPlan)
      
      return weekPlan

    } catch (error) {
      console.error('Week planning failed:', error)
      
      // Fallback: Einfacher Plan mit Mock-Daten
      return this.generateFallbackPlan(startDate)
    }
  }

  // Rezept-Pool aus verschiedenen Quellen aufbauen
  private async buildRecipePool(config: PlannerConfig): Promise<Recipe[]> {
    const recipes: Recipe[] = []
    
    try {
      // Bestehende Rezepte aus Google Sheets
      const savedRecipes = await sheetsService.getAllRecipes()
      recipes.push(...savedRecipes)
      
    } catch (error) {
      console.error('Failed to build recipe pool:', error)
    }
    
    return this.deduplicateRecipes(recipes)
  }

  // Rezepte nach Familienpräferenzen bewerten
  private scoreRecipes(
    recipes: Recipe[], 
    config: PlannerConfig, 
    preferences: IngredientPreference[]
  ): RecipeScore[] {
    return recipes.map(recipe => {
      let score = 0
      const reasons: string[] = []
      
      // Basis-Score: Bewertung & Reviews
      score += (recipe.rating / 5) * 30 // Max 30 Punkte für Rating
      score += Math.min(recipe.reviewCount / 10, 20) // Max 20 Punkte für Reviews
      
      // Schwierigkeit bevorzugen
      if (config.preferredDifficulty.includes(recipe.difficulty)) {
        score += 15
        reasons.push(`Passende Schwierigkeit: ${recipe.difficulty}`)
      }
      
      // Kochzeit bewerten
      const isWeekend = false // Wird später dynamisch
      const maxCookTime = isWeekend ? config.maxCookTimeWeekends : config.maxCookTimeWeekdays
      
      if (recipe.cookTime <= maxCookTime) {
        score += 10
        if (recipe.cookTime <= 30) {
          score += 5 // Bonus für schnelle Rezepte
          reasons.push('Schnell zubereitet')
        }
      } else {
        score -= 10 // Abzug für lange Kochzeit
      }
      
      // Zutaten-Präferenzen
      for (const ingredient of recipe.ingredients) {
        const preference = preferences.find(p => 
          ingredient.toLowerCase().includes(p.ingredient.toLowerCase())
        )
        
        if (preference) {
          switch (preference.status) {
            case 'verboten':
              score -= 50 // Hartes No-Go
              reasons.push(`Verbotene Zutat: ${ingredient}`)
              break
            case 'selten':
              score -= 10
              reasons.push(`Seltene Zutat: ${ingredient}`)
              break
            case 'oft':
              score += 15
              reasons.push(`Beliebte Zutat: ${ingredient}`)
              break
            case 'liebling':
              score += 25
              reasons.push(`Lieblings-Zutat: ${ingredient}`)
              break
          }
        }
      }
      
      // Küchen-Vielfalt (wird später in Optimierung berücksichtigt)
      
      return {
        recipe,
        score: Math.round(score),
        reasons
      }
    })
    .filter(scored => scored.score > 20) // Mindest-Score
    .sort((a, b) => b.score - a.score) // Beste zuerst
  }

  // 7-Tage-Auswahl mit Ausgewogenheits-Optimierung
  private optimizeWeeklySelection(
    scoredRecipes: RecipeScore[], 
    config: PlannerConfig,
    startDate: Date
  ): DayPlan[] {
    const selectedRecipes: RecipeScore[] = []
    const cuisineCount: { [key: string]: number } = {}
    const dayNames = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'] as const
    
    // Für jeden Tag der Woche
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      
      const isWeekend = i >= 5 // Samstag & Sonntag
      const maxCookTime = isWeekend ? config.maxCookTimeWeekends : config.maxCookTimeWeekdays
      
      // Verfügbare Rezepte für diesen Tag
      const availableRecipes = scoredRecipes.filter(scored => {
        // Bereits ausgewählt?
        if (selectedRecipes.find(s => s.recipe.id === scored.recipe.id)) return false
        
        // Kochzeit passt?
        if (scored.recipe.cookTime > maxCookTime) return false
        
        // Küchen-Vielfalt
        const cuisine = scored.recipe.cuisine
        if ((cuisineCount[cuisine] || 0) >= config.maxSameCuisinePerWeek) return false
        
        return true
      })
      
      if (availableRecipes.length > 0) {
        // Bestes verfügbares Rezept auswählen
        const selected = availableRecipes[0]
        selectedRecipes.push(selected)
        
        // Küchen-Counter erhöhen
        const cuisine = selected.recipe.cuisine
        cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1
      } else {
        // Fallback: Irgendein verfügbares Rezept
        const fallback = scoredRecipes.find(scored => 
          !selectedRecipes.find(s => s.recipe.id === scored.recipe.id)
        )
        if (fallback) {
          selectedRecipes.push(fallback)
        }
      }
    }
    
    // DayPlan-Objekte erstellen
    const dayPlans: DayPlan[] = selectedRecipes.map((scored, index) => {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + index)
      
      return {
        date: currentDate.toISOString(),
        dayName: dayNames[index],
        recipe: scored.recipe,
        status: 'geplant'
      }
    })

    // Falls weniger als 7 Rezepte gefunden
    while (dayPlans.length < 7) {
      const remainingDayIndex = dayPlans.length
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + remainingDayIndex)
      
      dayPlans.push({
        date: currentDate.toISOString(),
        dayName: dayNames[remainingDayIndex],
        status: 'geplant'
      })
    }
    
    return dayPlans
  }

  private generateFallbackPlan(startDate: Date): WeekPlan {
    // Einfacher Fallback-Plan mit Mock-Rezepten
    const mockRecipes: Recipe[] = [
      {
        id: 'fallback-1',
        title: 'Spaghetti Bolognese',
        url: 'https://www.kochbar.de/rezept/25945/Spaghetti-Bolognese.html',
        source: 'kochbar',
        rating: 4.5,
        reviewCount: 234,
        cookTime: 45,
        servings: 4,
        difficulty: 'einfach',
        category: 'hauptgang',
        cuisine: 'italienisch',
        ingredients: ['Spaghetti', 'Hackfleisch', 'Tomaten'],
        tags: ['pasta', 'fleisch', 'familientauglich'],
        addedDate: new Date().toISOString()
      },
      // ... weitere Mock-Rezepte
    ]
    
    const dayNames = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'] as const
    
    const dayPlans: DayPlan[] = dayNames.map((dayName, index) => {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + index)
      
      return {
        date: currentDate.toISOString(),
        dayName,
        recipe: mockRecipes[0], // Gleiche Rezepte für Fallback
        status: 'geplant'
      }
    })
    
    return {
      id: generateWeekPlanId(),
      startDate: startDate.toISOString(),
      endDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      days: dayPlans,
      created: new Date().toISOString(),
      status: 'geplant'
    }
  }

  // Alternative Rezepte für einen Tag finden
  async findAlternatives(originalRecipe: Recipe, preferences: IngredientPreference[]): Promise<Recipe[]> {
    try {
      // Ähnliche Rezepte suchen
      const allRecipes = await sheetsService.getAllRecipes()
      const alternatives = allRecipes.filter(recipe => 
        recipe.id !== originalRecipe.id &&
        (recipe.category === originalRecipe.category || recipe.cuisine === originalRecipe.cuisine)
      )
      
      // Bewertung mit Präferenzen
      const scored = this.scoreRecipes(alternatives, this.defaultConfig, preferences)
      
      return scored.slice(0, 3).map(s => s.recipe) // Top 3 Alternativen
      
    } catch (error) {
      console.error('Failed to find alternatives:', error)
      return []
    }
  }

  // Private Helper Functions
  private updateConfigWithPreferences(config: PlannerConfig, preferences: IngredientPreference[]): void {
    config.avoidIngredients = preferences
      .filter(p => p.status === 'verboten' || p.status === 'selten')
      .map(p => p.ingredient)
    
    config.preferIngredients = preferences
      .filter(p => p.status === 'oft' || p.status === 'liebling')
      .map(p => p.ingredient)
  }

  private deduplicateRecipes(recipes: Recipe[]): Recipe[] {
    const seen = new Set<string>()
    return recipes.filter(recipe => {
      const key = recipe.url || recipe.title
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
}

// Singleton Instance
export const weekPlannerEngine = new WeekPlannerEngine()

// Helper Functions
export function getWeekStartDate(date: Date = new Date()): Date {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Montag als Wochenstart
  return new Date(start.setDate(diff))
}

export function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' }
  return `${startDate.toLocaleDateString('de-DE', options)} - ${endDate.toLocaleDateString('de-DE', options)}`
}

export function getDayName(date: Date): string {
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  return dayNames[date.getDay()]
}

// Default Export
export default weekPlannerEngine