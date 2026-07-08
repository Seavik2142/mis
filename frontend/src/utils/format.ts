export const getCurrencySymbol = (): string => {
  return localStorage.getItem("setting_currency") || "USD";
};

// Exchange rates relative to USD (base currency in database)
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  KHR: 4100.0, // 1 USD = 4100 Khmer Riel
  EUR: 0.92    // 1 USD = 0.92 Euro
};

export const formatMoney = (value: number, fractionDigits: number | null = null): string => {
  const currency = getCurrencySymbol();
  const rate = EXCHANGE_RATES[currency] || 1.0;
  
  // Convert value from USD to target currency
  const convertedValue = Number(value) * rate;
  
  // Select appropriate locale
  const locale = currency === "KHR" ? "km-KH" : currency === "EUR" ? "de-DE" : "en-US";
  
  // Default decimal places: 0 for Riel (no cents/sub-units), 2 for USD/EUR
  let fd = fractionDigits;
  if (fd === null) {
    fd = currency === "KHR" ? 0 : 2;
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: fd,
      minimumFractionDigits: fd
    }).format(convertedValue);
  } catch (e) {
    return `${currency} ${convertedValue.toFixed(fd)}`;
  }
};
