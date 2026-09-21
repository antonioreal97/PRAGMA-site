# PRAGMA: sistema de interface

A fonte de verdade é `artifacts/pragma-live-production/src/index.css`. Tokens semânticos são expostos ao Tailwind 4 por `@theme inline` e usados pela biblioteca Radix existente. Não há uma segunda biblioteca.

A linguagem é **"Sinal e Luz"**: materiais de sala de controle (vidro escuro, feixes, grão de filme, malha técnica) com o verde reservado a sinal, ação e ênfase — nunca a decoração.

## Fundações

| Fundação | Padrão |
| --- | --- |
| Fundo | `--ink` #060907; `--ink-soft` #0b100d |
| Superfícies | `--surface` #111814; `--surface-2` #18211b |
| Texto | `--paper` #edf0e8; secundário `--paper-dim` #a9b4ab |
| Marca/ação | `--acid` #21e05d; hover `--acid-hover` #57ed85; profundidade `--acid-deep` #12933d |
| Gradiente de ênfase | `--mint` #5ff5b0, só em `.accent-gradient` e em brilhos; nunca em texto corrente |
| Erro | `--error` #ffaaa3, sempre com mensagem textual |
| Bordas | `--line` #27322b (fio decorativo); `--line-strong` #5d6b62 (controles, ≥3:1) |
| Fontes | Space Grotesk 300–700 (texto/títulos), DM Mono 400 (metadados). WOFF2 locais, `font-display: swap`; licenças em `public/fonts` |
| Texto corrente | 16px / 1.65; inputs 16px para evitar zoom automático em mobile |
| Escala | 4, 8, 12, 16, 24, 32, 48, 64px; seções fluidas 80–136px |
| Container | 1240px; margens fluidas 20–64px |
| Raios | controles 10px, painéis 18px, pequenos elementos 6px |
| Movimento | 180ms em feedback de cor/borda/pressionamento; 540ms em revelações e elevações |

Contraste verificado: texto principal 13,7–17,4:1; secundário 7,4–9,3:1; verde 9,0–11,3:1; erro 8,7–9,9:1; borda de input 3,4:1. Os cálculos consideram o vidro (`--glass`, até 5,5% de branco) sobre a superfície, que é o fundo efetivo mais claro do site.

## Materiais

- `--glass`: gradiente de reflexo aplicado **sobre** a superfície sólida. Nunca é o único fundo — sempre há cor opaca embaixo, para o texto não depender de transparência.
- `--hairline` / `--beam`: fios de gradiente verde que marcam topo de painel, topo de rodapé e progresso.
- `.fx-grid`: malha de 76px com máscara radial. Usada na abertura, em capacidades e nas páginas de estado.
- `.fx-grain`: grão de filme fixo a 5,5% de opacidade. **Sem `mix-blend-mode`** — uma camada fixa que mistura força o navegador a recompor a página inteira e quebra em alguns motores.
- `--glow-acid` e as sombras `--shadow-panel` / `--shadow-lift`: profundidade reservada a painéis elevados, menus e overlays.

## Movimento

O contrato é: **o conteúdo nasce visível**. A classe `motion-ok` no `<html>`, escrita por `useSiteMotion()`, é o que autoriza o CSS a escondê-lo para revelar depois. Sem JavaScript, ou com `prefers-reduced-motion: reduce`, a classe nunca entra e a página fica inteira.

- `data-reveal`: entra com opacidade e 24px de subida. Cascata por `--reveal-delay` (helper `stagger()` em `App.tsx`).
- `data-inview`: só recebe `.is-in`, sem esconder nada. Usado nas etapas do método, que acendem conforme a leitura avança.
- `useSpotlight()`: escreve `--mx`/`--my` num painel; quem decide se algo aparece é a folha de estilo, só em `(hover: hover) and (pointer: fine)`. Ignora ponteiro que não seja mouse.
- `useScrollProgress()`: barra de progresso do cabeçalho e troca do cabeçalho para vidro, medidas por `requestAnimationFrame`.
- A abertura tem um feixe lento (15s), o ponto de "live" pulsando e as linhas do título subindo atrás de uma máscara. Todos desligam com movimento reduzido.
- A altura do cabeçalho nunca muda no scroll — só o material.

## Componentes existentes

- `Button`: primary, secondary, outline, ghost, link e destructive. Área padrão de 44px, grande de 52px; foco global de 2px com offset. O primary tem preenchimento em gradiente, reflexo interno e um brilho que atravessa no hover. Disabled reduz opacidade e bloqueia interação; loading deve usar `aria-busy` e texto da ação.
- `Input` / `Textarea`: superfícies sólidas, borda perceptível, label persistente, placeholder legível, `aria-invalid` e mensagem conectada por `aria-describedby`. Não usar placeholder como label.
- `.panel`: material base de card, tile e formulário. Fio de gradiente no topo, brilho que segue o ponteiro e elevação no hover. Cards informativos continuam sem simular links.
- `.frame` / `.frame-corners`: moldura de foto com zoom suave no hover e cantos de HUD. Os cantos são decoração, não um controle.
- `Badge`, `Dialog`, `DropdownMenu`, `Popover`, `Tooltip`, `Table`: primitivas Radix inalteradas, com os tokens semânticos acima. Radix mantém focus trap, Escape e teclado.

## Fluxos e acessibilidade

- Home preserva IDs `top`, `about`, `capabilities`, `work`, `method`, `contact`.
- Menu mobile é uma navegação expansível não modal: Tab segue a ordem natural, Escape fecha e retorna ao acionador, clique externo fecha.
- Link de pular para o conteúdo. Seção atual usa `aria-current` e indicação visual.
- Vídeo: pausa fora da tela/aba e preferência de movimento reduzido. A faixa de operação da abertura é `aria-hidden` — repete conteúdo já presente nas capacidades.
- Contato não tem API no projeto atual. Valida os campos e prepara um link `mailto` para revisão/envio pelo visitante. Nunca mostrar "enviado" ou "recebido" sem envio real.
- 404 e erro usam português, a mesma atmosfera da home e ação de recuperação clara.

Não introduzir modais, tabelas ou tooltips na landing só para demonstrar estilos. As primitivas existentes estão preparadas para uso quando o conteúdo exigir.
