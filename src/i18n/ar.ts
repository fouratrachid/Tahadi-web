/**
 * All user-facing Arabic (MSA) strings live here. Components must not hardcode
 * strings — import from this file so the UI stays consistent and translatable.
 */

import type { Category, ChallengeType } from '@/types';

export const AR = {
  appName: 'تحدّي',
  tagline: 'لعبة المسابقات الجماعية',

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
    categoriesTitle: 'الفئات (اختر من ١ إلى ٣)',
    challengesTitle: 'أنواع التحديات (اختر ٤ بالترتيب)',
    timerTitle: 'مدة المؤقّت',
    seconds: 'ثانية',
    start: 'ابدأ اللعبة',
    orderHint: 'اضغط لاختيار الترتيب — سيُلعب حسب هذا التسلسل',
    selectedCount: (n: number) => `${toAr(n)} مختارة`,
    errNames: 'اكتب اسمي اللاعبين',
    errCategories: 'اختر فئة واحدة على الأقل',
    errChallenges: 'اختر ٤ تحديات بالضبط',
  },

  // Challenge names + referee rules text
  challenges: {
    speed: {
      name: 'تحدّي السرعة',
      short: 'أسئلة سريعة متتالية',
      rules:
        'اقرأ الأسئلة بسرعة على اللاعب. اضغط ✓ للإجابة الصحيحة (+١٠)، أو ✗ للخطأ (ينتقل تلقائياً)، أو "تخطّي". أجب على أكبر عدد ممكن قبل انتهاء الوقت. لكل لاعب دور واحد.',
    },
    whoAmI: {
      name: 'من أنا',
      short: 'أربعة تلميحات تدريجية',
      rules:
        'اقرأ التلميحات واحداً تلو الآخر. كلما خمّن اللاعب مبكراً زادت نقاطه: التلميح الأول ٤٠، الثاني ٣٠، الثالث ٢٠، الرابع ١٠. لكل لاعب ثلاثة أسئلة.',
    },
    reversed: {
      name: 'الكلمات المعكوسة',
      short: 'اقرأ الكلمة بالعكس',
      rules:
        'تظهر الكلمة معكوسة الحروف. على اللاعب نطق الكلمة الأصلية. كل إجابة صحيحة +١٥. لكل لاعب دور واحد ضمن الوقت.',
    },
    ordering: {
      name: 'الترتيب',
      short: 'رتّب العناصر بشكل صحيح',
      rules:
        'اقرأ العناصر على اللاعب، وعليه ترتيبها بالشكل الصحيح. اضغط "اكشف الترتيب" لرؤية الترتيب الصحيح ثم احكم: +٢٠ إذا كان الترتيب كاملاً وصحيحاً.',
    },
    bell: {
      name: 'الجرس',
      short: 'مواجهة مباشرة بين اللاعبين',
      rules:
        'كلا اللاعبين يتنافسان على نفس السؤال. امنح النقطة لمن يجيب أولاً بشكل صحيح (+١٠) باختيار اسمه، أو "لا أحد" إن لم يُجب أحد. ثمانية أسئلة.',
    },
  } satisfies Record<ChallengeType, { name: string; short: string; rules: string }>,

  categories: {
    football: 'كرة القدم',
    anime: 'أنمي',
    movies: 'أفلام',
    general: 'منوعات عامة',
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
    whoAnswered: 'من أجاب أولاً؟',
    judgePrompt: 'هل كان الترتيب صحيحاً؟',
    endTurn: 'إنهاء الدور',
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

/** Convert Western digits in a number to Arabic-Indic digits for display. */
export function toAr(value: number | string): string {
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(value).replace(/[0-9]/g, (d) => map[Number(d)]);
}
