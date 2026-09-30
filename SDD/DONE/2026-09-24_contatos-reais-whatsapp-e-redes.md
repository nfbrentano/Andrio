# [FEAT] Configurar contatos reais (WhatsApp, Instagram, e-mail) e torná-los editáveis no admin

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Rascunho
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** — · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-09-25

## Detalhes da Atividade

- **O que precisa ser feito:** Usar os contatos reais da PACO no CTA de orçamento e no rodapé, guardados no Firestore e editáveis pelo admin.
- **Problema e evidência:** O CTA "Solicitar Orçamento via WhatsApp" (`js/produto.js:124`) usa o número fictício `5511999999999`. Os ícones do rodapé da home (`index.html:212` e `index.html:215`) apontam para `https://wa.me/` e `https://instagram.com/` genéricos.
- **Impacto de não fazer:** O principal CTA manda o cliente para um número inexistente, e **todo lead de orçamento se perde**.
- **Para quem é destinado:** Visitantes interessados e a equipe comercial da PACO.
- **História de usuário:** Como visitante interessado numa peça, quero pedir orçamento pelo WhatsApp da loja, para falar direto com a equipe comercial.
- **Como saberemos que deu certo:** O CTA abre o número oficial em 100% das páginas de produto, e os pedidos passam a chegar ao WhatsApp comercial.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | O CTA do WhatsApp usa o número configurado, com mensagem contendo nome, preço e link do produto. | P0 | CA01 |
| RF02 | Documento `configuracoes/contato` com `whatsapp` (E.164), `instagram_url` e `email`. | P0 | CA01, CA02 |
| RF03 | O rodapé de todas as páginas usa os links configurados; o ícone some se o dado estiver ausente. | P0 | CA02, CA03 |
| RF04 | Seção no admin para editar os contatos, com validação de formato. | P1 | CA04 |
| RF05 | Botão flutuante de WhatsApp na home e no catálogo. | P2 | — |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Links externos com `rel="noopener noreferrer"`. | P0 | CA02 |
| RNF02 | Se o Firestore estiver fora, usar o último valor em cache ou ocultar o CTA; nunca o número fictício. | P1 | CA05 |

### Dependências técnicas

- `js/produto.js`, `index.html`, `catalogo.html`, `produto.html`, `admin.html`, `js/admin.js`, `firestore.rules`.

### Recursos necessários

- WhatsApp comercial, perfil do Instagram e e-mail oficiais (hoje o rodapé usa `contato@pacomoveis.com.br`).

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o WhatsApp configurado, quando clico em "Solicitar Orçamento" num produto, então abre `wa.me/<número real>` com nome, preço e link do produto na mensagem.
- [ ] **CA02:** Dado o Instagram configurado, quando clico no ícone do rodapé, então abre o perfil da PACO numa nova aba.
- [ ] **CA03:** Dado o Instagram não configurado, quando a página carrega, então o ícone não aparece.
- [ ] **CA04:** Dado um número inválido no admin, quando salvo, então vejo um erro de validação e nada é gravado.
- [ ] **CA05:** Dado que o Firestore não responde, quando abro um produto, então o CTA não aponta para `5511999999999` (caso negativo).

## O que a atividade não inclui

- WhatsApp Business API ou chat embutido: motivo: complexo demais agora.

### Considerado para o futuro (P2)

- Rastrear cliques no CTA como evento de conversão (Analytics).

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Qual o número de WhatsApp comercial? | PO | Sim | |
| D02 | Qual o @ do Instagram oficial? | PO | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | CTA produto | e2e | CA01 | Abrir produto e inspecionar o `href` do CTA | Número configurado e texto correto |
| CT02 | Rodapé | e2e | CA02 | Clicar em WhatsApp/Instagram na home | Destinos reais, nova aba |
| CT03 | Sem Instagram | e2e | CA03 | Remover `instagram_url` | Ícone oculto |
| CT04 | Validação | unit | CA04 | Validar "abc" e "+5511912345678" | Inválido / válido |
| CT05 | Firestore fora | e2e | CA05 | Bloquear `firestore.googleapis.com` | CTA oculto ou com o número em cache |

## URL Complementar

- Documentação técnica: https://faq.whatsapp.com/5913398998672934
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24.
- Issue / PR relacionado: N/A.
