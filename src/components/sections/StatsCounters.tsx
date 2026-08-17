import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { TrendingUp, Smile, Globe, Award } from "lucide-react";

const ICONS = [Award, Smile, Globe, TrendingUp];

type Item = { value: string; label: string };

export function StatsCounters() {
  const { t } = useTranslation();
  const items = t("statsSection.items", { returnObjects: true }) as Item[];

  return (
    <section className="container-prose py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
          {t("statsSection.title")}
        </h2>
        <p className="mt-3 text-muted-foreground">
          {t("statsSection.subtitle")}
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => {
          const Icon = ICONS[i] ?? Award;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-muted/30 p-7 text-center shadow-card"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal/10 blur-2xl" />
              <span className="relative mx-auto mb-3 grid h-11 w-11 place-items-center rounded-lg bg-gold/10 text-gold">
                <Icon className="h-5 w-5" />
              </span>
              <p className="font-display text-4xl font-semibold tracking-tight text-navy">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
