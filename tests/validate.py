#!/usr/bin/env python3
"""PRF192 v3.0 release checks: source consistency, C11 compile/run, risk cases.
No network access required; GCC and Python 3 are the only dependencies.
"""
from pathlib import Path
from collections import Counter
import json, re, sys, subprocess, tempfile, shutil, time

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT/'data/course.json').read_text('utf-8'))
ERRORS=[]
COUNTS=Counter()
T0=time.time()

def require(ok,msg):
    if not ok: ERRORS.append(msg)

def compiler_check(label,source,cases,check_stdout=True,extra_flags=(),output_pattern=None):
    src=ROOT/'examples'/source
    require(src.exists(),f'Chưa có tệp: {source}')
    if not src.exists():return
    with tempfile.TemporaryDirectory() as td:
        td=Path(td); exe=td/'test';cmd=['gcc','-std=c11','-Wall','-Wextra','-Wpedantic','-Werror',*extra_flags,str(src),'-lm','-o',str(exe)]
        c=subprocess.run(cmd,capture_output=True,text=True,timeout=18)
        if c.returncode!=0:
            ERRORS.append(f'Biên dịch lỗi {label}: {c.stderr[:650]}');return
        COUNTS['compiled']+=1
        for k,case in enumerate(cases):
            inp=case.get('stdin','') or ''
            try:res=subprocess.run([str(exe)],input=inp,capture_output=True,text=True,timeout=6,cwd=td)
            except Exception as ex:
                ERRORS.append(f'Thực thi lỗi {label} ca {k}: {ex}');continue
            if res.returncode !=case.get('exit',0):
                ERRORS.append(f'Mã thoát {label} ca {k}: {res.returncode} != {case.get("exit",0)}; stderr={res.stderr[:120]}')
                continue
            if check_stdout and case.get('stdout') is not None and res.stdout.strip()!=case['stdout'].strip():
                ERRORS.append(f'Stdout khác {label} ca {k}: {res.stdout.strip()!r} != {case["stdout"].strip()!r}')
                continue
            if output_pattern is not None and re.fullmatch(output_pattern,res.stdout) is None:
                ERRORS.append(f'Stdout không khớp mẫu {label} ca {k}: {res.stdout!r}');continue
            COUNTS['executed_cases']+=1
            COUNTS['output_verified_exact' if case.get('stdout') is not None else 'output_verified_pattern' if output_pattern else 'output_unchecked']+=1

L=DATA.get('lessons',[])
require(len(L)==21,'Không đủ 21 bài')
require(len(DATA.get('modules',[]))==5,'Không đủ 5 module')
require([x['id'] for x in L]==[f'slot-{x:02}' for x in range(21)],'Sai thứ tự Slot 00..20')
require(len(DATA.get('workshops',[]))==5,'Thiếu Workshop')
require(len(DATA.get('assignments',[]))==2,'Thiếu Assignment')
require(DATA.get('version')=='v3.0','Phiên bản không đúng v3.0')
require(sum(len(l['quiz']) for l in L)==105,'Phải có đúng 105 câu hỏi trắc nghiệm')
require(sum(len(l['exercises']) for l in L)==63,'Phải có đúng 63 bài luyện tập')
require(sum(len(l['lab_examples']) for l in L)>=26,'Thiếu ví dụ mở rộng')
require(sum(1 for l in L if l['flow'])==21,'Phải có đủ 21 lưu đồ sau khi bổ sung')
require(sum(len(l['syntax']) for l in L)==34,'Thay đổi bất ngờ 34 mẫu cú pháp')

answer_counts=Counter()
for l in L:
    i=l['number'];label=l['id']
    require(l.get('module') in [m['id'] for m in DATA['modules']],f'{label}: module không hợp lệ')
    dc=l.get('design_case',{})
    require(all(dc.get(k) for k in ['problem','input','process','output','assumptions','pseudocode','tests','reflection']),f'{label}: thiết kế bài học thiếu')
    require(len(dc.get('tests',[]))>=3,f'{label}: bảng kiểm thử cần >=3 trường hợp')
    require(len(l.get('rubric',[]))==5 and abs(sum(t['score'] for t in l['rubric'])-10)<1e-7,f'{label}: rubric không đạt 10 điểm')
    require(len(l['quiz'])==5,f'{label}: cần 5 câu quiz')
    require(len(l['exercises'])==3,f'{label}: cần 3 bài luyện tập')
    require(len(l['lab_examples'])>=1,f'{label}: cần 1 ví dụ mở rộng')
    require(len(l['sections'])>=3,f'{label}: thiếu phần khái niệm')
    require(len(l['objectives'])>=3,f'{label}: thiếu mục tiêu')
    require(l['deep_dive'].get('context') and l['deep_dive'].get('contrast'),f'{label}: thiếu phân tích kỹ thuật')
    require(l['deep_dive'].get('pitfall'),f'{label}: thiếu cảnh báo lỗi')
    require(l.get('lesson_parts') and l.get('practice_protocol'),f'{label}: thiếu bước sư phạm')
    for item in l['syntax']:
        require(all(item.get(key) for key in ('label','code','meaning','watch')),f'{label}: cú pháp thiếu thông tin')
    for q in l['quiz']:
        require(len(q['choices'])==4 and 0<=q['answer']<=3,f'{label}: đáp án không hợp lệ')
        require(len(set(q['choices']))==4,f'{label}: phương án bị lặp')
        require(len(q.get('rationales',[]))==4,f'{label}: thiếu giải thích từng phương án')
        require(all(str(t).strip() for t in q['rationales']),f'{label}: giải thích rỗng')
        require(q['explain'].strip(),f'{label}: thiếu lời giải thích đúng')
        answer_counts[q['answer']]+=1
    for mode,prefix in [('example',''),('worked','worked-')]:
        f=ROOT/'examples'/(prefix+label+'.c')
        require(f.exists(),f'{label} {mode}: không thấy mã nguồn')
        if f.exists():require(l[mode]['code']==f.read_text('utf-8'),f'{label} {mode}: mã nguồn và JSON không khớp')
        text=l[mode]['code']
        require('#include' in text and 'main(' in text and 'return 0;' in text,f'{label} {mode}: không thấy khung chương trình')
        if mode=='example':
            if l[mode].get('cases'): cases=l[mode]['cases']
            else:
                cases=[{'stdin':l[mode].get('stdin','')+'\n' if l[mode].get('stdin','') else '',
                        'stdout':l[mode].get('output') if l[mode].get('output') else None,'exit':0}]
        else:
            cases=[{'stdin':l[mode].get('stdin','')+'\n' if l[mode].get('stdin','') else '',
                    'stdout':l[mode]['output'],'exit':0}]
        compiler_check(f'{label}:{mode}',prefix+label+'.c',cases,output_pattern=l[mode].get('output_pattern'))
    for k,ex in enumerate(l['lab_examples'],1):
        fname=f'extended-{label}-{k:02}.c'
        f=ROOT/'examples'/fname
        require(f.exists(),f'{label} extended {k}: thiếu tệp mã')
        if f.exists():require(ex['code']==f.read_text('utf-8'),f'{label} extended {k}: không đồng bộ')
        cases=ex['cases'] or [{'stdin':ex.get('stdin',''),'stdout':None,'exit':0}]
        compiler_check(f'{label}:extended:{k}',fname,cases,output_pattern=ex.get('output_pattern'))
