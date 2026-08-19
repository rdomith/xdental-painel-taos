from pathlib import Path
import json, html

repo=Path('/root/.openclaw/workspace/projects/xdental-painel-taos')
fronts=[
  {
    'id':'mensagens-conversao-lancamento-atual','filter':'conversao','icon':'💬','name':'Mensagens de conversão · grupos do lançamento atual','status':'risk','priority':'p0','progress':55,'owner':'Ruan / TAOS / Felipe',
    'summary':'Ajuste rápido, mas crítico para hoje: revisar as mensagens de conversão dos grupos do lançamento que está rodando agora para aumentar intenção e resposta antes da venda/CTA.',
    'exec':['Ajustar mensagens de conversão já existentes para os grupos do lançamento atual','Revisar CTA, objeções, urgência e clareza da próxima ação','Separar versão pronta para disparo/uso nos grupos hoje de manhã'],
    'wait':['Confirmar se há algum link/CTA final específico antes do disparo','Se houver mudança de oferta ou bônus, refletir nas mensagens antes de enviar'],
    'next':['Depois do ajuste: validar tom com Ruan e liberar para execução','Acompanhar resposta dos grupos e ajustar uma segunda mensagem se necessário'],
    'done':['Base das mensagens já existe; tarefa é ajuste/refino, não criação do zero']
  },
  {
    'id':'bonus-formacao-pratica-mini-implante','filter':'bonus','icon':'🎁','name':'Bônus · Formação prática de Mini-Implante','status':'attention','priority':'p0','progress':45,'owner':'Ruan / Felipe / TAOS',
    'summary':'Bônus precisa ser liberado hoje. É item simples, mas tem impacto direto de promessa entregue e percepção de valor do lançamento/produto.',
    'exec':['Liberar hoje o bônus da formação prática de Mini-Implante','Conferir acesso/link/material antes de comunicar','Preparar comunicação curta de liberação do bônus'],
    'wait':['Confirmação final do local de entrega/acesso do bônus','Evidência de que o material está disponível para o aluno'],
    'next':['Depois de liberar: registrar evidência e remover do radar de urgência','Se houver grupo/base envolvida, alinhar mensagem de aviso com as mensagens de conversão'],
    'done':[]
  },
  {
    'id':'chile-cioch-materiais-grafica-video','filter':'chile','icon':'🇨🇱','name':'Chile / CIOCH · flyer + vídeo institucional','status':'risk','priority':'p0','progress':38,'owner':'Ruan / TAOS / Design / Fabián',
    'summary':'Bloco mais sensível da manhã: finalizar o panfleto/flyer do evento do Chile e mandar para a gráfica a tempo. Em paralelo, passar para Fabián a ideia do vídeo institucional XDental que vai rodar na TV do evento.',
    'exec':['Terminar agora de manhã o flyer/panfleto que será entregue no evento do Chile','Revisar texto, hierarquia visual, QR/link e informações antes de enviar para a gráfica','Enviar arquivo final para a gráfica com margem para produção e retirada','Compor briefing do vídeo institucional XDental para Fabián produzir'],
    'wait':['Prazo de gráfica é apertado: qualquer ajuste no flyer precisa ser fechado de manhã','Definir a ideia central do vídeo institucional: marca, autoridade, comunidade, cursos, cases e CTA visual','Confirmar formato/duração ideal para rodar em loop na TV do stand'],
    'next':['Depois do envio para gráfica: salvar comprovante/arquivo final no painel de evidências','Enviar para Fabián: roteiro visual, estrutura por blocos e referências do vídeo institucional','Preparar checklist do stand: TV, arquivo final, formato, pendrive/link e teste de reprodução'],
    'done':[]
  },
  {
    'id':'lancamento-12-09-paginas-checkout-sendflow','filter':'setembro','icon':'🚀','name':'Lançamento 12/09 · páginas, checkout, grupos e Sendflow','status':'risk','priority':'p0','progress':28,'owner':'Ruan / TAOS / Dev / Felipe / Tráfego',
    'summary':'Depois das urgências da manhã, a frente é deixar a máquina do lançamento de 12/09 pronta para captação/vendas no sábado: páginas finalizadas, checkout personalizado conectado, grupos criados e campanha no Sendflow pronta.',
    'exec':['Continuar/finalizar as páginas de vendas de ingressos','Ajustar o checkout personalizado','Pegar o link final do checkout e inserir na página de vendas','Finalizar/publicar a página de vendas sem pendência crítica'],
    'wait':['Página depende do link final do checkout personalizado','Grupos de WhatsApp dependem de criação + permissões revisadas','Campanha Sendflow depende dos grupos corretos e links finais'],
    'next':['Criar grupos de WhatsApp do lançamento','Criar campanha no Sendflow conectando página/obrigado/grupos','Validar fluxo completo: página → checkout → obrigado → WhatsApp → suporte','Deixar tudo pronto para captação/vendas começarem sábado 22/08'],
    'done':['ClickUp do lançamento de setembro já foi criado a partir do Freedom julho/26']
  }
]
radar=[
 ('Agora de manhã','Mensagens conversão','conversao','Ajustar as mensagens de conversão já existentes para os grupos do lançamento atual.','🔥'),
 ('Agora de manhã','Mensagens conversão','conversao','Revisar CTA, objeções, urgência e clareza da próxima ação antes de liberar o texto.','🔥'),
 ('Hoje','Bônus Mini-Implante','bonus','Liberar o bônus da formação prática de Mini-Implante.','🔥'),
 ('Antes de avisar','Bônus Mini-Implante','bonus','Conferir acesso/link/material e preparar a comunicação curta de liberação do bônus.','⚠️'),
 ('Agora de manhã','Chile / CIOCH','chile','Terminar o flyer/panfleto do evento do Chile para mandar para a gráfica.','🔥'),
 ('Antes da gráfica','Chile / CIOCH','chile','Revisar QR/link, texto, hierarquia visual, informações do evento e arquivo final de impressão.','🔥'),
 ('Hoje de manhã','Chile / CIOCH','chile','Enviar o arquivo final para a gráfica a tempo de produzir e retirar antes do evento.','🔥'),
 ('Hoje','Vídeo institucional','chile','Compor briefing para Fabián do vídeo institucional XDental que vai rodar na TV do stand no Chile.','⚠️'),
 ('Hoje','Vídeo institucional','chile','Definir ideia do vídeo: autoridade XDental, comunidade, cursos, cases/resultados, presença internacional e CTA visual em loop.','📌'),
 ('Na sequência','Lançamento 12/09','setembro','Continuar/finalizar as páginas de vendas de ingressos.','🔥'),
 ('Na sequência','Checkout','setembro','Ajustar o checkout personalizado e pegar o link final.','🔥'),
 ('Depois do checkout','Página de vendas','setembro','Inserir o link do checkout na página e finalizar/publicar a página sem pendência crítica.','🔥'),
 ('Hoje','WhatsApp','setembro','Criar os grupos de WhatsApp do lançamento 12/09.','⚠️'),
 ('Hoje','Sendflow','setembro','Criar a campanha no Sendflow e conectar grupos/links para captação e vendas.','⚠️'),
 ('Antes de sábado','Fluxo completo','setembro','Validar página → checkout → obrigado → WhatsApp → suporte antes das vendas começarem sábado 22/08.','📅'),
]

