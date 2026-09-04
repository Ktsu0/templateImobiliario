export function formatPrice(price: number, transaction: "venda" | "aluguel"): string {
  const numberFormatted = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  // Prefixing "R$" by hand keeps an ASCII space between symbol and number;
  // Intl's currency style inserts a non-breaking space on some ICU versions.
  const withCurrency = `R$ ${numberFormatted}`;
  return transaction === "aluguel" ? `${withCurrency}/mês` : withCurrency;
}
