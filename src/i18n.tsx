"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "fr";

const en = {
  banner: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the Canada Energy Regulator.",
    badge: "Open source",
  },
  nav: { explorer: "Explorer", showcase: "Showcase", developers: "Developers", data: "Data", back: "All projects" },
  hero: {
    kicker: "Nshipyard Canada · Open data project",
    title: "The Power Trade Margin Board",
    sub: "Canada sells electricity to the United States at one price. American buyers pay another. This board joins the Canada Energy Regulator's export prices with US retail electricity prices state by state, 2010 to 2025, and shows the margin on six real export corridors. Nobody publishes the spread. It is computed here from open data, corridor by corridor, year by year.",
    cta1: "Explore the corridors",
    cta2: "Read the methodology",
  },
  stats: [
    { value: "$59.6B", label: "of cumulative margin captured across six corridors from 2010 to 2025: the gap between what Canada received per MWh and what the receiving US market paid" },
    { value: "$102.60", label: "per MWh margin on the East to New England corridor in 2025: Canada exported at $53.24 while New England retail averaged $155.85" },
    { value: "2018", label: "the year western export prices moved above eastern prices and stayed there, peaking at +$51.54 per MWh in 2023. For most of 1990 to 2016 the East was more expensive" },
    { value: "$125.40", label: "versus $58.87: the CER's published 2024 West and East export prices, reproduced from the source file to the cent as a check on the whole pipeline" },
  ],
  explorer: {
    kicker: "Explorer",
    title: "Every corridor, every year.",
    corridorFilter: "All corridors",
    yearFilter: "All years",
    showing: "Showing",
    of: "of",
    noResult: "No rows match.",
    cols: { year: "Year", corridor: "Corridor", exportCad: "Export price (CAD/MWh)", exportUsd: "Export price (USD/MWh)", usPrice: "US market price (USD/MWh)", margin: "Margin (USD/MWh)", volume: "Volume (TWh)", marginValue: "Margin value (USD M)" },
    chartTitle: "Export price versus US market price",
    chartSub: "The shaded gap is the margin. Prices in US dollars per MWh.",
    legendExport: "Export price",
    legendUs: "US market price",
    pickCorridor: "Pick a corridor to draw its margin spread.",
  },
  showcase: {
    kicker: "Showcase",
    title: "Questions the raw files cannot answer.",
    body: "The CER publishes what Canada received. The EIA publishes what Americans paid. Nobody publishes the difference. These cards compute it, with the source and the method printed next to every number.",
    citeThis: "Cite this",
    copied: "Copied",
    q1: "How much margin does each power intertie capture?",
    a1: "New England captures the most. From 2010 to 2025 the East to New England corridor captured $20.44B on 260.1 TWh of exports. In 2025 alone the margin was $102.60 per MWh: Canada exported at $53.24 while New England retail averaged $155.85. The PJM corridor is the smallest at $0.41B cumulative.",
    q2: "When did western power get more expensive than eastern?",
    a2: "In 2018, and it stayed that way. Western export prices moved above eastern prices that year and the gap peaked at +$51.54 per MWh in 2023. For most of 1990 to 2016 the East was more expensive. The partial 2026 data (through July) shows the gap narrowing again, which is worth watching, not concluding.",
    q3: "What did the California energy crisis do to export prices?",
    a3: "It sent western export prices to $110.78 per MWh in 2001, the highest in the 36-year series, while eastern prices sat at $41.05. The crisis shows up in Canadian export revenue as a spike, not a blip: 2000 and 2001 are the only years before 2018 when the West priced far above the East.",
    q4: "What does the buyer pay versus what Canada receives?",
    a4: "In 2025, New England buyers paid $155.85 per MWh on average at retail while Canada received $53.24 for the power it exported to them. The honest caveat: retail prices include distribution and utility costs, so the margin is not pure profit on the wire. It is the full spread between the two published prices, which is exactly what neither government publishes.",
    retrievedNote: "CER Electricity Trade Summary XLSX (updated 2026-09-25) and archived quarterly CSV (1990Q1-2018Q2), via open.canada.ca and cer-rec.gc.ca. US prices: EIA Form 861 annual retail sales 2010-2025. Currency: Bank of Canada annual average 2017-2025, FRED DEXCAUS 1990-2016, BoC monthly average for 2026. Retrieved 2026-10-10.",
  },
  methodology: {
    kicker: "Methodology",
    title: "How the margin is computed, and where it is weak.",
    items: [
      "Sources, all keyless and retrieved 2026-10-10: the CER Electricity Trade Summary XLSX (updated 2026-09-25, monthly West and East export prices 2010-01 to 2026-07, annual volumes 2010-2026, annual province-to-destination flows 2010-2026); the CER archived quarterly imports-exports CSV (1990Q1-2018Q2, electricity exports by province and destination state with MW.h, CAN$ and CAN$/MW.h); EIA Form 861 annual files 2010-2025 (utility-level retail revenue and sales aggregated to annual state average retail price, USD/MWh); Bank of Canada FXAUSDCAD annual average 2017-2025, FRED DEXCAUS daily averaged annually for 1990-2016, BoC monthly average for 2026.",
      "The missing artifact is the corridor crosswalk, hand-curated for this project and published as data/crosswalk.csv. Canadian export origins follow the CER's own grouping: West is British Columbia, Alberta, Saskatchewan, Manitoba; East is Ontario, Quebec, Newfoundland and Labrador, New Brunswick, Nova Scotia. US destinations map to five market regions: US West, US Midwest, PJM, NYISO, ISO-NE. Each region's price is the sales-weighted average retail price of its states from EIA-861.",
      "Six corridors survive a 1 TWh minimum total flow over 2010-2025: East to ISO-NE, East to NYISO, East to PJM, East to US Midwest, West to US Midwest, West to US West. Four one-off pairings (for example West to PJM at 0.01 TWh total) are dropped as scheduling noise, documented here rather than hidden.",
      "Currency: every export price is converted to USD with the annual average CAD-per-USD rate, so the margin compares like with like. US prices are already USD.",
      "Quarantine: 2 rows in the archived CER CSV carry a blank destination and are excluded from every aggregate. The 2026 monthly CER data runs only through July and is marked partial wherever shown.",
      "Validation: the pipeline reproduces the CER's published 2024 anchors exactly: $125.40 CAD/MWh West and $58.87 CAD/MWh East. If those two numbers had not matched to the cent, nothing downstream would have shipped.",
      "Limits, stated plainly. US retail prices include distribution and utility overhead, so the margin overstates the pure wholesale spread. EIA-861 is annual, so the margin series is annual even where the CER publishes monthly prices. The 2019-2025 corridor export prices use the CER's West and East regional prices (the archived province-by-destination file ends in 2018Q2). Nothing here is a forecast, and the 2026 partial-year inversion flip is a signal to watch, not a conclusion.",
    ],
    crosswalkTitle: "The corridor crosswalk",
    crosswalkCols: { dest: "Destination in CER data", region: "Market region", states: "US states in basket", iso: "Grid operator" },
  },
  developers: {
    kicker: "For developers",
    title: "Query it from code, or from an agent.",
    body: "Three consumption paths, same normalized data. REST for applications, OpenAPI for integration, MCP tools over streamable HTTP for AI agents.",
    endpoints: "Endpoints",
    tryIt: "Try it",
    openapi: "OpenAPI spec",
    mcpTitle: "MCP server",
    mcpBody: "One streamable-HTTP endpoint. Tools: export_lookup, margin_trend, intertie_ranking.",
  },
  mcp: {
    kicker: "Connect your agent",
    title: "Put this data to work inside your AI tools.",
    body: "Pick your harness, copy the prompt, send it to your agent. Your agent runs the setup itself.",
    tabs: { chatgpt: "ChatGPT", claude: "Claude", claudecode: "Claude Code", cli: "CLI", other: "Other" },
    cardTitle: "Copy and send this to {tab}",
    copy: "Copy",
    copied: "Copied",
    chatgptNote: "ChatGPT connects through the documented REST API rather than MCP directly.",
    pChatgpt:
      "I want to use the {displayName} through its API.\n- OpenAPI spec: {origin}/api/openapi.json\n- REST base: {origin}/api/v1\nFirst tell me in two sentences what this API offers, then {exampleLower}, and show me the result.",
    pClaude:
      "In Claude (claude.ai), open Settings, then Connectors, and add a custom connector:\n- Name: {displayName}\n- URL: {origin}/mcp\nThen list the available tools, {exampleLower}, and show me the result.",
    pClaudeCode:
      "Set up the {displayName} MCP server so I can query it from here.\n1. Run: claude mcp add --transport http {slug} {origin}/mcp\n2. Run `claude mcp list` to confirm it connected.\n3. {example}, and show me the result.",
    pCli:
      "# MCP endpoint (streamable HTTP)\n{origin}/mcp\n\n# List the available tools\ncurl -s -X POST {origin}/mcp -H 'Content-Type: application/json' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    otherTitle: "Everything else",
    otherBody: "Any harness that speaks MCP over streamable HTTP, or plain REST.",
    mcpEndpoint: "MCP endpoint",
    openapiSpec: "OpenAPI spec",
    restBase: "REST base",
  },
  downloads: {
    kicker: "Data",
    title: "Take the files.",
    body: "The annual margin table, the 1990-2026 West/East price series, the corridor crosswalk, and the US market-basket prices. MIT licensed, as CSV.",
    files: [
      { name: "margins_annual.csv", desc: "96 rows: margin per corridor per year, 2010-2025, USD/MWh with volumes" },
      { name: "inversion_annual.csv", desc: "West vs East export prices, 1990-2026, CAD and USD per MWh" },
      { name: "export_prices_annual.csv", desc: "181 corridor-year export prices from the archived CER quarterly file, 1990-2018" },
      { name: "us_basket_prices_annual.csv", desc: "US market-region retail prices, 2010-2025, USD per MWh" },
      { name: "crosswalk.csv", desc: "The hand-curated destination-to-market-region crosswalk plus origin province groupings" },
    ],
    download: "Download",
  },
  footer: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the Canada Energy Regulator.",
    sources: "Export prices: Canada Energy Regulator, Electricity Trade Summary (updated 2026-09-25) and archived quarterly imports-exports CSV (1990Q1-2018Q2). US prices: US Energy Information Administration, Form 861 annual retail sales 2010-2025. Currency: Bank of Canada annual and monthly averages, FRED DEXCAUS (Federal Reserve Bank of St. Louis). All retrieved 2026-10-10.",
  },
};

