import json, pathlib
from playwright.sync_api import sync_playwright
url = pathlib.Path('comp.html').resolve().as_uri()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    pg.goto(url); pg.evaluate('window.__ready'); ev = pg.evaluate('window.__events()'); dur = pg.evaluate('window.__meta.dur'); b.close()
json.dump({'dur': dur, 'events': ev}, open('events.json', 'w')); print(len(ev), 'events, dur', dur)
