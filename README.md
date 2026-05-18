# Dashboard XDental — Painel Persistente

Painel operacional persistente das 9 frentes da XDental, migrado do fluxo antigo do Claude para TAOS.

## Objetivo

Manter um painel vivo, atualizado a partir das conversas com Ruan, memória operacional e Google Calendar, sem precisar gerar um HTML novo manualmente todos os dias.

## Arquitetura

- `data.json` — estado atual das 9 frentes, gargalos, radar do dia e métricas.
- `template.html` — template visual baseado no HTML aprovado por Ruan.
- `index.html` — painel renderizado para visualização.
- `render.js` — script futuro para gerar `index.html` a partir de `data.json` + `template.html`.

## Status

- Em 12/05/2026, Ruan enviou um trecho grande do HTML/CSS aprovado.
- O trecho chegou incompleto/truncado no chat e com alguns pontos de CSS quebrado, então o próximo passo é receber o arquivo `.html` completo como documento.

## Regras

- TAOS pode atualizar arquivos locais do painel.
- Alterações em Google Drive/Calendar/Docs/Sheets só com autorização explícita do Ruan.
- Painel = fonte visual operacional.
- Calendar = fonte temporal.
- Memória em `memory/` = fonte textual persistente.

## REGRA CRÍTICA — design validado do Claude

**Não publicar o painel principal com template simplificado.**

O painel em `/` deve preservar fielmente o HTML validado do Claude, incluindo navegação, estética, cards, radar, gargalos, kanban, cores, tipografia e espaçamentos.

Base fiel atual:
- `painel-xdental-2026-05-13-v2.9-fiel-claude.html`

Arquivos estruturados como `data.json` podem servir de apoio, mas não podem gerar/publicar `index.html` enquanto o renderizador não for visualmente idêntico ao HTML aprovado.

Se precisar atualizar o painel:
1. partir do HTML fiel validado;
2. editar apenas os blocos de conteúdo necessários;
3. verificar visual/navegação antes de deploy;
4. só então publicar no Netlify.
