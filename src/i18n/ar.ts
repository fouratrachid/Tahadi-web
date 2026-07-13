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
    categoriesTitle: (max: number) => `الفئات (اختر من 1 إلى ${toAr(max)})`,
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
        'اقرأ التلميحات واحداً تلو الآخر. أي فريق يخمّن الشخصية يفوز بالنقاط، وكلما خمّن مبكراً زادت نقاطه: التلميح الأول 20، الثاني 15، الثالث 10، الرابع 5. اختر الفريق الذي أجاب.',
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
    logic: 'ألغاز وذكاء',
    lifestyle: 'نمط الحياة',
    knowledge: 'علوم ومعرفة',
    philosophy: 'فلسفة',
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
    bellRevealAnswer: '👁️ اكشف الإجابة',
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

  // Games hub
  hub: {
    title: 'الألعاب',
    subtitle: 'اختر لعبة لتبدأ',
    triviaTitle: 'قهوة الحران Challenge',
    triviaDesc: 'مسابقة معلومات جماعية بين فريقين',
    imposterTitle: 'المندس',
    imposterDesc: 'اكتشفوا من يخفي الكلمة السرية',
  },

  imposter: {
    categories: {
      football: '⚽ كرة القدم',
      movies: '🎬 أفلام',
      anime: '🎌 أنمي',
      tunisia: '🇹🇳 تونس',
      geography: '🌍 جغرافيا',
      history: '📜 تاريخ',
      politics: '🏛️ سياسة',
      general: '🧠 معلومات عامة',
      food: '🍔 أكل',
      technology: '💻 تكنولوجيا',
      animals: '🐯 حيوانات',
      brands: '🏷️ علامات تجارية',
    },
    home: {
      title: 'المندس',
      tagline: 'اكتشفوا المندس قبل أن يكتشف الكلمة السرية!',
      start: 'ابدأ اللعبة',
      howToPlay: 'طريقة اللعب',
      rulesText:
        'يحصل كل اللاعبين على نفس الكلمة السرية، ما عدا المندس الذي لا يعرفها (أو يحصل على كلمة مشابهة في وضع "الكلمة المشابهة"). مرّروا الهاتف بالدور، وبعد أن يرى الجميع دوره يتناقش اللاعبون ثم يصوّتون لطرد من يشتبهون بأنه المندس.',
    },
    setup: {
      title: 'إعداد اللعبة',
      playersTitle: 'اللاعبون (من 3 إلى 15)',
      addPlayer: 'إضافة لاعب',
      playerPlaceholder: 'اسم اللاعب',
      categoryTitle: 'الفئة',
      randomCategory: '🎲 عشوائي',
      difficultyTitle: 'مستوى الصعوبة',
      difficulty: { easy: 'سهل', medium: 'متوسط', hard: 'صعب', mixed: 'متنوّع' },
      modeTitle: 'نمط اللعب',
      mode: {
        classic: 'مندس كلاسيكي',
        double: 'مندسان',
        fakeWord: 'الكلمة المشابهة',
        mixed: 'مندس + كلمة مشابهة',
      },
      modeDesc: {
        classic: 'المندس لا يعرف الكلمة إطلاقاً ويحاول الاندماج',
        double: 'مندسان لا يعرفان الكلمة، مناسب للمجموعات الكبيرة',
        fakeWord: 'مندس واحد يحصل على كلمة مشابهة من نفس الفئة',
        mixed: 'مندس لا يعرف الكلمة إطلاقاً + لاعب آخر لديه كلمة مشابهة، في نفس الوقت',
      },
      imposterCountTitle: 'عدد المندسين',
      oneImposter: 'مندس واحد',
      twoImposters: 'مندسان',
      timerTitle: 'مدة النقاش',
      customWordToggle: 'استخدم كلمة خاصة بي',
      customWordPlaceholder: 'اكتب الكلمة السرية',
      start: 'ابدأ اللعبة',
      errPlayers: 'أضف من 3 إلى 15 لاعباً بأسماء مختلفة',
      errDoubleNeedsPlayers: 'وضع "مندسان" يحتاج 6 لاعبين على الأقل',
      errCustomWord: 'اكتب الكلمة السرية',
    },
    reveal: {
      passTo: (name: string) => `مرّر الهاتف إلى ${name}`,
      passHint: 'تأكد أن بقية اللاعبين لا يشاهدون الشاشة',
      revealBtn: 'اكشف دوري',
      normalTitle: 'أنت لاعب عادي',
      normalWord: 'كلمتك السرية هي:',
      imposterTitle: 'أنت المندس 🕵️',
      imposterDesc: 'لا تعرف الكلمة! حاول الاندماج بدون أن يُكتشف أمرك',
      fakeTitle: 'لديك كلمة مختلفة 🤫',
      fakeWord: 'كلمتك هي:',
      fakeDesc: 'حاول إقناع الآخرين أن كلمتك هي نفس كلمتهم',
      hideAndPass: 'إخفاء وتمرير الهاتف',
      progress: (i: number, total: number) => `اللاعب ${i} من ${total}`,
    },
    discussion: {
      title: 'الجميع يعرف دوره!',
      subtitle: 'ابدأوا النقاش وحاولوا اكتشاف المندس',
      startVote: 'انتقل إلى التصويت',
      timeUp: 'انتهى وقت النقاش',
      orderTitle: 'ترتيب الحديث',
      orderSubtitle: 'كل لاعب يقول كلمة أو تلميحاً عن كلمته بهذا الترتيب',
    },
    voting: {
      title: 'من هو المندس برأيكم؟',
      subtitle: 'اضغطوا على اللاعب الذي تشكّون فيه، صوتاً واحداً في كل مرة',
      finish: 'إنهاء التصويت',
      votes: (n: number) => `${toAr(n)} صوت`,
      alreadyOut: (names: string) => `تم طردهم سابقاً: ${names}`,
    },
    caught: {
      eliminated: (name: string) => `تم طرد: ${name}`,
      wasImposter: 'كان مندساً! 🕵️',
      subtitle: 'ما زال هناك مندس آخر بينكم — عودوا للنقاش والتصويت',
      continueVoting: 'متابعة التصويت',
    },
    result: {
      eliminated: (name: string) => `تم طرد: ${name}`,
      wasNormal: 'كان لاعباً عادياً',
      wasImposter: 'كان المندس! 🕵️',
      wasFake: 'كان صاحب الكلمة المشابهة! 🤫',
      theWordWas: 'الكلمة السرية كانت:',
      theFakeWordWas: 'الكلمة المشابهة كانت:',
      playersWin: 'فاز اللاعبون 🎉',
      imposterWin: 'فاز المندس 🕵️',
      playAgain: 'العب مجدداً',
      changeSettings: 'تغيير الإعدادات',
      backToGames: 'العودة للألعاب',
    },
    stats: {
      title: 'إحصائيات',
      gamesPlayed: 'عدد الألعاب',
      playerWins: 'فوز اللاعبين',
      imposterWins: 'فوز المندس',
    },
  },
} as const;

/** Numeral formatting for display. Currently a passthrough (Western digits). */
export function toAr(value: number | string): string {
  return String(value);
}
