#!/usr/bin/env python3
"""Build the Clean-Power Export Margin Board dataset.

Sources (all keyless, retrieved 2026-10-10):
  1. CER archived quarterly CSV: https://www.neb-one.gc.ca/open/imports-exports/imports-exports-data-visualization.csv
     Electricity exports, province -> destination state/ISO, quarterly 1990Q1-2018Q2, units MW.h / CAN$ / CAN$/MW.h
  2. CER Electricity Trade Summary XLSX (updated 2026-09-25):
     https://www.cer-rec.gc.ca/en/data-analysis/energy-commodities/electricity/statistics/electricity-trade-summary/
     Annual volumes/values 2010-2026, monthly volumes/values 2010-01-2026-08,
     annual province->destination volumes 2010-2026, monthly West/East export prices 2010-01-2026-08
  3. EIA Form 861 annual files 2010-2025 (Sales_Ult_Cust): utility-level retail revenue/sales by state,
     aggregated to annual state average retail price (USD/MWh)
  4. Bank of Canada Valet FXCADUSD daily: annual average CAD per USD

Outputs: data/margins_annual.csv, data/inversion_annual.csv, data/crosswalk.csv,
         data/export_prices_annual.csv, data/us_basket_prices_annual.csv, data/summary.json
"""
import csv, json, zipfile, glob, os
from collections import defaultdict

RAW = '/tmp'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')

# ---------------------------------------------------------------- crosswalk
WEST_ORIGINS = {'British Columbia', 'Alberta', 'Saskatchewan', 'Manitoba'}
EAST_ORIGINS = {'Ontario', 'Québec', 'Quebec', 'New Brunswick', 'Nova Scotia',
                'Newfoundland and Labrador'}

DEST_REGION = {
    # US West (WECC-ish)
    'Washington': 'US West', 'Oregon': 'US West', 'California': 'US West',
    'Montana': 'US West', 'Idaho': 'US West', 'Arizona': 'US West',
    'Nevada': 'US West', 'Utah': 'US West', 'New Mexico': 'US West',
    'Wyoming': 'US West', 'Colorado': 'US West', 'Alaska': 'US West',
    # US Midwest (MISO/SPP-ish)
    'North Dakota': 'US Midwest', 'Minnesota': 'US Midwest', 'Michigan': 'US Midwest',
    'Indiana': 'US Midwest', 'Minn / N. Dakota': 'US Midwest', 'Nebraska': 'US Midwest',
    'South Dakota': 'US Midwest', 'Wisconsin': 'US Midwest', 'Illinois': 'US Midwest',
    'Iowa': 'US Midwest', 'Kansas': 'US Midwest', 'Missouri': 'US Midwest',
    'Texas': 'US Midwest', 'Oklahoma': 'US Midwest', 'Arkansas': 'US Midwest',
    'Tennessee': 'US Midwest', 'Mississippi': 'US Midwest', 'Florida': 'US Midwest',
    # PJM
    'Pennsylvania': 'PJM', 'Pennsylvania Jersey Maryland Power Pool': 'PJM',
    'Ohio': 'PJM', 'Virginia': 'PJM', 'New Jersey': 'PJM', 'Maryland': 'PJM',
    'West Virginia': 'PJM',
    # NYISO
    'New York': 'NYISO',
    # ISO-NE
    'Maine': 'ISO-NE', 'New England-ISO': 'ISO-NE', 'Vermont': 'ISO-NE',
    'Massachusetts': 'ISO-NE', 'New Hampshire': 'ISO-NE', 'Connecticut': 'ISO-NE',
    'Rhode Island': 'ISO-NE',
}

def origin_region(origin):
    if origin in WEST_ORIGINS: return 'West'
    if origin in EAST_ORIGINS: return 'East'
    return None  # quarantine

def parse_year(period):
    # '1990Q1' or '2010-01-01 00:00:00' or 2010
    s = str(period)
    if 'Q' in s: return int(s[:4])
    return int(s[:4])

