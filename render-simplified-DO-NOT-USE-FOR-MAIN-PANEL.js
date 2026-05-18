const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');
const outPath = path.join(__dirname, 'index.html');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const statusMap = {
  critical: ['🔴', 'Crítico', 'red'],
  attention: ['🟠', 'Atenção', 'orange'],
  on_track: ['🟢', 'No trilho', 'green'],
  standby: ['⚫', 'Standby', 'gray'],
  done: ['✅', 'Concluído', 'cyan']
};
const prioLabel = { p0:'P0', p1:'P1', p2:'P2', p3:'P3' };
const icons = {
  'low-tickets':'🛒','sniper-vip':'🎯','diplomado-ortho-pro':'🎓','plataforma-assinatura':'🎬','chile-cioch':'🇨🇱','sniper-elite':'💎','ortoplanner':'🧠','plataforma-app':'📱','lancamentos':'🚀'
};

const fronts = data.fronts || [];
const gargalos = data.gargalos?.length ? data.gargalos : fronts.filter(f => ['critical','attention'].includes(f.status)).slice(0,4).map(f => ({ title:f.name, priority:f.priority, frente:f.name, deadline:'A revisar', blocks:f.blockers?.[0] || 'Definir próximo destravamento', owner:f.owner || 'Ruan / TAOS' }));
const radar = data.radarDoDia?.length ? data.radarDoDia : [
  {time:'Hoje', task:'Consolidar migração Claude → TAOS', frente:'⚙️ INFRA', status:'✅', done:true},
  {time:'Próximo', task:'Receber/exportar histórico do Claude em blocos ou arquivo', frente:'🧠 MEM', status:'⏳'},
  {time:'Próximo', task:'Validar primeira versão do painel persistente', frente:'📊 PAINEL', status:'⏳'}
];
const stats = data.metrics || {};

