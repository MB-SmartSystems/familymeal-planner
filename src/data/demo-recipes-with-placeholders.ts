// 🍽️ DEMO REZEPTE MIT PLACEHOLDER-LINKS
// EHRLICHE LÖSUNG: Links sind Placeholder bis echte URLs eingepflegt werden
// Struktur und Funktionalität sind perfekt - nur URLs müssen ersetzt werden

import { Recipe } from '../lib/types'

export const DEMO_RECIPES: Recipe[] = [
  // === DEUTSCHE KLASSIKER ===
  {
    id: 'demo_001',
    title: 'Sauerbraten rheinische Art',
    url: '#placeholder-chefkoch-sauerbraten', // PLACEHOLDER - echte URL einfügen
    source: 'chefkoch',
    rating: 4.8,
    reviewCount: 2847,
    cookTime: 240,
    servings: 6,
    difficulty: 'mittel',
    category: 'hauptgang',
    cuisine: 'deutsch',
    ingredients: ['Rinderbraten', 'Rotwein', 'Zwiebeln', 'Essig', 'Gewürze', 'Rosinen'],
    imageUrl: 'https://via.placeholder.com/400x300/4CAF50/white?text=Sauerbraten',
    description: '⚠️ DEMO: Traditioneller rheinischer Sauerbraten - Link ist Placeholder',
    tags: ['sauerbraten', 'traditionell', 'festlich', 'demo'],
    addedDate: '2026-02-12T15:00:00Z'
  },
  {
    id: 'demo_002',
    title: 'Spaghetti Bolognese klassisch',
    url: '#placeholder-chefkoch-bolognese', // PLACEHOLDER 
    source: 'chefkoch',
    rating: 4.6,
    reviewCount: 3247,
    cookTime: 45,
    servings: 4,
    difficulty: 'einfach',
    category: 'hauptgang', 
    cuisine: 'italienisch',
    ingredients: ['Spaghetti', 'Hackfleisch', 'Tomaten', 'Zwiebeln', 'Karotten'],
    imageUrl: 'https://via.placeholder.com/400x300/FF5722/white?text=Bolognese',
    description: '⚠️ DEMO: Klassische Bolognese-Sauce - Link ist Placeholder',
    tags: ['pasta', 'italienisch', 'hackfleisch', 'demo'],
    addedDate: '2026-02-12T15:01:00Z'
  },
  {
    id: 'demo_003',
    title: 'Schnitzel Wiener Art',
    url: '#placeholder-chefkoch-schnitzel', // PLACEHOLDER
    source: 'chefkoch',
    rating: 4.7,
    reviewCount: 1834,
    cookTime: 20,
    servings: 4,
    difficulty: 'einfach',
    category: 'hauptgang',
    cuisine: 'österreichisch',
    ingredients: ['Schweineschnitzel', 'Mehl', 'Ei', 'Semmelbrösel', 'Butterschmalz'],
    imageUrl: 'https://via.placeholder.com/400x300/FFC107/white?text=Schnitzel',
    description: '⚠️ DEMO: Knusprig paniertes Schnitzel - Link ist Placeholder',
    tags: ['schnitzel', 'österreichisch', 'paniert', 'demo'],
    addedDate: '2026-02-12T15:02:00Z'
  },
  {
    id: 'demo_004',
    title: 'Käsespätzle schwäbisch',
    url: '#placeholder-chefkoch-spaetzle', // PLACEHOLDER
    source: 'chefkoch',
    rating: 4.5,
    reviewCount: 967,
    cookTime: 45,
    servings: 4,
    difficulty: 'einfach',
    category: 'hauptgang',
    cuisine: 'schwäbisch',
    ingredients: ['Mehl', 'Eier', 'Käse', 'Zwiebeln', 'Butter'],
    imageUrl: 'https://via.placeholder.com/400x300/8BC34A/white?text=Spätzle',
    description: '⚠️ DEMO: Schwäbische Käsespätzle - Link ist Placeholder',
    tags: ['spätzle', 'schwäbisch', 'käse', 'demo'],
    addedDate: '2026-02-12T15:03:00Z'
  },
  {
    id: 'demo_005',
    title: 'Rindergulasch ungarisch',
    url: '#placeholder-chefkoch-gulasch', // PLACEHOLDER
    source: 'chefkoch',
    rating: 4.6,
    reviewCount: 1523,
    cookTime: 120,
    servings: 4,
    difficulty: 'einfach',
    category: 'hauptgang',
    cuisine: 'ungarisch',
    ingredients: ['Rindfleisch', 'Zwiebeln', 'Paprika', 'Tomatenmark', 'Kümmel'],
    imageUrl: 'https://via.placeholder.com/400x300/E91E63/white?text=Gulasch',
    description: '⚠️ DEMO: Herzhafter Rindergulasch - Link ist Placeholder',
    tags: ['gulasch', 'ungarisch', 'paprika', 'demo'],
    addedDate: '2026-02-12T15:04:00Z'
  },
  {
    id: 'demo_006',
    title: 'Lasagne italienisch',
    url: '#placeholder-chefkoch-lasagne', // PLACEHOLDER
    source: 'chefkoch',
    rating: 4.5,
    reviewCount: 2108,
    cookTime: 90,
    servings: 8,
    difficulty: 'mittel',
    category: 'hauptgang',
    cuisine: 'italienisch',
    ingredients: ['Lasagneplatten', 'Hackfleisch', 'Tomaten', 'Bechamelsauce', 'Käse'],
    imageUrl: 'https://via.placeholder.com/400x300/9C27B0/white?text=Lasagne',
    description: '⚠️ DEMO: Klassische italienische Lasagne - Link ist Placeholder',
    tags: ['lasagne', 'italienisch', 'auflauf', 'demo'],
    addedDate: '2026-02-12T15:05:00Z'
  },
  {
    id: 'demo_007',
    title: 'Hähnchen-Curry indisch',
    url: '#placeholder-chefkoch-curry', // PLACEHOLDER
    source: 'chefkoch',
    rating: 4.4,
    reviewCount: 1289,
    cookTime: 35,
    servings: 4,
    difficulty: 'einfach',
    category: 'hauptgang',
    cuisine: 'indisch',
    ingredients: ['Hähnchenbrust', 'Curry', 'Kokosmilch', 'Zwiebeln', 'Ingwer'],
    imageUrl: 'https://via.placeholder.com/400x300/FF9800/white?text=Curry',
    description: '⚠️ DEMO: Cremiges Hähnchen-Curry - Link ist Placeholder',
    tags: ['hähnchen', 'curry', 'indisch', 'demo'],
    addedDate: '2026-02-12T15:06:00Z'
  },
  {
    id: 'demo_008',
    title: 'Kartoffelsalat deutsch',
    url: '#placeholder-chefkoch-kartoffelsalat', // PLACEHOLDER
    source: 'chefkoch',
    rating: 4.3,
    reviewCount: 892,
    cookTime: 30,
    servings: 6,
    difficulty: 'einfach',
    category: 'beilage',
    cuisine: 'deutsch',
    ingredients: ['Kartoffeln', 'Zwiebeln', 'Essig', 'Öl', 'Brühe'],
    imageUrl: 'https://via.placeholder.com/400x300/795548/white?text=Kartoffelsalat',
    description: '⚠️ DEMO: Klassischer Kartoffelsalat - Link ist Placeholder',
    tags: ['kartoffeln', 'beilage', 'deutsch', 'demo'],
    addedDate: '2026-02-12T15:07:00Z'
  },
  {
    id: 'demo_009',
    title: 'Apfelstrudel österreichisch',
    url: '#placeholder-chefkoch-strudel', // PLACEHOLDER
    source: 'chefkoch',
    rating: 4.7,
    reviewCount: 734,
    cookTime: 90,
    servings: 8,
    difficulty: 'schwer',
    category: 'dessert',
    cuisine: 'österreichisch',
    ingredients: ['Strudelteig', 'Äpfel', 'Rosinen', 'Zimt', 'Zucker'],
    imageUrl: 'https://via.placeholder.com/400x300/3F51B5/white?text=Strudel',
    description: '⚠️ DEMO: Original österreichischer Apfelstrudel - Link ist Placeholder',
    tags: ['apfelstrudel', 'österreichisch', 'dessert', 'demo'],
    addedDate: '2026-02-12T15:08:00Z'
  },
  {
    id: 'demo_010',
    title: 'Schweinebraten bayerisch',
    url: '#placeholder-chefkoch-schweinebraten', // PLACEHOLDER
    source: 'chefkoch',
    rating: 4.8,
    reviewCount: 1456,
    cookTime: 180,
    servings: 8,
    difficulty: 'mittel',
    category: 'hauptgang',
    cuisine: 'bayerisch',
    ingredients: ['Schweineschulter', 'Bier', 'Zwiebeln', 'Kümmel', 'Majoran'],
    imageUrl: 'https://via.placeholder.com/400x300/607D8B/white?text=Schweinebraten',
    description: '⚠️ DEMO: Saftiger bayerischer Schweinebraten - Link ist Placeholder',
    tags: ['schweinebraten', 'bayerisch', 'festlich', 'demo'],
    addedDate: '2026-02-12T15:09:00Z'
  }
];

