# Data-fixes log entry: Power trade corridors

Use this to add the entry to the umbrella data-fixes page (EN + FR). Follows the existing entry schema.

## EN

- **id:** `power-trade`
- **name:** Power Trade Corridors
- **tag:** Canada / US
- **dataset:** Canada Energy Regulator, Electricity Trade Summary XLSX (updated 2026-09-25) and archived quarterly imports-exports CSV (1990Q1-2018Q2, open.canada.ca); US Energy Information Administration, Form 861 annual files 2010-2025; Bank of Canada FXAUSDCAD annual average, FRED DEXCAUS
- **vintage:** Source vintage: October 2026
- **url:** https://powertrade.canada.nshipyard.com
- **repo:** canada-power-trade
- **methods:** crosswalk, normalization, quarantine, dedup

**What was wrong:**
- No published key links a CER export destination to a US electricity market. The CER names destinations 41 different ways ("Pennsylvania Jersey Maryland Power Pool", "Minn / N. Dakota", "New England-ISO") with no region mapping.
- The archived CER quarterly file (1990-2018) and the current trade summary XLSX (2010-2026) overlap for 2010-2018 with different destination naming; neither maps to EIA state codes.
- Two rows in the archived CSV carry a blank destination. Four province-to-region pairings (for example West to PJM) are one-off scheduling noise totaling under 1 TWh.
- Prices arrive in CAD, US prices in USD, with no shared currency series: the BoC annual average starts in 2017 and the FRED daily series uses a different column name.

**The fix:**
- Hand-curated the corridor crosswalk (data/crosswalk.csv, 55 rows): 41 CER destination strings mapped to five market regions (US West, US Midwest, PJM, NYISO, ISO-NE), each region's price a sales-weighted average of its states' EIA-861 retail prices; 14 origin provinces grouped into CER West and East.
- Month alignment: CER monthly West/East prices averaged to annual; EIA-861 annual state prices used as published; currency converted with the annual average CAD-per-USD rate (BoC FXAUSDCAD 2017-2025, FRED DEXCAUS averaged annually for 1990-2016, BoC monthly average for 2026).
- Quarantine: the 2 blank-destination rows are excluded from every aggregate; the 4 noise pairings under 1 TWh total are dropped and documented.
- Validation: the pipeline reproduces the CER's published 2024 anchors exactly, $125.40 West and $58.87 East per MWh, to the cent.

**Result:** 96 margin rows (6 corridors x 16 years, 2010-2025), a 1990-2026 West/East inversion series, and the 55-row crosswalk, all downloadable as CSV.

**Diffs:**
- before: "Pennsylvania Jersey Maryland Power Pool" / after: market region PJM, grid operator PJM Interconnection
- before: "Minn / N. Dakota" / after: market region US Midwest
- before: "New England-ISO" / after: market region ISO-NE, grid operator ISO New England
- before: 2024 West price unverifiable against the file / after: pipeline output $125.40, matching the CER's published anchor to the cent

## FR

- **id:** `power-trade`
- **name:** Corridors du commerce de l'électricité
- **tag:** Canada / É.-U.
- **dataset:** Régie de l'énergie du Canada, fichier XLSX du résumé du commerce de l'électricité (mis à jour le 2026-09-25) et CSV trimestriel archivé des importations-exportations (1990T1-2018T2, open.canada.ca); Energy Information Administration des États-Unis, fichiers annuels du formulaire 861, 2010-2025; moyenne annuelle FXAUSDCAD de la Banque du Canada, DEXCAUS de la FRED
- **vintage:** Données : octobre 2026
- **url:** https://powertrade.canada.nshipyard.com
- **repo:** canada-power-trade
- **methods:** crosswalk, normalization, quarantine, dedup

**Ce qui clochait :**
- Aucune clé publiée ne relie une destination d'exportation de la REC à un marché américain de l'électricité. La REC nomme les destinations de 41 façons différentes (« Pennsylvania Jersey Maryland Power Pool », « Minn / N. Dakota », « New England-ISO ») sans table de correspondance régionale.
- Le fichier trimestriel archivé de la REC (1990-2018) et le résumé courant en XLSX (2010-2026) se chevauchent sur 2010-2018 avec des noms de destinations différents; aucun des deux ne correspond aux codes d'États de l'EIA.
- Deux lignes du CSV archivé portent une destination vide. Quatre appariements province-région (par exemple Ouest vers PJM) sont du bruit de répartition ponctuel totalisant moins de 1 TWh.
- Les prix arrivent en $CA, les prix américains en $US, sans série de change commune : la moyenne annuelle de la BdC commence en 2017 et la série quotidienne de la FRED utilise un autre nom de colonne.

**La correction :**
- Table de correspondance des corridors constituée à la main (data/crosswalk.csv, 55 lignes) : 41 chaînes de destinations de la REC vers cinq régions de marché (Ouest américain, Midwest américain, PJM, NYISO, ISO-NE), le prix de chaque région étant la moyenne pondérée par les ventes des prix de détail des États du formulaire 861 de l'EIA; 14 provinces d'origine regroupées en Ouest et Est selon la REC.
- Alignement temporel : prix mensuels Ouest et Est de la REC moyennés à l'année; prix annuels par État du formulaire 861 de l'EIA utilisés tels que publiés; conversion en dollars américains avec le taux annuel moyen $CA par $US (FXAUSDCAD de la BdC 2017-2025, DEXCAUS de la FRED moyenné annuellement pour 1990-2016, moyenne mensuelle de la BdC pour 2026).
- Quarantaine : les 2 lignes à destination vide sont exclues de tous les agrégats; les 4 appariements de bruit sous 1 TWh au total sont écartés et documentés.
- Validation : la chaîne reproduit exactement les repères 2024 publiés par la REC, 125,40 $ pour l'Ouest et 58,87 $ pour l'Est par MWh, au cent près.

**Résultat :** 96 lignes de marges (6 corridors x 16 ans, 2010-2025), une série d'inversion Ouest/Est 1990-2026 et la table de correspondance de 55 lignes, toutes téléchargeables en CSV.

**Diffs :**
- avant : « Pennsylvania Jersey Maryland Power Pool » / après : région de marché PJM, exploitant PJM Interconnection
- avant : « Minn / N. Dakota » / après : région de marché Midwest américain
- avant : « New England-ISO » / après : région de marché ISO-NE, exploitant ISO New England
- avant : prix 2024 de l'Ouest invérifiable contre le fichier / après : sortie de la chaîne 125,40 $, concordant au cent près avec le repère publié par la REC
