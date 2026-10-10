# Chart specs: The Power Trade Margin Board

All charts are hand-built SVG (React, viewBox-scaled, desktop and mobile). Prices in USD per MWh unless noted. Every chart carries its unit label and a legend.

## EN

### 1. Ranked corridor margin bars (showcase Q1)
- Type: horizontal bars, 2025, one bar per corridor, sorted descending.
- Values: East to ISO-NE $102.60, East to NYISO $97.68, West to US West $75.69, East to US Midwest $56.74, East to PJM $42.99, West to US Midwest $39.69.
- Encoding: top corridor in Canada red (#d80621), others in ink at 72% opacity.
- Reads as: New England is the runaway margin leader.

### 2. Inversion gap bars (showcase Q2)
- Type: vertical bars, one per year 1990-2025, value = West export price minus East export price (USD/MWh).
- Encoding: positive years (West costs more) in Canada red; negative years (East costs more) in ink at 55%.
- Key features: 2000-2001 California crisis spike (+$69.72 in 2001), East-dominant 1990-2016 with brief flips (1994-1995, 2013, 2016-2017), West-dominant every year since 2018, peak +$51.54 in 2023.
- 2026 (partial, through July) is excluded from the chart and noted in copy.

### 3. Margin spread line chart (showcase Q3, Q4, and explorer)
- Type: two lines over 2010-2025 for one corridor: export price (red) vs US market price (ink), with the area between shaded red at 14% opacity.
- The shaded gap is the margin. Axis ticks in whole dollars.
- Guards: renders nothing when fewer than two data points exist (avoids divide-by-zero on single-year filters).

### 4. Hero stat band
- Four stats: $59.6B cumulative margin 2010-2025; $102.60/MWh 2025 New England margin; 2018 inversion crossover year; $125.40 vs $58.87 CER 2024 West/East anchor check.

## FR

### 1. Barres des marges par corridor, classées (vitrine Q1)
- Type : barres horizontales, 2025, un corridor par barre, tri décroissant.
- Valeurs : Est vers ISO-NE 102,60 $, Est vers NYISO 97,68 $, Ouest vers l'Ouest américain 75,69 $, Est vers le Midwest américain 56,74 $, Est vers PJM 42,99 $, Ouest vers le Midwest américain 39,69 $.
- Encodage : premier corridor en rouge Canada (#d80621), les autres en encre à 72 % d'opacité.

### 2. Barres de l'écart d'inversion (vitrine Q2)
- Type : barres verticales, une par année 1990-2025, valeur = prix d'exportation de l'Ouest moins prix de l'Est ($US/MWh).
- Encodage : années positives (l'Ouest coûte plus cher) en rouge Canada; années négatives (l'Est coûte plus cher) en encre à 55 % d'opacité.
- Points saillants : pic de la crise californienne 2000-2001 (+69,72 $ en 2001), domination de l'Est 1990-2016 avec bascules brèves (1994-1995, 2013, 2016-2017), domination de l'Ouest chaque année depuis 2018, pic +51,54 $ en 2023.

### 3. Graphique linéaire de l'écart de marge (vitrine Q3, Q4, et explorateur)
- Type : deux lignes sur 2010-2025 pour un corridor : prix d'exportation (rouge) contre prix du marché américain (encre), avec la zone entre les deux ombrée en rouge à 14 % d'opacité.
- La zone ombrée est la marge. Graduations en dollars entiers.

### 4. Bandeau de statistiques du héros
- Quatre statistiques : 59,6 G$ de marge cumulative 2010-2025; 102,60 $/MWh de marge 2025 pour la Nouvelle-Angleterre; 2018, année de bascule de l'inversion; 125,40 $ contre 58,87 $, repères 2024 de la REC pour validation.

## Accessibility

Every chart is an inline SVG with role="img" and a text legend beside it; the same numbers appear in the data table (explorer) and in the CSV downloads.
