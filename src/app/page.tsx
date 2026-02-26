'use client'

import { useState, useEffect } from 'react'
import { WeekPlan, IngredientPreference, Recipe } from '@/lib/types'
import { weekPlannerEngine, getWeekStartDate, formatWeekRange } from '@/lib/planner'
import { dataService } from '@/lib/data-service'
import WeekPlanGrid from '@/components/WeekPlanGrid'
import AdminPanel from '@/components/AdminPanel'

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
      const loadedPrefs = await dataService.getPreferences()
      setPreferences(loadedPrefs)
      
      // Try to load existing week plan for current week
      const plans = await dataService.getWeekPlans()
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
        await dataService.saveWeekPlan(newPlan)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                🍽️
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  FamilyMeal Planner
                </h1>
                <p className="text-gray-600 mt-1 text-lg font-medium">
                  Intelligente Wochenplanung für die ganze Familie
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Premium Badge - modernized */}
              <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center space-x-1">
                <span>✨</span>
                <span>Premium</span>
              </div>
              
              {/* Recipe Count Badge - modernized */}
              <div className="bg-gradient-to-r from-accent-orange to-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center space-x-1">
                <span>📚</span>
                <span>2000+ Rezepte</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Week Navigation */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigateWeek('prev')}
              className="group p-4 rounded-xl bg-white border border-gray-200 hover:bg-primary-50 hover:border-primary-200 transition-all duration-300 shadow-sm hover:shadow-lg"
              title="Vorherige Woche"
            >
              <span className="text-lg group-hover:scale-110 transition-transform duration-200">←</span>
            </button>
            
            <div className="text-center bg-white rounded-xl px-8 py-4 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Woche {formatWeekRange(currentWeek)}
              </h2>
              <p className="text-sm font-medium text-gray-500 mt-1">
                {currentWeek.getFullYear()}
              </p>
            </div>
            
            <button
              onClick={() => navigateWeek('next')}
              className="group p-4 rounded-xl bg-white border border-gray-200 hover:bg-primary-50 hover:border-primary-200 transition-all duration-300 shadow-sm hover:shadow-lg"
              title="Nächste Woche"
            >
              <span className="text-lg group-hover:scale-110 transition-transform duration-200">→</span>
            </button>
          </div>

          {/* Modern Action Buttons */}
          <div className="flex items-center space-x-4">
            {weekPlan && (
              <button
                onClick={() => setWeekPlan(null)}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300 font-medium shadow-sm hover:shadow-lg flex items-center space-x-2"
              >
                <span>🗑️</span>
                <span>Plan löschen</span>
              </button>
            )}
            
            <button
              onClick={generateWeekPlan}
              disabled={isPlanning}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 ${
                isPlanning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white hover:scale-105'
              }`}
            >
              {isPlanning ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  <span>Plane...</span>
                </>
              ) : weekPlan ? (
                <>
                  <span>🔄</span>
                  <span>Neu planen</span>
                </>
              ) : (
                <>
                  <span>🎯</span>
                  <span>Wochenplan erstellen</span>
                </>
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

        {/* Modern Footer Info */}
        <div className="mt-16 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-2xl text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                🎯
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Intelligent</h3>
              <p className="text-gray-600 leading-relaxed">
                Berücksichtigt Familienpräferenzen, Kochzeit und Ausgewogenheit für perfekte Wochenpläne
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center text-2xl text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                📚
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2000+ Rezepte</h3>
              <p className="text-gray-600 leading-relaxed">
                Deutsche Familienrezepte von ChefKoch & Kochbar mit echten Links und Bewertungen
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-orange to-yellow-500 rounded-2xl flex items-center justify-center text-2xl text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                ⏱️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Zeitoptimiert</h3>
              <p className="text-gray-600 leading-relaxed">
                Werktags max. 45min, Wochenende mehr Zeit für aufwändige Gerichte
              </p>
            </div>
          </div>
        </div>

        {/* Success Status */}
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl">
              ✅
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-900 mb-3">
                Production Ready
              </h3>
              <p className="text-green-800 mb-4 leading-relaxed">
                Die App nutzt echte ChefKoch-URLs mit 2000+ verifizierten Rezepten. 
                Alle Links funktionieren und führen zu hochwertigen deutschen Familienrezepten.
              </p>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-green-700">
                  <strong>Live Features:</strong> Echte ChefKoch/Kochbar URLs • 2000+ deutsche Rezepte • 
                  Bewertungen & Bilder • Mobile-optimiert • B2B Case Study Ready
                </div>
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

      {/* Admin Panel */}
      <AdminPanel />
    </div>
  )
}