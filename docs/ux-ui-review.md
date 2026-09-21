# Revisão UX/UI PRAGMA

## Diagnóstico antes das alterações

- Aplicação pública: `artifacts/pragma-live-production`, React + Vite + Tailwind 4, Wouter e primitivas Radix existentes. `mockup-sandbox` é um artefato separado, não a aplicação pública; API e bibliotecas em `lib` não precisam de alterações.
- Rotas: `/` reúne apresentação, capacidades, manifesto, operação/projetos, método e contato. Fallback 404. Âncoras existentes devem permanecer válidas.
- Marca: logo oficial verde/branco, verde #21e05d, fundo #080b0a, Space Grotesk e DM Mono. Preservar essa identidade e o tom humano do conteúdo.
- Hierarquia: hero em quatro linhas com até 145px adia o CTA; manifesto com 600px interrompe o fluxo; títulos competem entre si.
- Consistência: alternância entre branco, escuro e verde integral; cards com números decorativos e falsas sugestões de interação; grid assimétrico sem relação com importância do conteúdo.
- Legibilidade: labels de 11px muito espaçados, placeholders com 30% de opacidade, descrições de 13px no mobile.
- Navegação: sem indicação da seção atual, sem skip link; Escape não restaura foco ao botão do menu; header altera dimensões no scroll.
- Formulário: apenas `setSubmitted(true)`, sem integração ou envio real. Confirma recebimento e promete prazo sem suporte técnico. Campos sem autocomplete e sem mensagens de erro específicas.
- Movimento: ticker infinito, ruído fixo, vídeo sem pausa acessível, entrada com blur; conteúdo oculto depende de IntersectionObserver.
- 404/erro: texto em inglês, fundo claro e instruções destinadas a desenvolvedores.
- SEO: preservar título, descrição, idioma pt-BR, rota e IDs. Não há dados de ranking disponíveis neste repositório.

## Direção

Redesign com preservação da marca. Variância visual 5/10, movimento 2/10, densidade 3/10. Uma linguagem escura, tipografia existente, verde reservado a ações e ênfases. Prioridade ao fluxo e leitura; sem nova biblioteca.

## Escopo de implementação

1. Separar navegação, mídia e contato em componentes com estados próprios.
2. Aproximar mensagem, explicação e CTA na abertura; remover ticker e metadados decorativos obsoletos.
3. Normalizar tokens CSS/Tailwind, containers, superfícies e controles existentes.
4. Tornar conteúdo de operação informativo sem inventar cases/clientes.
5. Melhorar âncoras, foco, menu, campos e feedback; contato prepara e-mail para revisão pelo visitante, sem afirmar envio.
6. Unificar home, 404 e fallback de erro; verificar desktop, tablet e mobile.

## Verificação final

- TypeScript da aplicação: aprovado (`tsc -p artifacts/pragma-live-production/tsconfig.json --noEmit`).
- Build Vite de produção: aprovado, sem warnings no build final.
- Navegador real via Codex: home e 404 renderizam; console de produção sem erros/warnings observados. Retorno da 404 à home confirmado.
- Responsividade: 320, 390, 768, 1024 e 1440px sem overflow horizontal. Cards em uma, duas e três colunas; campos mantêm 16px; CTA da abertura visível no viewport mobile verificado de 390×844.
- Revisão visual: abertura, apresentação, capacidades, bastidores, método, contato e 404; desktop/tablet/mobile. Header com altura constante e menu sólido sem transparência.
- Teclado: Escape fecha menu e restaura foco ao acionador; navegação fecha menu e leva foco à seção; inputs têm outline verde visível ao usar Tab.
- Formulário: vazio exibe três erros; e-mail inválido recebe foco e mensagem; preenchimento válido gera `mailto` com conteúdo codificado; editar briefing remove rascunho anterior. Nenhum e-mail foi enviado durante os testes.
- Vídeo: pausa/reprodução manual confirmadas; pausa ao sair da área visível confirmada. Preferência de movimento reduzido e aba oculta tratadas no componente; não houve alteração de preferências do sistema do usuário para testar essas duas condições.
- Contraste calculado: texto principal/fundo 17,16:1; secundário/superfície 8,64:1; verde/fundo 11,19:1; erro/superfície 9,71:1. Borda de input ajustada acima de 3:1.
- Fontes locais carregadas. Imagem abaixo da dobra carrega por lazy loading. Removidos blur de entrada, ticker infinito, ruído fixo e revelações que ocultavam conteúdo.
- Não adicionadas dependências ou modificadas APIs/integrações. Tamanho final comprimido: JavaScript 110,58kB; CSS 17,29kB. Esses números não substituem uma medição de Core Web Vitals em produção.
- Limites: envio depende do aplicativo de e-mail do visitante; cópia tem fallback manual. Não foi medida entregabilidade do endereço já presente no projeto, nem realizada auditoria com leitor de tela/dispositivo físico. A página de erro foi revisada no código e compartilha a composição visual da 404; não foi induzida uma falha em produção.

