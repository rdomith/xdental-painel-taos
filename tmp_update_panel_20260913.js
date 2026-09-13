const fs = require('fs');
const path = require('path');

const repo = '/root/.openclaw/workspace/projects/xdental-painel-taos';

const fronts = [
  {
    id: 'pre-ferias-operacional-2026-09-14',
    filter: 'pre-ferias',
    icon: 'PF',
    name: 'Pré-férias · blindagem operacional 16/09 a 23/09',
    status: 'risk',
    priority: 'p0',
    progress: 28,
    owner: 'Ruan / TAOS / Operação',
    summary: 'Segunda é o dia de deixar a operação sem dependência do Ruan antes das férias. O período crítico vai de 16/09 a 23/09, com Freedom dia 21 e encontro do Diplomado M09 dia 22.',
    exec: [
      'Limpar o painel antigo e trabalhar só com as demandas novas do áudio de 13/09.',
      'Mapear as ações que acontecem durante as férias: prova Freedom em 21/09 e encontro M09/Stefan em 22/09.',
      'Separar o que precisa estar delegado antes de quarta-feira 16/09.',
      'Garantir responsáveis claros para Mônica e Felipe nas ações dos dias 21 e 22.'
    ],
    wait: [
      'Confirmação final de quem cobre cada ação enquanto Ruan estiver fora.',
      'Validação de que os links e comunicações dos dias 21 e 22 estão prontos antes da viagem.',
      'Conferência do evento da prova Freedom no Google Calendar, pois não apareceu na consulta feita em 13/09.'
    ],
    next: [
      '15/09: fazer checkpoint final de cobertura com Mônica e Felipe.',
      '16/09: início das férias no Calendar.',
      '23/09: retorno previsto e revisão do que aconteceu durante a ausência.'
    ],
    done: [
      'Google Calendar rdomith@gmail.com conferido em 13/09: férias de 16/09 a 23/09, evento M09/Stefan em 22/09 e pagamento professor M09 em 23/09.'
    ]
  },
  {
    id: 'fabian-diplomado-anclaje-2026-09-14',
    filter: 'fabian',
    icon: 'ED',
    name: 'Fabián · próximas edições do Diplomado',
    status: 'attention',
    priority: 'p0',
    progress: 20,
    owner: 'Ruan / Fabián',
    summary: 'Alinhar com Fabián as próximas edições dos conteúdos do Diplomado de Anclaje antes da viagem, para não deixar produção parada enquanto Ruan estiver fora.',
    exec: [
      'Alinhar amanhã com Fabián as próximas edições dos conteúdos do Diplomado de Anclaje.',
      'Definir ordem de prioridade dos conteúdos que precisam ser editados primeiro.',
      'Confirmar prazo de entrega ou checkpoint durante o período 16/09 a 23/09.'
    ],
    wait: [
      'Lista de conteúdos pendentes de edição.',
      'Disponibilidade de Fabián e prazo real de entrega.',
      'Confirmação do que precisa de revisão do Ruan antes das férias.'
    ],
    next: [
      'Após o alinhamento: transformar combinado em checklist por conteúdo.',
      'Deixar combinado se Fabián manda prévias para Mônica/Felipe ou espera retorno do Ruan.'
    ],
    done: []
  },
  {
    id: 'freedom-prova-2026-09-21',
    filter: 'freedom',
    icon: 'FR',
    name: 'Freedom · liberação da prova em 21/09',
    status: 'risk',
    priority: 'p0',
    progress: 60,
    owner: 'Ruan / Mônica',
    summary: 'A prova do Freedom já está pronta e enviada para Mônica, mas precisa de um novo alinhamento para garantir liberação correta no dia 21/09 durante as férias.',
    exec: [
      'Reunir ou falar novamente com Mônica sobre a prova do Freedom.',
      'Confirmar que a prova está pronta, no formato certo e com data de liberação em 21/09.',
      'Validar comunicação aos alunos e responsável por acompanhar eventuais dúvidas.',
      'Conferir se o evento da prova Freedom está corretamente registrado no Calendar.'
    ],
    wait: [
      'Confirmação de Mônica sobre liberação e comunicação.',
      'Confirmação do registro no Calendar, pois não apareceu na consulta de 13/09.',
      'Definição de quem resolve problema operacional no dia 21/09 se o Ruan estiver offline.'
    ],
    next: [
      '21/09: liberar prova do Freedom.',
      'Após liberação: registrar se houve problema ou dúvida recorrente dos alunos.'
    ],
    done: [
      'Ruan informou que a prova já está pronta e já foi enviada para Mônica.'
    ]
  },
  {
    id: 'diplomado-m09-stefan-2026-09-22',
    filter: 'stefan',
    icon: 'M9',
    name: 'Diplomado M09 · encontro ao vivo com Stefan Cardon',
    status: 'risk',
    priority: 'p0',
    progress: 35,
    owner: 'Ruan / Felipe / Mônica / Stefan Cardon',
    summary: 'O encontro ao vivo do módulo 9 está no Calendar em 22/09 às 14h BRT, mas Ruan precisa falar com Felipe e deixar Meet/link/comunicação prontos antes da viagem.',
    exec: [
      'Falar com Felipe sobre o encontro ao vivo com Stefan Cardon em 22/09.',
      'Confirmar com Mônica o fluxo de comunicação do encontro M09.',
      'Criar o Meet e mandar o link para Stefan/Felipe/Mônica.',
      'Deixar Felipe como cobertura operacional caso Ruan não consiga atuar no horário.'
    ],
    wait: [
      'Confirmação de Felipe sobre participação/cobertura.',
      'Link do Meet criado e enviado.',
      'Confirmação de Mônica sobre envio do link aos alunos.'
    ],
    next: [
      '22/09 14h BRT: encontro ao vivo M09 com Dr. Stefan Cardon.',
      '23/09: Calendar marca programação de pagamento do professor se arquivo final estiver entregue/aprovado.'
    ],
    done: [
      'Evento confirmado no Google Calendar: Diplomado M9 — Encuentro ao vivo com Dr. Stefan Cardon em 22/09, 14h-15h30 BRT.'
    ]
  },
  {
    id: 'comercial-cata-whatsapp-diplomado-2026-09-14',
    filter: 'comercial',
    icon: 'CO',
    name: 'Comercial + Cata · ações e WhatsApp do Diplomado',
    status: 'attention',
    priority: 'p1',
    progress: 25,
    owner: 'Ruan / Cata / Felipe',
    summary: 'A reunião com Cata precisa sair com ações comerciais claras e as mensagens dos grupos de WhatsApp refinadas para Felipe disparar no lançamento do Diplomado.',
    exec: [
      'Fazer reunião com Cata do comercial sobre as próximas ações.',
      'Refinar mensagens dos grupos de WhatsApp do lançamento do Diplomado.',
      'Separar versão final das mensagens para Felipe fazer os envios.',
      'Definir cadência e objetivo de cada mensagem nos grupos.'
    ],
    wait: [
      'Direção final da conversa com Cata.',
      'Mensagens aprovadas para Felipe.',
      'Confirmação de Felipe sobre execução dos envios.'
    ],
    next: [
      'Após reunião: transformar decisões comerciais em tarefas objetivas.',
      'Após mensagens finais: passar para Felipe com datas e horários de envio.'
    ],
    done: []
  },
  {
    id: 'live-quarta-resumo-evento-2026-09-16',
    filter: 'live',
    icon: 'LV',
    name: 'Live de quarta · resumo especial do evento',
    status: 'risk',
    priority: 'p0',
    progress: 30,
    owner: 'Ruan / Sérgio / Felipe',
    summary: 'A live de quarta precisa ser alinhada com Sérgio para 20h, com Felipe preparado para cobrir link/envio caso Ruan esteja no avião.',
    exec: [
      'Alinhar com Sérgio a live de quarta-feira como encontro especial de resumo do evento.',
      'Tentar programar para 20h e confirmar disponibilidade de Sérgio.',
      'Pedir para Felipe participar/cobrir o horário.',
      'Garantir que o link seja enviado para o pessoal mesmo se Ruan não conseguir fazer do avião.'
    ],
    wait: [
      'Confirmação de Sérgio para quarta às 20h.',
      'Confirmação de Felipe como backup operacional.',
      'Link final para envio ao grupo/público.'
    ],
    next: [
      'Com horário confirmado: mandar link e orientar Felipe sobre contingência.',
      'Depois da live: registrar dúvidas e oportunidades comerciais geradas.'
    ],
    done: []
  },
  {
    id: 'imagens-conversao-whatsapp-2026-09-14',
    filter: 'imagens',
    icon: 'IMG',
    name: 'Imagens de conversão · grupos de WhatsApp',
    status: 'attention',
    priority: 'p1',
    progress: 15,
    owner: 'Ruan',
    summary: 'Antes das mensagens dos grupos, Ruan quer deixar imagens de conversão separadas. Isso precisa ficar pronto amanhã para não virar gargalo na terça/quarta.',
    exec: [
      'Preparar amanhã as imagens de conversão.',
      'Separar uma imagem para acompanhar cada bloco de mensagem dos grupos.',
      'Organizar os arquivos antes de finalizar as mensagens para Felipe.'
    ],
    wait: [
      'Lista final de mensagens dos grupos.',
      'Definição de quantas imagens serão necessárias.',
      'Validação visual das imagens antes de passar para Felipe.'
    ],
    next: [
      'Com imagens prontas: anexar ao pacote de mensagens de WhatsApp.',
      'Passar pacote final para Felipe com ordem de envio.'
    ],
    done: []
  },
  {
    id: 'contrato-faciencia-2026-09-14',
    filter: 'contrato',
    icon: 'CT',
    name: 'Contrato · Faciencia',
    status: 'risk',
    priority: 'p0',
    progress: 10,
    owner: 'Ruan',
    summary: 'Assinatura de contrato com a Faciencia precisa entrar como P0 administrativo, mas com revisão mínima antes da assinatura por envolver acordo formal.',
    exec: [
      'Localizar versão final do contrato com a Faciencia.',
      'Revisar pontos críticos antes de assinar: partes, escopo, valores, prazos, obrigações, multa/rescisão e foro.',
      'Assinar somente se a versão estiver final e sem pendência jurídica/comercial.',
      'Salvar o contrato assinado no Drive/pasta correta depois da assinatura.'
    ],
    wait: [
      'Versão final do contrato.',
      'Confirmação de que não há cláusula pendente ou ponto comercial em aberto.',
      'Definição da pasta/arquivo final para arquivamento.'
    ],
    next: [
      'Após assinatura: registrar contrato assinado e avisar internamente quem precisa saber.',
      'Se houver dúvida em cláusula: pausar assinatura e resolver antes.'
    ],
    done: []
  }
];

