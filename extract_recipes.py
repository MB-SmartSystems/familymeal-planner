#!/usr/bin/env python3
# FamilyMeal Rezepte Extraktor
# Liest TypeScript-Datei und erstellt CSV für Excel/Google Sheets

import re
import csv

def extract_recipes_from_ts(file_path):
    """Extrahiert Rezepte aus TypeScript-Datei"""
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    recipes = []
    
    # Finde alle Rezept-Objekte zwischen { und }
    recipe_pattern = r'\{[\s\S]*?\}'
    matches = re.findall(recipe_pattern, content)
    
    for match in matches:
        if 'id:' in match and 'title:' in match:
            recipe = {}
            
            # Extrahiere einzelne Felder
            fields = {
                'title': r"title:\s*['\"]([^'\"]*)['\"]",
                'url': r"url:\s*['\"]([^'\"]*)['\"]",
                'rating': r"rating:\s*([\d\.]+)",
                'reviewCount': r"reviewCount:\s*(\d+)",
                'cookTime': r"cookTime:\s*(\d+)",
                'servings': r"servings:\s*(\d+)", 
                'difficulty': r"difficulty:\s*['\"]([^'\"]*)['\"]",
                'category': r"category:\s*['\"]([^'\"]*)['\"]",
                'cuisine': r"cuisine:\s*['\"]([^'\"]*)['\"]",
                'description': r"description:\s*['\"]([^'\"]*)['\"]"
            }
            
            for field, pattern in fields.items():
                match_field = re.search(pattern, match)
                recipe[field] = match_field.group(1) if match_field else ''
            
            # Extrahiere Zutaten-Array
            ingredients_match = re.search(r"ingredients:\s*\[(.*?)\]", match, re.DOTALL)
            if ingredients_match:
                ingredients_content = ingredients_match.group(1)
                ingredients = re.findall(r"['\"]([^'\"]*)['\"]", ingredients_content)
                recipe['ingredients'] = '; '.join(ingredients)
            else:
                recipe['ingredients'] = ''
            
            if recipe.get('title'):  # Nur wenn Title gefunden
                recipes.append(recipe)
    
    return recipes

def save_to_csv(recipes, output_file):
    """Speichert Rezepte als CSV"""
    fieldnames = [
        'Titel', 'URL', 'Bewertung', 'Anzahl_Reviews', 'Kochzeit_Min', 
        'Portionen', 'Schwierigkeit', 'Kategorie', 'Küche', 'Zutaten', 'Beschreibung'
    ]
    
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for recipe in recipes:
            writer.writerow({
                'Titel': recipe.get('title', ''),
                'URL': recipe.get('url', ''),
                'Bewertung': recipe.get('rating', ''),
                'Anzahl_Reviews': recipe.get('reviewCount', ''),
                'Kochzeit_Min': recipe.get('cookTime', ''),
                'Portionen': recipe.get('servings', ''),
                'Schwierigkeit': recipe.get('difficulty', ''),
                'Kategorie': recipe.get('category', ''),
                'Küche': recipe.get('cuisine', ''),
                'Zutaten': recipe.get('ingredients', ''),
                'Beschreibung': recipe.get('description', '')
            })

if __name__ == "__main__":
    input_file = "src/data/demo-recipes-with-placeholders.ts"
    output_file = "FamilyMeal_Rezepte_Komplett.csv"
    
    print("🔍 Extrahiere Rezepte aus TypeScript-Datei...")
    recipes = extract_recipes_from_ts(input_file)
    
    print(f"✅ {len(recipes)} Rezepte gefunden")
    
    print("📊 Erstelle CSV-Datei...")
    save_to_csv(recipes, output_file)
    
    print(f"🎉 CSV-Export erfolgreich: {output_file}")
    print(f"📋 {len(recipes)} Rezepte bereit für Excel/Google Sheets")