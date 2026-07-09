/**
 * All user-facing Arabic (MSA) strings live here. Components must not hardcode
 * strings — import from this file so the UI stays consistent and translatable.
 */

import type { Category, ChallengeType } from '@/types';

export const AR = {
  appName: 'قهوة الحران',
  appNameEn: 'CHALLENGE',
  tagline: 'الرجلة بحر و العوامة قلال',

  // Home
  home: {
    newGame: 'لعبة جديدة',
    packs: 'الحزم',
    history: 'السجل',
    settings: 'الإعدادات',
    subtitle: 'حكم ولاعبان — الهاتف مع الحكم',
  },

  // Setup
  setup: {
    title: 'إعداد اللعبة',
    playersTitle: 'أسماء اللاعبين',
    player1: 'اللاعب الأول',
    player2: 'اللاعب الثاني',
    playerPlaceholder: 'اكتب الاسم',
    categoriesTitle: 'الفئات (اختر من 1 إلى 8)',
    challengesTitle: 'أنواع التحديات (اختر من 1 إلى 5)',
    timerTitle: 'مدة المؤقّت',
    seconds: 'ثانية',
    start: 'ابدأ اللعبة',
    orderHint: 'اضغط لاختيار الترتيب — سيُلعب حسب هذا التسلسل',
    selectedCount: (n: number) => `${toAr(n)} مختارة`,
    errNames: 'اكتب اسمي اللاعبين',
    errCategories: 'اختر فئة واحدة على الأقل',
    errChallenges: 'اختر تحدياً واحداً على الأقل',
  },

  // Challenge names + referee rules text
  challenges: {
    speed: {
      name: 'تحدّي السرعة',
      short: 'أسئلة سريعة متتالية',
      rules:
        'اقرأ الأسئلة بسرعة على اللاعب. اضغط ✓ للإجابة الصحيحة (+10)، أو ✗ للخطأ (ينتقل تلقائياً)، أو "تخطّي". أجب على أكبر عدد ممكن قبل انتهاء الوقت. لكل لاعب دور واحد.',
    },
    whoAmI: {
      name: 'من أنا',
      short: 'أربعة تلميحات تدريجية',
      rules:
        'اقرأ التلميحات واحداً تلو الآخر. أي فريق يخمّن الشخصية يفوز بالنقاط، وكلما خمّن مبكراً زادت نقاطه: التلميح الأول 40، الثاني 30، الثالث 20، الرابع 10. اختر الفريق الذي أجاب.',
    },
    reversed: {
      name: 'الكلمات المعكوسة',
      short: 'اقرأ الكلمة بالعكس',
      rules:
        'تظهر الكلمة معكوسة الحروف. أي فريق ينطق الكلمة الأصلية أولاً يفوز بـ +15. اختر الفريق الذي أجاب، أو تخطَّ إذا لم يُجب أحد.',
    },
    ordering: {
      name: 'الترتيب',
      short: 'رتّب العناصر بشكل صحيح',
      rules:
        'اقرأ العناصر على اللاعبين، وعلى أي فريق ترتيبها بشكل صحيح أولاً. اضغط "اكشف الترتيب" لرؤية الترتيب الصحيح، ثم اختر الفريق الذي أجاب: +20 إذا كان ترتيبه كاملاً وصحيحاً.',
    },
    bell: {
      name: 'الجرس',
      short: 'اضغط أولاً وأجب',
      rules:
        'ضع الهاتف على الطاولة بين الفريقين، بحيث تكون منطقة كل فريق أمامه. اقرأ السؤال بصوتٍ عالٍ ثم افتح الجرس — عندها يُخفى السؤال عن الشاشة. أول فريق يضغط على منطقته يحصل على فرصة الإجابة (+10). إذا أخطأ، تنتقل الفرصة للفريق الآخر للخطف. ثمانية أسئلة.',
    },
  } satisfies Record<ChallengeType, { name: string; short: string; rules: string }>,

  categories: {
    football: 'كرة القدم',
    anime: 'أنمي',
    movies: 'أفلام',
    general: 'منوعات عامة',
    religion: 'أسئلة دينية',
    geography: 'جغرافيا',
    history: 'تاريخ وسياسة',
    tunisia: 'أسئلة حول تونس',
    tunisiaSeries: 'مسلسلات تونسية',
    tunisiaFootball: 'كرة قدم تونسية',
  } satisfies Record<Category, string>,

  // Round intro
  roundIntro: {
    round: (n: number, total: number) => `الجولة ${toAr(n)} من ${toAr(total)}`,
    refereeRead: 'اقرأ القواعد بصوتٍ عالٍ للاعبين',
    begin: 'ابدأ الجولة',
  },

  // Play screen
  play: {
    correct: 'صحيح',
    wrong: 'خطأ',
    skip: 'تخطّي',
    revealHint: 'التلميح التالي',
    revealOrder: 'اكشف الترتيب',
    correctOrder: 'الترتيب الصحيح',
    noOne: 'لا أحد',
    pause: 'إيقاف مؤقت',
    resume: 'متابعة',
    paused: 'اللعبة متوقفة',
    turnOf: (name: string) => `دور ${name}`,
    getReady: (name: string) => `استعد يا ${name}`,
    nextPlayer: 'اللاعب التالي',
    timeUp: 'انتهى الوقت',
    questionOf: (i: number, total: number) => `${toAr(i)} / ${toAr(total)}`,
    hintOf: (i: number) => `تلميح ${toAr(i)}`,
    answerLabel: 'الإجابة',
    /** Team-award prompt for whoAmI / ordering / reversed (shared questions). */
    whoAnswered: 'من أجاب بشكل صحيح؟',

    // Bell — tabletop buzzer
    bellReadFirst: 'اقرأ السؤال بصوتٍ عالٍ، ثم افتح الجرس',
    bellArm: 'افتح الجرس',
    bellArmedHint: 'الجرس مفتوح — بانتظار الضغط',
    bellTapZone: 'اضغط هنا',
    bellHidden: '🙈 السؤال مخفي — الجرس مفتوح',
    bellBuzzed: (name: string) => `${name} يجيب الآن!`,
    bellWasCorrect: 'هل الإجابة صحيحة؟',
    bellSteal: (name: string) => `فرصة خطف لفريق ${name}`,
  },

  // Round result
  roundResult: {
    title: 'نتيجة الجولة',
    roundPoints: 'نقاط هذه الجولة',
    total: 'المجموع',
    next: 'الجولة التالية',
    finish: 'النتيجة النهائية',
  },

  // Final
  final: {
    title: 'النتيجة النهائية',
    winner: (name: string) => `الفائز: ${name}`,
    tie: 'تعادل!',
    rematch: 'إعادة اللعب',
    newGame: 'لعبة جديدة',
    points: 'نقطة',
  },

  // Packs
  packs: {
    title: 'الحزم',
    questions: 'سؤال',
    total: (n: number) => `${toAr(n)} سؤال إجمالاً`,
  },

  // History
  history: {
    title: 'السجل',
    empty: 'لا توجد ألعاب سابقة بعد',
    vs: 'ضدّ',
    tie: 'تعادل',
  },

  // Settings
  settings: {
    title: 'الإعدادات',
    sound: 'المؤثرات الصوتية',
    haptics: 'الاهتزاز',
    resetUsed: 'إعادة تعيين الأسئلة المستخدمة',
    resetUsedDone: 'تمت إعادة التعيين',
    about: 'تحدّي — لعبة مسابقات جماعية تُلعب بدون إنترنت',
    version: 'الإصدار',
  },

  common: {
    back: 'رجوع',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    close: 'إغلاق',
  },
} as const;

/** Numeral formatting for display. Currently a passthrough (Western digits). */
export function toAr(value: number | string): string {
  return String(value);
}
