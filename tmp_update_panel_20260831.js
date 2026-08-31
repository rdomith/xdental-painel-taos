const fs = require('fs');
const path = require('path');

const repo = '/root/.openclaw/workspace/projects/xdental-painel-taos';

const fronts = [
  {
    id: 'calendario-31-08-diplomado-elite-financeiro',
    filter: 'calendario',
    icon: '📅',
    name: 'Calendário 31/08 · Diplomado, Elite e fechamento',
    status: 'risk',
    priority: 'p0',
    progress: 42,
    owner: 'Ruan / TAOS / Operação',
    summary: 'Hoje tem quatro itens de calendário: prova M08, galeria Elite, PDF M09 e fechamento Fabinho. O ponto sensível é separar execução operacional de qualquer repasse financeiro, que precisa de aprovação do Ruan.',
    exec: [
      'Diplomado M08: preparar prova hoje para liberar aos alunos em 03/09.',
      'Elite: extrair casos e atualizar galeria.',
      'Diplomado M09: iniciar PDF do módulo.',
      'Fechamento Fabinho: preparar conferência/entrega e deixar repasse apenas para aprovação do Ruan.'
    ],
    wait: [
      'Confirmação de prova M08 pronta no ambiente correto antes de 03/09.',
      'Evidência do arquivo final/aprovado do M09 antes de qualquer pagamento de professor em 01/09.',
      'Aprovação explícita do Ruan para qualquer operação financeira ligada ao fechamento Fabinho.'
    ],
    next: [
      '03/09: liberar prova M08 aos alunos.',
      '08/09: liberar módulo M09 aos alunos.',
      '10/09: encerrar prova M08.',
      '11/09: reunião semanal de sócios.'
    ],
    done: [
      'Calendar rdomith@gmail.com conferido de 31/08 a 12/09.'
    ]
  },
  {
    id: 'lancamento-12-09-aquecimento-mini-implantes',
    filter: 'setembro',
    icon: '🚀',
    name: 'Lançamento 12/09 · aquecimento Mini-Implantes',
    status: 'risk',
    priority: 'p0',
    progress: 35,
    owner: 'Ruan / TAOS / Batista / Adônio',
    summary: 'Prioridade comercial do dia: revisar o plano de aquecimento e começar a rodar a preparação do lançamento pago de 12/09, Formação Prática em Mini-Implantes.',
    exec: [
      'Revisar o plano de aquecimento do lançamento de 12/09.',
      'Transformar o plano em calendário de ações até 12/09.',
      'Produzir mais testes para criativos/campanhas.',
      'Preparar pauta da reunião com Batista sobre campanhas e testes.'
    ],
    wait: [
      'Rascunhos adicionais que o Ruan comentou que vai passar depois.',
      'Direção final das campanhas após reunião com Batista.',
      'Validação da reunião das 16h com Adônio sobre testes/extensão do lançamento.'
    ],
    next: [
      'Após reunião com Batista: converter decisões em tarefas de tráfego no painel.',
      'Após reunião com Adônio às 16h: atualizar bloco de testes, pendências e responsáveis.',
      'Garantir que aquecimento tenha cadência diária até 12/09.'
    ],
    done: [
      'Data do lançamento confirmada no Calendar: 12/09/2026.'
    ]
  },
  {
    id: 'diplomado-m09-m10-risco-liberacao',
    filter: 'diplomado',
    icon: '🎓',
    name: 'Diplomado · M09 e M10 próximos marcos',
    status: 'risk',
    priority: 'p0',
    progress: 30,
    owner: 'Ruan / TAOS / Mônica / Felipe',
    summary: 'M09 tem liberação em 08/09. Se PDF, upload e checklist final não andarem esta semana, vira atraso visível para aluno.',
    exec: [
      'M09: iniciar PDF do módulo hoje.',
      'M09: checar arquivo final, edição, upload e agendamento na Hotmart.',
      'M08: preparar/liberar prova e garantir encerramento em 10/09.',
      'M10: confirmar com Dr. Sérgio Cury em 05/09.'
    ],
    wait: [
      'Confirmação de gravação/edit final do M09.',
      'Confirmação de PDF/material complementar do M09.',
      'Confirmação de upload/agendamento antes de 07/09.'
    ],
    next: [
      '06/09: checkpoint final pré-liberação M09.',
      '07/09: subir módulo M09 na Hotmart.',
      '08/09: liberar M09 aos alunos.',
      '05/10: próxima liberação M10.'
    ],
    done: []
  },
  {
    id: 'reunioes-e-decisoes-do-dia-31-08',
    filter: 'reunioes',
    icon: '🧭',
    name: 'Reuniões do dia · Batista e Adônio',
    status: 'attention',
    priority: 'p1',
    progress: 25,
    owner: 'Ruan / TAOS',
    summary: 'As reuniões de hoje precisam virar decisão operacional no painel, não só conversa solta. Batista mexe no tráfego; Adônio fecha revisão de testes/extensão às 16h.',
    exec: [
      'Reunião da manhã com Batista: revisar campanhas, testes e próximos criativos.',
      'Reunião 16h com Adônio: revisar parte dos testes/extensão do lançamento.',
      'Registrar decisões das duas reuniões como próximos passos objetivos.'
    ],
    wait: [
      'Outputs da reunião com Batista.',
      'Outputs da reunião das 16h com Adônio.',
      'Rascunhos adicionais prometidos pelo Ruan.'
    ],
    next: [
      'Depois de cada reunião: atualizar responsáveis, prazo e status.',
      'Separar o que é P0 de hoje do que entra como cadência de aquecimento.'
    ],
    done: []
  }
];

