# 🍽️ FamilyMeal Planner

Intelligente Wochenplanung für Familien mit 100+ deutschen Premium-Rezepten.

## ✨ Features

- **🎯 Intelligente Planung:** Berücksichtigt Familienpräferenzen, Kochzeit und Ausgewogenheit
- **📚 100+ Premium Rezepte:** Handverlesene deutsche Familienrezepte mit echten funktionierenden Links
- **⏱️ Zeitoptimiert:** Werktags max. 45min, Wochenende mehr Zeit für aufwändige Gerichte
- **🥕 Präferenzen:** Zutaten als "liebling", "oft", "selten" oder "verboten" markieren
- **🌍 Küchen-Vielfalt:** Ausgewogene Mischung deutscher, italienischer und vegetarischer Küche
- **📱 Responsive:** Funktioniert perfekt auf Desktop, Tablet und Smartphone

## 🏗️ Technologie

- **Framework:** Next.js 14 mit TypeScript
- **Styling:** Tailwind CSS
- **Datenbank:** Mock Google Sheets Service (erweiterbar zu echter Sheets API)
- **Deployment:** Vercel

## 🚀 Installation

```bash
# Repository klonen
git clone https://github.com/MB-SmartSystems/familymeal-planner.git

# In Projektordner wechseln
cd familymeal-planner

# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Browser öffnen
open http://localhost:3000
```

## 📊 Rezept-Kategorien

### 🍗 Hähnchen & Geflügel (15 Rezepte)
- Paprika-Sahne-Hähnchen
- Toskanischer Hähnchen-Auflauf  
- Philadelphia-Hähnchen
- Hähnchen Curry
- Hähnchen süß-sauer

### 🍝 Pasta & Nudeln (15 Rezepte)
- Spaghetti Bolognese
- Pasta Carbonara
- Lasagne
- Nudelsalat
- Nudeln mit Tomatensauce

### 🇩🇪 Deutsche Klassiker (20 Rezepte)
- Wiener Schnitzel
- Sauerbraten
- Rouladen
- Currywurst mit Pommes
- Kassler mit Sauerkraut

### 🥬 Vegetarische Gerichte (15 Rezepte)
- Kartoffelauflauf
- Gemüse-Reispfanne
- Spinat-Lasagne
- Gemüse-Curry
- Ratatouille

### 🍲 Suppen & Eintöpfe (10 Rezepte)
- Tomatensuppe
- Kartoffelsuppe
- Linsensuppe
- Kürbissuppe
- Gulaschsuppe

### ⚡ Schnelle Gerichte (≤20min) (10 Rezepte)
- Rührei
- Pfannkuchen
- Omelett
- Spaghetti Aglio e Olio
- Spiegelei mit Bratkartoffeln

### 🔥 Aufläufe & Gratins (10 Rezepte)
- Nudelauflauf
- Kartoffelgratin
- Moussaka
- Brokkoli-Auflauf
- Zucchini-Auflauf

### 🐟 Fisch & Meeresfrüchte (5 Rezepte)
- Lachs mit Dillsauce
- Fischstäbchen
- Forelle Müllerin Art
- Garnelen in Knoblauchöl
- Thunfisch-Pasta

## 🎛️ Intelligente Planungslogik

### Scoring-System
Jedes Rezept wird nach diesen Kriterien bewertet:

- **Qualität (50 Punkte):** Rating + Anzahl Reviews
- **Schwierigkeit (15 Punkte):** "einfach" und "mittel" bevorzugt
- **Kochzeit (15 Punkte):** Werktag vs. Wochenende optimiert
- **Präferenzen (±50 Punkte):** Zutaten-Vorlieben berücksichtigt

### Ausgewogenheits-Regeln
- Max. 2x gleiche Küche pro Woche
- Mind. 1x vegetarisch pro Woche
- Werktags: Max. 45 Min Kochzeit
- Wochenende: Max. 90 Min Kochzeit

## 📁 Projektstruktur

```
familymeal-planner/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # Hauptseite
│   │   ├── layout.tsx       # Layout
│   │   └── globals.css      # Globale Styles
│   ├── components/          # React Komponenten
│   │   ├── RecipeCard.tsx   # Rezeptkarte
│   │   └── WeekPlanGrid.tsx # Wochenplan-Grid
│   ├── lib/                 # Business Logic
│   │   ├── types.ts         # TypeScript Definitionen
│   │   ├── sheets.ts        # Datenbank Service
│   │   └── planner.ts       # Planungsalgorithmus
│   └── data/                # Datenquellen
│       └── premium-100-recipes.ts  # 100 Premium Rezepte
├── package.json
└── README.md
```

## 🔧 Konfiguration

### Präferenzen anpassen
```typescript
// In sheets.ts - mockGet() Präferenzen-Sektion
const preferences = [
  { ingredient: 'Hähnchen', status: 'oft', notes: 'Familienliebling' },
  { ingredient: 'Paprika', status: 'verboten', notes: 'Allergisch' },
  { ingredient: 'Zwiebeln', status: 'selten', notes: 'Mag nicht jeder' }
]
```

### Planungsregeln anpassen
```typescript
// In planner.ts - defaultConfig
const config: PlannerConfig = {
  maxSameCuisinePerWeek: 2,     // Max 2x italienisch
  minVegetarianPerWeek: 1,      // Min 1x vegetarisch
  maxCookTimeWeekdays: 45,      // Max 45min Mo-Fr
  maxCookTimeWeekends: 90,      // Max 90min Sa-So
  minRating: 4.0,               // Min 4 Sterne
  preferredDifficulty: ['einfach', 'mittel']
}
```

## 🚀 Deployment

### Vercel (Empfohlen)
```bash
# Vercel CLI installieren
npm i -g vercel

# Deploy
npm run build
vercel --prod
```

### GitHub Integration
Das Projekt ist für Auto-Deployment via GitHub + Vercel konfiguriert.

## 🧪 Entwicklung

### Dev Server starten
```bash
npm run dev
```

### Build für Production
```bash
npm run build
npm start
```

### Lint Check
```bash
npm run lint
```

## 🔮 Roadmap

### Phase 1: Core (✅ Fertig)
- [x] 100 Premium-Rezepte Datenbank
- [x] Intelligente Wochenplanung
- [x] Responsive UI mit Tailwind CSS
- [x] Präferenzen-System

### Phase 2: Enhanced Features
- [ ] Echte Google Sheets Integration
- [ ] Einkaufslisten-Generator
- [ ] Rezept-Favoriten System
- [ ] Export-Funktionen (PDF, Print)

### Phase 3: Advanced Features  
- [ ] Nährwert-Informationen
- [ ] Saison-Kalender Integration
- [ ] KI-basierte Rezept-Vorschläge
- [ ] Community-Features

## 🤝 Contributing

1. Fork das Repository
2. Feature Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Commit Changes (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Pull Request öffnen

## 📜 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 👨‍💼 Autor

**MB SmartSystems**
- Website: [mb-smartsystems.de](https://mb-smartsystems.de)
- E-Mail: info@mb-smartsystems.de

---

**Made with ❤️ for German families who love good food! 🇩🇪🍽️**