# ---------------------------------------------------------------- 1. CER quarterly CSV
cer_q = defaultdict(lambda: [0.0, 0.0])  # (year, oregion, dregion) -> [mwh, cad]
quarantine = []
with open(os.path.join(RAW, 'cer-trade.csv'), encoding='latin-1') as f:
    for r in csv.DictReader(f):
        if r['Product'] != 'Electricity' or r['Activity'] != 'Exports':
            continue
        if r['Units'] not in ('MW.h', 'CAN$'):
            continue
        y = parse_year(r['Period'])
        oreg = origin_region(r['Origin'])
        dreg = DEST_REGION.get(r['Destination'])
        if oreg is None or dreg is None:
            quarantine.append(r)
            continue
        try:
            v = float(r['Value'])
        except ValueError:
            continue
        cell = cer_q[(y, oreg, dreg)]
        if r['Units'] == 'MW.h':
            cell[0] += v
        else:
            cell[1] += v
print('CER quarterly corridor cells:', len(cer_q), '| quarantined rows:', len(quarantine))
print('quarantined destinations:', sorted(set(r['Destination'] for r in quarantine))[:10])

# export price CAD/MWh per (year, origin_region, dest_region), 1990-2018
exp_price = {}
for (y, oreg, dreg), (mwh, cad) in cer_q.items():
    if mwh > 0:
        exp_price[(y, oreg, dreg)] = (cad / mwh, mwh)

# ---------------------------------------------------------------- 2. CER trade summary XLSX
import openpyxl
wb = openpyxl.load_workbook(os.path.join(RAW, 'cer-trade-summary.xlsx'), data_only=True, read_only=True)

# monthly West/East export prices (Fig.4)
ws4 = wb['Fig. 4']
monthly = []
for row in ws4.iter_rows(min_row=2, values_only=True):
    if row[0] is None: break
    d = str(row[0])[:7]  # YYYY-MM
    monthly.append({'month': d, 'export_cad_mwh': row[1], 'west_cad_mwh': row[3], 'east_cad_mwh': row[4]})
print('Fig.4 months:', len(monthly), monthly[0]['month'], '->', monthly[-1]['month'])

# annual volumes/values (Fig.1a)
ws1 = wb['Fig. 1 (a), Fig. 3 (a)']
annual = []
for row in ws1.iter_rows(min_row=2, values_only=True):
    if row[0] is None: break
    annual.append({'year': int(row[0]), 'exports_mwh': row[1], 'exports_cad': row[3],
                   'imports_mwh': row[2], 'imports_cad': row[4]})
print('annual rows:', len(annual), annual[0]['year'], '->', annual[-1]['year'])

# annual province->destination volumes (Fig.2)
ws2 = wb['Fig. 2']
fig2 = []
for row in ws2.iter_rows(min_row=2, values_only=True):
    if row[0] is None: break
    fig2.append({'year': int(row[0]), 'volume_mwh': row[1] or 0, 'province': row[2], 'destination': row[3]})

# ---------------------------------------------------------------- 3. EIA-861 state prices
def state_prices(year):
    zf = os.path.join(RAW, 'eia861', f'f861_{year}.zip')
    z = zipfile.ZipFile(zf)
    name = [n for n in z.namelist() if 'Sales_Ult_Cust' in n and 'CS' not in n][0]
    data = z.read(name)
    tmp = f'/tmp/suc_{year}' + os.path.splitext(name)[1]
    open(tmp, 'wb').write(data)
    if tmp.endswith('.xls'):
        import xlrd
        book = xlrd.open_workbook(tmp)
        sh = book.sheet_by_index(0)
        rows = [[sh.cell_value(r, c) for c in range(sh.ncols)] for r in range(sh.nrows)]
    else:
        wb2 = openpyxl.load_workbook(tmp, data_only=True, read_only=True)
        ws = wb2[wb2.sheetnames[0]]
        rows = list(ws.iter_rows(values_only=True))
    hdr = None
    for i, r in enumerate(rows[:12]):
        vals = [str(c).strip() if c not in (None, '') else '' for c in r]
        if 'State' in vals and any('Megawatthours' in v for v in vals):
            hdr = vals; hi = i; break
    assert hdr, f'no header {year}'
    si = hdr.index('State')
    # sector blocks: find all ('Thousand Dollars','Megawatthours') pairs after BA/state cols
    pairs = []
    for j in range(len(hdr) - 1):
        if 'Thousand' in hdr[j] and 'Megawatthours' in hdr[j + 1]:
            pairs.append((j, j + 1))
    rev = defaultdict(float); sal = defaultdict(float)
    for r in rows[hi + 1:]:
        st = str(r[si]).strip() if r[si] else ''
        if not st or len(st) > 3: continue
        for pj, sj in pairs:
            try:
                rv = float(r[pj] or 0); mw = float(r[sj] or 0)
            except (TypeError, ValueError):
                continue
            rev[st] += rv * 1000.0; sal[st] += mw
    return {st: (rev[st] / sal[st] if sal[st] > 0 else None, sal[st]) for st in rev}

