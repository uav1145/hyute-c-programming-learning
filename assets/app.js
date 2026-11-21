/* PRF192 – static GitHub Pages application. No third-party dependencies. */
'use strict';
(() => {
  const DATA = window.PRF192_COURSE;
  const view = document.getElementById('view');
  const sidebar = document.getElementById('sidebar');
  const nav = document.getElementById('lesson-nav');
  const search = document.getElementById('lesson-search');
  const PER_KEY = 'prf192-utehy-done-v1';
  const ACT_KEY = 'prf192-utehy-learning-check-v3';
  const NOTES_KEY = 'prf192-utehy-reflections-v3';
  if (!DATA || DATA.lessons.length !== 21) {
    view.innerHTML = '<section class="panel" style="padding:24px"><h1>Không thể mở nội dung bài giảng</h1><p>Vui lòng kiểm tra tệp data/course.js trong cùng thư mục website.</p></section>';
    return;
  }
  const esc = str => String(str === undefined || str === null ? '' : str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeAttr = esc;
  const onlineURL = 'https://www.onlinegdb.com/online_c_compiler';
  const groups = DATA.modules;
  let done = {};
  try { done = JSON.parse(localStorage.getItem(PER_KEY) || '{}'); } catch(_) { done = {}; }
  const quizAnswers = {};
  let activityState={}; let reflectionNotes={};
  try { activityState=JSON.parse(localStorage.getItem(ACT_KEY)||'{}'); } catch(_) {activityState={};}
  try { reflectionNotes=JSON.parse(localStorage.getItem(NOTES_KEY)||'{}'); } catch(_) {reflectionNotes={};}
  let toastTimer;
  function toast(msg) { const t = document.getElementById('toast'); t.textContent=msg; t.hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>{t.hidden=true},3500); }
  function saveDone() { try { localStorage.setItem(PER_KEY, JSON.stringify(done)); } catch(_) { toast('Trình duyệt đang chặn lưu tiến độ.'); } }
  function progress() { return DATA.lessons.filter(l=>done[l.id]).length; }
  function progressHTML() { const x=progress();return `<div class="progress-line"><span>Tiến độ hoàn thành theo đánh dấu cá nhân</span><b>${x}/21 bài</b></div><div class="progress-bar" role="progressbar" aria-label="Tiến độ học tập" aria-valuenow="${x}" aria-valuemin="0" aria-valuemax="21"><div class="progress-fill" style="width:${x/21*100}%"></div></div>`; }
  function currentHash() { return decodeURIComponent(location.hash.slice(1)) || '/home'; }
  function closeMenu() { sidebar.classList.remove('open'); document.getElementById('menu-toggle').setAttribute('aria-expanded','false'); }
  function navHTML(term='') {
    const q=term.trim().toLocaleLowerCase('vi');
    nav.innerHTML=groups.map(g=>{
      const ls=DATA.lessons.filter(l=>l.module===g.id && (!q || [l.title,l.lead,l.unit,l.source,l.design_case.title,l.design_case.problem,...l.objectives,...l.sections.flatMap(s=>[s.title,s.text])].join(' ').toLocaleLowerCase('vi').includes(q)));
      if(!ls.length) return '';
      return `<div class="side-group-title">${esc(g.id)} · ${esc(g.title)}</div>${ls.map(l=>`<a class="side-link" data-route="/lesson/${l.id}" href="#/lesson/${l.id}"><span class="side-num">${String(l.number).padStart(2,'0')}</span><span>${esc(l.title)}</span>${done[l.id]?'<span class="side-check" aria-label="Đã hoàn thành">✓</span>':''}</a>`).join('')}`;
    }).join('') || '<p class="side-empty">Không có chủ đề phù hợp.</p>';
    highlightNav();
  }
  function highlightNav() {const path=currentHash();nav.querySelectorAll('a[data-route]').forEach(a=>{const active=a.dataset.route===path;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});}
  const crumb=(items) => `<nav class="breadcrumb" aria-label="Đường dẫn"><a href="#/home">Trang chủ</a>${items.map(it=>` <span aria-hidden="true"> / </span> ${it.href?`<a href="${safeAttr(it.href)}">${esc(it.text)}</a>`:esc(it.text)}`).join('')}</nav>`;
  const listItems=(list, cls='')=>`<ul class="${cls}">${list.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`;
  const title=(text, num)=>`${num!==undefined?`<span class="lesson-kicker">BÀI ${String(num).padStart(2,'0')} · ${esc(DATA.code)}</span>`:''}<h1>${esc(text)}</h1>`;
  const codeBox=(code,kind,stdin)=>{
    const tag=kind || 'Mã nguồn C11';
    return `<div class="code-frame"><div class="code-toolbar"><span>⌨ ${esc(tag)}</span><div class="code-actions"><button class="code-btn" data-action="copy" type="button">Sao chép mã</button><a class="code-btn" target="_blank" rel="noopener noreferrer" href="${onlineURL}">Chạy trên OnlineGDB ↗</a></div></div><pre class="source-code"><code>${esc(code)}</code></pre></div>${stdin?`<div class="callout"><strong>Dữ liệu nhập (Standard Input):</strong><pre style="white-space:pre-wrap;overflow:auto">${esc(stdin)}</pre><button class="btn btn-sm" type="button" data-action="copy-stdin">Sao chép dữ liệu nhập</button></div>`:''}`;
  };
  /* In-page SVG flowcharts: no network dependency, readable on GitHub Pages/offline. */
  function svgText(text, x, y, width=26, fontSize=14) {
    const words=String(text).split(/\s+/), rows=[];let line='';
    words.forEach(word=>{
      if ((line+' '+word).trim().length>width&&line){rows.push(line);line=word;}
      else line=(line+' '+word).trim();
    });if(line)rows.push(line);
    const arr=rows.slice(0,4);
    const firstY=y-((arr.length-1)*8);
    return `<text x="${x}" y="${firstY}" text-anchor="middle" fill="#243b32" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="600">${arr.map((r,i)=>`<tspan x="${x}" dy="${i?17:0}">${esc(r)}</tspan>`).join('')}</text>`;
  }
  function flowchartHTML(flow, id) {
    if (!flow) return '';
    const marker=`arr-${id}`;
    const defs=`<defs><marker id="${marker}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#328a57"/></marker></defs>`;
    const arrow=(d)=>`<path d="${d}" stroke="#328a57" stroke-width="2.3" fill="none" marker-end="url(#${marker})" stroke-linejoin="round"/>`;
    const proc=(x,y,w,h,t)=>{
      const io=/^(nhập|xuất|in\b|in:|đọc|hiển thị|thông báo|báo lỗi|nhận dữ liệu)/i.test(String(t).trim());
      const shape=io?`<polygon points="${x+17},${y} ${x+w},${y} ${x+w-17},${y+h} ${x},${y+h}" fill="#e7f4ff" stroke="#3682ab" stroke-width="1.7"/>`
        :`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#eff8ef" stroke="#3d9858" stroke-width="1.7"/>`;
      return shape+svgText(t,x+w/2,y+h/2+5,Math.floor(w/8.5));
    };
    const capsule=(x,y,w,h,t)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="#e3f2fc" stroke="#387b9c" stroke-width="1.7"/>${svgText(t,x+w/2,y+h/2+4,Math.floor(w/9))}`;
    const decision=(txt)=>`<polygon points="380,104 509,154 380,204 251,154" fill="#fff5dc" stroke="#b88620" stroke-width="1.8"/>${svgText(txt,380,159,24)}`;
    let svg='', height=410;
    if(flow.type==='sequence'){
      const steps=flow.steps||[];
      height=107+steps.length*78;
      svg+=capsule(260,10,240,43,'Bắt đầu');
      let beforeY=53;
      for(let i=0;i<steps.length;i++){
        const y=79+i*78;
        svg+=arrow(`M380 ${beforeY} V${y-2}`);
        svg+=proc(200,y,360,52,steps[i]);beforeY=y+52;
      }
      let y=79+steps.length*78;
      svg+=arrow(`M380 ${beforeY} V${y-3}`);
      svg+=capsule(260,y,240,43,'Kết thúc');
    } else if(flow.type==='decision'){
      height=/^(kết thúc|dừng)$/i.test(String(flow.end).trim())?439:535;
      svg+=capsule(270,15,220,48,flow.start);
      svg+=arrow('M380 63 V103');
      svg+=decision(flow.condition);
      svg+=arrow('M251 154 H160 V245');
      svg+=arrow('M509 154 H600 V245');
      svg+=`<text x="195" y="145" class="flow-edge-label">Đúng</text><text x="564" y="145" class="flow-edge-label">Sai</text>`;
      svg+=proc(40,245,240,61,flow.yes);
      svg+=proc(480,245,240,61,flow.no);
      svg+='<path d="M160 306 V351 H600 V306" stroke="#328a57" stroke-width="2.3" fill="none"/>';
      svg+=arrow('M380 351 V379');
      if (/^(kết thúc|dừng)$/i.test(String(flow.end).trim())) {
        svg+=capsule(240,379,280,46,flow.end);
      } else {
        svg+=proc(210,379,340,56,flow.end);
        svg+=arrow('M380 435 V463');
        svg+=capsule(260,463,240,46,'Kết thúc');
      }
    } else if(flow.type==='loop'){
      height=372;
      svg+=capsule(270,12,220,48,flow.start);
      svg+=arrow('M380 60 V104');
      svg+=decision(flow.condition);
      svg+=arrow('M509 154 H620 V216');
      svg+=`<text x="555" y="143" class="flow-edge-label">Đúng</text>`;
      svg+=proc(504,216,232,64,flow.body);
      svg+=arrow('M736 249 H752 V88 H435 V125');
      svg+=arrow('M251 154 H178 V218');
      svg+=`<text x="198" y="143" class="flow-edge-label">Sai</text>`;
      svg+=proc(40,218,276,64,flow.end);
      svg+=arrow('M178 282 V312');
      svg+=capsule(85,312,186,47,'Kết thúc');
    } else return '';
    return `<figure class="flowchart-figure"><div class="flow-wrap" role="img" aria-label="${safeAttr(flow.caption)}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 ${height}" aria-hidden="true" focusable="false">${defs}${svg}</svg></div><figcaption>Hình ${id.replace('slot-','')}.1. ${esc(flow.caption)}. Lưu đồ biên soạn cho bài học; mũi tên biểu diễn thứ tự xử lý. Nhánh Đúng/Sai thể hiện kết quả của điều kiện.</figcaption></figure>`;
  }
  function syntaxHTML(l) {
    return `<h2 id="syntax" class="anchor-h2">3. Cú pháp và các thành phần C11</h2><p class="note">Các đoạn cú pháp sau giúp nhận diện mẫu lệnh; một số là đoạn trích minh họa, chưa phải chương trình hoàn chỉnh. Muốn chạy, dùng chương trình đầy đủ ở phần ví dụ hoặc bài tập mẫu.</p>${l.syntax.map((it,i)=>`<section class="syntax-card"><h3>Mẫu ${i+1}. ${esc(it.label)}</h3><div class="code-frame"><div class="code-toolbar"><span>⌨ Mẫu cú pháp / đoạn mã C</span><div class="code-actions"><button class="code-btn" data-action="copy" type="button">Sao chép</button></div></div><pre class="source-code"><code>${esc(it.code)}</code></pre></div><p><strong>Ý nghĩa:</strong> ${esc(it.meaning)}</p><div class="syntax-watch"><strong>Lưu ý:</strong> ${esc(it.watch)}</div></section>`).join('')}`;
  }
  function workedHTML(l) {
    const w=l.worked;
    return `<h2>6. Bài tập mẫu có lời giải</h2><div class="worked-card"><h3>${esc(w.title)}</h3><p><strong>Đề bài:</strong> ${esc(w.problem)}</p><h3>Phân tích và hướng giải</h3><ol class="steps-list">${w.steps.map(st=>`<li>${esc(st)}</li>`).join('')}</ol><details class="worked-solution"><summary>Xem lời giải C hoàn chỉnh và kết quả kiểm thử</summary>${codeBox(w.code,'Lời giải mẫu · C11',w.stdin)}<div class="io-box"><div class="io-title">Kết quả dự kiến</div><pre>${esc(w.output)}</pre></div><h3>Giải thích các bước thực thi</h3>${listItems(w.analysis)}<h3>Thử thêm các trường hợp</h3>${listItems(w.tests)}</details></div>`;
  }

  function expandedHTML(l) {
    const d=l.deep_dive; if(!d) return '';
    const comp=`<div class="contrast-wrap" role="region" aria-label="Bảng đối chiếu khái niệm" tabindex="0"><table class="contrast-table"><thead><tr><th>Khái niệm / cơ chế</th><th>Giải thích và điều kiện</th></tr></thead><tbody>${d.contrast.map(x=>`<tr><th scope="row">${esc(x[0])}</th><td>${esc(x[1])}</td></tr>`).join('')}</tbody></table></div>`;
    const labs=l.lab_examples.map((x,i)=>`<section class="extended-lab"><div class="lab-heading"><span class="lab-tag">MINH HỌA ${i+1}</span><h3>${esc(x.title)}</h3></div><p>${esc(x.purpose)}</p>${codeBox(x.code,'Ví dụ mở rộng · C11',x.stdin)}${x.output?`<details class="expected-output"><summary>Dự đoán trước rồi xem kết quả mong đợi</summary><pre>${esc(x.output)}</pre></details>`:'<div class="callout">Kết quả định lượng phụ thuộc triển khai; hãy tự chạy, ghi lại và giải thích.</div>'}<div class="lab-after"><b>Thử biến thể và giải thích:</b> ${esc(x.followup)}</div>${x.cases&&x.cases.length>1?`<div class="testcases"><b>Ca kiểm thử đã thực thi trong bộ kiểm định:</b><ul>${x.cases.map((t,j)=>`<li>Ca ${j+1}: <code>${esc((t.stdin||'(không nhập)').trim().slice(0,50))}</code> → ${t.exit===0?'hợp lệ':'báo lỗi'}; đầu ra kỳ vọng <code>${esc((t.stdout||'').replace(/\n/g,' | ').slice(0,95))}</code></li>`).join('')}</ul></div>`:''}</section>`).join('');
    return `<section class="deep-dive"><h2>6.1. Đào sâu kiến thức, đối chiếu và kiểm thử</h2><p>${esc(d.context)}</p>${l.teaching_note?`<div class="callout"><b>Gợi ý tổ chức giờ học:</b> ${esc(l.teaching_note)}</div>`:''}${comp}<div class="callout warn"><strong>Sai lầm cần tránh:</strong> ${esc(d.pitfall)}</div><h3>Ví dụ mở rộng có thể chạy độc lập</h3>${labs}<h3>Nhiệm vụ vận dụng</h3><p>${esc(d.challenge)}</p><details class="learning-protocol"><summary>Quy trình tự kiểm chứng trước khi đánh dấu hoàn thành</summary><ol>${l.practice_protocol.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></details></section>`;
  }

  function designCaseHTML(l) {
    const c=l.design_case;
    const tr=(heading,values)=>`<tr><th scope="row">${heading}</th><td>${values.map(esc).join('<span class="case-divider">; </span>')}</td></tr>`;
    const code=c.pseudocode.map((st,i)=>`${String(i+1).padStart(2,'0')}. ${st}`).join('\n');
    return `<div class="design-case"><div class="case-title">${esc(c.title)}</div><p>${esc(c.problem)}</p>
      <div class="case-table-scroll"><table class="ipo-table"><tbody>${tr('Input · Đầu vào',c.input)}${tr('Process · Xử lý',c.process)}${tr('Output · Đầu ra',c.output)}${tr('Giả thiết và giới hạn',c.assumptions)}</tbody></table></div>
      <h3>Thiết kế thuật toán bằng mã giả</h3><p class="note">Tự viết mã giả trước, sau đó mở phần đối chiếu; đây là bài toán ứng dụng độc lập với chương trình minh họa trong nguồn PRF192.</p>
      <details><summary class="link-green">Mở mã giả gợi ý để đối chiếu sau khi làm</summary><pre class="case-pre">${esc(code)}</pre></details>
      <h3 style="margin-top:18px">Bảng kiểm thử chức năng đề xuất</h3><p class="note">Kết quả dưới đây là kỳ vọng theo đặc tả tình huống; sinh viên phải tự viết mã C, chạy thực tế và ghi lại kết quả quan sát. Không phải kết quả đã thực thi của một chương trình mới.</p>
      <div class="case-table-scroll"><table class="test-matrix"><thead><tr><th>Loại ca</th><th>Dữ liệu thử</th><th>Kết quả mong đợi</th></tr></thead><tbody>${c.tests.map(t=>`<tr><td>${esc(t.kind)}</td><td>${esc(t.input)}</td><td>${esc(t.expected)}</td></tr>`).join('')}</tbody></table></div>
      <div class="callout"><b>Hoạt động chuyển giao:</b> ${esc(c.reflection)}</div><p class="meta-source">${esc(c.status)}</p>
      </div>`;
  }
  function learningCheckHTML(l) {
    const items=['Đã phân tích yêu cầu, đầu vào, đầu ra và đơn vị', 'Đã tự viết mã giả hoặc lưu đồ trước khi xem gợi ý', 'Đã biên dịch/chạy mã C và đối chiếu đầu ra', 'Đã thử trường hợp biên hoặc dữ liệu sai', 'Đã giải thích được một giới hạn hoặc lỗi thường gặp'];
    const state=activityState[l.id]||{};
    const rubric=`<table class="rubric-table pedagogy-rubric"><thead><tr><th>Tiêu chí đánh giá bài thực hành</th><th>Điểm tối đa</th></tr></thead><tbody>${l.rubric.map(r=>`<tr><td>${esc(r.name)}</td><td>${String(r.score).replace('.',',')}</td></tr>`).join('')}<tr><th>Tổng</th><th>10</th></tr></tbody></table>`;
    return `<h2 id="self-audit" class="anchor-h2">10. Tự kiểm tra năng lực và rubric</h2><p class="note">Rubric sau dùng cho bài luyện tập, không thay thế thang điểm Workshop và Assignment đã có.</p>${rubric}
      <div class="lesson-check"><h3>Danh sách tự kiểm trước khi hoàn thành</h3>${items.map((x,i)=>`<label><input type="checkbox" data-check="${i}" data-lesson="${l.id}" ${state[i]?'checked':''}/><span>${esc(x)}</span></label>`).join('')}</div>
      <div class="reflection-prompt"><b>Câu hỏi phản tư:</b> ${esc(l.design_case.reflection)}</div><label for="notes-${l.id}"><b>Ghi chép cá nhân</b> (lưu trên trình duyệt này, không gửi giảng viên)</label><textarea class="lesson-notes" id="notes-${l.id}" data-note="${l.id}" placeholder="Ghi thuật toán, kết quả kiểm thử hoặc lỗi cần sửa...">${esc(reflectionNotes[l.id]||'')}</textarea>`;
  }
  function lessonHTML(l) {
    const ix=DATA.lessons.findIndex(x=>x.id===l.id), prev=DATA.lessons[ix-1],next=DATA.lessons[ix+1];
    const latestDone=!!done[l.id];
    const sections=l.sections.map((s,i)=>`<section class="learn-section"><h3>${i+1}. ${esc(s.title)}</h3><p>${esc(s.text)}</p>${s.bullets&&s.bullets.length?listItems(s.bullets):''}</section>`).join('');
    const mistakes=listItems(l.mistakes);
    const exCards=l.exercises.map((x,i)=>`<article class="exercise-card"><div class="exercise-header"><h3>Bài tập ${l.number}.${i+1} — ${esc(x.name)}</h3><span class="task-tag">${esc(x.level)}</span></div><p><b>Yêu cầu:</b> ${esc(x.task)}</p><details><summary>Xem gợi ý khi cần</summary><p>${esc(x.hint)}</p></details><p class="mini-info"><b>Tiêu chí tự kiểm tra:</b> ${esc(x.criteria)}</p></article>`).join('');
    const quizzes=l.quiz.map((q,i)=>{
      const key=`${l.id}:${i}`,answer=quizAnswers[key];
      return `<div class="question-card" data-quiz="${i}"><fieldset><legend>Câu ${i+1}. ${esc(q.q)}</legend>${q.choices.map((c,j)=>`<label class="choice"><input type="radio" name="quiz-${l.id}-${i}" value="${j}" ${answer===j?'checked':''} /> <span>${'ABCD'[j]}. ${esc(c)}</span></label>`).join('')}</fieldset>${answer!==undefined?`<div class="feedback ${answer===q.answer?'':'wrong'}"><strong>${answer===q.answer?'✓ Chính xác':'✗ Chưa chính xác'} — Đáp án ${'ABCD'[q.answer]}.</strong> ${esc(q.explain)}</div><details class="quiz-reasons"><summary>Xem giải thích từng phương án A–D</summary><ol type="A">${q.rationales.map((reason,j)=>`<li><strong>${j===q.answer?'Đúng':'Chưa phù hợp'}:</strong> ${esc(reason)}</li>`).join('')}</ol></details>`:''}</div>`;
    }).join('');
    const qcount=l.quiz.filter((q,i)=>quizAnswers[`${l.id}:${i}`]===q.answer).length;
    return `<article class="lesson-page">${crumb([{text:'Bài giảng',href:'#/curriculum'},{text:`Slot ${String(l.number).padStart(2,'0')}`}])}
      ${title(l.title,l.number)}<p class="lesson-lead">${esc(l.lead)}</p><div class="lesson-meta"><span class="module-tag">${esc(l.module)} · ${esc(l.module_title)}</span><span class="pill">Chủ đề gốc: ${esc(l.unit)}</span><span class="pill">⏱ ${l.minutes} phút đề xuất</span><span class="pill">${l.quiz.length} câu tự kiểm tra</span><span class="pill">${1+l.lab_examples.length} chương trình có giải thích mở rộng</span><span class="pill">${l.exercises.length} bài luyện tập</span></div>
      <div class="callout"><b>Chuẩn đầu ra của bài học</b><ol class="obj-list">${l.objectives.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><span class="meta-source">Đối chiếu học liệu: ${esc(l.source)}. Phân bổ thời lượng và mục tiêu do người biên soạn đề xuất.</span></div>
      <details class="lesson-index"><summary>Xem lộ trình học tập của bài</summary><ol>${l.lesson_parts.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></details>
      <nav class="cycle-nav" aria-label="Các bước học trọng tâm"><button type="button" data-scroll="case-${l.id}">01 · Bài toán và IPO</button><button type="button" data-scroll="syntax">02 · Cú pháp</button><button type="button" data-scroll="test-${l.id}">03 · Kiểm thử</button><button type="button" data-scroll="self-audit">04 · Tự đánh giá</button></nav>
      <h2 id="case-${l.id}" class="anchor-h2">1. Bài toán kỹ thuật → IPO → mã giả</h2>${designCaseHTML(l)}
      <h2>2. Kiến thức nền tảng</h2>${sections}
      ${syntaxHTML(l)}
      ${l.flow?`<h2>4. Lưu đồ thuật toán</h2>${flowchartHTML(l.flow,l.id)}`:'<h2>4. Vai trò của biểu diễn thuật toán</h2><p class="note">Chủ đề này tập trung vào khái niệm và cú pháp, không có một thuật toán xử lý đơn nhất bắt buộc phải vẽ lưu đồ. Lưu đồ sẽ được giới thiệu khi bài học có nhánh điều kiện, trình tự xử lý hoặc vòng lặp cụ thể.</p>'}
      <h2 id="test-${l.id}" class="anchor-h2">5. Ví dụ C11 và kiểm chứng</h2><h3>${esc(l.example.title)}</h3>${codeBox(l.example.code,'Mã nguồn C11',l.example.stdin)}
      ${l.example.output?`<div class="io-grid"><div class="io-box"><div class="io-title">Kết quả dự kiến (stdout)</div><details><summary>Nhấn xem sau khi dự đoán</summary><pre>${esc(l.example.output)}</pre></details></div><div class="io-box"><div class="io-title">Quy trình thực hiện</div><p class="mini-info">1. Sao chép mã → 2. Mở OnlineGDB, chọn C → 3. Dán mã vào main.c → 4. Nhập dữ liệu mẫu nếu có → 5. Nhấn Run → 6. Đối chiếu và giải thích.</p></div></div>`:`<div class="callout warn">Đầu ra phụ thuộc môi trường hoặc dữ liệu và không được cố định cho mọi lần chạy. Hãy tự chạy và phân tích kết quả.</div>`}
      ${l.example.why?`<p><b>Giải thích:</b> ${esc(l.example.why)}</p>`:''}${l.example.trace&&l.example.trace.length?`<div class="example-trace"><b>Phân tích trình tự thực thi:</b><ol>${l.example.trace.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>`:''}
      ${workedHTML(l)}
      ${expandedHTML(l)}
      <h2>7. Các lỗi thường gặp</h2>${mistakes}
      <h2>8. Bài tập luyện tập</h2><p class="note">Tự xây dựng thuật toán và mã nguồn; kiểm thử với dữ liệu thông thường, dữ liệu biên và dữ liệu không hợp lệ khi phù hợp. Nên hoàn thành trước khi mở lời giải mẫu.</p>${exCards}
      <h2>9. Câu hỏi trắc nghiệm tự kiểm tra</h2><p class="note">Mỗi bài có năm câu từ nhận biết tới phân tích và kiểm thử. Mỗi câu có bốn phương án. Chọn câu trả lời để nhận phản hồi và giải thích từng phương án; điểm chỉ lưu trong phiên hiển thị.</p>${quizzes}<div class="quiz-summary">Điểm trắc nghiệm đang đạt: ${qcount}/${l.quiz.length}. <button class="btn btn-sm" data-action="reset-quiz" type="button">Làm lại</button></div>
      ${learningCheckHTML(l)}<h2>11. Tổng kết và nhiệm vụ tự học</h2>${listItems(l.summary)}
      <div class="mark-box"><div><strong>${latestDone?'✓ Bạn đã đánh dấu hoàn thành bài này':'Đánh dấu sau khi đã hoàn thành bài học'}</strong><div class="mini-info">Dựa trên tự đánh giá; không thay thế điểm kiểm tra của giảng viên.</div></div><button type="button" class="btn ${latestDone?'btn-ghost':'btn-primary'}" data-action="done" data-id="${l.id}">${latestDone?'Bỏ đánh dấu':'Đã học xong'}</button></div>
      <div class="lesson-footer-nav">${prev?`<a class="btn btn-ghost" href="#/lesson/${prev.id}">← Bài ${prev.number}: ${esc(prev.title)}</a>`:'<span></span>'}${next?`<a class="btn btn-primary" href="#/lesson/${next.id}">Bài ${next.number} →</a>`:'<a class="btn btn-primary" href="#/practice">Chuyển sang Workshop →</a>'}</div>
    </article>`;
  }
  function homeHTML() {
    const x=progress(); const next=DATA.lessons.find(l=>!done[l.id])||DATA.lessons[0];
    return `<section class="hero"><div class="eyebrow">TÀI NGUYÊN DẠY VÀ HỌC CĂN BẢN · PRF192</div><h1>Lập trình C căn bản<br />Từ thuật toán đến chương trình thực thi</h1><p>Khóa học HTML tiếng Việt gồm 5 module, giữ nguyên Slot 00–20 của PRF192. Mỗi bài đi từ tình huống kỹ thuật → IPO → mã giả/lưu đồ → chương trình C → kiểm thử → đánh giá, kết hợp bài mẫu và thực hành trên <strong>OnlineGDB</strong>.</p><div class="hero-buttons"><a class="btn btn-primary" href="#/lesson/${next.id}">${x?'Học tiếp':'Bắt đầu học'} — Slot ${String(next.number).padStart(2,'0')} →</a><a class="btn" href="#/curriculum">Xem toàn bộ 21 bài</a><a class="btn" href="${onlineURL}" target="_blank" rel="noopener noreferrer">OnlineGDB ↗</a></div></section>
      <div class="stats"><div class="stat"><div class="stat-number">5</div><div class="stat-caption">Module · 21 bài Slot 00–20</div></div><div class="stat"><div class="stat-number">5</div><div class="stat-caption">Workshop theo đề gốc</div></div><div class="stat"><div class="stat-number">2</div><div class="stat-caption">Phương án bài tập lớn</div></div><div class="stat"><div class="stat-number">${x}</div><div class="stat-caption">Bài bạn đánh dấu hoàn thành</div></div></div>
      <section class="panel" style="padding:20px"><h2 style="margin:0 0 8px">Tiến độ học tập cá nhân</h2>${progressHTML()}<p class="note">Tiến độ được lưu bằng localStorage của trình duyệt này. Không có tài khoản, không đồng bộ giữa thiết bị và không có chức năng nộp bài lên máy chủ.</p></section>
      <h2 class="section-heading">Học theo tiến trình nhận thức</h2><div class="card-grid">
        <div class="feature-card"><span class="tag">01 · Hình thành khái niệm</span><h3>Khái niệm → Cơ chế → Ví dụ</h3><p>Mỗi bài bắt đầu bằng mục tiêu đo được, liên hệ tri thức cũ trước khi giải thích các thành phần kỹ thuật.</p></div>
        <div class="feature-card"><span class="tag">02 · Luyện tập có giàn giáo</span><h3>Dự đoán → Chạy → Đối chiếu</h3><p>Mã mẫu có thể sao chép và chạy trên OnlineGDB; dự đoán kết quả trước khi mở phần kết quả.</p></div>
        <div class="feature-card"><span class="tag">03 · Vận dụng và chuyển giao</span><h3>Bài tập → Workshop → Assignment</h3><p>Bài tập tăng dần độ phức tạp, từ rẽ nhánh đến tổ chức mảng, struct và lưu trữ tệp.</p></div>
        <div class="feature-card"><span class="tag">04 · Phản hồi và tự đánh giá</span><h3>Trắc nghiệm → Phân tích lỗi</h3><p>5 câu hỏi mỗi bài với phản hồi tức thời và giải thích 4 phương án, mục lỗi thường gặp và đánh dấu tiến độ cá nhân.</p></div>
      </div>
      <h2 class="section-heading">Lộ trình 5 module · 21 bài</h2>${courseMapHTML()}
      <div class="callout warn"><b>Lưu ý nguồn gốc:</b> Website được biên soạn dựa trên PRF192 và đối chiếu sách C đã cung cấp, không sao chép nguyên văn slide. Một số nội dung slide đã được sửa khi phát hiện điểm chưa chuẩn xác về C11. Xem <a href="#/sources">nhật ký hiệu chỉnh và nguồn</a>.</div>`;
  }
  function courseMapHTML(){return `<div class="course-map">${groups.map(g=>`<div class="module-bar"><span>${esc(g.id)} · ${esc(g.title)}</span><small>${g.to-g.from+1} bài</small></div><p class="module-intro">${esc(g.description)}</p>${DATA.lessons.filter(l=>l.module===g.id).map(l=>`<a class="course-row" href="#/lesson/${l.id}"><span>Slot ${String(l.number).padStart(2,'0')}</span><strong>${esc(l.title)}</strong><small>${done[l.id]?'✓ Đã học':l.minutes+' phút'}</small></a>`).join('')}`).join('')}</div>`;}
  function curriculumHTML(){return `<section class="lesson-page">${crumb([{text:'Bài giảng'}])}<h1>Lộ trình học 5 module, 21 bài (Slot 00–20)</h1><p>Mỗi bài được trình bày theo chu trình: bài toán kỹ thuật → phân tích IPO → mã giả → cú pháp → lưu đồ → chương trình C → kiểm thử → luyện tập → trắc nghiệm → rubric và phản tư. Giữ nguyên thứ tự Slot PRF192; phân nhóm thành 5 module để thuận tiện tự học.</p>${progressHTML()}${courseMapHTML()}<div class="callout"><b>Quy tắc thực hành:</b> Đọc yêu cầu, tự viết thuật toán, dự đoán kết quả, sao chép mã mẫu khi cần, chạy trên OnlineGDB và đối chiếu với ít nhất hai dữ liệu khác ngoài ví dụ.</div></section>`;}
  function rubricHTML(weights, labels){ return `<table class="rubric-table"><thead><tr><th>Tiêu chí</th><th>Điểm</th></tr></thead><tbody>${weights.map((v,i)=>`<tr><td>${esc((labels||[])[i] || ['Phân tích yêu cầu và dữ liệu','Cấu trúc mã và thuật toán','Kiểm thử, xử lý lỗi','Trình bày, giải thích kết quả'][i]||`Mục tiêu ${i+1}`)}</td><td>${v}</td></tr>`).join('')}<tr><th>Tổng</th><th>${weights.reduce((a,b)=>a+b,0)}</th></tr></tbody></table>`;}
  function practiceHTML(){return `<section class="lesson-page">${crumb([{text:'Thực hành'}])}<h1>Workshop và bài tập lớn</h1><p>Phần thực hành bám sát 5 Workshop và 2 phương án Assignment trong tài liệu PRF192, được chuyển ngữ và bổ sung yêu cầu kiểm thử. Mỗi nhiệm vụ có điều kiện hoàn thành, dữ liệu kiểm tra và khung mã ban đầu.</p><div class="callout warn"><strong>OnlineGDB:</strong> Chọn Language = C. Với bài tệp, tạo <code>data.txt</code> hoặc tệp tương ứng trong dự án qua mục New File. Với chương trình nhiều lượt nhập, sử dụng console hoặc Standard Input. Dữ liệu chương trình cần được lưu dự án hoặc sao lưu về máy nếu muốn sử dụng lại.</div>
    <h2>5 Workshop theo thứ tự kiến thức</h2>${DATA.workshops.map((w,i)=>`<article class="practice-card" id="${w.id}"><span class="lesson-kicker">WORKSHOP ${i+1} · Sau Slot ${String(w.after).padStart(2,'0')}</span><h2>${esc(w.title)}</h2><p>${esc(w.brief)}</p><h3>Mục tiêu</h3>${listItems(w.objectives)}<h3>Yêu cầu thực hiện</h3><ol>${w.requirements.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><details><summary class="link-green" style="cursor:pointer">Mở bộ khung chương trình (chưa phải lời giải)</summary>${codeBox(w.scaffold,'Khung bài làm C11')}</details><details><summary class="link-green" style="cursor:pointer">Mở dữ liệu kiểm thử dự kiến</summary>${listItems(w.testcases)}</details><h3>Rubric đề xuất (10 điểm)</h3>${rubricHTML(w.rubric)}<div class="meta-source">Nguồn: ${esc(w.source)}, biên soạn lại; rubric các Workshop do người biên soạn đề xuất.</div><a class="btn btn-primary" href="${onlineURL}" target="_blank" rel="noopener noreferrer">Thực hành Workshop ${i+1} trên OnlineGDB ↗</a></article>`).join('')}
    <h2>Hai phương án bài tập lớn</h2>${DATA.assignments.map((a,i)=>`<article class="practice-card" id="${a.id}"><span class="lesson-kicker">ASSIGNMENT · PHƯƠNG ÁN ${i+1}</span><h2>${esc(a.title)}</h2><p>${esc(a.brief)}</p><h3>Yêu cầu</h3><ol>${a.requirements.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><h3>Rubric theo tài liệu gốc (10 điểm)</h3>${rubricHTML(a.rubric, i===0?['Thiết kế struct và thao tác nhị phân cơ bản','Menu chương trình','Ghi đè và thêm bản ghi','Đọc và hiển thị bản ghi','Sửa bản ghi theo ID','Xử lý lỗi đầu vào và tệp','Kiểm thử và tổ chức mã']:['Thêm và hiển thị','Tìm kiếm theo ID/họ','Sắp xếp theo họ','Menu, xác thực dữ liệu và xử lý lỗi'])}<div class="callout warn"><b>Giới hạn kỹ thuật:</b> ${esc(a.note)}</div><div class="meta-source">Nguồn: ${esc(a.source)}. Không cung cấp lời giải hoàn chỉnh nhằm giữ tính đánh giá của assignment.</div><a class="btn btn-primary" href="${onlineURL}" target="_blank" rel="noopener noreferrer">Mở OnlineGDB để làm Assignment ↗</a></article>`).join('')}
    </section>`;}
  const glossary=[
    ['Algorithm','Thuật toán','Dãy hữu hạn các bước xác định để giải một bài toán.'],['Source code','Mã nguồn','Chương trình viết ở dạng ngôn ngữ lập trình trước khi dịch.'],['Compiler','Trình biên dịch','Công cụ chuyển mã nguồn thành mã đích phù hợp.'],['Preprocessor','Bộ tiền xử lý','Xử lý chỉ thị #include, #define và các chỉ thị tiền xử lý khác.'],['Linker','Trình liên kết','Ghép các thành phần mã đối tượng và tham chiếu thư viện cần thiết.'],['Variable','Biến','Đối tượng được đặt tên với kiểu và vùng lưu trữ khi tồn tại.'],['Type','Kiểu dữ liệu','Quy định cách diễn giải giá trị và những phép toán hợp lệ.'],['Expression','Biểu thức','Kết hợp toán hạng và toán tử tạo giá trị hoặc hiệu ứng.'],['Statement','Câu lệnh','Đơn vị cú pháp mô tả hành động hoặc điều khiển luồng.'],['Scope','Phạm vi','Vùng mã nguồn mà định danh có thể được sử dụng.'],['Storage duration','Thời gian lưu trữ','Khoảng thời gian tồn tại của đối tượng lưu trữ.'],['Function','Hàm','Đơn vị chương trình có giao diện và nhiệm vụ xác định.'],['Prototype','Nguyên mẫu hàm','Khai báo hàm để kiểm tra kiểu đối số và giá trị trả về.'],['Pass by value','Truyền theo giá trị','Hàm nhận giá trị đối số để khởi tạo tham số riêng.'],['Pointer','Con trỏ','Giá trị chỉ tới đối tượng hoặc hàm phù hợp.'],['Dereference','Giải tham chiếu','Truy cập đối tượng được trỏ tới thông qua toán tử *.'],['NULL','Con trỏ rỗng','Giá trị con trỏ không trỏ tới đối tượng hoặc hàm.'],['Undefined behavior','Hành vi không xác định','Tình huống tiêu chuẩn C không quy định kết quả cần xảy ra.'],['Array','Mảng','Tập hợp phần tử cùng kiểu bố trí liên tiếp.'],['Index','Chỉ số','Vị trí phần tử trong mảng, bắt đầu từ 0.'],['Struct','Kiểu cấu trúc','Kiểu dữ liệu gộp các trường có thể khác kiểu.'],['String','Chuỗi C','Dãy char kết thúc bằng byte NUL.'],['NUL','Byte 0','Byte kết thúc chuỗi C, viết dưới dạng ký tự \\0.'],['Buffer','Bộ đệm','Vùng nhớ tạm để chứa dữ liệu khi xử lý.'],['EOF','Dấu kết thúc tệp','Giá trị int đặc biệt các hàm đọc có thể trả về khi hết dữ liệu hoặc lỗi.'],['FILE','Luồng tệp','Kiểu thư viện chuẩn biểu diễn trạng thái một luồng.'],['Binary file','Tệp nhị phân','Tệp đọc/ghi theo chế độ nhị phân.'],['Unit test','Kiểm thử đơn vị','Kiểm tra hành vi của một đơn vị chức năng với dữ liệu xác định.'],['Walkthrough','Truy vết','Theo dõi lệnh và giá trị biến theo từng bước.'],['Robustness','Tính vững chắc','Khả năng xử lý dữ liệu bất thường theo yêu cầu thiết kế.']];
  function glossaryHTML(){return `<section class="lesson-page">${crumb([{text:'Thuật ngữ'}])}<h1>Bảng thuật ngữ lập trình C</h1><p>Thuật ngữ Việt–Anh dùng thống nhất trong 5 module / 21 bài. Một số thuật ngữ như NULL, NUL, EOF và undefined behavior phải được phân biệt chính xác.</p><div class="gloss-grid">${glossary.map(x=>`<div class="gloss"><strong>${esc(x[1])}</strong> <span class="en">(${esc(x[0])})</span><p>${esc(x[2])}</p></div>`).join('')}</div></section>`;}
  function sourcesHTML(){return `<section class="lesson-page">${crumb([{text:'Nguồn và kiểm định'}])}<h1>Nguồn học liệu và danh mục hiệu chỉnh</h1><p>Bộ bài giảng được biên soạn lại bằng tiếng Việt dựa trên các tệp PRF192 và sách tham khảo do người dùng cung cấp. Văn bản và mã ví dụ trong website được xây dựng mới; không nhúng nguyên văn các slide có bản quyền.</p><h2>1. Nguồn đối chiếu</h2><ol class="source-list">${DATA.references.map(r=>`<li><b>${esc(r.name)}</b><p class="note">${esc(r.detail)}</p></li>`).join('')}</ol><h2>2. Hiệu chỉnh kỹ thuật từ nguồn PRF192</h2><div style="overflow:auto"><table class="source-table"><thead><tr><th>Vị trí</th><th>Điểm cần sửa</th><th>Cách xử lý</th></tr></thead><tbody>${DATA.corrections.map(c=>`<tr><td>${esc(c.source)}</td><td>${esc(c.issue)}</td><td>${esc(c.revision)}</td></tr>`).join('')}</tbody></table></div><h2>3. Giới hạn kiểm định và giấy phép</h2><p>Ví dụ C11 trong website được biên dịch độc lập với GCC và chạy thử tự động khi xuất bản bản này; kết quả kỹ thuật nằm trong tệp QA_REPORT.md của gói tải. Điều đó không đồng nghĩa mọi bài tập chưa có lời giải đã được kiểm chứng, hoặc chương trình của sinh viên được chấm tự động bởi website.</p><div class="callout warn"><strong>Bản quyền:</strong> Không phát hành lại các tệp slide, sách PDF và đề gốc trong repository công khai nếu chưa có quyền. Mã website và nội dung soạn lại cần được người quản trị xác định giấy phép trước khi xuất bản chính thức.</div></section>`;}
  function guideHTML(){ const steps=[['Mở bài giảng','Chọn module M1–M5 và bài Slot 00–20 trong thanh mục lục hoặc trang Lộ trình.','Ở máy tính và điện thoại đều có thể mở nội dung theo đường dẫn #/lesson/slot-xx.'],['Đọc mục tiêu và học nội dung','Phân tích tình huống, IPO và tự viết mã giả; sau đó đọc mục tiêu, cú pháp và ví dụ.','Trước khi xem kết quả đầu ra, hãy tự dự đoán.'],['Sao chép chương trình','Ở khung mã chọn “Sao chép mã”.','Trình duyệt có thể yêu cầu quyền dùng Clipboard; nếu bị chặn, bôi đen mã và copy thủ công.'],['Thực thi trên OnlineGDB','Nhấn “Chạy trên OnlineGDB”; trang trình biên dịch mở ở tab mới.','Chọn Language C, dán mã vào main.c và nhấn Run. Nút này không tự điền mã vào trang OnlineGDB.'],['Cung cấp dữ liệu nhập','Nếu ví dụ có Standard Input, sao chép dữ liệu vào chế độ nhập phù hợp.','Với tệp, tạo tệp qua New File hoặc cho chương trình tự tạo như trong bài 19–20.'],['Tự kiểm tra và hoàn thành','Thực hiện ca kiểm thử, làm năm câu trắc nghiệm, ghi phản tư và đánh dấu đã học.','Các nút đánh dấu không gửi điểm lên máy chủ, dữ liệu lưu trong trình duyệt.']];return `<section class="lesson-page">${crumb([{text:'Hướng dẫn sử dụng'}])}<h1>Hướng dẫn học và thực hành trên OnlineGDB</h1><p>Không cần cài trình biên dịch. Website là nơi học và tự kiểm tra; OnlineGDB là nơi biên dịch/chạy/gỡ lỗi mã C.</p><div class="guide-steps">${steps.map((s,i)=>`<div class="guide-step"><div class="step-num">${i+1}</div><div><h3 style="margin:0">${esc(s[0])}</h3><p>${esc(s[1])}</p><p class="note">${esc(s[2])}</p></div></div>`).join('')}</div><a class="btn btn-primary" href="${onlineURL}" target="_blank" rel="noopener noreferrer">Mở OnlineGDB C Compiler ↗</a><h2>Lỗi thường gặp trên OnlineGDB</h2><div class="callout warn"><p><b>Runtime exceed:</b> Có thể do vòng lặp không dừng, chương trình chờ nhập nhưng không có dữ liệu, hoặc chương trình chạy quá lâu.</p><p><b>No such file:</b> Kiểm tra tên, vị trí và sự tồn tại của tệp cần đọc.</p><p><b>Không thấy đầu ra:</b> Kiểm tra dòng printf, dấu xuống dòng, dữ liệu nhập và thông báo compiler.</p></div><h2>GitHub Pages</h2><p>Đăng toàn bộ thư mục website lên nhánh mặc định của repository, giữ nguyên các đường dẫn tương đối. Trong Settings → Pages, chọn Deploy from a branch, chọn nhánh (thường là main) và /(root). URL có dạng <code>https://USERNAME.github.io/REPOSITORY/</code>. Có thể thử mở file index.html trên máy mà không cần máy chủ nhờ dữ liệu được tải từ script cục bộ.</p><p class="note">Website không gửi mã lên máy chủ của nhà trường; khi mở OnlineGDB, sinh viên chuyển sang dịch vụ bên ngoài và chịu điều khoản, chính sách của dịch vụ đó.</p></section>`;}
  function render(){const path=currentHash();const parts=path.replace(/^\//,'').split('/');let html;
    if(parts[0]==='lesson') {const l=DATA.lessons.find(x=>x.id===parts[1]);html=l?lessonHTML(l):notfound();document.getElementById('mobile-route-title').textContent=l?`Slot ${String(l.number).padStart(2,'0')}`:'Không tìm thấy bài';}
    else if(parts[0]==='curriculum'){html=curriculumHTML();document.getElementById('mobile-route-title').textContent='Lộ trình';}
    else if(parts[0]==='practice'||parts[0]==='workshop'||parts[0]==='assignment'){html=practiceHTML();document.getElementById('mobile-route-title').textContent='Thực hành';}
    else if(parts[0]==='glossary'){html=glossaryHTML();document.getElementById('mobile-route-title').textContent='Thuật ngữ';}
    else if(parts[0]==='sources'){html=sourcesHTML();document.getElementById('mobile-route-title').textContent='Nguồn & QA';}
    else if(parts[0]==='guide'){html=guideHTML();document.getElementById('mobile-route-title').textContent='Hướng dẫn';}
    else {html=homeHTML();document.getElementById('mobile-route-title').textContent='Trang chủ';}
    view.innerHTML=html;
    const lessonName=DATA.lessons.find(x=>x.id===parts[1])?.title;
    document.title=(parts[0]==='lesson' && lessonName?lessonName+' | ':'')+'Lập trình C căn bản · PRF192';
    highlightNav();closeMenu();window.scrollTo({top:0,behavior:'auto'});
  }
  function notfound(){return `<section class="lesson-page"><h1>Không tìm thấy trang</h1><a class="btn" href="#/home">Về trang chủ</a></section>`;}
  async function copyText(txt){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(txt);return true;}const node=document.createElement('textarea');node.value=txt;node.setAttribute('readonly','');node.style.position='fixed';node.style.top='-9999px';document.body.appendChild(node);node.select();const ok=document.execCommand('copy');node.remove();return ok;}catch(_){return false;}}
  view.addEventListener('click', async e=>{
    const btn=e.target.closest('[data-action]');if(!btn)return;
    const action=btn.dataset.action;
    if(action==='copy'||action==='copy-stdin'){
      const p=btn.closest('.code-frame,.callout');const textNode=action==='copy'?p?.querySelector('code'):p?.querySelector('pre');if(!textNode)return;
      const ok=await copyText(textNode.textContent);toast(ok?'Đã sao chép. Mở OnlineGDB và dán vào trình soạn thảo.':'Không sao chép tự động được; hãy chọn mã và nhấn Ctrl+C.');
    } else if(action==='done') {const id=btn.dataset.id;done[id]=!done[id];saveDone();navHTML(search.value);render();toast(done[id]?'Đã đánh dấu hoàn thành.':'Đã bỏ đánh dấu hoàn thành.');}
    else if(action==='reset-quiz'){const l=DATA.lessons.find(x=>currentHash().endsWith(x.id));if(l){l.quiz.forEach((_,i)=>delete quizAnswers[`${l.id}:${i}`]);render();}}
  });
  view.addEventListener('click', e=>{
    const jump=e.target.closest('button[data-scroll]');
    if(!jump)return;
    const target=document.getElementById(jump.dataset.scroll);
    target?.scrollIntoView({behavior:'smooth',block:'start'});
  });
  view.addEventListener('input', e=>{
    const el=e.target;
    if(el.matches('textarea[data-note]')){
      reflectionNotes[el.dataset.note]=el.value;
      try { localStorage.setItem(NOTES_KEY,JSON.stringify(reflectionNotes)); } catch(_) {}
    }
  });
  view.addEventListener('change', e=>{
    const inp=e.target;
    if(inp.matches('input[data-check]')) {
      const id=inp.dataset.lesson;activityState[id]=activityState[id]||{};activityState[id][inp.dataset.check]=inp.checked;
      try {localStorage.setItem(ACT_KEY,JSON.stringify(activityState));}catch(_) {toast('Không thể lưu danh sách tự kiểm.');}
      return;
    }
    if(inp.matches('.question-card input[type="radio"]')){
      const card=inp.closest('.question-card'),q=Number(card.dataset.quiz),path=currentHash(),l=DATA.lessons.find(x=>path.endsWith(x.id));
      if(l){quizAnswers[`${l.id}:${q}`]=Number(inp.value); const y=window.scrollY; const focused=document.activeElement; render();window.scrollTo(0,y); const replacement=view.querySelectorAll('.question-card')[q]?.querySelector(`input[value="${inp.value}"]`);replacement?.focus({preventScroll:true});}
    }
  });
  search.addEventListener('input',()=>navHTML(search.value));
  document.getElementById('menu-toggle').addEventListener('click',()=>{const open=sidebar.classList.toggle('open');document.getElementById('menu-toggle').setAttribute('aria-expanded',String(open));});
  document.getElementById('sidebar-close').addEventListener('click',closeMenu);
  window.addEventListener('hashchange',render);
  document.getElementById('build-label').textContent='Biên soạn '+DATA.updated+' · '+DATA.version;
  navHTML();render();
})();
