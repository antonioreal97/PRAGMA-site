# PRAGMA: sistema de interface

A fonte de verdade é `artifacts/pragma-live-production/src/index.css`. Tokens semânticos são expostos ao Tailwind 4 por `@theme inline` e usados pela biblioteca Radix existente. Não há uma segunda biblioteca.

| Fundação | Padrão |
| --- | --- |
| Fundo | `--ink` #080b0a; `--ink-soft` #0e1310 |
| Superfícies | `--surface` #131a16; `--surface-2` #1b241e |
| Texto | `--paper` #edf0e8; secundário `--paper-dim` #adb8af |
| Marca/ação | `--acid` #21e05d; hover #57ed85; texto escuro |
| Erro | `--error` #ffaaa3, sempre com mensagem textual |
| Fontes | Space Grotesk (texto/títulos), DM Mono (metadados). WOFF2 locais, `font-display: swap`; licenças em `public/fonts` |
| Texto corrente | 16px / 1.65; inputs 16px para evitar zoom automático em mobile |
| Escala | 4, 8, 12, 16, 24, 32, 48, 64px; seções fluidas 72–120px |
| Container | 1200px; margens fluidas 20–64px |
| Raios | controles 10px, painéis 16px, pequenos elementos 6px |
| Sombras | suaves; reservar profundidade a menus e overlays |
| Movimento | 180ms em feedback de cor/borda/pressionamento; respeitar movimento reduzido |

## Componentes existentes

- `Button`: primary, secondary, outline, ghost, link e destructive. Área padrão de 44px, grande de 50px; foco global de 2px com offset. Disabled reduz opacidade e bloqueia interação; loading deve usar `aria-busy` e texto da ação. Variante pequena de 36px é exclusiva de contextos compactos, não usada nos CTAs da landing.
- `Input` / `Textarea`: superfícies sólidas, borda perceptível, label persistente, placeholder legível, `aria-invalid` e mensagem conectada por `aria-describedby`. Não usar placeholder como label.
- `Card`: raio de painel, borda semântica, sombra mínima. Cards informativos não simulam links com movimento ou cursor.
- `Badge`: cores semânticas, tipografia de 12px, sem helpers de hover inexistentes.
- `Dialog`: primitivas Radix mantêm focus trap e Escape; margem de 16px no mobile, altura máxima em `dvh`, botão Fechar de 44px.
- `DropdownMenu` / `Popover`: superfície popover, borda semântica, seleção/foco por accent; interação de teclado permanece com Radix.
- `Tooltip`: superfície neutra, texto legível; verde reservado para ações. Usar apenas informação complementar.
- `Table`: container com overflow, células de 16px horizontal / 12px vertical, cabeçalho 48px, estados selected/hover com tokens existentes. Usar caption e cabeçalhos semânticos.

## Fluxos e acessibilidade

- Home preserva IDs `top`, `about`, `capabilities`, `work`, `method`, `contact`.
- Menu mobile é uma navegação expansível não modal: Tab segue a ordem natural, Escape fecha e retorna ao acionador, clique externo fecha. Destinos recebem foco sem duplicar tab stops.
- Link de pular para o conteúdo. Header mantém altura constante. Seção atual usa `aria-current` e indicação visual.
- Vídeo: pausa manual, pausa fora da tela/aba e preferência de movimento reduzido. Sem ticker, ruído fixo ou revelações que escondam conteúdo.
- Contato não tem API no projeto atual. Valida os campos e prepara um link `mailto` para revisão/envio pelo visitante. Alternativa de copiar briefing, com fallback manual em caso de erro. Nunca mostrar “enviado” ou “recebido” sem envio real.
- 404 e erro usam português, identidade da marca e ação de recuperação clara.

Não introduzir modais, tabelas ou tooltips na landing só para demonstrar estilos. As primitivas existentes estão preparadas para uso quando o conteúdo exigir.
