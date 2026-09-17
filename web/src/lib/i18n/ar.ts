import type { Dict } from "./en";

/**
 * Modern Standard Arabic, with the receiving vocabulary a Moroccan parts depot
 * would actually use (سند التسليم for the bon de livraison, إشعار دائن for a
 * supplier credit).
 *
 * Typed as Dict, so this file cannot fall behind en.ts without failing the
 * typecheck. Numbers stay Western digits - that is what Moroccan paperwork uses.
 * Counts are written out for one and two because Arabic has a dual form and
 * "1 سندات" reads wrong on a projector.
 */
export const ar: Dict = {
  dir: "rtl",
  name: "العربية",
  short: "ع",

  chrome: {
    metaTitle: "استلام البضاعة — C04",
    metaDescription:
      "ما الذي يجب تسجيله عند الاستلام حتى يتمكّن من يأتي بعدك من تسوية الفرق.",
    banner: "بيانات تمرين اصطناعية · استلام بضاعة بأسلوب Trast · ليس مورّدًا حقيقيًا",
    bannerModified: "أرقام مُعدَّلة من الإعدادات",
    brand: "استلام البضاعة",
    flow: "مسار الاستلام",
    briefing: "الملخّص",
    settings: "الإعدادات",
    briefingNote:
      "هذا الملخّص هو ملاحظات مقدّم العرض، ويُحتفظ به بالإنجليزية. أمّا النموذج نفسه فيعمل باللغتين.",
    steps: {
      receive: "استلام البضاعة",
      evidence: "الأدلة",
      review: "المراجعة",
    },
    toLight: "التبديل إلى الوضع الفاتح",
    toDark: "التبديل إلى الوضع الداكن",
    language: "اللغة",
    languageHint: "تغيير اللغة",
  },

  cause: {
    shortage: "نقص",
    damage: "تلف",
    duplicate_scan: "مسح مكرّر",
    second_delivery: "تسليم ثانٍ",
    unknown: "غير محدّد",
  },

  confidence: {
    likely: "مرجّح — سجلّ واحد يفسّر الفرق تمامًا",
    possible: "محتمل — متّسق، لكنه ليس القراءة الوحيدة",
    uncertain: "غير مؤكّد — السجلات لا ترجّح سببًا على آخر",
  },

  ui: {
    simulated: "محاكاة",
    evidence: "الأدلة:",
  },

  receive: {
    title: "استلام البضاعة — الرصيف 1",
    intro:
      "سجّل ما وصل فعليًا مقابل كل سند تسليم. المستلَم والتالف وما يدخل المخزون ثلاثة أرقام منفصلة — والفصل بينها هنا هو ما يتيح لاحقًا تسوية الفاتورة.",
    waiting: (n: number) =>
      n === 1
        ? "سند تسليم واحد في الانتظار"
        : n === 2
          ? "سندا تسليم في الانتظار"
          : `${n} سندات تسليم في الانتظار`,
    emptyTitle: "لا شيء في انتظار الاستلام",
    emptyNoNotes: "لا توجد سندات تسليم لهذا الأمر بعد.",
    emptyAllCounted: (n: number, orderId: string) =>
      `تم عدّ كل السندات المرتبطة بـ ${orderId} وعددها ${n}. الأدلة مترابطة وجاهزة لمن يتولّى الفاتورة.`,
    toEvidence: "عرض الأدلة المترابطة ←",
    recorded: "ما سُجّل في هذه الوردية",
    against: "مقابل",
    counted: "المستلَم",
    damaged: "التالف",
    accepted: "المقبول",
    invoiceGap: (invoiceId: string, gap: number) => ({
      lead: `وصلت ${invoiceId} ولا تطابق ما تم قبوله. فرق قدره`,
      value: String(gap),
      tail: "بانتظار قرار.",
    }),
    toReview: "مراجعة الفرق ←",
    legendTag: "كيف تقرأ هذا",
    legend:
      "اللون البنفسجي يشير إلى كل ما هو مُدخَل أو مُحاكى. لا شيء في هذا النموذج يتصل بمورّد أو يسجّل حركة مخزون.",
  },

  form: {
    noteFor: (part: string, orderId: string) => `${part} · مقابل ${orderId}`,
    noteLists: "السند يذكر",
    countedIn: "المستلَم فعليًا",
    countedInHint: "ما عددته بنفسك على المنصّة",
    damagedLabel: "التالف",
    damagedHint: "وصل، لكنه غير صالح للاستعمال",
    acceptedLabel: "المقبول في المخزون",
    acceptedHint: "محسوب: المستلَم − التالف، ويُخزَّن منفصلًا عنهما.",
    shortWarning: (short: number, noteId: string) =>
      `أقل بـ ${short} ممّا يذكره ${noteId}. سيُسجَّل ذلك كنقص مقابل السند، لا كشطب.`,
    invalid: "لا يمكن أن يتجاوز التالف ما تم استلامه.",
    submit: "تسجيل الاستلام",
    submitting: "جارٍ التسجيل…",
    footnote: "يسجّل الاستلام فقط. لا تُقيَّد أي حركة مخزون أو محاسبة.",
  },

  evidence: {
    emptyTitle: "لا توجد أدلة بعد",
    emptyBody: (n: number) =>
      `${
        n === 1
          ? "يوجد سند تسليم واحد"
          : n === 2
            ? "يوجد سندا تسليم"
            : `توجد ${n} سندات تسليم`
      } على الرصيف ولم يُعدّ أي شيء بعد. السلسلة تبدأ من استلام البضاعة.`,
    toBay: "الذهاب إلى الرصيف ←",
    title: (orderId: string, part: string) => `الأدلة — ${orderId} · ${part}`,
    intro:
      "كل رقم أدناه يعود إلى سجلّ. السلسلة هي: الاستلام ← سند التسليم ← أمر الشراء ← بند الفاتورة، حتى يُردّ أي فرق إلى سبب بدل الجدال حوله.",
    ordered: "المطلوب",
    listed: "المذكور",
    countedIn: "المستلَم",
    accepted: "المقبول",
    invoiced: "المفوتَر",
    invoicedNet: "المفوتَر الصافي",
    notesHint: (n: number) => `عدد السندات: ${n}`,
    arrivedHint: "وصل فعليًا",
    damagedHint: (n: number) => `${n} تالف`,
    noneDamaged: "لا تلف",
    noInvoiceYet: "لا فاتورة بعد",
    netHint: (billed: number, credited: number) =>
      `${billed} مفوتَر − ${credited} دائن`,
    reconciledLead: "مطابَق.",
    reconciledBody: "ما يطالب به المورّد يطابق الآن ما دخل المخزون.",
    chain: "السلسلة",
    thRecord: "السجل",
    thSupports: "يدعم",
    thCounted: "المستلَم",
    thDamaged: "التالف",
    thAccepted: "المقبول",
    purchaseOrder: (part: string) => `أمر شراء · ${part}`,
    orderedQty: (n: number) => `${n} مطلوب`,
    duplicateOf: (id: string) => `مسح مكرّر لـ ${id} — مستبعَد`,
    noteLists: (n: number) => `سند تسليم · يذكر ${n}`,
    notCounted: "لم يُعدّ",
    invoiceBills: (notes: string) => `فاتورة مورّد · تغطّي ${notes}`,
    invoicedQty: (n: number) => `${n} مفوتَر`,
    creditNote: (reason: string) => `إشعار دائن · ${reason}`,
    creditedQty: (n: number) => `−${n} دائن`,
    mismatch: "ما لا يتطابق",
    toReview: "الانتقال إلى المراجعة ←",
  },

  review: {
    title: "مراجعة الفروق",
    intro:
      "يرفع النظام اقتراحًا مع الأدلة التي يستند إليها والسبب الذي يراه الأرجح. وهو لا يقرّر. أنت من يعتمد أو يصحّح أو يرفض، وجوابك هو ما يُسجَّل.",
    status: {
      approved: "معتمَد",
      corrected: "صُحِّح من المراجِع",
      rejected: "مرفوض",
      pending: "بانتظار قرار",
    },
    unraised: (n: number) =>
      n === 1
        ? "فرق واحد مرصود ولم يُرفع بعد"
        : n === 2
          ? "فرقان مرصودان ولم يُرفعا بعد"
          : `${n} فروق مرصودة ولم تُرفع بعد`,
    raise: "رفع للمراجعة",
    raising: "جارٍ الرفع…",
    unraisedNote:
      "حُمّلت هذه السجلات خارج مسار الاستلام، لذلك لم يُرفع أي اقتراح تلقائيًا.",
    emptyTitle: "لا شيء للمراجعة",
    emptyNoReceipts: "لم يُعدّ أي شيء بعد، فلا شيء لتسويته.",
    emptyNoInvoice:
      "البضاعة معدودة ومطابقة للسندات. فاتورة المورّد لم تصل بعد.",
    emptyReconciled:
      "كل الأرقام متطابقة. ما يطالب به المورّد يطابق ما دخل المخزون.",
    toBay: "الذهاب إلى الرصيف ←",
    toEvidence: "عرض الأدلة ←",
    pending: (n: number) =>
      n === 1
        ? "اقتراح واحد بانتظار القرار"
        : n === 2
          ? "اقتراحان بانتظار القرار"
          : `${n} اقتراحات بانتظار القرار`,
    proposedBy: "اقتراح من النظام",
    causesLead: "السبب الأرجح، وما يبقى محتملًا:",
    nextAction: "الإجراء المقترح",
    history: "سجل القرارات",
    recordedAs: (cause: string) => `سُجِّل كـ ${cause}`,
    actionRecorded: "الإجراء المسجَّل: ",
    notSent: "لم يُرسَل",
    noAction: "لم يُتّخذ أي إجراء.",
  },

  decide: {
    reviewer: "المراجِع",
    reviewerDefault: "مسؤول استلام قطع الغيار",
    correctLead: (cause: string) =>
      `اقترح النظام ${cause}. سجّل السبب الذي تراه صحيحًا:`,
    notePlaceholder: "السبب — مثلًا: أكّد المورّد أن السندين يخصّان شحنة واحدة",
    save: "حفظ التصحيح",
    saving: "جارٍ تسجيل التصحيح…",
    cancel: "إلغاء",
    approve: "اعتماد الاقتراح",
    approving: "جارٍ تسجيل القرار…",
    correct: "تصحيحه",
    reject: "رفض",
    rejecting: "جارٍ التسجيل…",
    footnote:
      "الاعتماد يسجّل القرار والإجراء المطلوب، ولا يُرسل أي شيء إلى المورّد.",
  },

  demo: {
    heading: "أحداث محاكاة",
    intro:
      "لا شيء أدناه يتصل بمورّد أو بنظام محاسبي. هذه الأزرار تُدخل سجلًّا كان المنسّق سيسلّمه أثناء التمرين.",
    creditUnavailableBefore: "إشعارات الدائن غير متاحة: شغّل",
    creditUnavailableAfter: "في محرّر SQL على Supabase لتفعيل هذا الحدث.",
    invoiceArrives: "◆ وصول فاتورة المورّد",
    invoiceArriving: "جارٍ تسليم الفاتورة…",
    creditIssued: "◆ إصدار المورّد لإشعار دائن",
    creditIssuing: "جارٍ إصدار الإشعار…",
    resetShift: "إعادة الضبط — بداية الوردية",
    resetInvoice: "إعادة الضبط — بعد وصول الفاتورة",
    resetting: "جارٍ إعادة الضبط…",
    creditReason: (n: number) =>
      `تعويض من المورّد عن ${
        n === 1 ? "وحدة تالفة واحدة" : n === 2 ? "وحدتين تالفتين" : `${n} وحدات تالفة`
      } مسجَّلة عند الاستلام.`,
  },

  settings: {
    title: "إعدادات الحالة",
    tag: "للنموذج الأولي فقط",
    intro:
      "يقرأ النموذج كل الكميات من قاعدة البيانات، فلا شيء منها مكتوب داخل الشيفرة. تُعدّل هذه الشاشة تلك الكميات، وهي أسرع طريقة لإظهار أن التسوية عملية حسابية على السجلات لا سيناريو مُعاد تشغيله.",
    notAFeature:
      "النظام الحقيقي لن تكون فيه هذه الشاشة. كمية أمر الشراء تأتي من نظام تخطيط الموارد، والكمية المذكورة تأتي من سند المورّد، ولا يحق لموظّف الاستلام إعادة كتابة أيٍّ منهما. وُجدت هنا ليجيب العرض عن سؤال: «هل يعمل هذا مع 10 من FILTER-X فقط؟».",
    suppliedSafe:
      "لا يُعدَّل ملف initial.json أبدًا. التغييرات تُحفظ في ملفّ تعريف ارتباط داخل هذا المتصفّح، ويُنبّه الشريط العلوي إلى ذلك ما دام قائمًا، ويُعيد زرّ الاستعادة السجلات الأصلية.",

    orderHeading: "أمر الشراء",
    part: "القطعة",
    partHint: "يُذكر اسمها في كل جملة يولّدها المحرّك",
    ordered: "المطلوب",
    orderedHint: "ما طلبه PO-1 من المورّد",

    invoiceHeading: "فاتورة المورّد",
    invoiced: "المفوتَر",
    invoicedHint: "ما تطالب به INV-1 قبل أي إشعار دائن",

    notesHeading: "سندات التسليم",
    notesIntro:
      "«المذكور» هو ما يدّعيه السند. أمّا «المستلَم فعليًا» و«التالف» فهما ما يقوله محضر الاستلام: تستعملهما حالتا البداية الجاهزتان، وعلى الرصيف يكتبهما الموظّف بنفسه.",
    listed: "المذكور في السند",
    counted: "المستلَم فعليًا",
    damagedLabel: "التالف",
    acceptedLabel: "المقبول",
    derived: "محسوب",

    previewHeading: "ما سيراه المحرّك",
    previewOrdered: "المطلوب",
    previewListed: "المذكور",
    previewCounted: "المستلَم",
    previewAccepted: "المقبول",
    previewInvoiced: "المفوتَر",
    gapNone: "الفاتورة والمقبول في المخزون متطابقان — لا فرق يستدعي قرارًا.",
    gapSome: (n: number) =>
      `المفوتَر ${n > 0 ? "يزيد عن" : "يقلّ عن"} المقبول بمقدار ${Math.abs(n)}: فرقٌ على المراجِع أن يسوّيه.`,
    previewNote:
      "«المستلَم فعليًا» و«التالف» يخصّان حالة «بعد وصول الفاتورة» فقط. أمّا «بداية الوردية» فتترك الرصيف فارغًا لتعدّ البضاعة بنفسك.",

    invalid: (noteId: string) =>
      `لا يمكن أن يتجاوز التالف في ${noteId} ما تم استلامه.`,
    changed: "مُعدَّل",
    suppliedValue: (v: string | number) => `كان ${v}`,

    applyShift: "تطبيق — بداية الوردية",
    applyInvoice: "تطبيق — بعد وصول الفاتورة",
    applying: "جارٍ إعادة البناء…",
    applyNote:
      "التطبيق يعيد بناء الحالة انطلاقًا من هذه الأرقام، وتُمسح الاستلامات والاقتراحات المبنية على الأرقام السابقة لأنها تجيب عن سؤال لم يعد قائمًا.",
    restore: "استعادة السجلات الأصلية",
    restoring: "جارٍ الاستعادة…",
    restoreHint: "عودة إلى initial.json، مع اختفاء علامة التعديل من الشريط.",

    limitsHeading: "ما لا تفعله هذه الشاشة",
    limits: [
      "معرّفات السندات ثابتة. يمكنك تغيير ما يقوله DN-1 و DN-2، لا إضافة سند ثالث أو حذف واحد — فذلك تغيير في السجلات لا في الإعدادات.",
      "التعديل محفوظ في هذا المتصفّح وحده. متصفّح آخر على القاعدة نفسها يرى السجلات ذاتها لكنه يعود إلى الأرقام الأصلية عند إعادة الضبط.",
      "لا شيء هنا يُقابَل بأمر شراء حقيقي. تُقبل القيم كما تُكتب، ضمن قيود قاعدة البيانات نفسها.",
    ],
  },

  error: {
    title: "حدث خطأ في هذه الشاشة",
    body: "السجلات في Supabase لم تتأثر. أعد المحاولة، أو أعد بناء حالة البداية وتابع العرض.",
    retry: "إعادة المحاولة",
    home: "العودة إلى الرصيف",
    detail: "التفاصيل التقنية",
  },

  recon: {
    received_vs_listed: {
      statement: (p) =>
        `تذكر السندات ${p.listed} بينما جرى عدّ ${p.received} فعليًا.`,
      action: (p) =>
        `راجع المورّد بخصوص ${p.abs} × ${p.part} مقابل ${p.notes.join(" و ")}.`,
      settledBy: () => "إعادة عدّ مقابل السندات، ثم سجلّ الإرسال لدى المورّد.",
    },
    invoiced_vs_accepted: {
      statement: (p) =>
        `تطالب ${p.invoiceId} بـ ${p.invoicedNet} بينما قُبل ${p.accepted} في المخزون: فرق قدره ${p.delta}.`,
      actionDamage: (p) =>
        `اطلب من المورّد إشعارًا دائنًا بـ ${p.delta} × ${p.part}، استنادًا إلى ${p.receipts.join("، ")}.`,
      actionUnclear: (p) =>
        `اطلب من المورّد تأكيد ما تم إرساله مقابل ${p.notes.join(" و ")} قبل سداد ${p.invoiceId}.`,
      settledDamage: (p) =>
        `التلف البالغ ${p.damaged} في ${p.receipts.join("، ")} يطابق الفرق تمامًا. إشعار دائن من المورّد يحسم الأمر؛ هذه السجلات وحدها لا تكفي.`,
      settledUnclear: () =>
        "لا يوجد سجلّ واحد يفسّر الفرق. يحتاج إلى تأكيد من المورّد.",
    },
    split_delivery: {
      statement: (p) =>
        `${
          p.count === 2 ? "سندا تسليم يشيران" : `${p.count} سندات تسليم تشير`
        } إلى ${p.orderId}، ومجموعهما يساوي تمامًا الكمية المطلوبة وهي ${p.ordered}.`,
      action: () =>
        "سجّل السندين كأمر واحد سُلّم على دفعات. لا تغيير في المخزون.",
      settledBy: () =>
        "الكميات متطابقة، ما يرجّح أنه تسليم على دفعات. تحقّق من اختلاف التواريخ أو الناقلين على السندين قبل اعتبارهما تسليمين منفصلين.",
    },
  },
};