const radar = [
  ['Manhã', 'Painel', 'pre-ferias', 'Usar só as demandas novas do áudio de 13/09; painel antigo limpo.', 'OK'],
  ['Amanhã', 'Fabián', 'fabian', 'Alinhar próximas edições dos conteúdos do Diplomado de Anclaje.', 'P0'],
  ['Amanhã', 'Férias', 'pre-ferias', 'Mapear cobertura do período 16/09 a 23/09 antes da viagem.', 'P0'],
  ['Amanhã', 'Freedom', 'freedom', 'Falar novamente com Mônica sobre a prova do Freedom que libera em 21/09.', 'P0'],
  ['Amanhã', 'Calendar', 'freedom', 'Conferir/ajustar registro da prova Freedom no Google Calendar; não apareceu na consulta de 13/09.', 'ALERTA'],
  ['Amanhã', 'Stefan M09', 'stefan', 'Falar com Felipe sobre o encontro ao vivo com Stefan Cardon em 22/09.', 'P0'],
  ['Amanhã', 'Meet', 'stefan', 'Criar o Meet do M09 e enviar link para Stefan/Felipe/Mônica.', 'P1'],
  ['Amanhã', 'Mônica', 'stefan', 'Confirmar com Mônica o fluxo de comunicação do encontro M09.', 'P1'],
  ['Amanhã', 'Cata', 'comercial', 'Reunião com Cata do comercial para alinhar próximas ações.', 'P0'],
  ['Amanhã', 'WhatsApp', 'comercial', 'Refinar mensagens dos grupos do lançamento do Diplomado para Felipe enviar.', 'P0'],
  ['Amanhã', 'Imagens', 'imagens', 'Preparar imagens de conversão para colocar antes das mensagens nos grupos.', 'P1'],
  ['Amanhã', 'Faciencia', 'contrato', 'Assinar contrato com a Faciencia após revisão dos pontos críticos.', 'P0'],
  ['Amanhã', 'Sérgio', 'live', 'Alinhar live de quarta como resumo especial do evento, idealmente às 20h.', 'P0'],
  ['Amanhã', 'Felipe', 'live', 'Pedir Felipe no horário da live para cobrir link/envio se Ruan estiver no avião.', 'ALERTA'],
  ['16/09', 'Férias', 'pre-ferias', 'Início das férias no Google Calendar.', 'CAL'],
  ['21/09', 'Freedom', 'freedom', 'Liberação da prova do Freedom durante as férias.', 'CAL'],
  ['22/09 14h', 'Stefan M09', 'stefan', 'Encontro ao vivo do módulo 9 com Dr. Stefan Cardon.', 'CAL'],
  ['23/09', 'Retorno', 'pre-ferias', 'Retorno previsto e revisão do que rodou durante a ausência.', 'CAL']
];

