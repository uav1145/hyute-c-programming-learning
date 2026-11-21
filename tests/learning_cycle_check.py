#!/usr/bin/env python3
"""Checks v3.0 pedagogical components on the exact CSS/JS/course content.
Also checks the new intra-lesson navigation never breaks the hash router.
"""
from pathlib import Path
import re, json
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
h=(R/'index.html').read_text('utf-8')
h=re.sub(r'<link[^>]+href="assets/style.css"[^>]*>','',h)
h=re.sub(r'<script[^>]+src="(?:data/course.js|assets/app.js)"[^>]*></script>','',h)
css=(R/'assets/style.css').read_text('utf-8')
data=(R/'data/course.js').read_text('utf-8')
js=(R/'assets/app.js').read_text('utf-8')
results={'modules':0,'cases':0,'ipo_tables':0,'pseudocodes':0,'test_matrices':0,'rubrics':0,'self_checks':0,'notes':0,'scroll_nav':False,'retained_student_state':False,'errors':[]}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1300,'height':840})
 page.on('pageerror',lambda e:results['errors'].append(str(e)))
 # Static app assembled from original release files, no external network dependency.
 page.set_content(h)
 page.add_style_tag(content=css)
 page.add_script_tag(content=data)
 page.add_script_tag(content=js)
 page.wait_for_selector('.hero')
 results['modules']=page.locator('.module-bar').count()
 assert results['modules']==5,results
 for i in range(21):
  sid=f'slot-{i:02}'
  page.evaluate('(id)=>{location.hash="#/lesson/"+id; window.dispatchEvent(new Event("hashchange"))}',sid)
  page.wait_for_selector('.design-case')
  assert page.locator('.module-tag').count()==1
  assert page.locator('.design-case').count()==1
  results['cases']+=1
  assert page.locator('.ipo-table tbody tr').count()==4
  results['ipo_tables']+=1
  assert page.locator('.design-case details summary').count()==1
  page.locator('.design-case details summary').click()
  assert page.locator('.case-pre').is_visible()
  results['pseudocodes']+=1
  assert page.locator('.test-matrix tbody tr').count()==3
  results['test_matrices']+=1
  assert page.locator('.pedagogy-rubric tbody tr').count()==6
  results['rubrics']+=1
  assert page.locator('.lesson-check input[type=checkbox]').count()==5
  results['self_checks']+=1
  assert page.locator('.lesson-notes').count()==1
  results['notes']+=1
  if i==0:
   before=page.evaluate('location.hash')
   page.locator('button[data-scroll="syntax"]').click()
   after=page.evaluate('location.hash')
   assert before==after,(before,after)
   results['scroll_nav']=True
 # Verify in-memory update survived rerender (localStorage may be disabled by about:blank browser).
 page.evaluate('''() => {location.hash='#/lesson/slot-08'; window.dispatchEvent(new Event('hashchange'))}''')
 page.wait_for_selector('textarea[data-note="slot-08"]')
 page.locator('textarea[data-note="slot-08"]').fill('Đã tính kiểm thử F=86 -> 30°C.')
 page.locator('input[data-check="0"]').check()
 page.evaluate('''() => {location.hash='#/lesson/slot-09'; window.dispatchEvent(new Event('hashchange'))}''')
 page.wait_for_selector('textarea[data-note="slot-09"]')
 page.evaluate('''() => {location.hash='#/lesson/slot-08'; window.dispatchEvent(new Event('hashchange'))}''')
 page.wait_for_selector('textarea[data-note="slot-08"]')
 assert 'F=86' in page.locator('textarea[data-note="slot-08"]').input_value()
 assert page.locator('input[data-check="0"]').is_checked()
 results['retained_student_state']=True
 (R/'tests/learning_cycle_results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(results,ensure_ascii=False,indent=2))
 b.close()
