export type TeamProfile = {
  id: string;
  name: string;
  title: string;
  expertise: string;
  experience: string;
  profileUrl: string;
  credentialsVerified: boolean;
  publicationApproved: boolean;
};

export type StudentStory = {
  id: string;
  name: string;
  service: string;
  context: string;
  support: string;
  outcome: string;
  quote: string;
  factsVerified: boolean;
  permission: {
    granted: boolean;
    recordedAt: string;
    recordReference: string;
  };
};

// Complete and verify these editorial records before approving public display.
// Never put identity documents or private consent records in this repository.
export const TEAM_PROFILE_DRAFTS: TeamProfile[] = [
  {
    id: "advisor-profile",
    name: "[DOLDUR: danışmanın yayımlanmasına izin verilen adı]",
    title: "[DOLDUR: doğrulanmış mesleki veya akademik unvan]",
    expertise: "[DOLDUR: doğrulanmış uzmanlık ve sorumluluk alanı]",
    experience: "[DOLDUR: doğrulanabilir deneyim bilgisi]",
    profileUrl: "[DOLDUR: doğrulanmış mesleki veya kurumsal profil bağlantısı]",
    credentialsVerified: false,
    publicationApproved: false,
  },
];

export const STUDENT_STORY_DRAFTS: StudentStory[] = [
  "egitim-basvuru-sureci",
  "vize-belge-sureci",
  "akademik-yontem-destegi",
].map((id) => ({
  id,
  name: "[DOLDUR: öğrencinin izin verdiği ad veya anonim gösterim]",
  service: "[DOLDUR: fiilen alınan hizmet]",
  context: "[DOLDUR: öğrencinin kendi beyanıyla başlangıç ihtiyacı]",
  support: "[DOLDUR: doğrulanmış danışmanlık kapsamı ve yapılan çalışma]",
  outcome: "[DOLDUR: kanıtlanabilen sonuç ve varsa sınırlılıklar]",
  quote: "[DOLDUR: öğrencinin aynen onayladığı gerçek yorum]",
  factsVerified: false,
  permission: {
    granted: false,
    recordedAt: "[DOLDUR: yayın izni kayıt tarihi]",
    recordReference: "[DOLDUR: özel kayıt sistemindeki izin referansı]",
  },
}));

const isComplete = (value: string) => value.trim().length > 0 && !/\[DOLDUR\b/i.test(value);
const hasPublicProfileUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
};

export const isPublishableTeamProfile = (profile: TeamProfile) =>
  profile.credentialsVerified &&
  profile.publicationApproved &&
  [profile.name, profile.title, profile.expertise, profile.experience].every(isComplete) &&
  hasPublicProfileUrl(profile.profileUrl);

export const isPublishableStudentStory = (story: StudentStory) =>
  story.factsVerified &&
  story.permission.granted &&
  [
    story.name,
    story.service,
    story.context,
    story.support,
    story.outcome,
    story.quote,
    story.permission.recordedAt,
    story.permission.recordReference,
  ].every(isComplete) &&
  /^\d{4}-\d{2}-\d{2}$/.test(story.permission.recordedAt) &&
  Number.isFinite(Date.parse(story.permission.recordedAt));

export const PUBLIC_TEAM_PROFILES = TEAM_PROFILE_DRAFTS.filter(isPublishableTeamProfile).map(
  ({ id, name, title, expertise, experience, profileUrl }) => ({
    id,
    name,
    title,
    expertise,
    experience,
    profileUrl,
  }),
);
export const PUBLIC_STUDENT_STORIES = STUDENT_STORY_DRAFTS.filter(isPublishableStudentStory).map(
  ({ id, name, service, context, support, outcome, quote }) => ({
    id,
    name,
    service,
    context,
    support,
    outcome,
    quote,
  }),
);
