/** "1 quarto" / "4 quartos" — an icon alone does not say what it counts. */
export function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