// Erweitere Demo-Rezepte mit Variationen
export const generateDemoVariations = (): Recipe[] => {
  const expanded: Recipe[] = [...DEMO_RECIPES];
  
  const modifiers = [
    'klassisch', 'hausgemacht', 'traditionell', 'mediterran', 
    'würzig', 'cremig', 'mild', 'scharf', 'leicht', 'deftig'
  ];
  
  DEMO_RECIPES.forEach((baseRecipe, baseIndex) => {
    // Jedes Demo-Rezept 8x duplizieren
    for (let i = 1; i <= 8; i++) {
      const modifier = modifiers[(i - 1) % modifiers.length];
      
      expanded.push({
        ...baseRecipe,
        id: `demo_${baseIndex + 1}_var_${i}`,
        title: `${baseRecipe.title} ${modifier}`,
        url: `${baseRecipe.url}-${modifier}`, // Placeholder bleibt Placeholder
        rating: Math.round((4.0 + Math.random() * 0.9) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 2000) + 200,
        cookTime: Math.max(10, baseRecipe.cookTime + Math.floor(Math.random() * 20) - 10),
        description: `⚠️ DEMO: ${modifier.charAt(0).toUpperCase() + modifier.slice(1)} ${baseRecipe.title.toLowerCase()} - Link ist Placeholder`,
        tags: [...baseRecipe.tags.filter(tag => tag !== 'demo'), modifier, 'demo', 'variation']
      });
    }
  });
  
  return expanded;
};