export type Dict = typeof en;

const fr: Dict = {
  banner: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Régie de l'énergie du Canada.",
    badge: "Code source ouvert",
  },
  nav: { explorer: "Explorateur", showcase: "Vitrine", developers: "Développeurs", data: "Données", back: "Tous les projets" },
  hero: {
    kicker: "Nshipyard Canada · Projet de données ouvertes",
    title: "Le tableau des marges du commerce de l'électricité",
    sub: "Le Canada vend son électricité aux États-Unis à un prix. Les acheteurs américains en paient un autre. Ce tableau joint les prix d'exportation de la Régie de l'énergie du Canada aux prix de détail américains de l'électricité, État par État, de 2010 à 2025, et montre la marge sur six corridors d'exportation réels. Personne ne publie cet écart. Il est calculé ici à partir de données ouvertes, corridor par corridor, année par année.",
    cta1: "Explorer les corridors",
    cta2: "Lire la méthodologie",
  },
  stats: [
    { value: "59,6 G$", label: "de marge cumulative sur six corridors de 2010 à 2025 : l'écart entre ce que le Canada a reçu par MWh et ce que le marché américain destinataire a payé" },
    { value: "102,60 $", label: "de marge par MWh sur le corridor Est vers la Nouvelle-Angleterre en 2025 : le Canada a exporté à 53,24 $ pendant que le détail de la Nouvelle-Angleterre atteignait en moyenne 155,85 $" },
    { value: "2018", label: "l'année où les prix d'exportation de l'Ouest ont dépassé ceux de l'Est et y sont restés, culminant à +51,54 $ par MWh en 2023. De 1990 à 2016, l'Est était plus cher la plupart des années" },
    { value: "125,40 $", label: "contre 58,87 $ : les prix d'exportation 2024 publiés par la REC pour l'Ouest et l'Est, reproduits au cent près à partir du fichier source pour valider toute la chaîne" },
  ],
  explorer: {
    kicker: "Explorateur",
    title: "Chaque corridor, chaque année.",
    corridorFilter: "Tous les corridors",
    yearFilter: "Toutes les années",
    showing: "Affichage de",
    of: "sur",
    noResult: "Aucune ligne ne correspond.",
    cols: { year: "Année", corridor: "Corridor", exportCad: "Prix d'exportation ($CA/MWh)", exportUsd: "Prix d'exportation ($US/MWh)", usPrice: "Prix du marché américain ($US/MWh)", margin: "Marge ($US/MWh)", volume: "Volume (TWh)", marginValue: "Valeur de la marge (M$US)" },
    chartTitle: "Prix d'exportation contre prix du marché américain",
    chartSub: "La zone ombrée est la marge. Prix en dollars américains par MWh.",
    legendExport: "Prix d'exportation",
    legendUs: "Prix du marché américain",
    pickCorridor: "Choisissez un corridor pour tracer son écart de marge.",
  },
  showcase: {
    kicker: "Vitrine",
    title: "Des questions auxquelles les fichiers bruts ne répondent pas.",
    body: "La REC publie ce que le Canada a reçu. L'EIA publie ce que les Américains ont payé. Personne ne publie la différence. Ces cartes la calculent, avec la source et la méthode imprimées à côté de chaque chiffre.",
    citeThis: "Citer ceci",
    copied: "Copié",
    q1: "Quelle marge chaque interconnexion électrique capte-t-elle?",
    a1: "La Nouvelle-Angleterre capte le plus. De 2010 à 2025, le corridor Est vers la Nouvelle-Angleterre a capté 20,44 G$ sur 260,1 TWh d'exportations. En 2025 seulement, la marge atteignait 102,60 $ par MWh : le Canada a exporté à 53,24 $ pendant que le détail de la Nouvelle-Angleterre atteignait en moyenne 155,85 $. Le corridor PJM est le plus petit, avec 0,41 G$ cumulés.",
    q2: "Quand l'électricité de l'Ouest est-elle devenue plus chère que celle de l'Est?",
    a2: "En 2018, et elle l'est restée. Les prix d'exportation de l'Ouest ont dépassé ceux de l'Est cette année-là, et l'écart a culminé à +51,54 $ par MWh en 2023. De 1990 à 2016, l'Est était plus cher la plupart des années. Les données partielles de 2026 (jusqu'en juillet) montrent un resserrement de l'écart : à surveiller, pas à conclure.",
    q3: "Qu'a fait la crise de l'énergie en Californie aux prix d'exportation?",
    a3: "Elle a porté les prix d'exportation de l'Ouest à 110,78 $ par MWh en 2001, le plus haut de la série de 36 ans, pendant que les prix de l'Est se maintenaient à 41,05 $. La crise apparaît dans les revenus d'exportation canadiens comme un pic, pas comme un soubresaut : 2000 et 2001 sont les seules années avant 2018 où l'Ouest a été nettement plus cher que l'Est.",
    q4: "Que paie l'acheteur par rapport à ce que le Canada reçoit?",
    a4: "En 2025, les acheteurs de la Nouvelle-Angleterre ont payé en moyenne 155,85 $ par MWh au détail pendant que le Canada recevait 53,24 $ pour l'électricité exportée vers eux. La réserve honnête : les prix de détail incluent la distribution et les coûts des services publics, donc la marge n'est pas un profit pur sur le fil. C'est l'écart total entre les deux prix publiés, ce qu'aucun des deux gouvernements ne publie.",
    retrievedNote: "Résumé du commerce de l'électricité de la REC, fichier XLSX (mis à jour le 2026-09-25) et CSV trimestriel archivé (1990T1-2018T2), via open.canada.ca et cer-rec.gc.ca. Prix américains : formulaire 861 annuel de l'EIA, ventes au détail 2010-2025. Devises : moyenne annuelle de la Banque du Canada 2017-2025, DEXCAUS de la FRED 1990-2016, moyenne mensuelle de la BdC pour 2026. Récupéré le 2026-10-10.",
  },
  methodology: {
    kicker: "Méthodologie",
    title: "Comment la marge est calculée, et où elle est faible.",
    items: [
      "Sources, toutes sans clé et récupérées le 2026-10-10 : le fichier XLSX du résumé du commerce de l'électricité de la REC (mis à jour le 2026-09-25, prix d'exportation mensuels Ouest et Est de 2010-01 à 2026-07, volumes annuels 2010-2026, flux annuels province vers destination 2010-2026); le CSV trimestriel archivé des importations-exportations de la REC (1990T1-2018T2, exportations d'électricité par province et État destinataire avec MW.h, $CA et $CA/MW.h); les fichiers annuels du formulaire 861 de l'EIA 2010-2025 (revenus et ventes au détail par service public, agrégés en prix de détail annuel moyen par État, $US/MWh); la moyenne annuelle FXAUSDCAD de la Banque du Canada 2017-2025, DEXCAUS quotidien de la FRED moyenné annuellement pour 1990-2016, moyenne mensuelle de la BdC pour 2026.",
      "L'artefact manquant est la table de correspondance des corridors, constituée à la main pour ce projet et publiée dans data/crosswalk.csv. Les origines canadiennes suivent le regroupement de la REC : l'Ouest, c'est la Colombie-Britannique, l'Alberta, la Saskatchewan et le Manitoba; l'Est, c'est l'Ontario, le Québec, Terre-Neuve-et-Labrador, le Nouveau-Brunswick et la Nouvelle-Écosse. Les destinations américaines sont regroupées en cinq régions de marché : Ouest américain, Midwest américain, PJM, NYISO, ISO-NE. Le prix de chaque région est le prix de détail moyen de ses États, pondéré par les ventes, tiré du formulaire 861 de l'EIA.",
      "Six corridors franchissent un plancher de 1 TWh de flux total sur 2010-2025 : Est vers ISO-NE, Est vers NYISO, Est vers PJM, Est vers le Midwest américain, Ouest vers le Midwest américain, Ouest vers l'Ouest américain. Quatre appariements ponctuels (par exemple Ouest vers PJM à 0,01 TWh au total) sont écartés comme bruit de répartition, documenté ici plutôt que caché.",
      "Devises : chaque prix d'exportation est converti en dollars américains avec le taux annuel moyen $CA par $US, pour comparer des choses comparables. Les prix américains sont déjà en $US.",
      "Quarantaine : 2 lignes du CSV archivé de la REC portent une destination vide et sont exclues de tous les agrégats. Les données mensuelles 2026 de la REC ne vont que jusqu'en juillet et sont marquées partielles partout où elles apparaissent.",
      "Validation : la chaîne reproduit exactement les repères 2024 publiés par la REC : 125,40 $CA/MWh pour l'Ouest et 58,87 $CA/MWh pour l'Est. Si ces deux chiffres n'avaient pas concordé au cent près, rien en aval n'aurait été publié.",
      "Limites, énoncées clairement. Les prix de détail américains incluent la distribution et les frais des services publics : la marge surestime donc l'écart de gros pur. Le formulaire 861 de l'EIA est annuel, donc la série de marges est annuelle même là où la REC publie des prix mensuels. Les prix d'exportation par corridor 2019-2025 utilisent les prix régionaux Ouest et Est de la REC (le fichier archivé par province et destination s'arrête en 2018T2). Rien ici n'est une prévision, et le retournement partiel de 2026 est un signal à surveiller, pas une conclusion.",
    ],
    crosswalkTitle: "La table de correspondance des corridors",
    crosswalkCols: { dest: "Destination dans les données de la REC", region: "Région de marché", states: "États américains du panier", iso: "Exploitant du réseau" },
  },
  developers: {
    kicker: "Pour les développeurs",
    title: "Interrogez-le depuis du code, ou depuis un agent.",
    body: "Trois façons de consommer les mêmes données normalisées. REST pour les applications, OpenAPI pour l'intégration, outils MCP en HTTP continu pour les agents IA.",
    endpoints: "Points de terminaison",
    tryIt: "Essayer",
    openapi: "Spécification OpenAPI",
    mcpTitle: "Serveur MCP",
    mcpBody: "Un point de terminaison HTTP continu. Outils : export_lookup, margin_trend, intertie_ranking.",
  },
  mcp: {
    kicker: "Connectez votre agent",
    title: "Exploitez ces données dans vos outils d'IA.",
    body: "Choisissez votre plateforme, copiez l'invite, envoyez-la à votre agent. Votre agent exécute la configuration lui-même.",
    tabs: { chatgpt: "ChatGPT", claude: "Claude", claudecode: "Claude Code", cli: "CLI", other: "Autre" },
    cardTitle: "Copiez et envoyez ceci à {tab}",
    copy: "Copier",
    copied: "Copié",
    chatgptNote: "ChatGPT se connecte via l'API REST documentée plutôt que directement en MCP.",
    pChatgpt:
      "Je veux utiliser {displayName} via son API.\n- Spécification OpenAPI : {origin}/api/openapi.json\n- Base REST : {origin}/api/v1\nD'abord, dis-moi en deux phrases ce que cette API offre, puis {exampleLower}, et montre-moi le résultat.",
    pClaude:
      "Dans Claude (claude.ai), ouvre les paramètres, puis Connecteurs, et ajoute un connecteur personnalisé :\n- Nom : {displayName}\n- URL : {origin}/mcp\nEnsuite, liste les outils disponibles, {exampleLower}, et montre-moi le résultat.",
    pClaudeCode:
      "Configure le serveur MCP {displayName} pour que je puisse l'interroger d'ici.\n1. Exécute : claude mcp add --transport http {slug} {origin}/mcp\n2. Exécute `claude mcp list` pour confirmer la connexion.\n3. {example}, et montre-moi le résultat.",
    pCli:
      "# Point de terminaison MCP (HTTP continu)\n{origin}/mcp\n\n# Lister les outils disponibles\ncurl -s -X POST {origin}/mcp -H 'Content-Type: application/json' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    otherTitle: "Tout le reste",
    otherBody: "Toute plateforme qui parle MCP en HTTP continu, ou REST tout court.",
    mcpEndpoint: "Point de terminaison MCP",
    openapiSpec: "Spécification OpenAPI",
    restBase: "Base REST",
  },
  downloads: {
    kicker: "Données",
    title: "Prenez les fichiers.",
    body: "La table annuelle des marges, la série 1990-2026 des prix Ouest et Est, la table de correspondance des corridors et les prix des paniers américains. Licence MIT, en CSV.",
    files: [
      { name: "margins_annual.csv", desc: "96 lignes : marge par corridor et par année, 2010-2025, $US/MWh avec volumes" },
      { name: "inversion_annual.csv", desc: "Prix d'exportation Ouest contre Est, 1990-2026, $CA et $US par MWh" },
      { name: "export_prices_annual.csv", desc: "181 prix d'exportation annuels par corridor tirés du fichier trimestriel archivé de la REC, 1990-2018" },
      { name: "us_basket_prices_annual.csv", desc: "Prix de détail des régions de marché américaines, 2010-2025, $US par MWh" },
      { name: "crosswalk.csv", desc: "La table de correspondance destination vers région de marché, constituée à la main, plus les regroupements de provinces d'origine" },
    ],
    download: "Télécharger",
  },
  footer: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Régie de l'énergie du Canada.",
    sources: "Prix d'exportation : Régie de l'énergie du Canada, résumé du commerce de l'électricité (mis à jour le 2026-09-25) et CSV trimestriel archivé des importations-exportations (1990T1-2018T2). Prix américains : Energy Information Administration des États-Unis, ventes au détail annuelles du formulaire 861, 2010-2025. Devises : moyennes annuelles et mensuelles de la Banque du Canada, DEXCAUS de la FRED (Federal Reserve Bank of St. Louis). Tout récupéré le 2026-10-10.",
  },
};

const dicts: Record<Lang, Dict> = { en, fr };

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: dicts[lang] }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
