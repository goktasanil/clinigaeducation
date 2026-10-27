import { useEffect, useState, type FormEvent } from "react";
import { Loader2, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePortalPaymentsCopy } from "@/components/portal/portal-payments-copy";
import {
  formatPortalPayment,
  portalPaymentAccountEmail,
  startPortalCheckout,
  type PortalBillingDetails,
  type PortalCheckoutSelection,
  type PortalPaymentQuote,
} from "@/lib/portal-payments";

type Props = { selection: PortalCheckoutSelection; quote: PortalPaymentQuote; onClose: () => void };
const emptyBilling = (): PortalBillingDetails => ({
  name: "",
  surname: "",
  gsmNumber: "",
  identityNumber: "",
  billingAddress: { address: "", contactName: "", city: "", country: "", zipCode: "" },
});

export function PortalBillingDialog({ selection, quote, onClose }: Props) {
  const { copy, locale } = usePortalPaymentsCopy();
  const [billing, setBilling] = useState(emptyBilling);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void portalPaymentAccountEmail()
      .then((value) => {
        if (active) setEmail(value);
      })
      .catch(() => {
        if (active) window.location.href = "/auth?next=" + encodeURIComponent("/portal#uyelik");
      });
    return () => {
      active = false;
    };
  }, []);

  const close = () => {
    if (pending) return;
    setBilling(emptyBilling());
    onClose();
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || quote.provider !== "iyzico" || quote.amountMinor === null || !email) return;
    const normalized: PortalBillingDetails = {
      name: billing.name.trim(),
      surname: billing.surname.trim(),
      gsmNumber: billing.gsmNumber.trim(),
      identityNumber: billing.identityNumber.trim(),
      billingAddress: Object.fromEntries(
        Object.entries(billing.billingAddress).map(([key, value]) => [key, value?.trim() || ""]),
      ) as PortalBillingDetails["billingAddress"],
    };
    if (
      !normalized.name ||
      !normalized.surname ||
      !/^\+[1-9]\d{7,14}$/.test(normalized.gsmNumber) ||
      normalized.identityNumber.length < 5 ||
      !normalized.billingAddress.address ||
      !normalized.billingAddress.contactName ||
      !normalized.billingAddress.city ||
      !normalized.billingAddress.country
    ) {
      setError(copy.invalidBilling);
      return;
    }
    setPending(true);
    setError("");
    try {
      if ((await portalPaymentAccountEmail()) !== email) throw new Error("AUTH_REQUIRED");
      const result = await startPortalCheckout(selection, normalized, quote);
      setBilling(emptyBilling());
      window.location.href = result.url;
    } catch (failure) {
      if (failure instanceof Error && failure.message === "AUTH_REQUIRED") {
        setBilling(emptyBilling());
        window.location.href = "/auth?next=" + encodeURIComponent("/portal#uyelik");
      } else if (failure instanceof Error && failure.message === "BILLING_DATA_REQUIRED") {
        setError(copy.invalidBilling);
      } else setError(copy.error);
    } finally {
      setPending(false);
    }
  };

  const inputClass =
    "mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal disabled:bg-slate-100";
  const field = (
    key: "name" | "surname" | "gsmNumber" | "identityNumber",
    label: string,
    maxLength: number,
  ) => (
    <label className="text-sm font-medium text-navy">
      {label}
      <input
        value={billing[key]}
        onChange={(event) => setBilling((value) => ({ ...value, [key]: event.target.value }))}
        required
        maxLength={maxLength}
        disabled={pending}
        autoComplete="off"
        type={key === "gsmNumber" ? "tel" : "text"}
        className={inputClass}
      />
    </label>
  );
  const addressField = (
    key: keyof PortalBillingDetails["billingAddress"],
    label: string,
    maxLength: number,
    optional = false,
  ) => (
    <label
      className={"text-sm font-medium text-navy " + (key === "address" ? "sm:col-span-2" : "")}
    >
      {label}
      <input
        value={billing.billingAddress[key] || ""}
        onChange={(event) =>
          setBilling((value) => ({
            ...value,
            billingAddress: { ...value.billingAddress, [key]: event.target.value },
          }))
        }
        required={!optional}
        maxLength={maxLength}
        disabled={pending}
        autoComplete="off"
        className={inputClass}
      />
    </label>
  );

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        className="max-h-[92svh] max-w-2xl overflow-y-auto rounded-2xl [&>button.absolute]:hidden"
        aria-describedby="portal-billing-description"
      >
        <DialogHeader>
          <DialogTitle>{copy.billingTitle}</DialogTitle>
          <DialogDescription id="portal-billing-description">
            {copy.billingDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-teal/20 bg-teal/5 px-4 py-3">
          <p className="font-semibold text-navy">
            {selection.kind === "membership" ? selection.plan.toUpperCase() : selection.pack} ·{" "}
            {formatPortalPayment(quote.amountMinor, selection.currency, locale)}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {selection.kind === "credits"
              ? copy.oneTime
              : selection.yearly
                ? copy.recurringAnnual
                : copy.recurringMonthly}
          </p>
          <p className="mt-1 text-xs text-slate-600">{copy.provider}: iyzico</p>
        </div>
        <form onSubmit={(event) => void submit(event)} autoComplete="off">
          <div className="grid gap-3 sm:grid-cols-2">
            {field("name", copy.name, 100)}
            {field("surname", copy.surname, 100)}
            <label className="text-sm font-medium text-navy">
              {copy.email}
              <input type="email" value={email} readOnly disabled className={inputClass} />
            </label>
            {field("gsmNumber", copy.phone, 16)}
            {field("identityNumber", copy.identity, 40)}
            {addressField("contactName", copy.contactName, 200)}
            {addressField("address", copy.address, 500)}
            {addressField("city", copy.city, 100)}
            {addressField("country", copy.country, 100)}
            {addressField("zipCode", copy.zip, 20, true)}
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-600">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
            {copy.privacy}
          </p>
          {error && (
            <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          )}
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" disabled={pending} onClick={close}>
              {copy.cancel}
            </Button>
            <Button
              type="submit"
              disabled={
                pending || !email || quote.provider !== "iyzico" || quote.amountMinor === null
              }
              className="bg-navy text-white"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.continue}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
