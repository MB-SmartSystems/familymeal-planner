'use client'

import { useState, useEffect } from 'react'
import { Recipe } from '@/lib/types'
import { dataService } from '@/lib/data-service'
import { baserowService } from '@/lib/baserow'

interface DataSourceStatus {
  baserow: boolean
  sheets: boolean  
  static: boolean
  current: 'baserow' | 'sheets' | 'static'
}

interface MigrationStats {
  success: number
  failed: number
  total?: number
  inProgress: boolean
}

export default function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<DataSourceStatus | null>(null)
  const [migrationStats, setMigrationStats] = useState<MigrationStats>({ success: 0, failed: 0, inProgress: false })
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load status on mount
  useEffect(() => {
    if (isOpen) {
      loadStatus()
    }
  }, [isOpen])

  const loadStatus = async () => {
    setIsLoading(true)
    try {
      const dataStatus = await dataService.getDataSourceStatus()
      setStatus(dataStatus)
      
      // Load recent recipes for preview
      const { recipes } = await dataService.getRecipesPaginated(1, 5)
      setRecentRecipes(recipes)
    } catch (error) {
      console.error('Failed to load admin status:', error)
    }
    setIsLoading(false)
  }

  const runMigration = async () => {
    setMigrationStats({ success: 0, failed: 0, inProgress: true })
    
    try {
      const result = await dataService.migrateToBaserow()
      setMigrationStats({
        success: result.success,
        failed: result.failed, 
        total: result.success + result.failed,
        inProgress: false
      })
      
      // Refresh status
      await loadStatus()
    } catch (error) {
      console.error('Migration failed:', error)
      setMigrationStats(prev => ({ ...prev, inProgress: false }))
    }
  }

  const clearCache = () => {
    dataService.clearCache()
    console.log('Cache cleared')
    // Could show toast notification
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-200 hover:scale-110"
        title="Admin Panel öffnen"
      >
        ⚙️
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">🔧 Admin Panel</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Data Source Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              📊 Data Source Status
              {isLoading && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
            </h3>
            
            {status && (
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-3 rounded-lg border-2 ${
                  status.baserow 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                  <div className="text-lg font-semibold">Baserow</div>
                  <div className="text-sm">
                    {status.baserow ? '✅ Online' : '❌ Offline'}
                  </div>
                  {status.current === 'baserow' && (
                    <div className="text-xs text-green-600 font-semibold mt-1">
                      🎯 AKTIV
                    </div>
                  )}
                </div>

                <div className={`p-3 rounded-lg border-2 ${
                  status.sheets 
                    ? 'border-yellow-200 bg-yellow-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                  <div className="text-lg font-semibold">Google Sheets</div>
                  <div className="text-sm">
                    {status.sheets ? '⚠️ Fallback' : '❌ Offline'}
                  </div>
                  {status.current === 'sheets' && (
                    <div className="text-xs text-yellow-600 font-semibold mt-1">
                      🔄 FALLBACK
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                  <div className="text-lg font-semibold">Static Data</div>
                  <div className="text-sm">✅ Always Available</div>
                  {status.current === 'static' && (
                    <div className="text-xs text-blue-600 font-semibold mt-1">
                      📁 STATIC
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Migration Section */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">🚀 Baserow Migration</h3>
            
            {migrationStats.inProgress ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <div className="text-lg">Migrating recipes to Baserow...</div>
                <div className="text-sm text-gray-600">
                  Success: {migrationStats.success} | Failed: {migrationStats.failed}
                </div>
              </div>
            ) : migrationStats.success > 0 || migrationStats.failed > 0 ? (
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">📈 Last Migration Results</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{migrationStats.success}</div>
                    <div className="text-sm text-gray-600">Success</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{migrationStats.failed}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {migrationStats.total ? Math.round(migrationStats.success / migrationStats.total * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex space-x-3">
              <button
                onClick={runMigration}
                disabled={migrationStats.inProgress || status?.current === 'baserow'}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  migrationStats.inProgress || status?.current === 'baserow'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {migrationStats.inProgress ? 'Migrating...' : 'Start Migration'}
              </button>
              
              <button
                onClick={clearCache}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                Clear Cache
              </button>
            </div>

            {status?.current === 'baserow' && (
              <div className="mt-3 p-3 bg-green-100 rounded-lg text-green-700 text-sm">
                ✅ Already using Baserow - Migration not needed
              </div>
            )}
          </div>

          {/* Recent Recipes Preview */}
          {recentRecipes.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">📋 Recent Recipes Preview</h3>
              <div className="space-y-2">
                {recentRecipes.map((recipe, index) => (
                  <div key={recipe.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div>
                      <div className="font-semibold">{recipe.title}</div>
                      <div className="text-sm text-gray-600">
                        {recipe.cuisine} • {recipe.cookTime}min • ⭐ {recipe.rating}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {recipe.source}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600 mt-3 text-center">
                Showing latest 5 recipes from current data source
              </div>
            </div>
          )}

          {/* Environment Info */}
          <div className="bg-gray-100 rounded-lg p-4 text-sm">
            <h4 className="font-semibold mb-2">🔧 Environment</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Baserow Enabled: {process.env.NEXT_PUBLIC_ENABLE_BASEROW || 'false'}</div>
              <div>Debug Mode: {process.env.NEXT_PUBLIC_DEBUG_BASEROW || 'false'}</div>
              <div>Cache TTL: {process.env.NEXT_PUBLIC_CACHE_TTL || '300000'}ms</div>
              <div>Batch Size: {process.env.NEXT_PUBLIC_BATCH_SIZE || '100'}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 text-center text-sm text-gray-600">
          FamilyMeal Admin Panel • Database Integration Status
        </div>
      </div>
    </div>
  )
}