const data = {
  dashboard: {
    name: 'Painel Operacional XDental',
    version: '2.34-radar-2026-09-14-pre-ferias',
    lastUpdated: '2026-09-13 · radar de amanhã',
    owner: 'Ruan Domith',
    operator: 'TAOS',
    status: 'operational',
    headline: 'Foco de amanhã: blindar a operação antes das férias, com Fabián, Freedom 21/09, Stefan/M09 22/09, Cata/comercial, WhatsApp, contrato Faciencia, live com Sérgio e imagens de conversão.'
  },
  fronts,
  gargalos: [
    {
      title: 'Freedom dia 21 não apareceu no Calendar consultado',
      filter: 'freedom',
      frente: 'Freedom / Prova',
      deadline: '14/09/2026',
      blocks: 'Ruan informou que está no calendário, mas a consulta ao rdomith@gmail.com entre 20/09 e 22/09 mostrou apenas FÉRIAS. Precisa conferir para não passar batido durante ausência.',
      owner: 'Ruan / Mônica'
    },
    {
      title: 'Ruan sai de férias em 16/09 com ações críticas nos dias 21 e 22',
      filter: 'pre-ferias',
      frente: 'Pré-férias / Operação',
      deadline: '16/09/2026',
      blocks: 'Sem cobertura clara de Mônica/Felipe, qualquer falha de link, envio ou liberação cai no colo do Ruan durante férias.',
      owner: 'Ruan / TAOS'
    },
    {
      title: 'Encontro M09/Stefan precisa de link e backup operacional',
      filter: 'stefan',
      frente: 'Diplomado M09',
      deadline: '14/09/2026',
      blocks: 'O evento está no Calendar para 22/09 às 14h BRT, mas Felipe ainda precisa ser alinhado e o Meet precisa ficar criado/enviado.',
      owner: 'Ruan / Felipe / Mônica'
    },
    {
      title: 'Live de quarta depende de Sérgio + Felipe',
      filter: 'live',
      frente: 'Lançamento / Resumo do evento',
      deadline: '14/09/2026',
      blocks: 'Se Sérgio não confirmar 20h e Felipe não ficar de backup, o envio de link pode falhar enquanto Ruan estiver no avião.',
      owner: 'Ruan / Sérgio / Felipe'
    },
    {
      title: 'Contrato com a Faciencia precisa de revisão antes da assinatura',
      filter: 'contrato',
      frente: 'Administrativo / Contratos',
      deadline: '14/09/2026',
      blocks: 'Contrato é acordo formal. O risco não é executar, é assinar versão com cláusula, valor, prazo ou obrigação desalinhada.',
      owner: 'Ruan'
    }
  ],
  radarDoDia: radar.map(([time, frontLabel, frontClass, task, status]) => ({ time, frontLabel, frontClass, task, status })),
  metrics: {
    tasks: radar.length,
    today: 13,
    week: 4,
    waiting: fronts.reduce((sum, front) => sum + front.wait.length, 0),
    done: fronts.reduce((sum, front) => sum + front.done.length, 0)
  },
  radarExtra: 'Fontes: áudio do Ruan em 13/09 no tópico Dados/Painel + Google Calendar rdomith@gmail.com consultado de 14/09 a 23/09. Conteúdo antigo removido da tela. Observação: prova Freedom 21/09 foi citada no áudio, mas não apareceu no Calendar consultado.',
  sourceFile: 'tmp_update_panel_20260913.js',
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
  'pre-ferias': '#38bdf8',
  fabian: '#f59e0b',
  freedom: '#22c55e',
  stefan: '#a78bfa',
  comercial: '#fb7185',
  live: '#06b6d4',
  imagens: '#e879f9',
  contrato: '#f97316'
};

