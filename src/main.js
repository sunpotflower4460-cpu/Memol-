import './style.css';
import source from '../public/opportunities.md?raw';
import { categories, parseMarkdown, status, remaining, selectItems, readState } from './data.js';
const paths = {
 search:'m21 21-4.5-4.5 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
 bookmark:'M6 3h12v18l-6-4-6 4z', compass:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M16 8l-2 6-6 2 2-6z',
 clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2', check:'m5 12 4 4L19 6', arrow:'M5 12h14m-5-5 5 5-5 5',
 mic:'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0z M5 10v2a7 7 0 0 0 14 0v-2 M12 19v3m-4 0h8',
 music:'M9 18V5l11-2v13 M9 8l11-2 M9 18a3 3 0 1 1-3-3h3 M20 16a3 3 0 1 1-3-3h3',
 book:'M12 5c-4-3-9-2-9-2v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2v16',
 spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z', game:'M7 7h10a4 4 0 0 1 4 3l1 7a3 3 0 0 1-5 2l-3-3h-4l-3 3a3 3 0 0 1-5-2l1-7a4 4 0 0 1 4-3 M5 11h6m-3-3v6m8-3h.1m3 3h.1',
 gift:'M3 8h18v4H3z M5 12v9h14v-9 M12 8v13 M12 8H8a3 3 0 1 1 3-3l1 3h4a3 3 0 1 0-3-3z',
 close:'m6 6 12 12M6 18 18 6', down:'m6 9 6 6 6-6', external:'M14 3h7v7m0-7L10 14 M10 3H3v18h18v-7', download:'M12 3v12m-5-5 5 5 5-5 M4 16v5h16v-5', info:'M12 8h.01 M12 11v6 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20', leaf:'M5 19C-1 9 8 2 21 3c1 13-7 20-16 16m0 0L16 8', calendar:'M4 5h16v16H4z M8 2v6m8-6v6M4 11h16', wifi:'M3 3l18 18 M2 8a17 17 0 0 1 4-2m4-1a17 17 0 0 1 12 3 M5 12a12 12 0 0 1 5-2m5 0a12 12 0 0 1 4 2 M8 16a7 7 0 0 1 8 0 M12 20h.01'
};
const icon = (name, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.spark}"/></svg>`;
const esc = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const items = parseMarkdown(source);
let storage;
try { storage = localStorage; } catch {}
let data = readState(storage);
let filter = { view:'discover', category:'', query:'', sort:'deadline', includeClosed:false };
let installPrompt;
const views = [{id:'discover',label:'見つける',icon:'compass'},{id:'upcoming',label:'締切が近い',icon:'clock'},{id:'saved',label:'お気に入り',icon:'bookmark'},{id:'applied',label:'応募済み',icon:'check'}];
const app = document.querySelector('#app');
app.innerHTML = `
<aside class="sidebar"><a class="brand" href="./" aria-label="Memol ホーム"><span class="brand-mark">m<span>•</span></span>Memol<span class="brand-dot">.</span></a><p class="brand-caption">ひらめきを、次の一歩に。</p><div class="nav-caption">MY WORKSPACE</div><nav class="side-nav" aria-label="メインメニュー">${views.map(v=>`<button data-view="${v.id}">${icon(v.icon)}<span>${v.label}</span>${v.id==='saved'?'<span class="saved-count"></span>':''}</button>`).join('')}</nav><div class="sidebar-note">${icon('leaf')}<strong>小さな「やってみたい」を<br>大きなきっかけに。</strong><p>あなたらしいチャンスを<br>ここから見つけよう。</p></div><button class="install-link" data-install>${icon('download')}ホーム画面に追加</button><span class="sidebar-footer">YOUR NEXT CHAPTER STARTS HERE</span></aside>
<div class="workspace"><header class="topbar"><span class="breadcrumb">ワークスペース <span>/</span> <b id="current-view">見つける</b></span><a href="./" class="mobile-brand">Memol<span>.</span></a><div class="topbar-right"><span id="connection" hidden>${icon('wifi')}オフライン</span><span class="today">${new Intl.DateTimeFormat('ja-JP',{month:'long',day:'numeric',weekday:'short',timeZone:'Asia/Tokyo'}).format(new Date())}</span><button class="mobile-install" data-install aria-label="ホーム画面に追加">${icon('download')}</button><span class="avatar" aria-label="マイワークスペース">M</span></div></header>
<main id="main"><section class="intro"><div><p class="eyebrow">A LITTLE CURIOSITY, A NEW POSSIBILITY</p><h1 id="page-title">次のチャンスを、見つけよう。</h1><p id="page-description">気になる公募やオーディションを、あなたの次の一歩へ。</p></div><span class="intro-art" aria-hidden="true">${icon('spark')}<i></i></span></section>
<section class="hero" aria-label="チャンスを探す"><div class="hero-copy"><span class="hero-label"><i></i> あなたの可能性、もっと広がる。</span><h2>その「好き」が、<br>新しい扉をひらく。</h2><p>音楽も、物語も、まだ名前のないアイデアも。<br>挑戦したい気持ちを、ここから。</p><button id="hero-action">締切が近いチャンスを見る ${icon('arrow')}</button></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="little-star star-one">✦</span><span class="little-star star-two">✧</span><div class="art-card card-back">${icon('music')}<span></span><span></span></div><div class="art-card card-front">${icon('spark')}<b>YOUR NEXT<br>CHAPTER</b><span></span><span></span><i>${icon('check')}</i></div><span class="art-caption">a possibility is waiting for you.</span></div></section>
<section class="stats" aria-label="応募情報の集計"><button data-stat="discover"><span class="stat-icon sage">${icon('compass')}</span><span>収録されたチャンス<strong>${items.length}<small>件</small></strong></span>${icon('arrow','stat-arrow')}</button><button data-stat="upcoming"><span class="stat-icon peach">${icon('clock')}</span><span>7日以内に締切<strong id="upcoming-count"></strong></span>${icon('arrow','stat-arrow')}</button><button data-stat="saved"><span class="stat-icon lavender">${icon('bookmark')}</span><span>お気に入り<strong id="saved-stat"></strong></span>${icon('arrow','stat-arrow')}</button></section>
<section class="finder" aria-label="応募情報の検索"><div class="section-heading"><div><h2 id="list-title">チャンスを探す</h2><span class="section-caption">あなたの興味から、次の一歩へ。</span></div><span class="source-date">情報収録：2026.11.06</span></div><div class="search-row"><label class="search">${icon('search')}<input id="search" type="search" placeholder="キーワードや主催者で検索" aria-label="キーワードや主催者で検索" autocomplete="off"><kbd>/</kbd></label><label class="sort-label">${icon('down')}<select id="sort" aria-label="並び順"><option value="deadline">締切が近い順</option><option value="name">名前順</option></select></label></div><div class="categories" role="group" aria-label="ジャンル">${[{name:'',label:'すべて',icon:'compass'}, ...categories].map(c=>`<button data-category="${c.name}" aria-pressed="false">${icon(c.icon)}${c.label}</button>`).join('')}</div><div class="results-bar"><p><strong id="result-count"></strong> 件のチャンス<span id="filter-caption"></span></p><label class="switch-label"><input type="checkbox" id="include-closed"><span class="switch"></span>終了した募集も表示</label></div><div id="results" class="results" aria-live="polite"></div></section>
<footer class="page-footer">${icon('info')}<p>締切の表示は日本時間・日付単位です。応募条件や締切時刻はリンク先でご確認ください。<br>お気に入り・応募状況・メモは、このブラウザに保存されます。</p><button id="backup">データを保存 ${icon('download')}</button><label class="restore">復元<input type="file" id="restore" accept="application/json,.json"></label></footer></main></div>
<nav class="bottom-nav" aria-label="スマホメニュー">${views.map(v=>`<button data-view="${v.id}">${icon(v.icon)}<span>${v.label}</span></button>`).join('')}</nav>
<dialog id="detail-dialog" aria-labelledby="detail-title"></dialog><dialog id="install-dialog" aria-labelledby="install-title"><button class="dialog-close" aria-label="閉じる">${icon('close')}</button><span class="dialog-symbol sage">${icon('download')}</span><h2 id="install-title">Memolを、いつも手元に。</h2><p>ホーム画面に追加すると、アプリのように開けます。一度読み込めば、オフラインでも一覧を確認できます。</p><div class="install-steps"><strong>iPhone・iPad（Safari）</strong><p>共有ボタン →「ホーム画面に追加」</p><strong>Android（Chrome）</strong><p>メニュー →「アプリをインストール」または「ホーム画面に追加」</p></div><p class="muted">HTTPSで公開されたURLから開いてください。保存したデータは端末間で自動同期されません。</p><button id="native-install" class="primary" hidden>この端末にインストール</button><button class="secondary dialog-done">わかりました</button></dialog><div id="toast" role="status"></div>`;
function persist() { try { if (!storage) throw new Error(); storage.setItem('memol-v1',JSON.stringify(data)); return true; } catch { toast('このブラウザには保存できません。データはページを閉じると失われます。'); return false; } }
let toastTimer;
function toast(message) { const el=document.querySelector('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),4000); }
function render() {
 const selected=selectItems(items,{...filter,...data});
 document.querySelectorAll('[data-view]').forEach(el=>{const active=el.dataset.view===filter.view;el.classList.toggle('active',active);el.setAttribute('aria-current',active?'page':'false');});
 document.querySelectorAll('[data-category]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.category===filter.category)));
 const count=Object.values(data.saved).filter(Boolean).length;
 document.querySelector('.saved-count').textContent=count;
 document.querySelector('#saved-stat').innerHTML=`${count}<small>件</small>`;
 document.querySelector('#upcoming-count').innerHTML=`${selectItems(items,{view:'upcoming'}).length}<small>件</small>`;
 const view=views.find(v=>v.id===filter.view);document.querySelector('#current-view').textContent=view.label;
 const titles={discover:'チャンスを探す',upcoming:'締切が近いチャンス',saved:'お気に入りのチャンス',applied:'応募済みのチャンス'};
 document.querySelector('#list-title').textContent=titles[filter.view];
 document.querySelector('#result-count').textContent=selected.length;
 document.querySelector('#filter-caption').textContent=filter.category?` / ${categories.find(c=>c.name===filter.category).label}`:'';
 document.querySelector('#results').innerHTML=selected.length?selected.map(item=>{
 const c=categories.find(c=>c.name===item.category),s=status(item),days=remaining(item),saved=!!data.saved[item.id];
 const urgent=days!==null&&days>=0&&days<=7&&s!=='募集開始前';
 return `<article class="opportunity ${s==='終了'?'closed':''}"><div class="card-top"><span class="category-icon ${c.color}">${icon(c.icon)}</span><span class="category-name">${c.label}</span><button class="bookmark ${saved?'is-saved':''}" data-save="${esc(item.id)}" aria-label="${esc(item.title)}を${saved?'お気に入りから削除':'お気に入りに追加'}" aria-pressed="${saved}">${icon('bookmark')}</button></div><button class="card-title" data-detail="${esc(item.id)}"><h3>${esc(item.title)}</h3></button><p class="organizer">${esc(item.organizer)}</p><div class="card-meta"><span class="status ${urgent?'urgent':''} ${s==='終了'?'ended':''}"><i></i>${data.applied[item.id]?'応募済み':s}</span>${urgent?`<span class="days">${days===0?'今日まで':`あと${days}日`}</span>`:''}</div><div class="card-bottom"><span>${icon('calendar')}<span>${item.deadline?esc(item.deadline.replaceAll('-','.')):esc(item.deadlineText)}<small>締切</small></span></span><button data-detail="${esc(item.id)}" aria-label="${esc(item.title)}の詳細を見る">詳細を見る ${icon('arrow')}</button></div></article>`;
 }).join(''):`<div class="empty">${icon(filter.view==='saved'?'bookmark':'search')}<h3>${filter.view==='saved'&&!filter.query&&!filter.category?'気になるチャンスを、ここに。':'該当するチャンスがありません'}</h3><p>${filter.view==='saved'?'カードのしおりマークを押して保存できます。':'キーワードやジャンル、表示条件を変えて探してみましょう。'}</p><button id="reset-filter" class="secondary">${filter.view==='saved'||filter.view==='applied'?'チャンスを探す':'検索条件をリセット'}</button></div>`;
}
function changeView(view) {filter.view=view;render();document.querySelector('.finder').scrollIntoView({behavior:'smooth',block:'start'});}
function openDetail(id) {
 const item=items.find(i=>i.id===id);if(!item)return;
 const c=categories.find(c=>c.name===item.category),dialog=document.querySelector('#detail-dialog');
 dialog.innerHTML=`<button class="dialog-close" aria-label="閉じる">${icon('close')}</button><span class="dialog-symbol ${c.color}">${icon(c.icon)}</span><span class="detail-category">${c.label} / ${status(item)}</span><h2 id="detail-title">${esc(item.title)}</h2><dl><div><dt>主催</dt><dd>${esc(item.organizer)}</dd></div><div><dt>締切</dt><dd>${esc(item.deadlineText)}<small>締切時刻・応募条件は公式情報をご確認ください。</small></dd></div></dl><div class="detail-actions"><button class="secondary ${data.saved[id]?'selected':''}" id="detail-save" aria-pressed="${!!data.saved[id]}">${icon('bookmark')}${data.saved[id]?'お気に入りに保存済み':'お気に入りに保存'}</button><label class="applied-toggle"><input id="applied" type="checkbox" ${data.applied[id]?'checked':''}>応募済みにする</label></div><label class="note-label" for="note">自分用メモ<span id="note-status">この端末に保存</span></label><textarea id="note" placeholder="応募の準備や、気になったことをメモ…" maxlength="5000">${esc(data.notes[id]||'')}</textarea><a class="primary official-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">応募情報を確認する ${icon('external')}</a><p class="detail-disclaimer">外部サイトが新しいタブで開きます。募集の最新状況をご確認ください。</p>`;
 dialog.querySelector('#detail-save').onclick=()=>{data.saved[id]=!data.saved[id];persist();render();const button=dialog.querySelector('#detail-save');button.innerHTML=`${icon('bookmark')}${data.saved[id]?'お気に入りに保存済み':'お気に入りに保存'}`;button.setAttribute('aria-pressed',String(data.saved[id]));};
 dialog.querySelector('#applied').onchange=e=>{data.applied[id]=e.target.checked;persist();render();};
 dialog.querySelector('#note').oninput=e=>{data.notes[id]=e.target.value;dialog.querySelector('#note-status').textContent=persist()?'保存しました':'保存できません';};
 if(!dialog.open)dialog.showModal();
}
app.addEventListener('click',e=>{
 const view=e.target.closest('[data-view]');if(view)changeView(view.dataset.view);
 const stat=e.target.closest('[data-stat]');if(stat)changeView(stat.dataset.stat);
 const category=e.target.closest('[data-category]');if(category){filter.category=category.dataset.category;render();}
 const save=e.target.closest('[data-save]');if(save){const id=save.dataset.save;data.saved[id]=!data.saved[id];const ok=persist();render();if(ok)toast(data.saved[id]?'お気に入りに保存しました':'お気に入りから削除しました');}
 const detail=e.target.closest('[data-detail]');if(detail)openDetail(detail.dataset.detail);
 if(e.target.closest('.dialog-close, .dialog-done'))e.target.closest('dialog').close();
 if(e.target.closest('[data-install]'))document.querySelector('#install-dialog').showModal();
 if(e.target.closest('#reset-filter')){filter={view:'discover',category:'',query:'',sort:'deadline',includeClosed:false};document.querySelector('#search').value='';document.querySelector('#include-closed').checked=false;document.querySelector('#sort').value='deadline';render();}
});
document.querySelector('#search').oninput=e=>{filter.query=e.target.value;render();};
document.querySelector('#sort').onchange=e=>{filter.sort=e.target.value;render();};
document.querySelector('#include-closed').onchange=e=>{filter.includeClosed=e.target.checked;render();};
document.querySelector('#hero-action').onclick=()=>changeView('upcoming');
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
document.addEventListener('keydown',e=>{if(e.key==='/'&&!document.querySelector('dialog[open]')&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();document.querySelector('#search').focus();}});
document.querySelector('#backup').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,...data},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='memol-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
document.querySelector('#restore').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>2000000)throw new Error();const json=JSON.parse(await file.text());if(json.version!==1||!json.saved||!json.applied||!json.notes)throw new Error();const restored=readState({getItem:()=>JSON.stringify(json)});for(const key of ['saved','applied','notes'])data[key]={...data[key],...restored[key]};if(persist())toast('バックアップを復元しました');render();}catch{toast('Memolのバックアップファイルを選んでください。');}finally{e.target.value='';}};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;document.querySelector('#native-install').hidden=false;});
document.querySelector('#native-install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;document.querySelector('#native-install').hidden=true;}};
function connection(){document.querySelector('#connection').hidden=navigator.onLine;}
window.addEventListener('online',connection);window.addEventListener('offline',connection);connection();
window.addEventListener('storage',e=>{if(e.key==='memol-v1'){data=readState(storage);render();}});
// Re-evaluate deadlines when returning to the app or crossing midnight.
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});setInterval(render,60000);
render();
if('serviceWorker' in navigator && import.meta.env.PROD)navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(()=>toast('オフライン利用の準備ができませんでした。オンラインでは利用できます。'));