const frontCard = (f, i) => {
  const [emoji, label, color] = statusMap[f.status] || ['⚪','Mapear','gray'];
  const actions = f.nextActions?.length ? f.nextActions : ['Mapear próximos passos com Ruan'];
  const blockers = f.blockers?.length ? f.blockers : [];
  return `<article class="frente-card ${i < 3 ? 'expanded' : ''}" data-status="${esc(f.status)}" data-prio="${esc(f.priority)}">
    <button class="frente-head" type="button">
      <div class="frente-title"><span class="chev">›</span><span class="frente-icon">${icons[f.id] || '•'}</span><span><strong>${esc(f.name)}</strong><small>${esc(f.summary || '')}</small></span></div>
      <div class="frente-meta"><span class="health ${color}">${emoji} ${label}</span><span class="prio ${esc(f.priority)}">${prioLabel[f.priority] || f.priority || 'P?'}</span></div>
    </button>
    <div class="frente-body"><div class="cols">
      <div class="col"><h4>Em execução</h4>${actions.map(a=>`<div class="task">${esc(a)}</div>`).join('')}</div>
      <div class="col"><h4>Aguardando</h4>${blockers.map(b=>`<div class="task wait">${esc(b)}</div>`).join('') || '<div class="empty">Sem bloqueio registrado</div>'}</div>
      <div class="col"><h4>Próximo</h4><div class="task">Atualizar status operacional</div></div>
      <div class="col"><h4>Done</h4><div class="empty">A consolidar</div></div>
    </div></div>
  </article>`;
};

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Painel XDental · TAOS</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700;800&family=Geist+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
*{box-sizing:border-box}body{margin:0;background:#0a0612;color:#e9e5f5;font-family:Inter,system-ui,sans-serif;line-height:1.45;min-height:100vh}body:before{content:"";position:fixed;inset:0;background:radial-gradient(circle at 15% 20%,rgba(139,92,246,.11),transparent 38%),radial-gradient(circle at 85% 80%,rgba(192,132,252,.07),transparent 42%),linear-gradient(rgba(139,92,246,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.03) 1px,transparent 1px);background-size:auto,auto,80px 80px,80px 80px;pointer-events:none}.wrap{max-width:1440px;margin:0 auto;padding:32px;position:relative}.top{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:24px}.brand{display:flex;gap:16px;align-items:center}.mark{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#8b5cf6,#a78bfa,#c084fc);display:grid;place-items:center;font:800 25px 'Bricolage Grotesque';box-shadow:0 12px 38px rgba(167,139,250,.35)}h1,h2,h3{font-family:'Bricolage Grotesque',sans-serif;margin:0;letter-spacing:-.02em}h1{font-size:30px}.sub,.muted{color:#8f82b3}.mono{font-family:'Geist Mono',monospace}.pills{display:flex;flex-direction:column;gap:8px;align-items:flex-end}.pill{border:1px solid rgba(139,92,246,.18);background:#1f1538;border-radius:999px;padding:8px 14px;font:12px 'Geist Mono';color:#a89cc7}.dot{display:inline-block;width:7px;height:7px;background:#4ade80;border-radius:50%;box-shadow:0 0 10px #4ade80;margin-right:7px}.alert,.card,.frente-card{background:#1f1538;border:1px solid rgba(139,92,246,.16);border-radius:18px;box-shadow:0 0 0 1px rgba(167,139,250,.05),0 8px 30px rgba(139,92,246,.08)}.alert{padding:15px 18px;margin:20px 0 28px;background:linear-gradient(90deg,rgba(167,139,250,.13),rgba(167,139,250,.04))}.filters{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:26px}.filter{background:#1a1030;border:1px solid rgba(139,92,246,.2);color:#a89cc7;border-radius:9px;padding:7px 12px;font-weight:600;cursor:pointer}.filter.active{background:linear-gradient(135deg,#8b5cf6,#a78bfa);color:white}.grid{display:grid;grid-template-columns:2fr 1fr;gap:22px;margin-bottom:28px}@media(max-width:900px){.grid{grid-template-columns:1fr}.wrap{padding:20px}.pills{align-items:flex-start}}.card{padding:24px}.section{font:600 12px 'Geist Mono';text-transform:uppercase;letter-spacing:.12em;color:#a78bfa;margin-bottom:16px}.pulse{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}@media(max-width:640px){.pulse{grid-template-columns:1fr}}.pulse-item,.stat,.gargalo,.task,.col{background:#110a1f;border:1px solid rgba(139,92,246,.16);border-radius:12px}.pulse-item{padding:15px}.pulse-head{display:flex;justify-content:space-between;margin-bottom:10px;font-weight:700}.bar{height:7px;background:rgba(167,139,250,.12);border-radius:99px;overflow:hidden}.fill{height:100%;border-radius:99px;background:linear-gradient(135deg,#8b5cf6,#a78bfa,#c084fc);box-shadow:0 0 12px rgba(167,139,250,.4)}.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.stat{padding:16px}.num{font:800 30px 'Bricolage Grotesque'}.p0{color:#f87171}.p1{color:#fb923c}.p2{color:#facc15}.p3{color:#4ade80}.cyan{color:#22d3ee}.label{font:10px 'Geist Mono';color:#6b5d8c;text-transform:uppercase;letter-spacing:.08em}.gargalos{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;margin-bottom:30px}.gargalo{padding:18px;border-left:3px solid #fb923c}.gargalo.p0{border-left-color:#f87171}.gargalo h3{font-size:17px;margin-bottom:10px}.meta{display:grid;grid-template-columns:80px 1fr;gap:7px 10px;font-size:13px}.key{font:10px 'Geist Mono';color:#6b5d8c;text-transform:uppercase}.radar-list{list-style:none;margin:0;padding:0}.radar-item{display:grid;grid-template-columns:80px 1fr 100px 34px;gap:12px;padding:13px 14px;border-radius:12px;border:1px solid transparent}.radar-item:hover{background:#2a1d4d;border-color:rgba(139,92,246,.2)}.radar-item.done{opacity:.55;text-decoration:line-through}.time{font:12px 'Geist Mono';color:#c4b5fd}.tag{font:11px 'Geist Mono';color:#8f82b3;background:#110a1f;border:1px solid rgba(139,92,246,.16);border-radius:7px;padding:4px 8px;text-align:center}.kanban-title{display:flex;align-items:baseline;gap:12px;margin:30px 0 16px}.actions{text-align:right;margin-bottom:12px}.smallbtn{font:11px 'Geist Mono';border:1px solid rgba(139,92,246,.2);background:transparent;color:#8f82b3;border-radius:7px;padding:6px 10px;cursor:pointer}.frente-card{margin-bottom:12px;overflow:hidden}.frente-head{width:100%;display:flex;justify-content:space-between;gap:12px;align-items:center;background:transparent;color:inherit;border:0;padding:18px 22px;text-align:left;cursor:pointer}.frente-title{display:flex;align-items:center;gap:12px}.frente-title strong{display:block;font:700 18px 'Bricolage Grotesque'}.frente-title small{display:block;color:#8f82b3;margin-top:2px}.chev{font-size:28px;color:#8f82b3;transition:.25s}.expanded .chev{transform:rotate(90deg);color:#c4b5fd}.frente-icon{width:40px;height:40px;border-radius:11px;background:#110a1f;border:1px solid rgba(139,92,246,.25);display:grid;place-items:center;font-size:20px}.frente-meta{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.health,.prio{font:11px 'Geist Mono';border:1px solid rgba(139,92,246,.18);background:#110a1f;border-radius:7px;padding:5px 8px}.green{color:#4ade80}.orange{color:#fb923c}.red{color:#f87171}.gray{color:#8f82b3}.frente-body{display:none}.expanded .frente-body{display:block}.cols{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:0 22px 22px}@media(max-width:980px){.cols{grid-template-columns:repeat(2,1fr)}}@media(max-width:580px){.cols{grid-template-columns:1fr}.radar-item{grid-template-columns:1fr}.top{display:block}.brand{margin-bottom:14px}}.col{padding:13px;min-height:90px}.col h4{font:600 10px 'Geist Mono';text-transform:uppercase;color:#8f82b3;letter-spacing:.09em;margin:0 0 10px;border-bottom:1px solid rgba(139,92,246,.16);padding-bottom:9px}.task{padding:10px 11px;margin-bottom:7px;color:#d8d1eb;font-size:13px;background:#1f1538}.task.wait{border-left:2px solid #facc15}.empty{font-size:12px;color:#6b5d8c}.footer{text-align:center;border-top:1px solid rgba(139,92,246,.16);margin-top:30px;padding:22px;color:#6b5d8c;font:11px 'Geist Mono'}
</style></head><body><main class="wrap">
<header class="top"><div class="brand"><div class="mark">X</div><div><h1>${esc(data.dashboard.name)}</h1><div class="sub mono">v${esc(data.dashboard.version)} · TAOS · Google Workspace conectado</div></div></div><div class="pills"><div class="pill"><span class="dot"></span>Atualizado ${esc(data.dashboard.lastUpdated)}</div><div class="pill">📅 Painel persistente · 9 frentes</div></div></header>
<div class="alert"><strong>📅 ${esc(data.dashboard.headline || 'Painel persistente operacional')}</strong></div>
<nav class="filters"><button class="filter active" data-filter="all">Todas</button><button class="filter" data-filter="critical">🔴 Críticas</button><button class="filter" data-filter="attention">🟠 Atenção</button><button class="filter" data-filter="on_track">🟢 No trilho</button><button class="filter" data-filter="standby">⚫ Standby</button></nav>
<section class="grid"><div class="card"><div class="section">Pulso da Semana</div><div class="pulse">${fronts.slice(0,4).map((f,idx)=>`<div class="pulse-item"><div class="pulse-head"><span>${icons[f.id]||''} ${esc(f.name)}</span><span class="muted mono">${f.progress ?? [60,80,15,45][idx]}%</span></div><div class="bar"><div class="fill" style="width:${f.progress ?? [60,80,15,45][idx]}%"></div></div></div>`).join('')}</div></div><div class="card"><div class="section">Indicadores</div><div class="stats"><div class="stat"><div class="num p0">${stats.p0??0}</div><div class="label">P0 abertos</div></div><div class="stat"><div class="num p1">${stats.p1??0}</div><div class="label">P1 abertos</div></div><div class="stat"><div class="num p2">${stats.tasks??0}</div><div class="label">Tarefas</div></div><div class="stat"><div class="num cyan">${stats.done??0}</div><div class="label">Done</div></div></div></div></section>
<section><div class="section">🚨 Gargalos Ativos</div><div class="gargalos">${gargalos.map(g=>`<article class="gargalo ${esc(g.priority)}"><h3>${esc(g.title)}</h3><div class="meta"><span class="key">Frente</span><span>${esc(g.frente)}</span><span class="key">Deadline</span><span>${esc(g.deadline)}</span><span class="key">Bloqueia</span><span>${esc(g.blocks)}</span><span class="key">Owner</span><span>${esc(g.owner)}</span></div></article>`).join('')}</div></section>
<section class="card"><div class="section">📌 Radar de Hoje</div><ul class="radar-list">${radar.map(r=>`<li class="radar-item ${r.done?'done':''}"><span class="time">${esc(r.time)}</span><span>${esc(r.task)}</span><span class="tag">${esc(r.frente)}</span><span>${esc(r.status||'⏳')}</span></li>`).join('')}</ul>${data.radarExtra ? `<div class="task" style="margin-top:14px">📡 ${esc(data.radarExtra)}</div>` : ''}</section>
<section><h2 class="kanban-title">🎯 Kanban por Frente <span class="muted mono">${fronts.length} frentes ativas</span></h2><div class="actions"><button class="smallbtn" id="expand">Expandir todas</button> <button class="smallbtn" id="collapse">Recolher todas</button></div>${fronts.map(frontCard).join('')}</section>
<footer class="footer">TAOS · Painel XDental persistente · alterações reais em Workspace somente com autorização explícita do Ruan</footer>
</main><script>
(() => {
  const root = document;
  const EXPANDED_KEY = 'xdental_expanded_frentes_v1';

  function getExpanded(){
    try { return JSON.parse(localStorage.getItem(EXPANDED_KEY) || '[]'); }
    catch { return []; }
  }

  function setExpanded(arr){
    try { localStorage.setItem(EXPANDED_KEY, JSON.stringify(arr)); }
    catch {}
  }

  function syncExpandedFromDom(){
    const ids = [...root.querySelectorAll('.frente-card.expanded')].map(c => c.dataset.id || c.dataset.status + '-' + [...root.querySelectorAll('.frente-card')].indexOf(c));
    setExpanded(ids);
  }

  const frentes = [...root.querySelectorAll('.frente-card')];
  frentes.forEach((card, idx) => {
    card.dataset.id = card.querySelector('.frente-title strong')?.textContent?.trim() || 'frente-' + idx;
  });

  const saved = getExpanded();
  if (saved.length) {
    frentes.forEach(card => card.classList.toggle('expanded', saved.includes(card.dataset.id)));
  }

  root.querySelectorAll('.frente-head').forEach(head => {
    head.addEventListener('click', () => {
      head.closest('.frente-card').classList.toggle('expanded');
      syncExpandedFromDom();
    });
  });

  root.getElementById('expand').onclick = () => {
    frentes.forEach(c => c.classList.add('expanded'));
    syncExpandedFromDom();
  };

  root.getElementById('collapse').onclick = () => {
    frentes.forEach(c => c.classList.remove('expanded'));
    setExpanded([]);
  };

  root.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      frentes.forEach(card => {
        const match = f === 'all' || card.dataset.status === f;
        card.style.display = match ? 'block' : 'none';
        if (match && f !== 'all') card.classList.add('expanded');
      });
      syncExpandedFromDom();
    });
  });
})();
</script></body></html>`;
fs.writeFileSync(outPath, html);
console.log(outPath);
