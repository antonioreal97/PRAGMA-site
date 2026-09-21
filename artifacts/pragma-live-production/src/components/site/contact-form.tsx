import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Field = "name" | "email" | "project";

export function ContactForm({ email }: { email: string }) {
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [draft, setDraft] = useState<{ body: string; url: string } | null>(
    null,
  );
  const [copyState, setCopyState] = useState<
    "idle" | "loading" | "copied" | "error"
  >("idle");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const project = String(data.get("project") || "").trim();
    const next: Partial<Record<Field, string>> = {};
    if (!name) next.name = "Informe seu nome para identificarmos a conversa.";
    if (
      !email ||
      !(form.elements.namedItem("email") as HTMLInputElement).validity.valid
    )
      next.email = "Informe um e-mail válido, como voce@empresa.com.";
    if (!project)
      next.project = "Conte um pouco sobre o que você está planejando.";
    setErrors(next);
    const first = (Object.keys(next) as Field[])[0];
    if (first) {
      requestAnimationFrame(() => {
        (form.elements.namedItem(first) as HTMLElement)?.focus();
      });
      return;
    }
    const body = `Olá, PRAGMA!\n\n${project}\n\nNome: ${name}\nE-mail: ${email}`;
    setDraft({
      body,
      url: `mailto:${email}?subject=${encodeURIComponent("Novo projeto | " + name)}&body=${encodeURIComponent(body)}`,
    });
  };
  const copy = async () => {
    if (!draft) return;
    setCopyState("loading");
    try {
      await navigator.clipboard.writeText(draft.body);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };
  return (
    <form
      className="panel contact-form"
      noValidate
      onSubmit={submit}
      onChange={(event) => {
        const target = event.target;
        if (!(
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement
        ))
          return;
        const field = target.name as Field;
        setErrors((current) => ({ ...current, [field]: undefined }));
        setDraft(null);
        setCopyState("idle");
      }}
      data-testid="form-contact"
    >
      <div className="form-heading">
        <h3>Conte sobre o seu projeto</h3>
        <p>
          Preencha o briefing para preparar seu e-mail. Todos os campos são
          obrigatórios.
        </p>
      </div>
      <div className="field">
        <label htmlFor="name">Seu nome</label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          maxLength={100}
          placeholder="Como podemos te chamar?"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          data-testid="input-name"
        />
        {errors.name && (
          <p className="field-error" id="name-error">
            {errors.name}
          </p>
        )}
      </div>
      <div className="field">
        <label htmlFor="email">Seu e-mail</label>
        <Input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          spellCheck={false}
          required
          maxLength={254}
          placeholder="voce@empresa.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          data-testid="input-email"
        />
        {errors.email && (
          <p className="field-error" id="email-error">
            {errors.email}
          </p>
        )}
      </div>
      <div className="field">
        <label htmlFor="project">O que vamos colocar de pé?</label>
        <Textarea
          id="project"
          name="project"
          required
          maxLength={1500}
          placeholder="Tipo de evento, data, local e o que você tem em mente…"
          aria-invalid={!!errors.project}
          aria-describedby={errors.project ? "project-error" : "project-hint"}
          data-testid="input-project"
        />
        <p className="field-hint" id="project-hint">
          Ainda não tem todos os detalhes? Comece pela ideia.
        </p>
        {errors.project && (
          <p className="field-error" id="project-error">
            {errors.project}
          </p>
        )}
      </div>
      <div className="form-foot">
        <Button type="submit" size="lg" data-testid="button-submit-contact">
          Preparar briefing <ArrowUpRight aria-hidden="true" />
        </Button>
        <p className="form-hint">
          Você revisa e envia pelo seu aplicativo de e-mail.
        </p>
      </div>
      <div aria-live="polite" aria-atomic="true">
        {draft && (
          <div className="form-message" data-testid="status-form-ready">
            <h4>
              <Check size={18} aria-hidden="true" /> Seu briefing está pronto
            </h4>
            <p>
              Abra seu e-mail para concluir o envio para{" "}
              <strong>{email}</strong>.
            </p>
            <div className="draft-actions">
              <Button asChild>
                <a href={draft.url}>
                  <Mail aria-hidden="true" /> Abrir e-mail
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={copy}
                disabled={copyState === "loading"}
                aria-busy={copyState === "loading"}
              >
                <Copy aria-hidden="true" />
                {copyState === "copied"
                  ? "Copiado"
                  : copyState === "loading"
                    ? "Copiando…"
                    : "Copiar briefing"}
              </Button>
            </div>
            {copyState === "error" && (
              <>
                <p className="field-error">
                  Não foi possível copiar. Selecione o texto abaixo e copie
                  manualmente.
                </p>
                <textarea
                  className="draft-copy"
                  readOnly
                  aria-label="Briefing para copiar"
                  value={draft.body}
                />
              </>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
