// Curated Arabic data and localization dictionaries for popular Manga & Manhwa

export const ARABIC_GENRE_MAP: Record<string, string> = {
  Action: "أكشن",
  Adventure: "مغامرة",
  Comedy: "كوميديا",
  Drama: "دراما",
  Fantasy: "خيال",
  Horror: "رعب",
  Mystery: "غموض",
  Romance: "رومانسي",
  "Sci-Fi": "خيال علمي",
  "Slice of Life": "شريحة من الحياة",
  Supernatural: "خارق للطبيعة",
  Thriller: "إثارة",
  Monsters: "وحوش",
  "Award Winning": "حائز على جوائز",
  Magic: "سحر",
  Isekai: "إيسيكاي",
  Reincarnation: "تناسخ أرواح",
  MartialArts: "فنون قتالية",
  "Martial Arts": "فنون قتالية",
  Historical: "تاريخي",
  Superpowers: "قوى خارقة",
  Psychological: "نفسي",
  Sports: "رياضي",
  Shounen: "شونين",
  Seinen: "سينين",
  Webtoon: "مانهوا ويبتون",
  Manhwa: "مانهوا كورية",
  Manga: "مانجا يابانية",
  Manhua: "مانها صينية",
};

export const ARABIC_MANGA_CURATION: Record<string, { title: string; description: string; author?: string }> = {
  "solo-leveling": {
    title: "سولو ليفلينج (Solo Leveling)",
    description: "في عالم فُتحت فيه بوابات تربط عالمنا بأبعاد الوحوش، يُعرف سونغ جين وو بأضعف صياد في العالم من الرتبة E. ولكن بعد نجاته بمعجزة من زنزانة مزدوجة قاتلة، يكتسب قدرة النظام التي تتيح له رؤية واجهة مستخدم خاصة وترقية مستواه وقواه بلا حدود!",
    author: "Chugong (تشوغونغ)",
  },
  "one-piece": {
    title: "ون بيس (One Piece)",
    description: "تبدأ أسطورة مونكي دي لوفي الذي انطلق في رحلة ملحمية عبر المحيطات برفقة طاقم قبعة القش للبحث عن الكنز الأسطوري 'ون بيس' وتحقيق حلمه الخالد بأن يصبح ملك القراصنة القادم.",
    author: "Eiichiro Oda (إييتشيرو أودا)",
  },
  "jujutsu-kaisen": {
    title: "جوجيتسو كايسن (Jujutsu Kaisen)",
    description: "يجد يوجي إيتادوري، وهو طالب ثانوي ذو قدرات بدنية خارقة، نفسه متورطاً في عالم اللعنات والمشعوذين بعد ابتلاعه إصبعاً ملعوناً يخص ريومين سوكونا ملك اللعنات الأسطوري.",
    author: "Gege Akutami (غيغي أكوتامي)",
  },
  "demon-slayer": {
    title: "قاتل الشياطين (Demon Slayer)",
    description: "بعد ذبح عائلته على يد الشياطين وتحول أخته نيزوكو إلى شيطانة، ينضم تانجيرو كامادو إلى فيلق قتلة الشياطين في رحلة شاقة لاستعادة إنسانية أخته والانتقام من ملك الشياطين موزان.",
    author: "Koyoharu Gotouge (كويوهارو غوتوغي)",
  },
  "attack-on-titan": {
    title: "هجوم العمالقة (Attack on Titan)",
    description: "يعيش البشر خلف أسوار ضخمة لحماية أنفسهم من العمالقة الآكلين للبشر. بعد تدمير قريته وموت والدته، يقسم إيرين ييغر على إبادة جميع العمالقة وتحرير العالم خلف الأسوار.",
    author: "Hajime Isayama (هاجيمي إيساياما)",
  },
  "naruto": {
    title: "ناروتو (Naruto)",
    description: "قصة الفتى ناروتو أوزوماكي الذي نشأ منبوذاً لوجود الثعلب ذي الذيول التسعة مختوماً بداخله، لكنه يصر بعزيمة لا تلين على أن يصبح الهوكاغي وينال احترام الجميع في قرية كونوها.",
    author: "Masashi Kishimoto (ماساشي كيشيموتو)",
  },
  "bleach": {
    title: "بليتش (Bleach)",
    description: "يكتسب إيتشيغو كوروساكي قوى الشينيغامي (حاصد الأرواح) للدفاع عن مدينته ضد الأرواح الشريرة (الهولو) ويقود معارك ملحمية لحماية مجتمع الأرواح وعالم الأحياء.",
    author: "Tite Kubo (تايت كوبو)",
  },
};

export function localizeGenre(genre: string): string {
  if (!genre) return "مانجا";
  return ARABIC_GENRE_MAP[genre] || genre;
}

export function localizeGenres(genres: string[]): string[] {
  if (!Array.isArray(genres)) return ["مانجا"];
  return genres.map(localizeGenre);
}

export function localizeMangaContent<T extends {
  id: string;
  title: string;
  description: string;
  author?: string;
  genres?: string[];
}>(manga: T): T {
  const lowerTitle = manga.title?.toLowerCase() || "";
  let matchedKey = "";

  if (lowerTitle.includes("solo leveling") || lowerTitle.includes("سولو ليفلينج")) {
    matchedKey = "solo-leveling";
  } else if (lowerTitle.includes("one piece") || lowerTitle.includes("ون بيس")) {
    matchedKey = "one-piece";
  } else if (lowerTitle.includes("jujutsu") || lowerTitle.includes("جوجيتسو")) {
    matchedKey = "jujutsu-kaisen";
  } else if (lowerTitle.includes("demon slayer") || lowerTitle.includes("قاتل الشياطين") || lowerTitle.includes("kimetsu")) {
    matchedKey = "demon-slayer";
  } else if (lowerTitle.includes("attack on titan") || lowerTitle.includes("هجوم العمالقة") || lowerTitle.includes("shingeki")) {
    matchedKey = "attack-on-titan";
  } else if (lowerTitle.includes("naruto") || lowerTitle.includes("ناروتو")) {
    matchedKey = "naruto";
  } else if (lowerTitle.includes("bleach") || lowerTitle.includes("بليتش")) {
    matchedKey = "bleach";
  }

  const curated = matchedKey ? ARABIC_MANGA_CURATION[matchedKey] : null;

  return {
    ...manga,
    title: curated?.title || manga.title,
    description: curated?.description || manga.description || "استمتع بقراءة أحدث الفصول بأعلى جودة وتجربة قراءة عربية احترافية.",
    author: curated?.author || manga.author || "غير معروف",
    genres: localizeGenres(manga.genres || []),
  };
}
