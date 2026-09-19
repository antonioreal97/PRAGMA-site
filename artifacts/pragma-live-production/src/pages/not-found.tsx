import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "wouter";
import { Brand } from "@/components/site/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="status-page">
      <Link href="/" aria-label="PRAGMA: página inicial">
        <Brand />
      </Link>
      <span className="status-code">404</span>
      <h1>Essa página saiu de cena.</h1>
      <p>
        O endereço pode ter mudado ou não existir. Volte ao início para conhecer
        a PRAGMA ou fale com a nossa equipe.
      </p>
      <div className="status-actions">
        <Button asChild>
          <Link href="/">
            <ArrowLeft aria-hidden="true" /> Voltar ao início
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <a href="mailto:ola@pragma.live">
            <Mail aria-hidden="true" /> Falar com a PRAGMA
          </a>
        </Button>
      </div>
    </main>
  );
}