data={
 'dashboard':{'name':'Painel Operacional XDental','version':'2.30-radar-manhã-2026-08-19','lastUpdated':'2026-08-19 · demandas da manhã','owner':'Ruan Domith','operator':'TAOS','status':'operational','headline':'Foco fechado nas demandas de hoje: mensagens de conversão dos grupos, bônus da formação prática de Mini-Implante, flyer do Chile para gráfica, briefing do vídeo institucional e estrutura do lançamento 12/09 para vender no sábado.'},
 'fronts':fronts,
 'gargalos':[
  {'title':'Flyer do Chile precisa sair hoje de manhã para não perder prazo da gráfica','filter':'chile','frente':'Chile / CIOCH','deadline':'Manhã de 19/08','blocks':'Sem arquivo final enviado cedo, aumenta risco de não produzir/retirar a tempo do evento.','owner':'Ruan / TAOS / Design'},
  {'title':'Venda/captação de sábado depende do fluxo completo do lançamento 12/09','filter':'setembro','frente':'Lançamento 12/09','deadline':'Antes de 22/08','blocks':'Página, checkout, grupos e Sendflow precisam estar conectados; se um elo falhar, perde lead/venda.','owner':'Ruan / TAOS / Felipe / Dev'},
  {'title':'Mensagens dos grupos precisam ser ajustadas antes do pico de conversão','filter':'conversao','frente':'Lançamento atual','deadline':'Hoje de manhã','blocks':'Sem mensagens afiadas, grupo fica aquecido mas sem direcionamento claro para ação.','owner':'Ruan / TAOS'},
  {'title':'Vídeo institucional para TV do Chile precisa de briefing claro para Fabián','filter':'chile','frente':'Chile / Stand','deadline':'Hoje','blocks':'Sem direção, Fabián pode produzir algo bonito mas genérico; precisa vender autoridade e presença internacional da XDental.','owner':'Ruan / TAOS / Fabián'},
 ],
 'radarDoDia':[{'time':a,'frontLabel':b,'frontClass':c,'task':d,'status':e} for a,b,c,d,e in radar],
 'metrics':{'tasks':len(radar),'today':14,'week':1,'waiting':8,'done':1},
 'radarExtra':'Fonte: áudio do Ruan em 19/08 no tópico Dados/Painel. Por orientação explícita, painel foi limpo e ficou focado somente nas demandas citadas para hoje/agora de manhã.',
 'sourceFile':'tmp_update_panel_20260819.py','radar':[]
}
(repo/'data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")

def e(s): return html.escape(str(s), quote=True)
colors={'conversao':'#22d3ee','bonus':'#f59e0b','chile':'#22c55e','setembro':'#fb7185'}
def li(item,i):
 color=colors.get(item['frontClass'],'#a78bfa')
 return f'<li class="radar-item" data-id="2026-08-19-{e(item["frontClass"])}-{i:02d}" data-frente="{e(item["frontClass"])}" style="--front-color:{color}"><button class="radar-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></button><span class="radar-time">{e(item["time"])}</span><span class="radar-frente">{e(item["frontLabel"])}</span><span class="radar-task">{e(item["task"])}</span><span class="radar-status">{e(item["status"])}</span></li>'

def col(title,key,cls,f):
 items=f[key]
 cards=''.join(f'<div class="kanban-card priority {"p0" if f["priority"]=="p0" and key in ("exec","wait") else ""}">{e(x)}</div>' for x in items)
 return f'<div class="kanban-col kanban-col-{cls}"><div class="kanban-col-head"><span class="kanban-col-name"><span class="col-status-dot {cls}"></span> {title}</span><span class="kanban-col-count">{len(items)}</span></div>{cards}</div>'

def card(f):
 health='red' if f['status']=='risk' else 'orange' if f['status']=='attention' else 'green'
 return f'''<article class="frente-card expanded" data-frente="{e(f['filter'])}"><div class="frente-head"><div class="frente-title"><div class="frente-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></div><div class="frente-icon">{e(f['icon'])}</div><div><div class="frente-name">{e(f['name'])}</div><div class="frente-id">{e(f['owner'])}</div></div></div><div class="frente-summary"><div class="frente-counts"><span class="frente-count-pill exec"><span class="count-dot"></span>{len(f['exec'])}</span><span class="frente-count-pill wait"><span class="count-dot"></span>{len(f['wait'])}</span><span class="frente-count-pill next"><span class="count-dot"></span>{len(f['next'])}</span><span class="frente-count-pill done"><span class="count-dot"></span>{len(f['done'])}</span></div><div class="frente-health"><span class="health-dot {health}"></span>{e(f['summary'])}</div></div></div><div class="frente-body"><div class="kanban-cols">{col('Em execução','exec','exec',f)}{col('Aguardando','wait','wait',f)}{col('Próximo','next','next',f)}{col('Concluído','done','done',f)}</div></div></article>'''

content=f'''<div class="container">
  <header class="header"><div class="header-top"><div class="brand"><div class="brand-mark"><img src="assets/xdental-logo-fundo-escuro.png" alt="Excellence Dental Academy"></div><div class="brand-info"><h1>Painel XDental</h1><div class="subtitle">v2.30 · Demandas da manhã 19/08</div></div></div><div class="header-meta"><div class="meta-pill"><span class="dot"></span>Atualizado 19/08 · foco hoje</div><div class="meta-pill">💬 Conversão · 🎁 Bônus · 🇨🇱 Chile · 🚀 12/09</div></div></div>
    <div class="alert-bar" style="background: linear-gradient(90deg, rgba(251, 113, 133, 0.16) 0%, rgba(34, 211, 238, 0.08) 100%); border: 1px solid rgba(251, 113, 133, 0.30);"><span style="font-size: 18px;">⚙️</span><span><strong style="color: var(--accent);">Foco fechado:</strong> painel limpo só com as demandas que o Ruan passou para hoje/agora de manhã: mensagens de conversão, bônus Mini-Implante, flyer Chile, vídeo institucional e estrutura do lançamento <b>12/09</b>.</span></div>
    <div class="filters-bar"><div class="filter-group"><span class="filter-label">Frente</span><button class="filter-btn active" data-filter="frente" data-value="all">Todas</button><button class="filter-btn" data-filter="frente" data-value="conversao">💬 Conversão</button><button class="filter-btn" data-filter="frente" data-value="bonus">🎁 Bônus</button><button class="filter-btn" data-filter="frente" data-value="chile">🇨🇱 Chile</button><button class="filter-btn" data-filter="frente" data-value="setembro">🚀 12/09</button></div></div>
  </header>
<section class="radar-card"><div class="radar-head"><div class="radar-title-block"><h2>📌 Radar operacional · Quarta 19/08</h2><div class="radar-subtitle">Manhã crítica: gráfica do Chile + conversão + estrutura de vendas de sábado</div></div><div class="meta-pill">{len(radar)} itens · America/Sao_Paulo</div></div><div class="radar-table-head"><span></span><span>Data / horário</span><span>Frente</span><span>Demanda</span><span>Status</span></div><ul class="radar-list">
{chr(10).join(li(x,i+1) for i,x in enumerate(data['radarDoDia']))}
</ul><div class="radar-extra"><span class="radar-extra-icon">⚙️</span>{e(data['radarExtra'])}</div></section>
<section class="kanban-section"><h2 class="kanban-section-title">🎯 Kanban das demandas de hoje <span class="kanban-section-count">somente frentes citadas no áudio</span></h2><div class="kanban-actions"><button class="kanban-action-btn" id="expand-all">Expandir todas</button><button class="kanban-action-btn" id="collapse-all">Recolher todas</button></div>
    {chr(10).join(card(f) for f in fronts)}
  </section>
<footer class="footer">Painel operacional XDental · Atualizado pelo TAOS em 19/08/2026<br>Fonte: áudio do Ruan no tópico Dados/Painel · Publicação oficial GitHub Pages</footer>
</div>'''
idx=repo/'index.html'
s=idx.read_text()
start=s.index('<div class="container">')
end=s.index('\n\n<script>', start)
new=s[:start]+content+s[end:]
new=new.replace("const STORAGE_KEY = 'xdental_radar_2026_08_18_miniimplantes';","const STORAGE_KEY = 'xdental_radar_2026_08_19_manha';")
idx.write_text(new)
(repo/'.pages-rebuild').write_text('2026-08-19T10:40Z\n')
