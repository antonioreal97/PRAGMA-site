/** Número padrão PRAGMA (DDI+DDD+número), usado se o CMS ainda não tiver o campo. */
export const DEFAULT_WHATSAPP = "5561992733018";

export function whatsappDigits(phone: string | undefined) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits || DEFAULT_WHATSAPP;
}

export function whatsappUrl(phone: string | undefined, text?: string) {
  const base = `https://wa.me/${whatsappDigits(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
