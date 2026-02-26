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

  // Modern Loading State
  if (isLoading) {
    return (
      <div className="recipe-card animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 bg-gray-300 rounded-lg w-24"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16 px-3 py-1"></div>
        </div>
        <div className="space-y-4">
          <div className="w-full h-40 bg-gray-300 rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-300 rounded w-4/5"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full flex-1"></div>
            <div className="h-6 bg-gray-200 rounded-full flex-1"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
            <div className="h-12 bg-gray-200 rounded-xl w-12"></div>
          </div>
        </div>
      </div>
    )
  }

  // Modern Empty State
  if (!recipe) {
    return (
      <div className="recipe-card border-2 border-dashed border-gray-300 hover:border-primary-300 transition-colors duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-700 tracking-tight">{dayName}</h3>
          <div className="bg-gray-100 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-gray-600">
              {date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
            </span>
          </div>
        </div>
        
        <div className="space-y-6 text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center text-2xl mx-auto">
            🍽️
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">Noch kein Rezept</h4>
            <p className="text-sm text-gray-500">Erstelle einen Wochenplan oder füge ein Rezept hinzu</p>
          </div>
          <button 
            onClick={onFindAlternative}
            className="w-full py-3 text-sm font-medium border-2 border-dashed border-primary-400 text-primary-600 rounded-xl hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
          >
            <span>🎯</span>
            <span>Rezept hinzufügen</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="recipe-card group relative z-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">{dayName}</h3>
        <div className="bg-gray-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-gray-600">
            {date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Modern Recipe Image */}
        <div className="relative w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-inner">
          {recipe.imageUrl && !imageError ? (
            <>
              <img 
                src={recipe.imageUrl}
                alt={recipe.title}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true)
                  setImageLoading(false)
                }}
              />
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90">
                  <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {/* Subtle overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <div className="text-3xl mb-2">🍳</div>
                <div className="text-sm font-medium text-gray-600">Kein Bild verfügbar</div>
              </div>
            </div>
          )}
        </div>

        {/* Modern Recipe Info */}
        <div className="space-y-4 relative z-10">
          <h4 
            className="text-lg font-bold text-gray-900 line-clamp-2 cursor-pointer hover:text-primary-600 transition-colors duration-200 leading-tight"
            onClick={() => onViewDetails && onViewDetails(recipe)}
          >
            {recipe.title}
          </h4>
          
          {recipe.description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {recipe.description}
            </p>
          )}
          
          {/* Modern Meta Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span className="text-orange-500">⏱️</span>
                <span className="font-medium">{recipe.cookTime}min</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-medium">{recipe.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-blue-500">👥</span>
                <span className="font-medium">{recipe.servings}</span>
              </div>
            </div>
          </div>
          
          {/* Modern Tags */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
            
            {recipe.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center bg-primary-50 text-primary-700 border border-primary-200 text-xs px-3 py-1 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
            
            {recipe.familyRating && (
              <span className="inline-flex items-center bg-accent-orange/10 text-orange-700 border border-orange-200 text-xs px-3 py-1 rounded-full font-medium">
                Familie {recipe.familyRating}⭐
              </span>
            )}
          </div>
        </div>

        {/* Modern Action Buttons */}
        <div className="flex gap-3 pt-3 relative z-10">
          <button 
            onClick={onFindAlternative}
            className="flex-1 py-3 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-primary-300 hover:text-primary-600 transition-all duration-300 flex items-center justify-center space-x-2 group"
          >
            <span className="group-hover:rotate-180 transition-transform duration-300">🔄</span>
            <span>Alternative</span>
          </button>
          
          {recipe.url && (
            <a
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 flex items-center justify-center group hover:scale-105 shadow-sm hover:shadow-lg"
              title="Rezept auf ChefKoch öffnen"
            >
              <span className="group-hover:scale-110 transition-transform duration-200">📖</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}