Referência de revisão: [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md).

---

## Segunda passagem: redesign "Sinal e Luz" (2026-09-20)

### Mudança de direção

A passagem anterior fixou variância visual 5/10, movimento 2/10 e densidade 3/10, e removeu ticker, ruído, blur de entrada e revelações. O pedido desta passagem foi o oposto: um site mais moderno, futurista, interativo e premium. A direção nova é **variância 8/10, movimento 6/10, densidade 4/10** — mas o movimento voltou sob contrato, não como antes.

**O contrato:** o conteúdo nasce visível no HTML. A classe `motion-ok` no `<html>` é o que autoriza o CSS a escondê-lo para revelar depois, e só é escrita por JavaScript quando `prefers-reduced-motion` não está ligado. Sem JS, com movimento reduzido, ou se a preferência mudar durante a visita, a página fica inteira. Foi isso que permitiu reintroduzir movimento sem repetir o problema que a primeira revisão corrigiu: nenhuma revelação pode esconder conteúdo em definitivo.

### O que mudou

1. Camada de materiais nova: vidro escuro sobre superfície opaca, fios de gradiente, malha técnica de 76px, grão de filme e brilhos de palco. Paleta escurecida (`--ink` #080b0a → #060907) para dar mais alcance ao verde.
2. Abertura recomposta: escurecimento em camadas que protege a leitura sobre o vídeo, título subindo linha a linha atrás de máscara, selo com ponto pulsante e faixa de operação no rodapé da dobra, com as capacidades reais.
3. Cards, tiles e formulário passaram a compartilhar o material `.panel`: elevação, fio de topo que acende e um brilho que segue o ponteiro (`useSpotlight`, só em ponteiro fino).
4. Cabeçalho ganhou barra de progresso de leitura e troca para vidro ao rolar. A altura continua constante.
5. Método virou trilho de sinal: as etapas acendem conforme a leitura avança, e ficam acesas por padrão quando não há movimento.
6. Fotos ganharam moldura com zoom suave e cantos de HUD; a galeria ganhou barra de progresso do trilho.
7. 404 e a página de erro herdaram a mesma atmosfera.

### Verificação

- TypeScript da aplicação: aprovado (`tsc -p tsconfig.json --noEmit`).
- Build Vite de produção: aprovado, sem warnings. CSS 20,37kB gzip (era 17,29kB); JavaScript 112,59kB gzip (era 110,58kB).
- Navegador real: console de produção sem erros. Home, 404 e âncoras renderizam.
- Responsividade verificada em 375, 800 e 1440px, sem overflow horizontal.
- Teclado: anel de foco verde visível na navegação; ordem preservada.
- Estados de movimento testados no DOM: com `motion-ok`, elementos aguardam revelação; sem a classe, todos resolvem para `opacity: 1` e `transform: none`, e as etapas do método já nascem acesas.
- Contraste recalculado para a paleta nova, considerando o vidro como fundo efetivo mais claro: texto principal 13,7–17,4:1; secundário 7,4–9,3:1; verde 9,0–11,3:1; erro 8,7–9,9:1; borda de input 3,4:1. Todos acima de AA. A borda `--line` continua um fio decorativo, não um limite de controle.
- `mix-blend-mode` foi retirado do grão: uma camada fixa que mistura força o navegador a recompor a página inteira, e produziu quadros pretos na captura. Sem blend, o grão é uma sobreposição simples a 5,5%.

### Limites

- Não foi feita auditoria com leitor de tela nem em dispositivo físico.
- Não há medição de Core Web Vitals em produção; os números acima são tamanho de bundle, não desempenho percebido.
- O vídeo da abertura continua com 4,8MB e é o maior custo da página. Trocá-lo por um arquivo mais curto e comprimido é a próxima melhoria de desempenho, e não foi feita aqui.
- O envio do contato continua dependendo do aplicativo de e-mail do visitante; nada mudou nesse fluxo.
