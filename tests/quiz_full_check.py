#!/usr/bin/env python3
"""Interactive check of all 105 quiz answer keys and explanation panels."""
from pathlib import Path
import re, json
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
h=(R/'index.html').read_text('utf-8')
h=re.sub(r'<link[^>]+href="assets/style.css"[^>]*>','',h)
h=re.sub(r'<script[^>]+src="(?:data/course.js|assets/app.js)"[^>]*></script>','',h)
# Browser loads logo only when served; the UI tests are independent from the image asset.
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page();issues=[]
 page.on('pageerror', lambda e:issues.append(str(e)))
 page.set_content(h);page.add_style_tag(content=(R/'assets/style.css').read_text('utf-8'))
 page.add_script_tag(content=(R/'data/course.js').read_text('utf-8'))
 page.add_script_tag(content=(R/'assets/app.js').read_text('utf-8'))
 summary=page.evaluate('''() => {
   let total=0,passed=0,failures=[];
   for (let s=0;s<21;s++) {
     const id='slot-'+String(s).padStart(2,'0');
     location.hash='#/lesson/'+id; window.dispatchEvent(new Event('hashchange'));
     const lesson=window.PRF192_COURSE.lessons[s];
     for (let i=0;i<5;i++) {
       const right=lesson.quiz[i].answer;
       const card=document.querySelectorAll('.question-card')[i];
       const inp=card?.querySelector('input[value="'+right+'"]');
       total++;
       if (!inp) {failures.push(id+':missing input '+i);continue;}
       inp.checked=true;inp.dispatchEvent(new Event('change',{bubbles:true}));
       const newCard=document.querySelectorAll('.question-card')[i];
       const text=newCard?.querySelector('.feedback')?.textContent||'';
       const options=newCard?.querySelectorAll('ol[type="A"] li').length||0;
       // Reason list exists inside closed details but remains in DOM.
       if (text.includes('Chính xác') && options===4) passed++;
       else failures.push(id+':wrong feedback '+i+' '+text.slice(0,40)+' reasons='+options);
     }
   }
   return {total,passed,failures};
 }''')
 assert summary['total']==105 and summary['passed']==105,summary
 assert not issues,issues
 (R/'tests/quiz_results.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(summary,ensure_ascii=False,indent=2))
 b.close()
