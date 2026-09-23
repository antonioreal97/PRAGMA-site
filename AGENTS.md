## Learned User Preferences

- Responder em português (Brasil).
- Subir o site com pnpm via filter (`pnpm --filter @workspace/pragma-live-production dev`); não usar `npm run dev` na raiz do monorepo.
- Ao subir o dev server, confirmar que a página servida é o site PRAGMA — outros apps do monorepo podem ocupar a mesma porta e parecer “o site errado”.
- Tipografia principal: Montserrat (self-hosted); DM Mono só em metadados, eyebrows e labels.
- Preferência visual na abertura: mosaico cinematográfico moderno (referência SpaceX), com tiles densos (metade do tamanho para caber mais fotos); fotos editáveis no Sanity, com origem em `FOTOS/` e fallback local comprimido.
- Intro/gate da página: só após movimento do mouse; círculo com logo (`public/favicon.svg`) e flash de fotos atrás dela (~2s); véu revela a página ao redor do círculo (sem véu nas fotos do flash).
- Ao selecionar fotos de `FOTOS/` para o site, evitar duplicatas óbvias (cópias `(1)`, rajadas do mesmo clique).

## Learned Workspace Facts

- Monorepo pnpm; o site PRAGMA fica em `artifacts/pragma-live-production` (`@workspace/pragma-live-production`). Outros artifacts incluem `api-server` e `mockup-sandbox`.
- O `package.json` da raiz não tem script `dev`; o Vite do site sobe em `http://localhost:5173`.
- Conteúdo da landing (copy, fotos, vídeo) vem do Sanity em runtime; schema com singletons `home` e `siteSettings`. Hero de abertura usa `home.hero.mosaic` (array de imagens); `home.sectionOrder` define a ordem das seções (vazio → ordem padrão); poster/vídeo de abertura saíram do schema.
- Projeto Sanity: `cy9xfpoq`, dataset `production` (PRAGMA Live). Studio hospedado: `https://pragma-live.sanity.studio` (não usar `https://cy9xfpoq.sanity.studio`).
- Studio local embutido em `/studio` (entry Vite separado); republicar schema com `pnpm --filter @workspace/pragma-live-production studio:deploy`.
- No Studio, o documento Página inicial tem a aba Imagens (ao lado de Conteúdo), listando fotos por seção — mosaico, o que fazemos, em campo, bastidores e método.
- Perguntas do formulário de contato vêm do Sanity (`home` → Contato → Formulário); tipos Nome, E-mail, texto curto e texto longo (Nome e E-mail obrigatórios para montar o e-mail).
- Deploy de produção do site: `https://pragmasite.vercel.app` — origem que precisa estar nas CORS do projeto Sanity (também `http://localhost:5173` e o preview/frame do Presentation).
- Leitura pública do Sanity no site não exige `SANITY_API_TOKEN`; scripts `seed` / `seed:mosaic` precisam do token ou de `sanity exec --with-user-token`.
- Fotos-fonte ficam em `FOTOS/`; tiles locais (fallback do build) em `artifacts/pragma-live-production/src/assets/mosaic/` como AVIF leves. Processar com `swift scripts/photos/process-mosaic.swift` (JPEG HDR/gain map passam por ffmpeg antes do AVIF, senão saem pretos no macOS); popular o CMS com `pnpm --filter @workspace/pragma-live-production seed:mosaic`.
- No `dist` do Vite entram sobretudo os AVIF do mosaico; JPEG grandes de galeria/método/about vêm do CDN Sanity em runtime, não do bundle.
- Âncora histórica da marca no eyebrow do hero: texto estático “desde 2016” (sem contador de anos/meses/dias).
