export type CurrencySettings = { currency: string; currency_minor_units: number };

export const DEFAULT_CURRENCY: CurrencySettings = { currency: "twd", currency_minor_units: 0 };

/** Formats a whole-unit integer price (as stored in the DB) for display. */
export function formatMoney(amount: number, settings: CurrencySettings = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: settings.currency.toUpperCase(),
    minimumFractionDigits: settings.currency_minor_units,
    maximumFractionDigits: settings.currency_minor_units,
  }).format(amount);
}
