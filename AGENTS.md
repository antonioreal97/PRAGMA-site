## Learned User Preferences

- Responder em português (Brasil).
- Subir o site com pnpm via filter (`pnpm --filter @workspace/pragma-live-production dev`); não usar `npm run dev` na raiz do monorepo.
- Ao subir o dev server, confirmar que a página servida é o site PRAGMA — outros apps do monorepo podem ocupar a mesma porta e parecer “o site errado”.
- Preferência visual na abertura: mosaico/hero cinematográfico moderno (referência SpaceX), com fotos reais da pasta `FOTOS`.

## Learned Workspace Facts

- Monorepo pnpm; o site PRAGMA fica em `artifacts/pragma-live-production` (`@workspace/pragma-live-production`). Outros artifacts incluem `api-server` e `mockup-sandbox`.
- O `package.json` da raiz não tem script `dev`; o Vite do site sobe em `http://localhost:5173`.
- Conteúdo da landing (copy, fotos, vídeo) vem do Sanity em runtime; schema com singletons `home` e `siteSettings`.
- Projeto Sanity: `cy9xfpoq`, dataset `production` (PRAGMA Live). Studio hospedado: `https://pragma-live.sanity.studio` (não usar `https://cy9xfpoq.sanity.studio`).
- Studio local embutido em `/studio` (entry Vite separado); republicar schema com `pnpm --filter @workspace/pragma-live-production studio:deploy`.
- Deploy de produção do site: `https://pragmasite.vercel.app` — origem que precisa estar nas CORS do projeto Sanity (e no preview/frame do Presentation).
- Fotos-fonte para mosaico/mídia ficam em `FOTOS/` na raiz do repo; há script de processamento em `scripts/photos/`.
