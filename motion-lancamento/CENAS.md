# PRAGMA Live — Novo site · Motion (HyperFrames)

Duração 21,5 s · 30 fps · H.264 · sound design sintetizado (opcional — o vídeo funciona mudo).
Linguagem "Sinal e Luz": fundo #060907, superfícies #111814/#18211B, verde #21E05D, brilho #5FF5B0,
branco #EDF0E8, cinza #A9B4AB. Montserrat (títulos) · DM Mono (labels/metadados/stack).

## Cenas e tempos

| Cena | Tempo | O que acontece | Fonte real usada |
|---|---|---|---|
| 01 Sinal de abertura | 0,0 – 2,5 | Linha verde atravessa o quadro (0,1), indicador pulsa (0,55), círculo abre (0,8) com flashes de fotos do mosaico (0,9–2,1), símbolo PRAGMA (1,0), "PRAGMA LIVE / NOVO SITE / 2026" (1,35) | `favicon.svg` do site, tiles do mosaico |
| 02 Revelação do site | 2,5 – 6,0 | Círculo expande e revela a abertura real (2,45), push-in lento no mosaico em movimento, "NOVO SITE NO AR" entra por máscara (3,1) e sai (4,75); câmera recua e a home inteira "respira" como plano de monitor (5,0–6,0) | Vídeo `hero-desktop.mp4` (captura frame a frame do site real, 1440×900 @1,5x) |
| 03 Identidade que virou interface | 6,0 – 10,0 | Título (6,6), 4 recortes deslizam com perspectiva leve e alinham no grid (6,75–7,2), cadeia de transmissão verde liga LUZ → SINAL → MOVIMENTO → BASTIDORES (7,65–9,15) | Recortes de screenshots @2x: mosaico, seção Eventos (01/05), cards de Soluções, Em campo |
| 04 Experiência e conteúdo | 10,0 – 14,5 | Scroll cinematográfico desktop pelo método/Em campo (10,0); linha de varredura troca para mobile (12,25); texto "DESIGN, CONTEÚDO E MOVIMENTO / EM UM ÚNICO SISTEMA" (10,45–13,95) | `scroll-desktop.mp4`, `scroll-mobile.mp4` (390×844 @3x), screenshots mobile |
| 05 Stack | 14,5 – 17,5 | Interface recua ao centro; 4 labels entram com pulsos: React + TypeScript (14,95), Vite + Tailwind CSS (15,33), Sanity CMS (15,71), Vercel (16,09) | Screenshot da home |
| 06 Encerramento | 17,5 – 21,5 | Interface colapsa numa linha luminosa (17,5–18,9) que conduz ao logotipo (18,75); "EXPERIÊNCIAS AO VIVO. / AGORA TAMBÉM NO DIGITAL." (18,95); URL (19,2); pulso verde (19,4); frame final limpo de 19,95 a 21,5 | `PRAGMA_Horizontal_Verde_Branco.svg` do site (sem alterações) |

## Como editar

- Tudo vive em `src/template.html` (CSS + timeline GSAP com os tempos acima). Depois de editar:
  `python3 src/build.py` → regenera `feed-4x5/index.html` (1080×1350) e `wide-16x9/index.html` (1920×1080).
  Os enquadramentos de cada formato ficam nos blocos `.portrait` / `.landscape` do CSS e no objeto `L` do script.
- Som: `python3 src/sound_design.py` (gera `_base/assets/audio/sound-design.wav`), depois `python3 src/build.py`.
  Para versão muda, remova o elemento `<audio id="sfx">` ou zere `data-volume`.
- Preview/edição visual: `cd feed-4x5 && npx hyperframes preview`
- Render: `cd feed-4x5 && npx hyperframes render --quality delivery -o ../renders/pragma-novo-site-1080x1350.mp4`

## Origem das capturas

O site publicado (sitepragma.com.br) foi salvo pelo navegador (HTML/JS/CSS do build + conteúdo e fotos do Sanity)
e reproduzido localmente com Playwright, com as animações CSS pausadas e avançadas quadro a quadro — por isso os vídeos
são determinísticos e sem cursor, barra de navegador ou telas de carregamento. Nenhuma interface foi recriada.