const radar = [
  ['Hoje', 'Diplomado M08', 'calendario', 'Preparar prova do M08 para liberação aos alunos em 03/09.', '🔥'],
  ['Hoje', 'Elite', 'calendario', 'Extrair casos e atualizar galeria do Elite.', '🔥'],
  ['Hoje', 'Diplomado M09', 'diplomado', 'Iniciar PDF do módulo M09.', '🔥'],
  ['Hoje', 'Fechamento Fabinho', 'calendario', 'Preparar conferência/entrega do fechamento; qualquer repasse financeiro fica pendente de aprovação do Ruan.', '⚠️'],
  ['Agora', 'Aquecimento 12/09', 'setembro', 'Revisar o plano de aquecimento da Formação Prática em Mini-Implantes.', '🔥'],
  ['Hoje', 'Aquecimento 12/09', 'setembro', 'Transformar o plano de aquecimento em calendário de ações até 12/09.', '🔥'],
  ['Hoje', 'Testes/campanhas', 'setembro', 'Produzir mais testes para criativos e campanhas do lançamento.', '🔥'],
  ['Manhã', 'Batista', 'reunioes', 'Usar a reunião com Batista para fechar direção de campanhas, testes e próximos criativos.', '📌'],
  ['16h', 'Adônio', 'reunioes', 'Revisar com Adônio a parte dos testes/extensão do lançamento.', '📌'],
  ['01/09', 'Diplomado M09', 'diplomado', 'Programar pagamento do professor somente se arquivo final estiver entregue/aprovado e com aprovação do Ruan.', '⚠️'],
  ['03/09', 'Diplomado M08', 'diplomado', 'Liberar prova M08 aos alunos.', '📅'],
  ['05/09', 'Diplomado M10', 'diplomado', 'Confirmar com Dr. Sérgio Cury o M10.', '📅'],
  ['06/09', 'Diplomado M09', 'diplomado', 'Fazer checkpoint final pré-liberação do M09.', '📅'],
  ['07/09', 'Diplomado M09', 'diplomado', 'Subir módulo M09 na Hotmart.', '📅'],
  ['08/09', 'Diplomado M09', 'diplomado', 'Liberar módulo M09 aos alunos.', '🔥'],
  ['10/09', 'Diplomado M08', 'diplomado', 'Encerrar prova M08.', '📅'],
  ['12/09', 'Lançamento', 'setembro', 'Lançamento pago pré-Black / Formação Prática em Mini-Implantes.', '🔥']
];

