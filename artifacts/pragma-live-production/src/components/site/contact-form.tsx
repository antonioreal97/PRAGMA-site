import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  ContactFormContent,
  ContactQuestion,
  ContactQuestionKind,
} from "@/sanity/types";

const fallbackForm: ContactFormContent = {
  heading: "Conte sobre o seu projeto",
  intro:
    "Preencha o briefing para preparar seu e-mail. Todos os campos são obrigatórios.",
  submitLabel: "Preparar briefing",
  submitHint: "Você revisa e envia pelo seu aplicativo de e-mail.",
  fields: [
    {
      id: "name",
      label: "Seu nome",
      placeholder: "Como podemos te chamar?",
      kind: "name",
    },
    {
      id: "email",
      label: "Seu e-mail",
      placeholder: "voce@empresa.com",
      kind: "email",
    },
    {
      id: "project",
      label: "O que vamos colocar de pé?",
      placeholder: "Tipo de evento, data, local e o que você tem em mente…",
      hint: "Ainda não tem todos os detalhes? Comece pela ideia.",
      kind: "textarea",
    },
  ],
};

const kinds = new Set<ContactQuestionKind>([
  "name",
  "email",
  "text",
  "textarea",
]);

function formContent(form?: ContactFormContent): ContactFormContent {
  const fields = (form?.fields ?? []).flatMap((field) => {
    const id = field.id?.trim();
    if (!id || !kinds.has(field.kind) || !field.label?.trim()) return [];
    return [{ ...field, id, label: field.label.trim() }];
  });
  if (!fields.length) return fallbackForm;
  return {
    heading: form?.heading?.trim() || fallbackForm.heading,
    intro: form?.intro?.trim() || fallbackForm.intro,
    submitLabel: form?.submitLabel?.trim() || fallbackForm.submitLabel,
    submitHint: form?.submitHint?.trim() || fallbackForm.submitHint,
    fields,
  };
}

function maxLength(kind: ContactQuestionKind) {
  if (kind === "name") return 100;
  if (kind === "email") return 254;
  if (kind === "textarea") return 1500;
  return 200;
}

function emptyMessage(field: ContactQuestion) {
  if (field.kind === "email")
    return "Informe um e-mail válido, como voce@empresa.com.";
  if (field.kind === "name")
    return "Informe seu nome para identificarmos a conversa.";
  if (field.kind === "textarea")
    return "Conte um pouco sobre o que você está planejando.";
  return `Preencha “${field.label}”.`;
}

function briefingBody(fields: ContactQuestion[], values: Map<string, string>) {
  const name = fields.find((field) => field.kind === "name");
  const reply = fields.find((field) => field.kind === "email");
  const questions = fields.filter(
    (field) => field.kind !== "name" && field.kind !== "email",
  );
  const answers = questions
    .map((field) => {
      const value = values.get(field.id) ?? "";
      return questions.length === 1 ? value : `${field.label}\n${value}`;
    })
    .join("\n\n");
  const lines = ["Olá, PRAGMA!", "", answers, ""];
  if (name) lines.push(`Nome: ${values.get(name.id) ?? ""}`);
  if (reply) lines.push(`E-mail: ${values.get(reply.id) ?? ""}`);
  return lines.join("\n");
}

export function ContactForm({
  email,
  form,
}: {
  email: string;
  form?: ContactFormContent;
}) {
  const content = formContent(form);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [draft, setDraft] = useState<{ body: string; url: string } | null>(
    null,
  );
  const [copyState, setCopyState] = useState<
    "idle" | "loading" | "copied" | "error"
  >("idle");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const data = new FormData(formEl);
    const values = new Map(
      content.fields.map((field) => [
        field.id,
        String(data.get(field.id) || "").trim(),
      ]),
    );
    const next: Record<string, string> = {};
    for (const field of content.fields) {
      const value = values.get(field.id) ?? "";
      if (field.kind === "email") {
        const input = formEl.elements.namedItem(field.id);
        if (
          !value ||
          !(input instanceof HTMLInputElement) ||
          !input.validity.valid
        ) {
          next[field.id] = emptyMessage(field);
        }
        continue;
      }
      if (!value) next[field.id] = emptyMessage(field);
    }
    setErrors(next);
    const first = content.fields.find((field) => next[field.id]);
    if (first) {
      requestAnimationFrame(() => {
        (formEl.elements.namedItem(first.id) as HTMLElement | null)?.focus();
      });
      return;
    }
    const name = content.fields.find((field) => field.kind === "name");
    const subjectName = name ? values.get(name.id) : "";
    const body = briefingBody(content.fields, values);
    setDraft({
      body,
      url: `mailto:${email}?subject=${encodeURIComponent("Novo projeto | " + (subjectName || "Briefing"))}&body=${encodeURIComponent(body)}`,
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
        const field = target.name;
        setErrors((current) => ({ ...current, [field]: undefined }));
        setDraft(null);
        setCopyState("idle");
      }}
      data-testid="form-contact"
    >
      <div className="form-heading">
        <h3>{content.heading}</h3>
        <p>{content.intro}</p>
      </div>
      {content.fields.map((field) => {
        const error = errors[field.id];
        const describedBy =
          [field.hint ? `${field.id}-hint` : null, error ? `${field.id}-error` : null]
            .filter(Boolean)
            .join(" ") || undefined;
        const controlProps = {
          id: field.id,
          name: field.id,
          required: true,
          maxLength: maxLength(field.kind),
          placeholder: field.placeholder,
          "aria-invalid": !!error,
          "aria-describedby": describedBy,
          "data-testid": `input-${field.id}`,
        };
        return (
          <div className="field" key={field.id}>
            <label htmlFor={field.id}>{field.label}</label>
            {field.kind === "textarea" ? (
              <Textarea {...controlProps} />
            ) : (
              <Input
                {...controlProps}
                type={field.kind === "email" ? "email" : "text"}
                autoComplete={
                  field.kind === "email"
                    ? "email"
                    : field.kind === "name"
                      ? "name"
                      : undefined
                }
                spellCheck={field.kind === "email" ? false : undefined}
              />
            )}
            {field.hint ? (
              <p className="field-hint" id={`${field.id}-hint`}>
                {field.hint}
              </p>
            ) : null}
            {error ? (
              <p className="field-error" id={`${field.id}-error`}>
                {error}
              </p>
            ) : null}
          </div>
        );
      })}
      <div className="form-foot">
        <Button type="submit" size="lg" data-testid="button-submit-contact">
          {content.submitLabel} <ArrowUpRight aria-hidden="true" />
        </Button>
        {content.submitHint ? (
          <p className="form-hint">{content.submitHint}</p>
        ) : null}
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
