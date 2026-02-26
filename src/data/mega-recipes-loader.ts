// 🍽️ MEGA RECIPE LOADER - 1971 DEUTSCHE REZEPTE
// JSON-basierte Lösung für bessere Performance
// Generiert: 2026-02-12

import { Recipe } from '../lib/types'
import recipesData from './mega-recipes-2000.json'

// Typisierte Rezept-Daten
export const MEGA_RECIPES: Recipe[] = recipesData as Recipe[]

// Statistiken
export const RECIPE_COUNT = MEGA_RECIPES.length

export const RECIPES_BY_CATEGORY = {
  fleisch: MEGA_RECIPES.filter(r => r.id.startsWith('fleisch')).length,
  geflügel: MEGA_RECIPES.filter(r => r.id.startsWith('geflügel')).length,
  fisch: MEGA_RECIPES.filter(r => r.id.startsWith('fisch')).length,
  vegetarisch: MEGA_RECIPES.filter(r => r.id.startsWith('vegetarisch')).length,
  nudeln: MEGA_RECIPES.filter(r => r.id.startsWith('nudeln')).length,
  reis: MEGA_RECIPES.filter(r => r.id.startsWith('reis')).length,
  suppen: MEGA_RECIPES.filter(r => r.id.startsWith('suppen')).length,
  salate: MEGA_RECIPES.filter(r => r.id.startsWith('salate')).length,
  desserts: MEGA_RECIPES.filter(r => r.id.startsWith('desserts')).length,
  beilagen: MEGA_RECIPES.filter(r => r.id.startsWith('beilagen')).length
}

export const RECIPE_SOURCES = {
  chefkoch: MEGA_RECIPES.filter(r => r.source === 'chefkoch').length,
  kochbar: MEGA_RECIPES.filter(r => r.source === 'kochbar').length,
  'marions-kochbuch': MEGA_RECIPES.filter(r => r.source === 'marions-kochbuch').length
}

// Helper Functions
export function getRecipesByCategory(category: string): Recipe[] {
  return MEGA_RECIPES.filter(r => r.id.startsWith(category))
}

export function getRecipesBySource(source: string): Recipe[] {
  return MEGA_RECIPES.filter(r => r.source === source)
}

export function getRecipesByCuisine(cuisine: string): Recipe[] {
  return MEGA_RECIPES.filter(r => r.cuisine === cuisine)
}

export function getRandomRecipes(count: number): Recipe[] {
  const shuffled = [...MEGA_RECIPES].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export function searchRecipes(query: string): Recipe[] {
  const lowerQuery = query.toLowerCase()
  return MEGA_RECIPES.filter(r => 
    r.title.toLowerCase().includes(lowerQuery) ||
    r.ingredients.some(ingredient => ingredient.toLowerCase().includes(lowerQuery)) ||
    r.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

// Default Export
export default MEGA_RECIPES