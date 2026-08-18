import { useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitLead } from "@/lib/leads.functions";
import { getCountries } from "@/data/portal";
import type { AppointmentSelection } from "./AppointmentPicker";

export type ContactSuccess = {
  confirmationCode: string;
  appointmentAt: string | null;
  name: string;
  email: string;
};

const NAME_REGEX = /^[\p{L}\s.'-]+$/u;
const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;
const normalizePhone = (value: string) => value.replace(/[()\s-]/g, "");

const makeSchema = (t: (k: string) => string) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2, t("contact.form.validation.required"))
      .max(80)
      .regex(NAME_REGEX, t("contact.form.validation.required")),
    email: z
      .string()
      .trim()
      .min(1, t("contact.form.validation.required"))
      .email(t("contact.form.validation.email"))
      .max(120),
    phone: z
      .string()
      .trim()
      .min(1, t("contact.form.validation.required"))
      .transform(normalizePhone)
      .refine((value) => PHONE_REGEX.test(value), t("contact.form.validation.phone")),
    level: z.string().min(1, t("contact.form.validation.required")),
    country: z.string().min(1, t("contact.form.validation.required")),
    service: z.string().min(1, t("contact.form.validation.required")),
    deadline: z
      .string()
      .min(1, t("contact.form.validation.required"))
      .refine(
        (value) => value >= new Date().toISOString().slice(0, 10),
        t("contact.form.validation.required"),
      ),
    message: z.string().trim().min(20, t("contact.form.validation.minMessage")).max(2000),
    consent: z.boolean().refine((v) => v === true, t("contact.form.validation.consent")),
    website: z.string().max(0, t("contact.form.validation.spam")).optional().or(z.literal("")),
  });

type FormValues = z.infer<ReturnType<typeof makeSchema>>;

export function ContactForm({
  appointment,
  onSuccess,
  prefillIntent,
}: {
  appointment?: AppointmentSelection;
  onSuccess?: (result: ContactSuccess) => void;
  prefillIntent?: string | null;
}) {
  const { t, i18n } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const submit = useServerFn(submitLead);
  const queryClient = useQueryClient();
  const startedAtRef = useRef<number>(Date.now());

  const levels = t("contact.form.levels", { returnObjects: true }) as string[];
  const services = t("contact.form.services", { returnObjects: true }) as string[];
  const countries = useMemo(
    () => getCountries(i18n.resolvedLanguage || i18n.language || "tr"),
    [i18n.resolvedLanguage, i18n.language],
  );

  const prefillService = prefillIntent && services.includes(prefillIntent) ? prefillIntent : "";

  const form = useForm<FormValues>({
    resolver: zodResolver(makeSchema(t)),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      level: "",
      country: "",
      service: prefillService,
      deadline: "",
      message: prefillIntent ? `[${prefillIntent}] ` : "",
      consent: false,
      website: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    // Honeypot: hidden field must remain empty
    if (data.website && data.website.length > 0) {
      toast.error(t("contact.form.validation.spam"));
      return;
    }
    // Timing gate: block bots that autofill+submit under 2s
    const elapsed = Date.now() - startedAtRef.current;
    if (elapsed < 2000) {
      toast.error(t("contact.form.validation.tooFast"));
      return;
    }

    setSubmitting(true);
    try {
      const appointmentAt =
        appointment && appointment.date && appointment.time
          ? (() => {
              const [h, m] = appointment.time.split(":").map(Number);
              const d = new Date(appointment.date);
              d.setHours(h, m, 0, 0);
              return d.toISOString();
            })()
          : null;

      const result = await submit({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          level: data.level,
          country: data.country,
          service: data.service,
          deadline: data.deadline,
          message: data.message,
          language: i18n.language,
          appointmentAt,
          startedAt: startedAtRef.current,
          honeypot: data.website ?? "",
        },
      });

      if (!result.ok) {
        if (result.error === "slot_taken") {
          toast.error(t("contact.errorSlotTaken"));
        } else {
          toast.error(t("contact.errorGeneric"));
        }
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["booked-slots"] });
      toast.success(t("contact.success"));
      form.reset();
      onSuccess?.({
        confirmationCode: result.confirmationCode,
        appointmentAt: result.appointmentAt,
        name: data.name,
        email: data.email,
      });
    } catch (err) {
      console.error("[contact] submit failed", err);
      toast.error(t("contact.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 rounded-xl border border-border/70 bg-card p-6 shadow-card"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("contact.form.name")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input maxLength={80} autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("contact.form.email")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    maxLength={120}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("contact.form.phone")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+90 5xx xxx xx xx"
                    maxLength={20}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("contact.form.deadline")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("contact.form.level")} <span className="text-destructive">*</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("contact.form.selectPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {levels.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("contact.form.country")} <span className="text-destructive">*</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("contact.form.selectPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("contact.form.service")} <span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("contact.form.selectPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("contact.form.message")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea rows={5} maxLength={2000} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 rounded-md border border-border/60 bg-muted/30 p-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1"
                  aria-required="true"
                />
              </FormControl>
              <div className="flex-1 space-y-1 leading-none">
                <FormLabel className="cursor-pointer text-sm font-normal text-foreground/80">
                  <Trans
                    i18nKey="contact.form.consent"
                    components={[
                      <Link
                        key="privacy"
                        to="/gizlilik"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-teal underline-offset-2 hover:underline"
                      />,
                    ]}
                  />
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Honeypot anti-spam field — hidden from real users, catches bots */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden opacity-0"
            >
              <label>
                Website (do not fill)
                <input type="text" tabIndex={-1} autoComplete="off" {...field} />
              </label>
            </div>
          )}
        />

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="h-12 w-full bg-gold text-gold-foreground hover:bg-gold/90"
        >
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {t("contact.form.submit")}
        </Button>
      </form>
    </Form>
  );
}
