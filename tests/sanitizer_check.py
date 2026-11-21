#!/usr/bin/env python3
"""UndefinedBehaviorSanitizer smoke check of published C snippets with normal cases."""
from pathlib import Path
import json, subprocess, tempfile, sys
R=Path(__file__).resolve().parents[1]
D=json.loads((R/'data/course.json').read_text('utf-8'))
checked=0;issues=[]
for l in D['lessons']:
    snippets=[(l['id']+'.c',l['example']),('worked-'+l['id']+'.c',l['worked'])]+[(f'extended-{l["id"]}-{i:02}.c',v) for i,v in enumerate(l['lab_examples'],1)]
    for source,case in snippets:
        with tempfile.TemporaryDirectory() as d:
            src=R/'examples'/source; exe=Path(d)/'app'
            cc=subprocess.run(['gcc','-std=c11','-Wall','-Wextra','-Wpedantic','-Werror','-fsanitize=undefined','-fno-sanitize-recover=undefined',str(src),'-lm','-o',str(exe)],capture_output=True,text=True,timeout=12)
            if cc.returncode:
                issues.append(f'{source} compile: {cc.stderr[:180]}');continue
            inp=case.get('stdin','')
            # test uses one normal case, not malicious data; hardening cases covered in validate.py.
            if isinstance(inp,str) and inp and not inp.endswith('\n'):inp+='\n'
            if not inp and case.get('cases'):
                inp=case['cases'][0]['stdin']
            try:ret=subprocess.run([str(exe)],input=inp,capture_output=True,text=True,timeout=5,cwd=d)
            except Exception as exc:issues.append(f'{source} runtime: {exc}');continue
            if ret.returncode!=0 or 'runtime error:' in ret.stderr:
                issues.append(f'{source} UBSan failed: rc={ret.returncode}, stderr={ret.stderr[:280]}')
            else:checked+=1
print(f'UBSan PASS: {checked}/{sum(2+len(l["lab_examples"]) for l in D["lessons"])} programs; issues={len(issues)}')
for i in issues:print(i)
sys.exit(bool(issues))
