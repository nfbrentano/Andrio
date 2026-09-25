# [FEAT] Configurar contatos reais (WhatsApp, Instagram, e-mail) e torná-los editáveis no admin

## Detalhes da Atividade

- **O que precisa ser feito:** O CTA "Solicitar Orçamento via WhatsApp" de `js/produto.js` usa o número fictício `5511999999999`; os ícones do rodapé da home apontam para `https://wa.me/` e `https://instagram.com/` genéricos. Configurar os contatos reais e armazená-los em `configuracoes/contato` no Firestore, editáveis no admin, para não depender de deploy.
- **Por que é necessário:** O CTA principal de conversão envia o cliente para um número inexistente — **leads perdidos**.
- **Qual valor será agregado:** Conversão de visitantes em orçamentos.
- **Para quem é destinado:** Visitantes interessados e equipe comercial da PACO.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Documento `configuracoes/contato` com `whatsapp` (E.164), `instagram_url`, `email`.
- RF02: Seção no admin para editar esses dados com validação de formato.
- RF03: CTA do WhatsApp na página de produto usa o número configurado e mensagem com nome, preço e link do produto.
- RF04: Rodapé de todas as páginas usa os links configurados; se ausente, o ícone é ocultado.
- RF05: Link do WhatsApp flutuante opcional na home/catálogo.

### Requisitos não-funcionais

- RNF01: Links externos com `rel="noopener noreferrer"`.
- RNF02: Fallback seguro se o Firestore estiver indisponível (ocultar CTA ou usar valor em cache).

### Dependências técnicas

- `js/produto.js`, `index.html`, `catalogo.html`, `produto.html`, `admin.html`, `js/admin.js`, `firestore.rules`.

### Recursos necessários

- Número de WhatsApp comercial, perfil do Instagram e e-mail oficiais (a confirmar com o cliente; hoje o rodapé usa `contato@pacomoveis.com.br`).

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o WhatsApp configurado no admin, quando clico em "Solicitar Orçamento" num produto, então abre `wa.me/<número real>` com o nome, o preço e o link do produto na mensagem.
- [ ] **CA02:** Dado o Instagram configurado, quando clico no ícone do rodapé, então abro o perfil da PACO.
- [ ] **CA03:** Dado que o Instagram não está configurado, quando a página carrega, então o ícone não aparece.
- [ ] **CA04:** Dado um número inválido no admin, quando salvo, então vejo erro de validação.

## O que a atividade não inclui

- Integração com WhatsApp Business API ou chat embutido.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | CTA produto | Abrir produto e clicar no CTA | URL com número configurado e texto correto |
| CT02 | Rodapé | Clicar WhatsApp/Instagram na home | Destinos reais |
| CT03 | Validação | Salvar "abc" como WhatsApp | Erro |
| CT04 | Sem config | Remover Instagram | Ícone oculto |

## URL Complementar

- Documentação técnica: https://faq.whatsapp.com/5913398998672934 (links de conversa)
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24 (`wa.me/5511999999999` em `js/produto.js`).
