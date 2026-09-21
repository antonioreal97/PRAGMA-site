import { Brand } from "@/components/site/brand";
import { Button } from "@/components/ui/button";

export function CmsLoading() {
  return (
    <main className="status-page" aria-busy="true">
      <Brand />
      <span className="status-code">Carregando</span>
      <h1>Abrindo a operação.</h1>
      <p>Buscando o conteúdo publicado no Sanity.</p>
    </main>
  );
}

export function CmsError({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <main className="status-page">
      <Brand />
      <span className="status-code">Sanity</span>
      <h1>Não foi possível carregar o conteúdo.</h1>
      <p>{error.message}</p>
      <pre>{error.stack || error.message}</pre>
      <div className="status-actions">
        <Button type="button" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    </main>
  );
}