us_state = {}
for y in range(2010, 2026):
    us_state[y] = state_prices(y)
    n = len(us_state[y])
    print('EIA-861', y, 'states:', n)

# ---------------------------------------------------------------- 4. BoC FX annual average (CAD per USD)
# BoC FXAUSDCAD (annual average) starts 2017. Pre-2017: FRED DEXCAUS (CAD per USD, daily).
fx_ann = {}
import urllib.request
urllib.request.urlretrieve(
    'https://www.bankofcanada.ca/valet/observations/FXAUSDCAD/csv?start_date=1990-01-01',
    '/tmp/boc_ann.csv')
with open('/tmp/boc_ann.csv', encoding='utf-8-sig') as f:
    lines = [l.strip() for l in f if l.strip()]
si = next(i for i, l in enumerate(lines) if l.startswith('"date"'))
for l in lines[si + 1:]:
    parts = l.replace('"', '').split(',')
    if len(parts) >= 2 and parts[1]:
        try: fx_ann[parts[0][:4]] = float(parts[1])
        except ValueError: pass
urllib.request.urlretrieve(
    'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXCAUS&cosd=1990-01-01&coed=2016-12-31',
    '/tmp/dexcaus.csv')
pre = defaultdict(list)
with open('/tmp/dexcaus.csv') as f:
    for r in csv.DictReader(f):
        dcol = r.get('DATE') or r.get('observation_date') or ''
        try:
            v = float(r['DEXCAUS'])
        except (ValueError, KeyError, TypeError):
            continue
        if dcol: pre[dcol[:4]].append(v)
for y, v in pre.items():
    if y not in fx_ann:
        fx_ann[y] = sum(v) / len(v)
# 2026: average available 2026 months from BoC monthly series
urllib.request.urlretrieve(
    'https://www.bankofcanada.ca/valet/observations/FXMUSDCAD/csv?start_date=2026-01-01',
    '/tmp/boc_m.csv')
m26 = []
with open('/tmp/boc_m.csv', encoding='utf-8-sig') as f:
    lines = [l.strip() for l in f if l.strip()]
si = next(i for i, l in enumerate(lines) if l.startswith('"date"'))
for l in lines[si + 1:]:
    parts = l.replace('"', '').split(',')
    if len(parts) >= 2 and parts[0].startswith('2026') and parts[1]:
        try: m26.append(float(parts[1]))
        except ValueError: pass
if m26: fx_ann['2026'] = sum(m26) / len(m26)
print('FX years:', min(fx_ann), max(fx_ann), '| 2026 months:', len(m26))

# ---------------------------------------------------------------- 5. build corridors
US_BASKETS = {
    'US West': ['WA', 'OR', 'CA', 'ID', 'NV', 'AZ', 'UT', 'MT', 'WY', 'CO', 'NM'],
    'US Midwest': ['MN', 'ND', 'SD', 'NE', 'IA', 'KS', 'MO', 'WI', 'IL', 'IN', 'MI'],
    'PJM': ['PA', 'NJ', 'MD', 'DE', 'VA', 'WV', 'OH', 'DC'],
    'NYISO': ['NY'],
    'ISO-NE': ['ME', 'NH', 'VT', 'MA', 'CT', 'RI'],
}
STATE_ABBR = {'WA': 'Washington', 'OR': 'Oregon', 'CA': 'California', 'ID': 'Idaho',
    'NV': 'Nevada', 'AZ': 'Arizona', 'UT': 'Utah', 'MT': 'Montana', 'WY': 'Wyoming',
    'CO': 'Colorado', 'NM': 'New Mexico', 'MN': 'Minnesota', 'ND': 'North Dakota',
    'SD': 'South Dakota', 'NE': 'Nebraska', 'IA': 'Iowa', 'KS': 'Kansas', 'MO': 'Missouri',
    'WI': 'Wisconsin', 'IL': 'Illinois', 'IN': 'Indiana', 'MI': 'Michigan', 'PA': 'Pennsylvania',
    'NJ': 'New Jersey', 'MD': 'Maryland', 'DE': 'Delaware', 'VA': 'Virginia',
    'WV': 'West Virginia', 'OH': 'Ohio', 'DC': 'District of Columbia', 'NY': 'New York',
    'ME': 'Maine', 'NH': 'New Hampshire', 'VT': 'Vermont', 'MA': 'Massachusetts',
    'CT': 'Connecticut', 'RI': 'Rhode Island', 'AK': 'Alaska', 'TX': 'Texas', 'FL': 'Florida'}

