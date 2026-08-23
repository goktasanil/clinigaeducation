export const STRIPE_PLATFORM_MARGIN_BPS = 500;
export const STRIPE_PROCESSING_RESERVE_BPS = 350;
export const STRIPE_PROCESSING_RESERVE_FIXED_CENTS = 25;

export function calculateMarketplaceApplicationFee(
  amountMinor: number,
  platformMarginBps = STRIPE_PLATFORM_MARGIN_BPS,
  processingReserveBps = STRIPE_PROCESSING_RESERVE_BPS,
  processingReserveFixed = STRIPE_PROCESSING_RESERVE_FIXED_CENTS,
) {
  if (!Number.isInteger(amountMinor) || amountMinor < 100) {
    throw new Error("INVALID_MARKETPLACE_AMOUNT");
  }
  const percentageFee = Math.ceil(
    (amountMinor * (platformMarginBps + processingReserveBps)) / 10_000,
  );
  return Math.min(amountMinor - 1, percentageFee + processingReserveFixed);
}

export function stripeIntegrationIdentifier(prefix: string) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const suffix = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  return `${prefix}_${suffix}`;
}

export function toMinorUnits(amount: number) {
  if (!Number.isFinite(amount) || amount < 1 || amount > 1_000_000) {
    throw new Error("INVALID_MARKETPLACE_AMOUNT");
  }
  return Math.round(amount * 100);
}