function radarItem(item, index) {
  const color = colors[item.frontClass] || '#a78bfa';
  return `<li class="radar-item" data-id="2026-09-14-${esc(item.frontClass)}-${String(index + 1).padStart(2, '0')}" data-frente="${esc(item.frontClass)}" style="--front-color:${color}"><button class="radar-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></button><span class="radar-time">${esc(item.time)}</span><span class="radar-frente">${esc(item.frontLabel)}</span><span class="radar-task">${esc(item.task)}</span><span class="radar-status">${esc(item.status)}</span></li>`;
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
  <header class="header"><div class="header-top"><div class="brand"><div class="brand-mark"><img src="assets/xdental-logo-fundo-escuro.png" alt="Excellence Dental Academy"></div><div class="brand-info"><h1>Painel XDental</h1><div class="subtitle">v2.34 · Radar de amanhã 14/09</div></div></div><div class="header-meta"><div class="meta-pill"><span class="dot"></span>Atualizado 13/09 · foco amanhã</div><div class="meta-pill">Pré-férias · Freedom · Stefan M09 · Comercial · Contrato</div></div></div>
    <div class="alert-bar" style="background: linear-gradient(90deg, rgba(56, 189, 248, 0.24) 0%, rgba(251, 113, 133, 0.12) 100%); border: 1px solid rgba(56, 189, 248, 0.45); color: #f8fafc; box-shadow: 0 12px 38px rgba(56, 189, 248, 0.10);"><span style="font-size: 13px; font-weight: 800; color: #7dd3fc;">TAOS</span><span><strong style="color: #c4b5fd;">Foco fechado:</strong> amanhã é dia de blindar a operação antes das férias: Fabián, Freedom 21/09, Stefan/M09 22/09, Cata, WhatsApp, contrato Faciencia, Sérgio/Felipe e imagens de conversão.</span></div>
    <div class="filters-bar"><div class="filter-group"><span class="filter-label">Frente</span><button class="filter-btn active" data-filter="frente" data-value="all">Todas</button><button class="filter-btn" data-filter="frente" data-value="pre-ferias">Pré-férias</button><button class="filter-btn" data-filter="frente" data-value="fabian">Fabián</button><button class="filter-btn" data-filter="frente" data-value="freedom">Freedom</button><button class="filter-btn" data-filter="frente" data-value="stefan">Stefan M09</button><button class="filter-btn" data-filter="frente" data-value="comercial">Comercial</button><button class="filter-btn" data-filter="frente" data-value="live">Live</button><button class="filter-btn" data-filter="frente" data-value="imagens">Imagens</button><button class="filter-btn" data-filter="frente" data-value="contrato">Contrato</button></div></div>
  </header>
<section class="radar-card"><div class="radar-head"><div class="radar-title-block"><h2>Radar operacional · Segunda 14/09</h2><div class="radar-subtitle">Pré-férias: deixar delegações, links, mensagens e imagens prontos antes de 16/09</div></div><div class="meta-pill">${radar.length} itens · America/Sao_Paulo</div></div><div class="radar-table-head"><span></span><span>Data / horário</span><span>Frente</span><span>Demanda</span><span>Status</span></div><ul class="radar-list">
${data.radarDoDia.map(radarItem).join('\n')}
</ul><div class="radar-extra"><span class="radar-extra-icon">TAOS</span>${esc(data.radarExtra)}</div></section>
<section class="kanban-section"><h2 class="kanban-section-title">Kanban das demandas de amanhã <span class="kanban-section-count">Pré-férias + Diplomado + Comercial + Contratos + Conteúdo</span></h2><div class="kanban-actions"><button class="kanban-action-btn" id="expand-all">Expandir todas</button><button class="kanban-action-btn" id="collapse-all">Recolher todas</button></div>
    ${fronts.map(frontCard).join('\n')}
  </section>
<footer class="footer">Painel operacional XDental · Atualizado pelo TAOS em 13/09/2026<br>Fontes: áudio do Ruan no tópico Dados/Painel + Google Calendar rdomith@gmail.com</footer>
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
  .replace(/<title>.*?<\/title>/, '<title>Painel XDental · 14/09 · radar pré-férias</title>')
  .replace(/<!-- deploy-bust: .*? -->/, '<!-- deploy-bust: 2026-09-13T22:15Z -->')
  .replace(/const STORAGE_KEY = 'xdental_radar_[^']+';/, "const STORAGE_KEY = 'xdental_radar_2026_09_14_pre_ferias';")
  .replaceAll("status.textContent = '✅';", "status.textContent = 'OK';");

fs.writeFileSync(indexPath, next);
fs.writeFileSync(path.join(repo, '.pages-rebuild'), '2026-09-13T22:15Z\n');
