import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, BookOpenCheck, GraduationCap } from "lucide-react";

const COPY: Record<
  string,
  { title: string; description: string; education: string; research: string; link: string }
> = {
  pt: {
    title: "Conhecimento adequado e um âmbito de trabalho claro",
    description:
      "Na consulta inicial, defina as suas necessidades, o papel do consultor e os materiais a entregar.",
    education: "Planeamento de estudos e candidaturas",
    research: "Métodos de investigação e comentários sobre os seus textos",
    link: "Conheça a nossa forma de trabalhar",
  },
  tr: {
    title: "Hedefinize uygun uzmanlık ve net bir çalışma kapsamı",
    description:
      "Ön görüşmede ihtiyacınızı, danışmanın görevini ve beklenen teslimatları birlikte netleştirin.",
    education: "Eğitim ve başvuru planlama",
    research: "Akademik yöntem ve metin geri bildirimi",
    link: "Çalışma yaklaşımımızı inceleyin",
  },
  en: {
    title: "Relevant expertise and a clear scope of work",
    description:
      "Use the initial consultation to clarify your needs, the advisor’s role and the expected deliverables.",
    education: "Education and application planning",
    research: "Research methods and feedback on your writing",
    link: "Explore how we work",
  },
  de: {
    title: "Passende Expertise und ein klarer Leistungsumfang",
    description:
      "Klären Sie im Erstgespräch Ihren Bedarf, die Rolle der Beratung und die vereinbarten Leistungen.",
    education: "Studien- und Bewerbungsplanung",
    research: "Forschungsmethoden und Feedback zu Ihrem Text",
    link: "Unsere Arbeitsweise kennenlernen",
  },
  fr: {
    title: "Une expertise adaptée et un cadre de travail clair",
    description:
      "Lors du premier entretien, précisez vos besoins, le rôle du conseiller et les livrables attendus.",
    education: "Planification des études et des candidatures",
    research: "Méthodologie et retour sur vos textes",
    link: "Découvrir notre approche",
  },
  it: {
    title: "Competenze pertinenti e un ambito di lavoro chiaro",
    description:
      "Nel primo colloquio, chiarite le vostre esigenze, il ruolo del consulente e i risultati del lavoro attesi.",
    education: "Pianificazione degli studi e delle candidature",
    research: "Metodologia e feedback sui vostri testi",
    link: "Scoprite come lavoriamo",
  },
  es: {
    title: "Experiencia pertinente y un alcance de trabajo claro",
    description:
      "En la primera consulta, definan sus necesidades, la función del asesor y los entregables previstos.",
    education: "Planificación de estudios y solicitudes",
    research: "Metodología y comentarios sobre sus textos",
    link: "Conozca nuestra forma de trabajar",
  },
  ar: {
    title: "اختصاص يناسب هدفك ونطاق عمل واضح",
    description: "وضّح في الاستشارة الأولى احتياجاتك ودور المستشار والمخرجات المتوقعة.",
    education: "التخطيط للدراسة وطلبات القبول",
    research: "منهجية البحث والملاحظات على نصوصك",
    link: "تعرّف على أسلوب عملنا",
  },
  ru: {
    title: "Подходящая специализация и понятный объём работы",
    description:
      "На первой консультации уточните свои потребности, роль консультанта и ожидаемые материалы.",
    education: "Планирование учёбы и подачи заявлений",
    research: "Методология исследования и обратная связь по тексту",
    link: "Наш подход к работе",
  },
  zh: {
    title: "切合目标的专业领域与明确的服务范围",
    description: "在初次咨询中明确您的需求、顾问的职责以及预期交付内容。",
    education: "学习与申请规划",
    research: "研究方法与文稿反馈",
    link: "了解我们的工作方式",
  },
};

export function ExpertTeaser() {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "tr").split("-")[0];
  const copy = COPY[language] || COPY.en;

  return (
    <section className="container-prose py-16 md:py-20" aria-labelledby="expertise-heading">
      <div className="grid gap-8 rounded-2xl border border-teal/20 bg-teal/5 p-7 md:grid-cols-[1.1fr_1fr] md:p-10">
        <div>
          <h2
            id="expertise-heading"
            className="font-display text-2xl font-semibold text-navy md:text-3xl"
          >
            {copy.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {copy.description}
          </p>
          <Link
            to="/hakkimizda"
            hash="ekip"
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal underline-offset-4 hover:underline"
          >
            {copy.link}
            <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" aria-hidden="true" />
          </Link>
        </div>
        <ul className="space-y-4 self-center text-sm font-medium text-navy">
          <li className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
            {copy.education}
          </li>
          <li className="flex items-center gap-3">
            <BookOpenCheck className="h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
            {copy.research}
          </li>
        </ul>
      </div>
    </section>
  );
}
