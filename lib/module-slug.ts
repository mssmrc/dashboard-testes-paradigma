/**
 * Converte nome do módulo para segmento de URL seguro.
 * Usa encodeURIComponent para preservar acentos e caracteres especiais.
 */
export function moduleToSlug(moduleName: string): string {
  return encodeURIComponent(moduleName);
}

/**
 * Decodifica slug da URL para o nome original do módulo.
 * Next.js pode já decodificar params — decodeURIComponent é idempotente para strings normais.
 */
export function slugToModule(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}
