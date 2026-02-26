'use client'

import { useState, useEffect } from 'react'
import { WeekPlan, IngredientPreference, Recipe } from '@/lib/types'
import { weekPlannerEngine, getWeekStartDate, formatWeekRange } from '@/lib/planner'
import { sheetsService } from '@/lib/sheets'
import WeekPlanGrid from '@/components/WeekPlanGrid'

export default function Home() {
  const [currentWeek, setCurrentWeek] = useState<Date>(getWeekStartDate())
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null)
  const [preferences, setPreferences] = useState<IngredientPreference[]>([])
  const [isPlanning, setIsPlanning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  // Data loading on mount
  useEffect(() => {
    loadInitialData()
  }, [])

  // Load existing data
  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      // Load preferences
      const loadedPrefs = await sheetsService.getPreferences()
      setPreferences(loadedPrefs)
      
      // Try to load existing week plan for current week
      const plans = await sheetsService.getWeekPlans()
      const currentPlan = plans.find(plan => 
        new Date(plan.startDate).toDateString() === currentWeek.toDateString()
      )
      if (currentPlan) {
        setWeekPlan(currentPlan)
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
    }
    setIsLoading(false)
  }

  // Generate new week plan
  const generateWeekPlan = async () => {
    setIsPlanning(true)
    try {
      const newPlan = await weekPlannerEngine.generateWeekPlan({
        startDate: currentWeek,
        preferences
      })
      setWeekPlan(newPlan)
    } catch (error) {
      console.error('Failed to generate week plan:', error)
    }
    setIsPlanning(false)
  }

  // Find alternative for specific day
  const findAlternativeForDay = async (dayIndex: number) => {
    if (!weekPlan || !weekPlan.days[dayIndex]?.recipe) {
      // No recipe exists, generate plan or find recipe
      await generateWeekPlan()
      return
    }

    try {
      const originalRecipe = weekPlan.days[dayIndex].recipe!
      const alternatives = await weekPlannerEngine.findAlternatives(originalRecipe, preferences)
      
      if (alternatives.length > 0) {
        // Replace with first alternative
        const newPlan = { ...weekPlan }
        newPlan.days[dayIndex] = {
          ...newPlan.days[dayIndex],
          recipe: alternatives[0]
        }
        setWeekPlan(newPlan)
        
        // Save updated plan
        await sheetsService.saveWeekPlan(newPlan)
      }
    } catch (error) {
      console.error('Failed to find alternative:', error)
    }
  }

  // Week navigation
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(getWeekStartDate(newDate))
    setWeekPlan(null) // Clear current plan
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🍽️ FamilyMeal Planner
              </h1>
              <p className="text-gray-600 mt-1">
                Intelligente Wochenplanung für die ganze Familie
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Recipe Count Badge */}
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                📋 DEMO: Placeholder-Links
              </div>
              
              {/* Premium Badge */}
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✨ Premium
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              title="Vorherige Woche"
            >
              ←
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Woche {formatWeekRange(currentWeek)}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {currentWeek.getFullYear()}
              </p>
            </div>
            
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              title="Nächste Woche"
            >
              →
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {weekPlan && (
              <button
                onClick={() => setWeekPlan(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                🗑️ Plan löschen
              </button>
            )}
            
            <button
              onClick={generateWeekPlan}
              disabled={isPlanning}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isPlanning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isPlanning ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Plane...
                </>
              ) : weekPlan ? (
                '🔄 Neu planen'
              ) : (
                '🎯 Wochenplan erstellen'
              )}
            </button>
          </div>
        </div>

        {/* Week Plan Grid */}
        <WeekPlanGrid
          weekPlan={weekPlan}
          currentWeek={currentWeek}
          isLoading={isLoading}
          onFindAlternative={findAlternativeForDay}
          onViewRecipeDetails={(recipe) => setSelectedRecipe(recipe)}
          onGeneratePlan={generateWeekPlan}
        />

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-900">Intelligent</h3>
              <p className="text-sm text-gray-600 mt-1">
                Berücksichtigt Familienpräferenzen, Kochzeit und Ausgewogenheit
              </p>
            </div>
            
            <div>
              <div className="text-2xl mb-2">📚</div>
              <h3 className="font-semibold text-gray-900">📋 Demo-Modus</h3>
              <p className="text-sm text-gray-600 mt-1">
                Deutsche Familienrezepte mit Placeholder-Links. Echte URLs können einfach eingefügt werden.
              </p>
            </div>
            
            <div>
              <div className="text-2xl mb-2">⏱️</div>
              <h3 className="font-semibold text-gray-900">Zeitoptimiert</h3>
              <p className="text-sm text-gray-600 mt-1">
                Werktags max. 45min, Wochenende mehr Zeit für aufwändige Gerichte
              </p>
            </div>
          </div>
        </div>

        {/* Demo Mode Warning */}
        <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-orange-500 text-xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-orange-900 mb-2">
                Demo-Modus aktiv
              </h3>
              <p className="text-sm text-orange-800 mb-3">
                Die Rezept-Links sind derzeit Placeholder. Die App-Funktionalität ist vollständig - 
                nur die URLs müssen durch echte ChefKoch-Links ersetzt werden.
              </p>
              <div className="text-xs text-orange-700">
                <strong>Für Production:</strong> Ersetze Placeholder-URLs in <code>demo-recipes-with-placeholders.ts</code>
              </div>
            </div>
          </div>
        </div>

        {/* Current Preferences Display */}
        {preferences.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              🎛️ Aktuelle Präferenzen
            </h3>
            <div className="flex flex-wrap gap-2">
              {preferences.map((pref, index) => (
                <span 
                  key={index}
                  className={`px-2 py-1 rounded text-xs ${
                    pref.status === 'oft' || pref.status === 'liebling' 
                      ? 'bg-green-100 text-green-800'
                      : pref.status === 'verboten'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {pref.ingredient} ({pref.status})
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}