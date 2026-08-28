/* eslint-disable @typescript-eslint/no-explicit-any -- Portal application table is newer than generated Supabase types. */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, GraduationCap, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePortalCopy } from "@/components/portal/portal-copy";
import { supabase } from "@/integrations/supabase/client";

export type PortalSelection = {
  country?: string;
  institution?: string;
  institutionName?: string;
  city?: string;
  program?: string;
};

export function PortalSelectionBridge({ selection }: { selection: PortalSelection }) {
  const { copy } = usePortalCopy();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const institutionName = selection.institutionName?.trim() || "";

  const saveSelection = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error(copy.errors.session);
      if (institutionName.length < 2) throw new Error(copy.applications.institutionRequired);

      const db = supabase as any;
      const { data: existing, error: existingError } = await db
        .from("portal_applications")
        .select("id")
        .eq("user_id", auth.user.id)
        .eq("institution_id", selection.institution || "")
        .eq("program_name", selection.program || "")
        .limit(1);
      if (existingError) throw existingError;
      if (existing?.length) return { duplicate: true };

      const { error } = await db.from("portal_applications").insert({
        user_id: auth.user.id,
        institution_id: selection.institution || null,
        institution_name: institutionName,
        program_name: selection.program?.trim() || null,
        country_code: selection.country?.trim().toUpperCase() || null,
        status: "draft",
        priority: "medium",
      });
      if (error) throw error;
      return { duplicate: false };
    },
    onSuccess: ({ duplicate }) => {
      setSaved(true);
      void queryClient.invalidateQueries({ queryKey: ["portal-journey-workspace"] });
      toast.success(duplicate ? copy.applications.created : copy.applications.createSuccess);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : copy.applications.createError),
  });

  if (!institutionName) return null;

  return (
    <Card className="mt-6 border-gold/30 bg-gradient-to-br from-white to-gold/5 shadow-sm">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy text-gold">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-sm text-navy">{institutionName}</strong>
              {selection.country ? <Badge variant="outline">{selection.country}</Badge> : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {[selection.program, selection.city].filter(Boolean).join(" · ") || copy.workspace.programDiscoveryDesc}
            </p>
          </div>
        </div>
        <Button
          onClick={() => saveSelection.mutate()}
          disabled={saveSelection.isPending || saved}
          className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
        >
          {saveSelection.isPending ? (
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="me-2 h-4 w-4" />
          ) : (
            <Plus className="me-2 h-4 w-4" />
          )}
          {saved ? copy.applications.statuses.draft : copy.applications.add}
        </Button>
      </CardContent>
    </Card>
  );
}
