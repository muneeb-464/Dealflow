export const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar", symbol: "$" },
  { value: "PKR", label: "PKR — Pakistani Rupee", symbol: "₨" },
  { value: "EUR", label: "EUR — Euro", symbol: "€" },
  { value: "GBP", label: "GBP — British Pound", symbol: "£" },
  { value: "AED", label: "AED — UAE Dirham", symbol: "د.إ" },
  { value: "CAD", label: "CAD — Canadian Dollar", symbol: "CA$" },
  { value: "AUD", label: "AUD — Australian Dollar", symbol: "A$" },
] as const;

export type Currency = (typeof CURRENCIES)[number]["value"];