for idx in range(4):
    require(24<=answer_counts[idx]<=28,f'Trắc nghiệm lệch vị trí đáp án {idx}: {answer_counts[idx]}')
for w in DATA['workshops']:
    require(abs(sum(w['rubric'])-10)<1e-8,f'Workshop {w["id"]}: rubric không bằng 10')
for a in DATA['assignments']:
    require(abs(sum(a['rubric'])-10)<1e-8,f'Assignment {a["id"]}: rubric không bằng 10')
for required in ('index.html','assets/style.css','assets/app.js','assets/utehy-mark-from-user.png','data/course.js','.nojekyll','README.md','TEACHING_GUIDE.md'):
    require((ROOT/required).is_file(),f'Thiếu thành phần website: {required}')
app=(ROOT/'assets/app.js').read_text('utf-8')
require('function expandedHTML(l)' in app,'UI không hiển thị phần mở rộng')
require('const onlineURL' in app and 'online_c_compiler' in app,'Thiếu OnlineGDB')
require('${l.quiz.length} câu tự kiểm tra' in app,'UI chưa hiển thị số câu cập nhật')
require('`' not in (ROOT/'data/course.js').read_text('utf-8')[:70], 'Dữ liệu không phải JSON literal')
cs=(ROOT/'data/course.js').read_text('utf-8').strip()
try:
    decoded=json.loads(cs[len('window.PRF192_COURSE = '):-1]);require(decoded==DATA,'course.js khác course.json')
except Exception as e:
    ERRORS.append('Không đọc được course.js như JSON: '+repr(e))
if shutil.which('node'):
    j=subprocess.run(['node','--check',str(ROOT/'assets/app.js')],capture_output=True,text=True)
    require(j.returncode==0,'Lỗi cú pháp JavaScript: '+j.stderr[:250])

# Explicit negative regression that was accepted by v1.1; now must reject.
regression=next(l for l in L if l['id']=='slot-12')['example']['cases']
require(any(' '*120 in x['stdin'] and x['exit']==1 for x in regression),'Thiếu kiểm thử dòng nhập bị cắt')
# Spot-check target structure and problem corrections.
require('long long square = (long long)x * x;' in L[3]['worked']['code'],'Slot03 thiếu sửa tràn trước phép nhân')
require('Phân loại' in L[5]['example']['title'],'Slot05 chưa khớp tên ví dụ')
require('strtol' in L[12]['example']['code'] and 'getchar()' in L[12]['example']['code'],'Slot12 chưa từ chối dữ liệu thừa')
require('selection_sort' in L[14]['worked']['code'] and 'binary_search' in L[14]['worked']['code'],'Slot14 chưa có bài tìm nhị phân')
require('r+b' in L[20]['worked']['code'] and 'ftell(' in L[20]['worked']['code'],'Slot20 chưa có bài cập nhật tệp')

report={'version':DATA.get('version'),'lessons':len(L),'workshops':len(DATA['workshops']),
    'assignments':len(DATA['assignments']),'quizzes':sum(len(l['quiz']) for l in L),
    'exercises':sum(len(l['exercises']) for l in L),'extra_labs':sum(len(l['lab_examples']) for l in L),
    'flowcharts':sum(bool(l['flow']) for l in L),'syntax_cards':sum(len(l['syntax']) for l in L),
    'compiled_programs':COUNTS['compiled'],'run_test_cases_passed':COUNTS['executed_cases'],
    'output_verified_exact':COUNTS['output_verified_exact'],
    'output_verified_pattern':COUNTS['output_verified_pattern'],
    'output_unchecked':COUNTS['output_unchecked'],
    'answer_distribution':{chr(65+k):answer_counts[k] for k in range(4)},
    'errors':ERRORS,'elapsed_seconds':round(time.time()-T0,2),
    'flags':'gcc -std=c11 -Wall -Wextra -Wpedantic -Werror -lm'}
print(json.dumps(report,ensure_ascii=False,indent=2))
(ROOT/'tests/results_latest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sys.exit(bool(ERRORS))