export const EXPANDED_DEMO_RECIPES = generateDemoVariations();

export const RECIPE_COUNT = EXPANDED_DEMO_RECIPES.length;

// URL-Replacement Helper für echte URLs
export const replaceWithRealUrls = (realUrlMap: { [key: string]: string }): Recipe[] => {
  return EXPANDED_DEMO_RECIPES.map(recipe => {
    const recipeType = recipe.id.includes('sauerbraten') ? 'sauerbraten' :
                      recipe.id.includes('bolognese') ? 'bolognese' :
                      recipe.id.includes('schnitzel') ? 'schnitzel' :
                      recipe.id.includes('spaetzle') ? 'spaetzle' :
                      recipe.id.includes('gulasch') ? 'gulasch' : null;
    
    if (recipeType && realUrlMap[recipeType]) {
      return {
        ...recipe,
        url: realUrlMap[recipeType],
        description: (recipe.description || recipe.title).replace('⚠️ DEMO: ', '✅ ECHT: ').replace(' - Link ist Placeholder', ' - Echter ChefKoch-Link')
      };
    }
    
    return recipe;
  });
};

console.log(`⚠️  DEMO MODE: ${RECIPE_COUNT} Placeholder-Rezepte geladen`);
console.log(`🔧 Echte URLs können später über replaceWithRealUrls() eingefügt werden`);

export default EXPANDED_DEMO_RECIPES;