def basket_price(year, basket):
    rev = 0.0; sal = 0.0
    for ab in basket:
        p, s = us_state[year].get(ab, (None, 0))
        if p is None: continue
        rev += p * s; sal += s
    return rev / sal if sal > 0 else None

# annual West/East export prices from Fig.4 monthly
we = defaultdict(lambda: [[], []])
for m in monthly:
    y = int(m['month'][:4])
    if m['west_cad_mwh']: we[y][0].append(m['west_cad_mwh'])
    if m['east_cad_mwh']: we[y][1].append(m['east_cad_mwh'])
we_ann = {y: (sum(a) / len(a), sum(b) / len(b)) for y, (a, b) in we.items() if a and b}

# corridor annual volumes 2010-2026 from Fig.2 province->destination flows
cor_vol = defaultdict(float)
cor_vol_q = defaultdict(float)  # from quarterly CSV (backup for volume checks)
for r in fig2:
    oreg = origin_region(r['province'])
    dreg = DEST_REGION.get(r['destination'])
    if oreg and dreg:
        cor_vol[(r['year'], oreg, dreg)] += r['volume_mwh']

# margin rows 2010-2025 (EIA-861 annual state prices end 2025)
margins = []
for y in range(2010, 2026):
    fxr = fx_ann.get(str(y))
    if not fxr: continue
    for oreg in ('West', 'East'):
        w_cad, e_cad = we_ann.get(y, (None, None))
        exp_cad = w_cad if oreg == 'West' else e_cad
        if exp_cad is None: continue
        exp_usd = exp_cad / fxr
        for dreg in ('US West', 'US Midwest', 'PJM', 'NYISO', 'ISO-NE'):
            vol = cor_vol.get((y, oreg, dreg), 0)
            if vol == 0:
                continue  # no observed flow on this corridor this year
            bp = basket_price(y, US_BASKETS[dreg])
            if bp is None: continue
            margin = bp - exp_usd
            margins.append({
                'year': y, 'origin_region': oreg, 'market_region': dreg,
                'corridor': f'{oreg} to {dreg}',
                'export_price_cad_mwh': round(exp_cad, 2),
                'export_price_usd_mwh': round(exp_usd, 2),
                'us_market_price_usd_mwh': round(bp, 2),
                'margin_usd_mwh': round(margin, 2),
                'export_volume_mwh': round(vol, 1),
                'margin_value_usd_millions': round(margin * vol / 1e6, 1),
                'fx_cad_per_usd': round(fxr, 4),
            })
# keep only corridors with material flow (>= 1 TWh over 2010-2025); drops
# one-off scheduling noise like West to PJM (0.01 TWh)
cor_tot = defaultdict(float)
for (y, oreg, dreg), v in cor_vol.items():
    if 2010 <= y <= 2025:
        cor_tot[(oreg, dreg)] += v
margins = [m for m in margins
           if cor_tot.get((m['origin_region'], m['market_region']), 0) >= 1e6]
print('margin rows (after corridor filter):', len(margins))

# inversion series: West vs East export prices, 1990-2026
# 1990-2009 from quarterly CSV aggregated; 2010-2026 from Fig.4
inv = {}
for y in range(1990, 2019):
    for oreg in ('West', 'East'):
        mwh = sum(v for (yy, o, d), (p, v) in {k: (v[0], v[1]) for k, v in exp_price.items()}.items()
                  if yy == y and o == oreg)
        pv = sum(p * v for (yy, o, d), (p, v) in exp_price.items() if yy == y and o == oreg)
        if mwh > 0: inv.setdefault(y, {})[oreg] = pv / mwh
