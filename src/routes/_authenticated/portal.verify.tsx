/* eslint-disable @typescript-eslint/no-explicit-any -- Verification tables are newer than generated Supabase types. */
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, FileCheck2, Loader2, ShieldCheck, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import {
  PortalCatalogFields,
  type PortalCatalogValue,
} from "@/components/portal/PortalCatalogFields";
import { usePortalVerifyCopy } from "@/components/portal/portal-verify-copy";
import { savePortalProfile } from "@/lib/portal.functions";
import { ensurePortalProfileClient } from "@/lib/portal-browser";

export const Route = createFileRoute("/_authenticated/portal/verify")({
  head: () => ({
    meta: [
      { title: "Account Verification | CliniGA Student Portal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalVerificationPage,
});

const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxBytes = 8 * 1024 * 1024;
const isStaticHost = import.meta.env.VITE_STATIC_HOST === "true";

function PortalVerificationPage() {
  const copy = usePortalVerifyCopy();
  const saveProfile = useServerFn(savePortalProfile);
  const [role, setRole] = useState<"student" | "advertiser" | "institution">("student");
  const [documentType, setDocumentType] = useState<
    "student_document" | "identity_document" | "company_document" | "dormitory_license"
  >("student_document");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [catalog, setCatalog] = useState<PortalCatalogValue>({
    countryCode: "DE",
    city: "",
    institution: "",
    institutionId: "",
    program: "",
  });

  const submit = async () => {
    if (displayName.trim().length < 2) {
      toast.error(copy.invalidName);
      return;
    }
    if (!file || !allowedTypes.includes(file.type) || file.size > maxBytes) {
      toast.error(copy.invalidFile);
      return;
    }

    setSubmitting(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) throw new Error(copy.sessionMissing);

      const profileData = {
        displayName: displayName.trim(),
        countryCode: catalog.countryCode,
        city: catalog.city || null,
        institution: catalog.institution || null,
        program: catalog.program || null,
      };
      if (isStaticHost) await ensurePortalProfileClient(profileData);
      else await saveProfile({ data: profileData });

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "bin";
      const storagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const upload = await supabase.storage.from("portal-verification").upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upload.error) throw upload.error;

      const db = supabase as any;
      const request = await db.from("portal_verification_requests").insert({
        user_id: user.id,
        requested_role: role,
        document_storage_path: storagePath,
        document_type: documentType,
        status: "pending",
      });
      if (request.error) {
        await supabase.storage.from("portal-verification").remove([storagePath]);
        throw request.error;
      }

      setSubmitted(true);
      setFile(null);
      toast.success(copy.success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[80vh] bg-slate-50 py-8 md:py-10">
      <div className="container-prose max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <a
            href="/portal/workspace"
            className="text-sm font-semibold text-teal hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            ← {copy.back}
          </a>
          <LanguageSwitcher />
        </div>

        <div className="mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy via-[#0b5d91] to-[#7f1d5a] p-7 text-white shadow-2xl md:p-10">
          <BadgeCheck className="h-9 w-9 text-gold" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-white/75">{copy.subtitle}</p>
        </div>

        <Card className="mt-6 border-border/70 shadow-lg">
          <CardContent className="p-6 md:p-8">
            {submitted ? (
              <div className="py-8 text-center" aria-live="polite">
                <ShieldCheck className="mx-auto h-12 w-12 text-teal" />
                <h2 className="mt-4 font-display text-2xl font-semibold text-navy">
                  {copy.submittedTitle}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  {copy.submittedDesc}
                </p>
                <Button asChild className="mt-6 bg-navy text-white hover:bg-navy/90">
                  <a href="/portal/workspace">{copy.back}</a>
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-navy sm:col-span-2">
                    {copy.name}
                    <input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      maxLength={80}
                      autoComplete="name"
                      className="mt-2 h-12 w-full rounded-xl border bg-white px-3"
                      placeholder={copy.namePlaceholder}
                    />
                  </label>
                  <label className="text-sm font-semibold text-navy">
                    {copy.role}
                    <select
                      value={role}
                      onChange={(event) => setRole(event.target.value as typeof role)}
                      className="mt-2 h-12 w-full rounded-xl border bg-white px-3"
                    >
                      <option value="student">{copy.roles.student}</option>
                      <option value="advertiser">{copy.roles.advertiser}</option>
                      <option value="institution">{copy.roles.institution}</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-navy">
                    {copy.documentType}
                    <select
                      value={documentType}
                      onChange={(event) => setDocumentType(event.target.value as typeof documentType)}
                      className="mt-2 h-12 w-full rounded-xl border bg-white px-3"
                    >
                      {Object.entries(copy.documentTypes).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-6 rounded-2xl border border-teal/20 bg-slate-50 p-5">
                  <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                    {copy.catalogNote}
                  </p>
                  <PortalCatalogFields value={catalog} onChange={setCatalog} compact />
                </div>

                <label className="mt-6 block rounded-2xl border-2 border-dashed border-teal/30 bg-teal/5 p-6 text-center focus-within:ring-2 focus-within:ring-teal">
                  <UploadCloud className="mx-auto h-9 w-9 text-teal" />
                  <span className="mt-3 block font-semibold text-navy">{copy.uploadTitle}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{copy.uploadHint}</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    className="mt-4 block w-full text-sm"
                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                  />
                </label>

                <div className="mt-5 rounded-xl border bg-slate-50 p-4 text-xs leading-relaxed text-muted-foreground">
                  <FileCheck2 className="me-2 inline h-4 w-4 text-teal" />
                  {copy.privacy}
                </div>

                <Button
                  onClick={submit}
                  disabled={submitting || !file}
                  className="mt-6 w-full bg-gold text-gold-foreground hover:bg-gold/90"
                  size="lg"
                >
                  {submitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  {copy.submit}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
