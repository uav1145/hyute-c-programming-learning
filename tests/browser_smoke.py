#!/usr/bin/env python3
"""Check rendered site with Chromium. Admin-blocked localhost is worked around by
injecting *exact same* HTML/CSS/course.js/app.js without network dependencies.
"""
from pathlib import Path
import json, sys, base64, re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text('utf-8')
html=re.sub(r'<link[^>]+href="assets/style.css"[^>]*>', '',html)
html=re.sub(r'<script[^>]+src="(?:data/course.js|assets/app.js)"[^>]*></script>', '',html)
logo=base64.b64encode((ROOT/'assets/utehy-mark-from-user.png').read_bytes()).decode()
html=html.replace('src="assets/utehy-mark-from-user.png"',f'src="data:image/png;base64,{logo}"')
html=html.replace('href="assets/utehy-mark-from-user.png"',f'href="data:image/png;base64,{logo}"')
css=(ROOT/'assets/style.css').read_text('utf-8')
course=(ROOT/'data/course.js').read_text('utf-8')
app=(ROOT/'assets/app.js').read_text('utf-8')
errors=[]
results={'desktop_lessons':0,'mobile_lessons':0,'quiz_interactions':0,'worked_accordions':0,'svg_flowcharts':0,'extra_labs_seen':0,'javascript_errors':[]}

def load(page):
 page.set_content(html,wait_until='domcontentloaded')
 page.add_style_tag(content=css)
 page.add_script_tag(content=course)
 page.add_script_tag(content=app)
 page.wait_for_selector('.hero',timeout=8000)

def route(page,r):
 page.evaluate('(r)=>{location.hash=r}',r)
 page.wait_for_selector('.lesson-page' if '/lesson/' in r else '.hero' if 'home' in r else '#view',timeout=8000)

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 ctx=browser.new_context(viewport={'width':1365,'height':850},device_scale_factor=1)
 page=ctx.new_page()
 page.on('pageerror',lambda exc:errors.append('JS '+str(exc)))
 load(page)
 assert page.evaluate('window.PRF192_COURSE.lessons.length')==21
 assert page.locator('.side-link').count()==21
 assert page.locator('.brand-logo img').count()==1
 page.screenshot(path=str(ROOT/'tests/preview-home-desktop.png'),full_page=False)
 for no in range(21):
  route(page,f'#/lesson/slot-{no:02}')
  assert page.locator('.extended-lab').count()>=1,(no,'extended')
  assert page.locator('.syntax-card').count()>=1,(no,'syntax')
  assert page.locator('.question-card').count()==5,(no,'quiz')
  assert page.locator('.exercise-card').count()==3,(no,'exercise')
  assert page.locator('.worked-card').count()==1,(no,'worked')
  assert page.locator('.contrast-table').count()==1,(no,'contrast')
  assert page.locator('.code-frame').count()>=3,(no,'code')
  assert page.locator('.lesson-index').count()==1,(no,'index')
  assert '5 câu tự kiểm tra' in page.locator('.lesson-meta').inner_text(),(no,'count')
  if page.locator('.flowchart-figure').count():
   assert page.locator('.flowchart-figure svg').count()==1
   results['svg_flowcharts']+=1
  if no in (3,5,6,7,12,14,15,17,19,20):
   page.locator('.worked-solution summary').evaluate('(e)=>e.click()')
   assert page.locator('.worked-solution').evaluate('(e)=>e.open'),(no,'worked open')
   results['worked_accordions']+=1
  page.locator('.question-card').first.locator('input[type=radio]').first.evaluate('(e)=>{e.checked=true;e.dispatchEvent(new Event("change",{bubbles:true}));}')
  assert page.locator('.question-card .feedback').count()==1,(no,'feedback')
  results['quiz_interactions']+=1
  page.locator('[data-action="reset-quiz"]').evaluate('(e)=>e.click()')
  assert page.locator('.question-card .feedback').count()==0,(no,'reset')
  assert page.locator('a[href="https://www.onlinegdb.com/online_c_compiler"]').count()>=1,(no,'OnlineGDB')
  results['desktop_lessons']+=1
  results['extra_labs_seen']+=page.locator('.extended-lab').count()
  if no in (7,12,14):page.screenshot(path=str(ROOT/f'tests/preview-slot-{no:02}.png'),full_page=False)
 route(page,'#/lesson/slot-06')
 page.locator('.extended-lab').first.locator('.code-btn').first.evaluate('(e)=>e.click()')
 assert page.locator('#toast').is_visible()
 # Test routes other than lessons.
 for r,selector in [('#/practice','.practice-card'),('#/glossary','.gloss'),('#/guide','.guide-step'),('#/sources','.source-table')]:
  route(page,r)
  assert page.locator(selector).count()>0,(r,'missing')
 # Mobile checks.
 mob=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
 mp=mob.new_page();mp.on('pageerror',lambda exc:errors.append('Mobile JS '+str(exc)))
 load(mp)
 mp.locator('#menu-toggle').evaluate('(e)=>e.click()')
 assert 'open' in mp.locator('.sidebar').get_attribute('class')
 mp.locator('#sidebar-close').evaluate('(e)=>e.click()')
 assert 'open' not in mp.locator('.sidebar').get_attribute('class')
 for no in range(21):
  route(mp,f'#/lesson/slot-{no:02}')
  assert mp.locator('.extended-lab').count()>=1
  assert mp.locator('.question-card').count()==5
  assert mp.locator('.lesson-page').count()==1
  results['mobile_lessons']+=1
 mp.screenshot(path=str(ROOT/'tests/preview-mobile.png'),full_page=False)
 overflow=mp.evaluate('document.documentElement.scrollWidth - window.innerWidth')
 assert overflow<=5,('mobile overflow',overflow)
 mob.close();ctx.close();browser.close()
results['javascript_errors']=errors
(ROOT/'tests/browser_results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(results,ensure_ascii=False,indent=2))
sys.exit(bool(errors))
