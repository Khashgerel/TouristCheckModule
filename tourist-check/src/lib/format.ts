export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const p = iso.slice(0, 10).split('-');
  if (p.length !== 3) return iso;
  return `${p[0]}/${p[1]}/${p[2]}`;
}

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return '';
  const p = iso.slice(0, 10).split('-');
  if (p.length !== 3) return iso;
  return `${+p[1]}/${+p[2]}`;
}
