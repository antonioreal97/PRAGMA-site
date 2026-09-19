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
