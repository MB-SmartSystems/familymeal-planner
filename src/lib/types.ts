// Types für FamilyMeal Planner

// === REZEPT TYPES ===
export interface Recipe {
  id: string
  title: string
  url: string
  source: 'chefkoch' | 'kochbar' | 'eatsmarter' | 'marions-kochbuch' | 'other'
  rating: number
  reviewCount: number
  cookTime: number // Minuten
  servings: number
  difficulty: 'einfach' | 'mittel' | 'schwer'
  category: 'hauptgang' | 'vorspeise' | 'nachspeise' | 'snack' | 'beilage' | 'frühstück' | 'getränk'
  cuisine: 'deutsch' | 'italienisch' | 'französisch' | 'spanisch' | 'griechisch' | 'asiatisch' | 'amerikanisch' | 'vegetarisch' | 'mediterran' | 'orientalisch' | 'skandinavisch' | 'österreichisch' | 'international'
  ingredients: string[]
  imageUrl?: string
  description?: string
  tags: string[]
  addedDate: string
  lastUsed?: string
  familyRating?: number // 1-5
}

// === PRÄFERENZEN ===
export interface IngredientPreference {
  ingredient: string
  status: 'liebling' | 'oft' | 'neutral' | 'selten' | 'verboten'
  notes?: string
}

export interface FamilyProfile {
  name: string
  members: number
  preferences: IngredientPreference[]
  dietaryRestrictions: string[]
  favoriteCategories: string[]
  dislikedCategories: string[]
  maxCookTimeWeekdays: number
  maxCookTimeWeekends: number
}

// === WOCHENPLANUNG ===
export interface DayPlan {
  date: string
  dayName: 'montag' | 'dienstag' | 'mittwoch' | 'donnerstag' | 'freitag' | 'samstag' | 'sonntag'
  recipe?: Recipe
  alternatives?: Recipe[]
  status: 'geplant' | 'gekocht' | 'übersprungen'
  notes?: string
}

export interface WeekPlan {
  id: string
  startDate: string
  endDate: string
  days: DayPlan[]
  created: string
  status: 'geplant' | 'aktiv' | 'abgeschlossen'
  totalCookTime?: number
  averageRating?: number
  shoppingList?: ShoppingItem[]
}

// === EINKAUFSLISTE ===
export interface ShoppingItem {
  id: string
  ingredient: string
  amount?: string
  unit?: string
  category: 'fleisch' | 'gemüse' | 'obst' | 'milchprodukte' | 'getreide' | 'gewürze' | 'sonstiges'
  checked: boolean
  recipes: string[] // Recipe IDs
}

// === PLANNER CONFIG ===
export interface PlannerConfig {
  // Ausgewogenheits-Regeln
  maxSameCuisinePerWeek: number
  minVegetarianPerWeek: number
  maxCookTimeWeekdays: number
  maxCookTimeWeekends: number
  
  // Qualitäts-Filter
  minRating: number
  minReviewCount: number
  
  // Familien-Anpassungen
  preferredDifficulty: ('einfach' | 'mittel' | 'schwer')[]
  avoidIngredients: string[]
  preferIngredients: string[]
}

// === API TYPES ===
export interface RecipeSearchOptions {
  query?: string
  category?: string
  cuisine?: string
  maxCookTime?: number
  minRating?: number
  difficulty?: 'einfach' | 'mittel' | 'schwer'
  maxResults?: number
}

export interface PlanningOptions {
  startDate: Date
  preferences: IngredientPreference[]
  existingRecipes?: Recipe[]
  config?: Partial<PlannerConfig>
}

// === SHEET INTEGRATION ===
export type RecipeSheetRow = {
  id: string
  title: string
  url: string
  source: string
  rating: string
  reviewCount: string
  cookTime: string
  servings: string
  difficulty: string
  category: string
  cuisine: string
  ingredients: string
  imageUrl: string
  description: string
  tags: string
  addedDate: string
  lastUsed: string
  familyRating: string
}

export type PreferenceSheetRow = {
  ingredient: string
  status: string
  notes: string
}

export type WeekPlanSheetRow = {
  id: string
  startDate: string
  endDate: string
  status: string
  created: string
  dayPlans: string // JSON
}

// === SCRAPING ===
export interface ChefkochSearchResult {
  title: string
  url: string
  rating: number
  reviewCount: number
  cookTime: number
  imageUrl?: string
  difficulty: string
}

// === VALIDATION ===
export interface ValidationResult {
  isValid: boolean
  status: number
  reason: string
  isPremium?: boolean
  hasRecipe?: boolean
  timestamp: string
}

// === UI STATE ===
export interface AppState {
  currentWeek: Date
  weekPlan: WeekPlan | null
  preferences: IngredientPreference[]
  isLoading: boolean
  error: string | null
}

export interface RecipeCardProps {
  recipe: Recipe | null
  dayName: string
  date: Date
  isLoading?: boolean
  onFindAlternative: () => void
  onViewDetails?: (recipe: Recipe) => void
}

// === UTILITY TYPES ===
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>