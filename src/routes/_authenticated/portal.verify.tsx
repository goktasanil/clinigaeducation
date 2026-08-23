/* eslint-disable @typescript-eslint/no-explicit-any -- Verification tables are newer than generated Supabase types. */
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, FileCheck2, Loader2, ShieldCheck, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PortalCatalogFields,
  type PortalCatalogValue,
} from "@/components/portal/PortalCatalogFields";
import { savePortalProfile } from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/portal/verify")({
  head: () => ({
    meta: [
      { title: "Hesap Doğrulama | CliniGA Global Student Portal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalVerificationPage,
});

const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxBytes = 8 * 1024 * 1024;

function PortalVerificationPage() {
  const saveProfile = useServerFn(savePortalProfile);
  const [role, setRole] = useState<"student" | "advertiser" | "institution">("student");
  const [documentType, setDocumentType] = useState("student_document");
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
      toast.error("Lütfen adınızı veya kurum adını yazın.");
      return;
    }
    if (!file || !allowedTypes.includes(file.type) || file.size > maxBytes) {
      toast.error("PDF, JPG veya PNG biçiminde en fazla 8 MB belge seçin.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) throw new Error("Oturum bulunamadı.");

      await saveProfile({
        data: {
          displayName,
          countryCode: catalog.countryCode,
          city: catalog.city || null,
          institution: catalog.institution || null,
          program: catalog.program || null,
        },
      });

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
      toast.success("Doğrulama başvurunuz güvenli inceleme kuyruğuna alındı.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Doğrulama başvurusu gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[80vh] bg-slate-50 py-10">
      <div className="container-prose max-w-3xl">
        <a href="/portal/panel" className="text-sm font-semibold text-teal hover:text-gold">
          ← Portala dön
        </a>
        <div className="mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy via-[#0b5d91] to-[#7f1d5a] p-7 text-white shadow-2xl md:p-10">
          <BadgeCheck className="h-9 w-9 text-gold" />
          <h1 className="mt-5 font-display text-3xl font-semibold md:text-4xl">Hesabını doğrula</h1>
          <p className="mt-3 max-w-2xl text-white/75">
            İlan verebilmek için kimliğin veya kurum yetkinliğin manuel incelemeden geçmelidir.
            Doğrulama rozeti tek başına güvenlik garantisi değildir; ilan moderasyonu, raporlar ve
            işlem sonrası yorumlar ayrıca kullanılır.
          </p>
        </div>

        <Card className="mt-6 border-border/70 shadow-lg">
          <CardContent className="p-6 md:p-8">
            {submitted ? (
              <div className="py-8 text-center">
                <ShieldCheck className="mx-auto h-12 w-12 text-teal" />
                <h2 className="mt-4 font-display text-2xl font-semibold text-navy">
                  Başvuru alındı
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Belgeniz herkese açık değildir. Sonuç panelinizde gösterilecek; gerekirse ek belge
                  istenir.
                </p>
                <Button asChild className="mt-6 bg-navy text-white">
                  <a href="/portal/panel">Panele dön</a>
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-navy sm:col-span-2">
                    Ad soyad / kurum adı
                    <input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      maxLength={80}
                      autoComplete="name"
                      className="mt-2 h-12 w-full rounded-xl border bg-white px-3"
                      placeholder="Profilde görünecek doğrulanmış ad"
                    />
                  </label>
                  <label className="text-sm font-semibold text-navy">
                    Hesap türü
                    <select
                      value={role}
                      onChange={(event) => setRole(event.target.value as typeof role)}
                      className="mt-2 h-12 w-full rounded-xl border bg-white px-3"
                    >
                      <option value="student">Öğrenci</option>
                      <option value="advertiser">İlan veren kişi</option>
                      <option value="institution">Kurum / yurt / işletme</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-navy">
                    Belge türü
                    <select
                      value={documentType}
                      onChange={(event) => setDocumentType(event.target.value)}
                      className="mt-2 h-12 w-full rounded-xl border bg-white px-3"
                    >
                      <option value="student_document">Öğrenci belgesi</option>
                      <option value="identity_document">Kimlik belgesi</option>
                      <option value="company_document">Şirket / kurum yetki belgesi</option>
                      <option value="dormitory_license">Yurt / işletme ruhsatı</option>
                    </select>
                  </label>
                </div>

                <div className="mt-6 rounded-2xl border border-teal/20 bg-slate-50 p-5">
                  <h2 className="font-display text-lg font-semibold text-navy">
                    Eğitim ve konum bilgileri
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Bölüm listesi yalnızca seçtiğiniz kurumun doğrulanmış gerçek programlarından
                    oluşur; genel alan adı gösterilmez.
                  </p>
                  <div className="mt-4">
                    <PortalCatalogFields value={catalog} onChange={setCatalog} compact />
                  </div>
                </div>

                <label className="mt-6 block rounded-2xl border-2 border-dashed border-teal/30 bg-teal/5 p-6 text-center">
                  <UploadCloud className="mx-auto h-9 w-9 text-teal" />
                  <span className="mt-3 block font-semibold text-navy">
                    Belgeyi güvenli alana yükle
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    PDF, JPG veya PNG · en fazla 8 MB
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    className="mt-4 block w-full text-sm"
                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                  />
                </label>

                <div className="mt-5 rounded-xl border bg-slate-50 p-4 text-xs leading-relaxed text-muted-foreground">
                  <FileCheck2 className="mr-2 inline h-4 w-4 text-teal" />
                  Belge yalnız yetkili inceleme ekibi tarafından görülür; public bağlantı
                  oluşturulmaz. KVKK/GDPR kapsamında veri minimizasyonu ve saklama süresi uygulanır.
                </div>

                <Button
                  onClick={submit}
                  disabled={submitting || !file}
                  className="mt-6 w-full bg-gold text-white hover:bg-gold/90"
                  size="lg"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Doğrulama başvurusu gönder
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