const data = {
  dashboard: {
    name: 'Painel Operacional XDental',
    version: '2.31-radar-2026-08-31',
    lastUpdated: '2026-08-31 · demandas do dia',
    owner: 'Ruan Domith',
    operator: 'TAOS',
    status: 'operational',
    headline: 'Foco do dia: calendário operacional, plano de aquecimento do lançamento 12/09, testes/campanhas e reuniões com Batista e Adônio.'
  },
  fronts,
  gargalos: [
    {
      title: 'M09 libera em 08/09 e ainda precisa de PDF/upload/checkpoint final',
      filter: 'diplomado',
      frente: 'Diplomado Ortho Pro',
      deadline: '08/09/2026',
      blocks: 'Sem PDF, arquivo final e upload/agendamento fechados esta semana, o atraso vira experiência ruim para aluno.',
      owner: 'Ruan / TAOS / Mônica / Felipe'
    },
    {
      title: 'Aquecimento do lançamento 12/09 precisa começar agora',
      filter: 'setembro',
      frente: 'Mini-Implantes 12/09',
      deadline: 'Hoje',
      blocks: 'Se o plano não virar cadência diária e testes de campanha hoje, a janela comercial fica curta demais.',
      owner: 'Ruan / TAOS / Batista / Adônio'
    },
    {
      title: 'Fechamento Fabinho envolve repasse financeiro',
      filter: 'calendario',
      frente: 'Financeiro / Operação',
      deadline: 'Hoje',
      blocks: 'TAOS pode preparar conferência e entrega, mas não executa repasse sem aprovação explícita do Ruan.',
      owner: 'Ruan'
    },
    {
      title: 'Reuniões de Batista e Adônio precisam virar tarefas executáveis',
      filter: 'reunioes',
      frente: 'Tráfego / Testes',
      deadline: 'Hoje após cada reunião',
      blocks: 'Sem registro de decisão, o lançamento fica dependente de memória e perde velocidade de execução.',
      owner: 'Ruan / TAOS'
    }
  ],
  radarDoDia: radar.map(([time, frontLabel, frontClass, task, status]) => ({ time, frontLabel, frontClass, task, status })),
  metrics: {
    tasks: radar.length,
    today: 9,
    week: 7,
    waiting: 8,
    done: 1
  },
  radarExtra: 'Fontes: áudio do Ruan em 31/08 no tópico Dados/Painel + Google Calendar rdomith@gmail.com de 31/08 a 12/09. Painel focado nas demandas de hoje, no aquecimento do lançamento 12/09 e nos próximos marcos críticos do Diplomado.',
  sourceFile: 'tmp_update_panel_20260831.js',
  radar: []
};

fs.writeFileSync(path.join(repo, 'data.json'), JSON.stringify(data, null, 2) + '\n');

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

const colors = {
  calendario: '#38bdf8',
  setembro: '#fb7185',
  diplomado: '#a78bfa',
  reunioes: '#f59e0b'
};

function radarItem(item, index) {
  const color = colors[item.frontClass] || '#a78bfa';
  return `<li class="radar-item" data-id="2026-08-31-${esc(item.frontClass)}-${String(index + 1).padStart(2, '0')}" data-frente="${esc(item.frontClass)}" style="--front-color:${color}"><button class="radar-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></button><span class="radar-time">${esc(item.time)}</span><span class="radar-frente">${esc(item.frontLabel)}</span><span class="radar-task">${esc(item.task)}</span><span class="radar-status">${esc(item.status)}</span></li>`;
}

function column(title, key, cls, front) {
  const items = front[key];
  const cards = items.map((item) => `<div class="kanban-card priority ${front.priority === 'p0' && ['exec', 'wait'].includes(key) ? 'p0' : ''}">${esc(item)}</div>`).join('');
  return `<div class="kanban-col kanban-col-${cls}"><div class="kanban-col-head"><span class="kanban-col-name"><span class="col-status-dot ${cls}"></span> ${title}</span><span class="kanban-col-count">${items.length}</span></div>${cards}</div>`;
}

function frontCard(front) {
  const health = front.status === 'risk' ? 'red' : front.status === 'attention' ? 'orange' : 'green';
  return `<article class="frente-card expanded" data-frente="${esc(front.filter)}"><div class="frente-head"><div class="frente-title"><div class="frente-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></div><div class="frente-icon">${esc(front.icon)}</div><div><div class="frente-name">${esc(front.name)}</div><div class="frente-id">${esc(front.owner)}</div></div></div><div class="frente-summary"><div class="frente-counts"><span class="frente-count-pill exec"><span class="count-dot"></span>${front.exec.length}</span><span class="frente-count-pill wait"><span class="count-dot"></span>${front.wait.length}</span><span class="frente-count-pill next"><span class="count-dot"></span>${front.next.length}</span><span class="frente-count-pill done"><span class="count-dot"></span>${front.done.length}</span></div><div class="frente-health"><span class="health-dot ${health}"></span>${esc(front.summary)}</div></div></div><div class="frente-body"><div class="kanban-cols">${column('Em execução', 'exec', 'exec', front)}${column('Aguardando', 'wait', 'wait', front)}${column('Próximo', 'next', 'next', front)}${column('Concluído', 'done', 'done', front)}</div></div></article>`;
}

