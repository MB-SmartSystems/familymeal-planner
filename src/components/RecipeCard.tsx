'use client'

import { useState } from 'react'
import { Recipe } from '@/lib/types'

interface RecipeCardProps {
  recipe: Recipe | null
  dayName: string
  date: Date
  isLoading?: boolean
  onFindAlternative: () => void
  onViewDetails?: (recipe: Recipe) => void
}

export default function RecipeCard({ 
  recipe, 
  dayName, 
  date, 
  isLoading = false,
  onFindAlternative,
  onViewDetails 
}: RecipeCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Difficulty colors
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'einfach': return 'bg-green-100 text-green-700'
      case 'mittel': return 'bg-yellow-100 text-yellow-700'
      case 'schwer': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="recipe-card animate-pulse">
        <div className="flex justify-between items-center mb-3">
          <div className="h-4 bg-gray-300 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="space-y-3">
          <div className="w-full h-32 bg-gray-300 rounded-lg"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded flex-1"></div>
            <div className="h-8 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </div>
    )
  }

  // Empty State
  if (!recipe) {
    return (
      <div className="recipe-card border-2 border-dashed border-gray-300">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">{dayName}</h3>
          <span className="text-sm text-gray-500">
            {date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
          </span>
        </div>
        
        <div className="space-y-4 text-center py-6">
          <div className="text-4xl">🍽️</div>
          <div>
            <h4 className="font-medium text-gray-500 mb-1">Noch kein Rezept</h4>
            <p className="text-sm text-gray-400">Wochenplan erstellen</p>
          </div>
          <button 
            onClick={onFindAlternative}
            className="w-full py-2 text-sm border border-dashed border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-105"
          >
            🎯 Rezept hinzufügen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="recipe-card group hover:scale-105 transition-all duration-300 bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">{dayName}</h3>
        <span className="text-sm text-gray-500">
          {date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
        </span>
      </div>
      
      <div className="space-y-3">
        {/* Recipe Image */}
        <div className="relative w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
          {recipe.imageUrl && !imageError ? (
            <>
              <img 
                src={recipe.imageUrl}
                alt={recipe.title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true)
                  setImageLoading(false)
                }}
              />
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="text-2xl mb-1">🍳</div>
                <div className="text-xs text-gray-500">Kein Bild</div>
              </div>
            </div>
          )}
        </div>

        {/* Recipe Info */}
        <div className="space-y-1">
          <h4 
            className="font-medium text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
            onClick={() => onViewDetails && onViewDetails(recipe)}
          >
            {recipe.title}
          </h4>
          
          {recipe.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {recipe.description}
            </p>
          )}
          
          {/* Meta Info */}
          <div className="flex items-center mt-2 text-xs text-gray-500 space-x-3">
            <span className="flex items-center">
              ⏱️ {recipe.cookTime}min
            </span>
            <span className="flex items-center">
              ⭐ {recipe.rating.toFixed(1)}
            </span>
            <span className="flex items-center">
              👥 {recipe.servings}
            </span>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
            
            {recipe.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index} 
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
            
            {recipe.familyRating && (
              <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">
                Familie: {recipe.familyRating}⭐
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button 
            onClick={onFindAlternative}
            className="flex-1 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:border-blue-500 hover:text-blue-600"
          >
            🔄 Alternative
          </button>
          
          {recipe.url && (
            <a
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
              title="Rezept auf Website öffnen"
            >
              📖
            </a>
          )}
        </div>
      </div>
    </div>
  )
}