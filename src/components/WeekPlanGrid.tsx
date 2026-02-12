'use client'

import { WeekPlan, Recipe } from '@/lib/types'
import RecipeCard from './RecipeCard'

interface WeekPlanGridProps {
  weekPlan: WeekPlan | null
  currentWeek: Date
  isLoading: boolean
  onFindAlternative: (dayIndex: number) => void
  onViewRecipeDetails?: (recipe: Recipe) => void
  onGeneratePlan: () => void
}

const WEEKDAYS = [
  'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 
  'Freitag', 'Samstag', 'Sonntag'
]

export default function WeekPlanGrid({
  weekPlan,
  currentWeek,
  isLoading,
  onFindAlternative,
  onViewRecipeDetails,
  onGeneratePlan
}: WeekPlanGridProps) {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {WEEKDAYS.map((day, index) => {
          const currentDate = new Date(currentWeek.getTime() + index * 24 * 60 * 60 * 1000)
          return (
            <RecipeCard
              key={day}
              recipe={null}
              dayName={day}
              date={currentDate}
              isLoading={true}
              onFindAlternative={() => {}}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Week Summary */}
      {weekPlan && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                📅 Wochenplan erstellt
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Zeitraum:</span> {' '}
                  {new Date(weekPlan.startDate).toLocaleDateString('de-DE', { 
                    day: '2-digit', month: '2-digit' 
                  })} - {new Date(weekPlan.endDate).toLocaleDateString('de-DE', { 
                    day: '2-digit', month: '2-digit' 
                  })}
                </p>
                <p>
                  <span className="font-medium">Status:</span> {' '}
                  <span className="capitalize">{weekPlan.status}</span>
                </p>
                <p>
                  <span className="font-medium">Rezepte:</span> {' '}
                  {weekPlan.days.filter(day => day.recipe).length}/7 Tage
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="text-right text-sm">
              <div className="space-y-1">
                {getWeekStats(weekPlan).map((stat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span>{stat.icon}</span>
                    <span className="text-gray-600">{stat.label}</span>
                    <span className="font-medium">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {WEEKDAYS.map((day, index) => {
          const dayPlan = weekPlan?.days[index]
          const recipe = dayPlan?.recipe
          const currentDate = new Date(currentWeek.getTime() + index * 24 * 60 * 60 * 1000)
          
          return (
            <RecipeCard
              key={day}
              recipe={recipe || null}
              dayName={day}
              date={currentDate}
              isLoading={false}
              onFindAlternative={() => onFindAlternative(index)}
              onViewDetails={onViewRecipeDetails}
            />
          )
        })}
      </div>

      {/* Empty State */}
      {!weekPlan && !isLoading && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Noch kein Wochenplan erstellt
            </h3>
            <p className="text-gray-600 mb-6">
              Erstelle deinen ersten intelligenten Wochenplan basierend auf deinen Familienpräferenzen.
            </p>
            <button
              onClick={onGeneratePlan}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
            >
              🎯 Wochenplan erstellen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper: Wochenstatistiken berechnen
function getWeekStats(weekPlan: WeekPlan) {
  const recipes = weekPlan.days.map(day => day.recipe).filter((recipe): recipe is Recipe => recipe !== undefined)
  
  if (recipes.length === 0) return []

  const stats = []

  // Durchschnittliche Kochzeit
  const avgCookTime = Math.round(
    recipes.reduce((sum, recipe) => sum + recipe.cookTime, 0) / recipes.length
  )
  stats.push({
    icon: '⏱️',
    label: 'Ø Kochzeit',
    value: `${avgCookTime}min`
  })

  // Durchschnittliches Rating
  const avgRating = (
    recipes.reduce((sum, recipe) => sum + recipe.rating, 0) / recipes.length
  ).toFixed(1)
  stats.push({
    icon: '⭐',
    label: 'Ø Rating',
    value: `${avgRating}/5`
  })

  // Küchen-Vielfalt
  const cuisineSet = new Set(recipes.map(r => r.cuisine))
  const cuisines = Array.from(cuisineSet)
  stats.push({
    icon: '🌍',
    label: 'Küchen',
    value: `${cuisines.length} versch.`
  })

  // Vegetarische Gerichte
  const vegetarianCount = recipes.filter(r => r.tags.includes('vegetarisch')).length
  if (vegetarianCount > 0) {
    stats.push({
      icon: '🥬',
      label: 'Vegetarisch',
      value: `${vegetarianCount}x`
    })
  }

  return stats
}