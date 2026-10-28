import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PUBLIC_TEAM_PROFILES } from "@/data/about-content";

const COPY: Record<
  string,
  { title: string; description: string; expertise: string; experience: string; profile: string }
> = {
  tr: {
    title: "Danışmanınız ve çalışma kapsamı",
    description:
      "Ön görüşmede danışmanınızın ilgili alandaki uzmanlığını ve deneyimini, görev dağılımını ve çalışma kapsamını netleştirin. Birlikte belirlenen teslimatlar ve takvim, hizmet teklifinde açıklanır.",
    expertise: "Uzmanlık alanı",
    experience: "Deneyim",
    profile: "Mesleki profili inceleyin",
  },
  en: {
    title: "Your advisor and scope of work",
    description:
      "At the initial consultation, clarify your advisor’s relevant expertise and experience, responsibilities and scope of work. The service proposal sets out the agreed deliverables and timeline.",
    expertise: "Area of expertise",
    experience: "Experience",
    profile: "View professional profile",
  },
  de: {
    title: "Ihre Beratungsperson und der Leistungsumfang",
    description:
      "Klären Sie im Erstgespräch die relevante Expertise und Erfahrung Ihrer Beratungsperson sowie Aufgaben und Leistungsumfang. Die vereinbarten Leistungen und Termine werden im Angebot festgehalten.",
    expertise: "Fachgebiet",
    experience: "Erfahrung",
    profile: "Berufliches Profil ansehen",
  },
  fr: {
    title: "Votre conseiller et le cadre de travail",
    description:
      "Lors du premier entretien, précisez l’expertise et l’expérience pertinentes du conseiller, ses responsabilités et le périmètre de la mission. Les livrables et le calendrier convenus sont présentés dans la proposition de service.",
    expertise: "Domaine d’expertise",
    experience: "Expérience",
    profile: "Consulter le profil professionnel",
  },
  it: {
    title: "Il consulente e l’ambito di lavoro",
    description:
      "Nel primo colloquio, chiarite le competenze e l’esperienza pertinenti del consulente, le responsabilità e l’ambito di lavoro. La proposta di servizio descrive i materiali da consegnare e le scadenze concordate.",
    expertise: "Area di competenza",
    experience: "Esperienza",
    profile: "Vedi il profilo professionale",
  },
  es: {
    title: "Su asesor y el alcance del trabajo",
    description:
      "En la primera consulta, aclare la especialización y experiencia pertinentes del asesor, sus responsabilidades y el alcance del trabajo. La propuesta de servicio recoge los entregables y plazos acordados.",
    expertise: "Área de especialización",
    experience: "Experiencia",
    profile: "Ver el perfil profesional",
  },
  ar: {
    title: "المستشار ونطاق العمل",
    description:
      "وضّح في الاستشارة الأولى اختصاص المستشار وخبرته ذات الصلة، والمسؤوليات ونطاق العمل. يبيّن عرض الخدمة المخرجات والجدول الزمني المتفق عليهما.",
    expertise: "مجال الاختصاص",
    experience: "الخبرة",
    profile: "عرض الملف المهني",
  },
  ru: {
    title: "Ваш консультант и объём работы",
    description:
      "На первой консультации уточните профильную квалификацию и опыт консультанта, его обязанности и объём работы. Согласованные материалы и сроки указываются в предложении об услугах.",
    expertise: "Специализация",
    experience: "Опыт",
    profile: "Посмотреть профессиональный профиль",
  },
  zh: {
    title: "您的顾问与服务范围",
    description:
      "在初次咨询中确认顾问的相关专业领域与经验、各方职责及服务范围。服务方案将列明双方商定的交付内容与时间安排。",
    expertise: "专业领域",
    experience: "经验",
    profile: "查看专业履历",
  },
};

export function TeamProfiles() {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "tr").split("-")[0];
  const copy = COPY[language] || COPY.en;

  return (
    <section
      id="ekip"
      className="container-prose scroll-mt-24 pb-16 md:pb-20"
      aria-labelledby="team-heading"
    >
      <h2 id="team-heading" className="font-display text-3xl font-semibold text-navy">
        {copy.title}
      </h2>
      <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">{copy.description}</p>
      {PUBLIC_TEAM_PROFILES.length > 0 && (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {PUBLIC_TEAM_PROFILES.map((profile) => (
            <Card key={profile.id} className="border-border/70">
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-semibold text-navy">{profile.name}</h3>
                <p className="mt-2 text-sm font-medium text-teal">{profile.title}</p>
                <dl className="mt-5 space-y-4 text-sm leading-relaxed">
                  <div>
                    <dt className="font-semibold text-navy">{copy.expertise}</dt>
                    <dd className="mt-1 text-muted-foreground">{profile.expertise}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-navy">{copy.experience}</dt>
                    <dd className="mt-1 text-muted-foreground">{profile.experience}</dd>
                  </div>
                </dl>
                <a
                  href={profile.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal underline-offset-4 hover:underline"
                >
                  {copy.profile}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