for y, (w, e) in we_ann.items():
    inv.setdefault(y, {})['West'] = w
    inv.setdefault(y, {})['East'] = e
inversion = []
for y in sorted(inv):
    fxr = fx_ann.get(str(y))
    row = {'year': y, 'west_cad_mwh': round(inv[y].get('West', 0) or 0, 2),
           'east_cad_mwh': round(inv[y].get('East', 0) or 0, 2)}
    if fxr and inv[y].get('West') and inv[y].get('East'):
        row['west_usd_mwh'] = round(inv[y]['West'] / fxr, 2)
        row['east_usd_mwh'] = round(inv[y]['East'] / fxr, 2)
        row['west_minus_east_usd'] = round((inv[y]['West'] - inv[y]['East']) / fxr, 2)
    inversion.append(row)

# export prices annual per corridor 2010-2026 for CSV
exp_rows = []
for (y, oreg, dreg), (p, v) in sorted(exp_price.items()):
    exp_rows.append({'year': y, 'origin_region': oreg, 'market_region': dreg,
                     'export_price_cad_mwh': round(p, 2), 'volume_mwh': round(v, 1)})

# US basket prices annual
us_rows = []
for y in range(2010, 2026):
    for dreg, basket in US_BASKETS.items():
        p = basket_price(y, basket)
        us_rows.append({'year': y, 'market_region': dreg,
                        'us_avg_retail_price_usd_mwh': round(p, 2) if p else None})

# ---------------------------------------------------------------- write outputs
os.makedirs(OUT, exist_ok=True)
def wcsv(name, rows):
    keys = []
    for r in rows:
        for k in r.keys():
            if k not in keys: keys.append(k)
    with open(os.path.join(OUT, name), 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=keys)
        w.writeheader(); w.writerows(rows)
    print('wrote', name, len(rows), 'rows')

wcsv('margins_annual.csv', margins)
wcsv('inversion_annual.csv', inversion)
wcsv('export_prices_annual.csv', exp_rows)
wcsv('us_basket_prices_annual.csv', us_rows)

# crosswalk CSV
xw = []
for dest, reg in sorted(DEST_REGION.items()):
    xw.append({'destination_in_cer_data': dest, 'market_region': reg,
               'us_states_in_basket': ', '.join(US_BASKETS[reg]),
               'iso_rto': {'US West': 'WECC / BPA / CAISO', 'US Midwest': 'MISO / SPP',
                           'PJM': 'PJM Interconnection', 'NYISO': 'NYISO',
                           'ISO-NE': 'ISO New England'}[reg]})
for prov in sorted(WEST_ORIGINS | EAST_ORIGINS):
    xw.append({'destination_in_cer_data': prov, 'market_region': 'West' if prov in WEST_ORIGINS else 'East',
               'us_states_in_basket': '', 'iso_rto': 'Canadian export origin region (CER grouping)'})
wcsv('crosswalk.csv', xw)

summary = {
    'built': '2026-10-10',
    'margin_years': [m['year'] for m in margins][:1] and [min(m['year'] for m in margins), max(m['year'] for m in margins)],
    'margin_rows': len(margins),
    'corridors': sorted(set(m['corridor'] for m in margins)),
    'quarantined_cer_rows': len(quarantine),
    'latest_year': max(m['year'] for m in margins),
}
json.dump(summary, open(os.path.join(OUT, 'summary.json'), 'w'), indent=2)
print(json.dumps(summary, indent=2))

# top-3 findings printout
ly = summary['latest_year']
top = sorted([m for m in margins if m['year'] == ly], key=lambda m: -m['margin_usd_mwh'])
print(f'\n--- {ly} corridor margins (USD/MWh) ---')
for m in top:
    print(f"{m['corridor']}: export ${m['export_price_usd_mwh']} vs US ${m['us_market_price_usd_mwh']} -> margin ${m['margin_usd_mwh']}")
print('\n--- inversion check (last 6 years, USD/MWh) ---')
for r in inversion[-6:]:
    print(r['year'], 'West:', r.get('west_usd_mwh'), 'East:', r.get('east_usd_mwh'), 'W-E:', r.get('west_minus_east_usd'))