const content = `<div class="container">
  <header class="header"><div class="header-top"><div class="brand"><div class="brand-mark"><img src="assets/xdental-logo-fundo-escuro.png" alt="Excellence Dental Academy"></div><div class="brand-info"><h1>Painel XDental</h1><div class="subtitle">v2.31 · Demandas do dia 31/08</div></div></div><div class="header-meta"><div class="meta-pill"><span class="dot"></span>Atualizado 31/08 · foco hoje</div><div class="meta-pill">📅 Calendar · 🚀 12/09 · 🎓 Diplomado · 🧭 Reuniões</div></div></div>
    <div class="alert-bar" style="background: linear-gradient(90deg, rgba(251, 113, 133, 0.16) 0%, rgba(56, 189, 248, 0.08) 100%); border: 1px solid rgba(251, 113, 133, 0.30);"><span style="font-size: 18px;">⚙️</span><span><strong style="color: var(--accent);">Foco fechado:</strong> calendário operacional de hoje + aquecimento do lançamento <b>12/09</b>, com testes/campanhas e reuniões de Batista e Adônio virando execução.</span></div>
    <div class="filters-bar"><div class="filter-group"><span class="filter-label">Frente</span><button class="filter-btn active" data-filter="frente" data-value="all">Todas</button><button class="filter-btn" data-filter="frente" data-value="calendario">📅 Calendar</button><button class="filter-btn" data-filter="frente" data-value="setembro">🚀 12/09</button><button class="filter-btn" data-filter="frente" data-value="diplomado">🎓 Diplomado</button><button class="filter-btn" data-filter="frente" data-value="reunioes">🧭 Reuniões</button></div></div>
  </header>
<section class="radar-card"><div class="radar-head"><div class="radar-title-block"><h2>📌 Radar operacional · Segunda 31/08</h2><div class="radar-subtitle">Prioridade: colocar o dia em ordem e começar o aquecimento do lançamento 12/09</div></div><div class="meta-pill">${radar.length} itens · America/Sao_Paulo</div></div><div class="radar-table-head"><span></span><span>Data / horário</span><span>Frente</span><span>Demanda</span><span>Status</span></div><ul class="radar-list">
${data.radarDoDia.map(radarItem).join('\n')}
</ul><div class="radar-extra"><span class="radar-extra-icon">⚙️</span>${esc(data.radarExtra)}</div></section>
<section class="kanban-section"><h2 class="kanban-section-title">🎯 Kanban das demandas do dia <span class="kanban-section-count">Calendar + lançamento + reuniões</span></h2><div class="kanban-actions"><button class="kanban-action-btn" id="expand-all">Expandir todas</button><button class="kanban-action-btn" id="collapse-all">Recolher todas</button></div>
    ${fronts.map(frontCard).join('\n')}
  </section>
<footer class="footer">Painel operacional XDental · Atualizado pelo TAOS em 31/08/2026<br>Fontes: áudio do Ruan no tópico Dados/Painel + Google Calendar rdomith@gmail.com</footer>
</div>`;

const indexPath = path.join(repo, 'index.html');
const current = fs.readFileSync(indexPath, 'utf8');
const start = current.indexOf('<div class="container">');
const end = current.indexOf('\n\n<script>', start);
if (start === -1 || end === -1) {
  throw new Error('Could not locate dashboard container in index.html');
}

let next = current.slice(0, start) + content + current.slice(end);
next = next
  .replace(/<title>.*?<\/title>/, '<title>Painel XDental · 31/08 · demandas do dia</title>')
  .replace(/<!-- deploy-bust: .*? -->/, '<!-- deploy-bust: 2026-08-31T13:05Z -->')
  .replace(/const STORAGE_KEY = 'xdental_radar_[^']+';/, "const STORAGE_KEY = 'xdental_radar_2026_08_31_dia';");

fs.writeFileSync(indexPath, next);
fs.writeFileSync(path.join(repo, '.pages-rebuild'), '2026-08-31T13:05Z\n');
