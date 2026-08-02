// ---------- Helpers ----------
const $ = (sel, el=document) => el.querySelector(sel);
const app = $("#app");
const crumbsEl = $("#crumbs");

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Interface language (FR/AR) ----------
// Scope: interface chrome only (buttons, labels, headings, notices). Concours/matière
// names and the QCM content itself (questions, options, explanations) come from the
// data layer and are never touched here — they stay exactly as authored.
// Arabic strings use Modern Standard Arabic. Counts don't implement full Arabic plural
// rules (singular/dual/plural-3-10/plural-11+) — that's a known simplification, not a bug.
const I18N = {
  fr: {
    nav_inedit:"Questions inédites", nav_progression:"Ma progression", nav_home:"Accueil", nav_level:"Niveau", nav_bac2:"Concours Bac+2", nav_bac3:"Concours d'enseignement", nav_master:"Concours Master", skip_to_content:"Aller au contenu",
    search_placeholder:"Chercher un concours, une matière…",
    theme_to_dark:"Passer en mode sombre", theme_to_light:"Passer en mode clair",
    lang_to_ar:"Passer l'interface en arabe", lang_to_fr:"Passer l'interface en français",
    footer_tagline:"Plateforme gratuite de préparation aux concours marocains — QCM corrigés et expliqués, mode cours et mode examen chronométré. Ta progression est sauvegardée localement sur cet appareil.",
    footer_nav_title:"Navigation", footer_choose_concours:"Choisir un concours", footer_faq:"Questions fréquentes",
    footer_contact_title:"Contact", footer_contact_text:"Une question, une suggestion, un problème sur un examen ? Écris-nous, on répond rapidement.",
    footer_copyright:"© 2026 Suprepa — banque de QCM d'entraînement pour les concours marocains",
    auth_sub:"Synchronise ta progression entre ton téléphone et ton ordinateur.", auth_google:"Continuer avec Google",
    auth_or:"ou", auth_email:"Email", auth_password:"Mot de passe", auth_username:"Nom d'utilisateur", auth_username_ph:"ex. sara_ensa", auth_login:"Se connecter", auth_signup:"Créer mon compte",
    auth_no_account:"Pas encore de compte ?", auth_have_account:"Déjà un compte ?",
    auth_create_account:"Créer un compte", auth_close:"Fermer", auth_signout:"Se déconnecter", auth_connected:"Connecté",
    auth_connect_title:"Facultatif — connecte-toi pour garder ta progression entre ton téléphone et ton ordinateur",
    auth_not_configured:"La connexion n'est pas encore configurée sur ce site. Réessaie plus tard.",
    err_bad_credentials:"Email ou mot de passe incorrect.", err_account_exists:"Un compte existe déjà avec cet email.",
    err_password_short:"Le mot de passe doit contenir au moins 6 caractères.", err_invalid_email:"Adresse email invalide.",
    err_confirm_email:"Confirme d'abord ton adresse email (vérifie ta boîte mail).", err_generic:"Une erreur est survenue. Réessaie.",
    auth_signup_success:"Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.",
    admin_title:"Admin — import Excel",
    admin_denied:"Accès réservé aux administrateurs.",
    admin_need_login:"Connecte-toi avec un compte admin.",
    admin_niveau:"Niveau",
    admin_file:"Fichier Excel (.xlsx)",
    admin_concours:"Concours (si absent du fichier)",
    admin_matiere:"Matière (si absente du fichier)",
    admin_annee:"Année (si absente du fichier)",
    admin_upload:"Importer et publier",
    admin_parsing:"Lecture du fichier…",
    admin_saving:"Publication…",
    admin_success:"Publié : {n} examen(s), {q} question(s).",
    admin_error:"Import impossible.",
    admin_hint:"Colonnes attendues : Concours, Question, Option A–D, Correct Answer, Explanation. Optionnel : Matière, Année, Question Number.",
    admin_list:"Examens importés (ce niveau)",
    admin_empty_list:"Aucun import pour ce niveau.",
    admin_delete:"Retirer",
    admin_link:"Admin",
    retry:"↻ Réessayer", err_load_exams:"Impossible de charger les données de Suprepa. Vérifie ta connexion.",
    err_load_exam:"Impossible de charger cet examen. Vérifie ta connexion.",
    hero_badge:"Plateforme gratuite · Maroc", hero_title:"Prépare ton <em>concours</em>,<br>question par question.",
    hero_desc:"Banque de QCM corrigés pour les concours d'accès aux grandes écoles et facultés marocaines — mode cours pour apprendre, mode examen chronométré pour t'entraîner en conditions réelles.",
    hero_cta_start:"Commencer maintenant →", hero_cta_progress:"Voir ma progression",
    cover_candidate:"Candidat(e)", cover_you:"Toi", cover_concours:"Concours", cover_free_choice:"Au choix",
    cover_duration:"Durée", cover_timed:"Chronométrée", cover_questions:"Questions", cover_available:"disponibles",
    cover_status:"Statut", cover_ready:"Prêt",
    stat_questions:"Questions", stat_exams:"Examens", stat_concours:"Concours", stat_corrected:"Corrigées",
    section_choose_concours:"Choisis ton concours", section_resume:"Reprendre mes révisions", see_all:"Voir tout",
    level_bac:"Bac", level_bac2:"Bac+2", level_bac3:"Bac+3", level_master:"Master",
    section_why:"Pourquoi Suprepa ?",
    feature_free_title:"100% gratuit", feature_free_desc:"Toute la banque de QCM est accessible librement, sans compte obligatoire et sans frais cachés.",
    feature_corrections_title:"Corrections détaillées", feature_corrections_desc:"Chaque question corrigée est accompagnée d'une explication claire : la bonne réponse, et pourquoi les autres sont fausses.",
    feature_modes_title:"Deux modes d'entraînement", feature_modes_desc:"Mode cours pour apprendre à ton rythme, mode examen chronométré pour simuler les conditions réelles du concours.",
    feature_progress_title:"Progression sauvegardée", feature_progress_desc:"Ton avancement est enregistré automatiquement sur cet appareil : reprends un examen là où tu l'as laissé.",
    section_how:"Comment ça marche",
    step1_title:"Choisis ton concours et un examen", step1_desc:"Médecine, ENSA, ENSAM, ENCG ou ISPITS — sélectionne la matière et l'année qui t'intéressent.",
    step2_title:"Réponds aux QCM", step2_desc:"En mode cours avec correction immédiate, ou en mode examen chronométré pour te mettre en conditions réelles.",
    step3_title:"Analyse tes résultats", step3_desc:"Consulte ton score, revois tes erreurs et les explications, et suis ta progression au fil des examens.",
    section_faq:"Questions fréquentes",
    faq_q1:"Est-ce que Suprepa est vraiment gratuit ?", faq_a1:"Oui. L'accès à l'ensemble des QCM, examens et corrections disponibles sur Suprepa est entièrement gratuit.",
    faq_q2:"Quels concours sont couverts ?",
    faq_q3:"Quelle est la différence entre mode cours et mode examen ?", faq_a3:"Le mode cours te permet d'avancer à ton rythme avec correction et explication immédiates après chaque réponse. Le mode examen chronomètre ta session pour simuler les conditions réelles du concours, avec un bilan à la fin.",
    faq_q4:"Est-ce que toutes les questions sont corrigées ?", faq_a4:"Non, certaines questions n'ont pas encore de correction disponible. Elles restent néanmoins accessibles à l'entraînement pour t'habituer aux énoncés du concours.",
    faq_q5:"Comment vous contacter ?",
    progression_title:"Ma progression", progression_empty:'Tu n\'as pas encore commencé d\'examen. <a href="#/">Choisis un concours</a> pour démarrer.',
    stat_started:"Examens entamés", stat_finished:"Terminés", stat_success_rate:"Taux de réussite (corrigées)",
    row_finished:"terminé", row_in_progress:"en cours",
    btn_review:"Revoir", btn_continue:"Continuer", btn_open:"Ouvrir", btn_review_mistakes:"Revoir mes erreurs",
    mistakes_title:"Mes erreurs", mistakes_empty:"Aucune erreur à revoir pour le moment — soit tu n'as pas encore répondu à des questions corrigées, soit tu les as toutes eues juste !",
    no_exam_for_concours:"Aucun examen pour ce concours.", back_all_concours:"Tous les concours", empty_no_exam:"Aucun examen.",
    inedit_title:"Questions inédites", inedit_badge:"Original Suprepa",
    inedit_desc:"Des QCM entièrement inédits, écrits dans l'esprit des concours marocains — jamais tombés dans une vraie session. Idéal pour tester ta compréhension au-delà des annales déjà connues, avec une correction et une explication systématiques sur chaque question.",
    inedit_empty:"Aucune question inédite disponible pour le moment.", inedit_no_concours:"Aucune question inédite pour ce concours.",
    inedit_matiere_hint:"Questions inédites, jamais tombées en concours", inedit_empty_lots:"Aucun lot disponible.",
    corrige_100:"100% corrigées",
    bac2_title:"Concours Bac+2", bac2_badge:"Réponse libre",
    bac2_desc:"Épreuves d'admission destinées aux étudiants ayant déjà validé un Bac+2 (classes préparatoires, DEUG, DUT...) — des exercices à réponse rédigée, pas des QCM. Tape ta réponse, compare-la à la réponse modèle, puis consulte la correction détaillée.",
    bac2_empty:"Aucune épreuve Bac+2 disponible pour le moment.",
    bac2_free_response:"Réponse rédigée", bac2_type_qcm:"QCM",
    bac2_similarity:"Similarité avec la réponse modèle", bac2_similarity_hint:"indicatif, pas une note",
    bac2_model_answer:"Réponse modèle et explication",
    bac2_placeholder:"Tape ta réponse ici…",
    bac2_check_similarity:"Vérifier ma similarité", bac2_reveal:"Voir la réponse et l'explication",
    bac2_reviewed:"consultées",
    bac3_title:"Concours d'enseignement", bac3_badge:"Enseignement",
    bac3_desc:"Concours de recrutement des enseignants — cycle primaire et secondaire, organisés par filière. QCM avec correction et explication détaillée.",
    bac3_empty:"Aucune filière disponible pour le moment.",
    bac3_cycle_primaire:"Primaire", bac3_cycle_secondaire:"Secondaire",
    bac3_cycle_primaire_hint:"Enseignement primaire", bac3_cycle_secondaire_hint:"Enseignement secondaire",
    master_title:"Concours Master", master_badge:"Master",
    master_desc:"Concours d'admission en Master — ENCG, ENSET, ENS Fès, ENS Rabat. QCM et exercices à réponse rédigée selon les concours.",
    mode_cours_tag:"Mode cours", mode_cours_title:"Question par question",
    mode_cours_desc:"Avance à ton rythme, reviens en arrière, pas de chronomètre. Idéal pour découvrir les notions.",
    btn_start:"Commencer", mode_examen_tag:"Mode examen", mode_examen_title:"Chronométré",
    btn_start_timer:"Démarrer le chrono", notice_none_corrected:"Aucune correction disponible pour le moment sur cet examen — tu peux quand même t'entraîner sur les énoncés.",
    crumb_examen:"Examen", crumb_cours:"Cours", mode_examen_review:"Revue de l'examen", mode_examen_timed:"Mode examen chronométré",
    mode_cours_label:"Mode cours", corrected_tag:"Corrigée",
    flag_marked:"★ Marquée", flag_mark:"☆ Marquer", flag_title:"Marquer pour révision (touche F)",
    kbd_hint:'Raccourcis : <kbd>A</kbd><kbd>B</kbd><kbd>C</kbd><kbd>D</kbd> répondre · <kbd>←</kbd><kbd>→</kbd> naviguer · <kbd>F</kbd> marquer',
    swipe_hint:"← Glisse pour changer de question →",
    btn_prev:"Précédente", btn_next:"Suivante →", btn_finish:"Terminer", btn_finish_review:"Terminer la revue",
    correct_answer_right:"Bonne réponse !", correct_answer_wrong:"Ce n'est pas la bonne réponse.",
    correction_label:"Correction", no_correction:"Correction non disponible pour cette question.",
    calculating_score:"Calcul du score…", session_finished:"Session terminée", stat_answered:"Répondues",
    score_label:"Score (corrigées)", no_correction_available:"Aucune correction dispo",
    good_score_msg:"Bon score sur les questions corrigées — continue comme ça.",
    notice_no_correctable:"Aucune question de cet examen n'est corrigée pour le moment.",
    review_answers_hint:"Revois tes réponses en détail ci-dessous.", flagged_questions:"Questions marquées",
    btn_review_answers:"Revoir les réponses", btn_other_exams:"Autres examens", search_no_results:"Aucun résultat pour",
    comments_show:"💬 Commentaires", comments_login_prompt:"Connecte-toi pour poser une question ou répondre à quelqu'un.",
    comments_login_btn:"Se connecter", comments_placeholder:"Pose ta question ou aide quelqu'un…",
    comments_reply_placeholder:"Ta réponse…", comments_send:"Publier", comments_reply:"Répondre",
    comments_cancel:"Annuler", comments_report:"Signaler", comments_reported:"Signalé, merci",
    comments_delete:"Supprimer", comments_you:"toi", comments_delete_confirm:"Supprimer ce commentaire ?", comments_empty:"Aucun commentaire pour l'instant — sois le premier à poser une question.",
    comments_error:"Impossible de charger les commentaires.", comments_hidden_reported:"Commentaire masqué (signalé plusieurs fois).",
  },
  ar: {
    nav_inedit:"أسئلة حصرية", nav_progression:"تقدمي", nav_home:"الرئيسية", nav_level:"المستوى", nav_bac2:"مباريات Bac+2", nav_bac3:"مباريات التعليم", nav_master:"مباريات الماستر", skip_to_content:"الانتقال إلى المحتوى",
    search_placeholder:"ابحث عن مباراة أو مادة…",
    theme_to_dark:"التبديل إلى الوضع الداكن", theme_to_light:"التبديل إلى الوضع الفاتح",
    lang_to_ar:"التبديل إلى العربية", lang_to_fr:"التبديل إلى الفرنسية",
    footer_tagline:"منصة مجانية للتحضير للمباريات المغربية — أسئلة اختيار من متعدد مصححة ومشروحة، وضع المراجعة ووضع الامتحان المحدد بوقت. يُحفظ تقدمك محليًا على هذا الجهاز.",
    footer_nav_title:"التصفح", footer_choose_concours:"اختر مباراة", footer_faq:"الأسئلة الشائعة",
    footer_contact_title:"تواصل معنا", footer_contact_text:"سؤال، اقتراح، أو مشكلة في امتحان؟ اكتب لنا، نرد بسرعة.",
    footer_copyright:"© 2026 Suprepa — بنك أسئلة للتدرب على المباريات المغربية",
    auth_sub:"زامن تقدمك بين هاتفك وحاسوبك.", auth_google:"الاستمرار باستخدام Google",
    auth_or:"أو", auth_email:"البريد الإلكتروني", auth_password:"كلمة المرور", auth_username:"اسم المستخدم", auth_username_ph:"مثال sara_ensa", auth_login:"تسجيل الدخول", auth_signup:"إنشاء حسابي",
    auth_no_account:"ليس لديك حساب؟", auth_have_account:"لديك حساب؟",
    auth_create_account:"إنشاء حساب", auth_close:"إغلاق", auth_signout:"تسجيل الخروج", auth_connected:"متصل",
    auth_connect_title:"اختياري — سجّل الدخول للاحتفاظ بتقدمك بين هاتفك وحاسوبك",
    auth_not_configured:"تسجيل الدخول غير مُفعّل بعد على هذا الموقع. حاول مرة أخرى لاحقًا.",
    err_bad_credentials:"البريد الإلكتروني أو كلمة المرور غير صحيحة.", err_account_exists:"يوجد حساب بالفعل بهذا البريد الإلكتروني.",
    err_password_short:"يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.", err_invalid_email:"عنوان بريد إلكتروني غير صالح.",
    err_confirm_email:"أكّد أولاً بريدك الإلكتروني (تحقق من صندوق الوارد).", err_generic:"حدث خطأ. حاول مرة أخرى.",
    auth_signup_success:"تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد عنوانك، ثم سجّل الدخول.",
    retry:"↻ إعادة المحاولة", err_load_exams:"تعذر تحميل بيانات Suprepa. تحقق من اتصالك.",
    err_load_exam:"تعذر تحميل هذا الامتحان. تحقق من اتصالك.",
    hero_badge:"منصة مجانية · المغرب", hero_title:"حضّر لـ<em>مباراتك</em>،<br>سؤالاً بعد سؤال.",
    hero_desc:"بنك أسئلة اختيار من متعدد مصححة لمباريات الالتحاق بالمدارس العليا والكليات المغربية — وضع المراجعة للتعلم، ووضع الامتحان المحدد بوقت للتدرب في ظروف حقيقية.",
    hero_cta_start:"ابدأ الآن ←", hero_cta_progress:"شاهد تقدمي",
    cover_candidate:"المترشح(ة)", cover_you:"أنت", cover_concours:"المباراة", cover_free_choice:"حسب الاختيار",
    cover_duration:"المدة", cover_timed:"محددة بوقت", cover_questions:"الأسئلة", cover_available:"متوفر",
    cover_status:"الحالة", cover_ready:"جاهز",
    stat_questions:"الأسئلة", stat_exams:"الامتحانات", stat_concours:"المباريات", stat_corrected:"المصححة",
    section_choose_concours:"اختر مباراتك", section_resume:"استئناف مراجعتي", see_all:"عرض الكل",
    level_bac:"البكالوريا", level_bac2:"Bac+2", level_bac3:"Bac+3", level_master:"ماستر",
    section_why:"لماذا Suprepa؟",
    feature_free_title:"مجاني 100%", feature_free_desc:"بنك الأسئلة بأكمله متاح مجانًا، بدون حساب إلزامي وبدون أي رسوم خفية.",
    feature_corrections_title:"تصحيحات مفصّلة", feature_corrections_desc:"كل سؤال مصحح مرفق بشرح واضح: الجواب الصحيح، وسبب خطأ الأجوبة الأخرى.",
    feature_modes_title:"وضعان للتدرب", feature_modes_desc:"وضع المراجعة للتعلم بالسرعة التي تناسبك، ووضع الامتحان المحدد بوقت لمحاكاة ظروف المباراة الحقيقية.",
    feature_progress_title:"تقدم محفوظ", feature_progress_desc:"يُسجَّل تقدمك تلقائيًا على هذا الجهاز: استأنف أي امتحان من حيث توقفت.",
    section_how:"كيف يعمل الموقع",
    step1_title:"اختر مباراتك وامتحانًا", step1_desc:"الطب، ENSA، ENSAM، ENCG أو ISPITS — اختر المادة والسنة التي تهمك.",
    step2_title:"أجب عن الأسئلة", step2_desc:"في وضع المراجعة مع تصحيح فوري، أو في وضع الامتحان المحدد بوقت لتضع نفسك في ظروف حقيقية.",
    step3_title:"حلّل نتائجك", step3_desc:"تفقد نتيجتك، راجع أخطاءك والشروحات، وتتبع تقدمك عبر الامتحانات.",
    section_faq:"الأسئلة الشائعة",
    faq_q1:"هل Suprepa مجاني بالفعل؟", faq_a1:"نعم. الوصول إلى جميع الأسئلة والامتحانات والتصحيحات المتوفرة على Suprepa مجاني بالكامل.",
    faq_q2:"ما هي المباريات المتوفرة؟",
    faq_q3:"ما الفرق بين وضع المراجعة ووضع الامتحان؟", faq_a3:"يتيح لك وضع المراجعة التقدم بالسرعة التي تناسبك مع تصحيح وشرح فوريين بعد كل إجابة. أما وضع الامتحان فيحدد وقت جلستك لمحاكاة ظروف المباراة الحقيقية، مع تقرير نهائي.",
    faq_q4:"هل جميع الأسئلة مصححة؟", faq_a4:"لا، بعض الأسئلة ليس لها تصحيح متوفر بعد. تبقى مع ذلك متاحة للتدرب لتعتاد على صيغة أسئلة المباراة.",
    faq_q5:"كيف تتواصل معنا؟",
    progression_title:"تقدمي", progression_empty:'لم تبدأ أي امتحان بعد. <a href="#/">اختر مباراة</a> للبدء.',
    stat_started:"امتحانات بدأتها", stat_finished:"المنتهية", stat_success_rate:"معدل النجاح (المصححة)",
    row_finished:"منتهٍ", row_in_progress:"قيد التقدم",
    btn_review:"مراجعة", btn_continue:"استمرار", btn_open:"فتح", btn_review_mistakes:"مراجعة أخطائي",
    mistakes_title:"أخطائي", mistakes_empty:"لا توجد أخطاء لمراجعتها حاليًا — إما أنك لم تُجب بعد عن أسئلة مصححة، أو أنك أجبت عنها جميعًا بشكل صحيح!",
    no_exam_for_concours:"لا يوجد امتحان لهذه المباراة.", back_all_concours:"جميع المباريات", empty_no_exam:"لا يوجد امتحان.",
    inedit_title:"أسئلة حصرية", inedit_badge:"أصلي من Suprepa",
    inedit_desc:"أسئلة اختيار من متعدد حصرية بالكامل، مكتوبة بروح المباريات المغربية — لم تُطرح مطلقًا في جلسة حقيقية. مثالية لاختبار فهمك بعيدًا عن الامتحانات السابقة المعروفة، مع تصحيح وشرح منهجي لكل سؤال.",
    inedit_empty:"لا توجد أسئلة حصرية متوفرة حاليًا.", inedit_no_concours:"لا توجد أسئلة حصرية لهذه المباراة.",
    inedit_matiere_hint:"أسئلة حصرية، لم تُطرح مطلقًا في المباراة", inedit_empty_lots:"لا توجد مجموعة متوفرة.",
    corrige_100:"مصححة 100%",
    bac2_title:"مباريات Bac+2", bac2_badge:"إجابة حرة",
    bac2_desc:"مباريات ولوج مخصصة للطلبة الحاصلين على Bac+2 (أقسام تحضيرية، DEUG، DUT...) — تمارين بإجابة مُحررة، وليست أسئلة اختيار من متعدد. اكتب إجابتك، قارنها بالإجابة النموذجية، ثم اطّلع على التصحيح المفصل.",
    bac2_empty:"لا توجد مباراة Bac+2 متوفرة حاليًا.",
    bac2_free_response:"إجابة مُحررة", bac2_type_qcm:"اختيار من متعدد",
    bac2_similarity:"التشابه مع الإجابة النموذجية", bac2_similarity_hint:"مؤشر تقريبي، وليس علامة",
    bac2_model_answer:"الإجابة النموذجية والشرح",
    bac2_placeholder:"اكتب إجابتك هنا…",
    bac2_check_similarity:"تحقق من نسبة التشابه", bac2_reveal:"عرض الإجابة والشرح",
    bac2_reviewed:"تمت مراجعتها",
    bac3_title:"مباريات التعليم", bac3_badge:"التعليم",
    bac3_desc:"مباريات توظيف الأساتذة — السلك الابتدائي والإعدادي/التأهيلي، منظمة حسب الشعبة. أسئلة اختيار من متعدد مع تصحيح وشرح مفصل.",
    bac3_empty:"لا توجد شعبة متوفرة حاليًا.",
    bac3_cycle_primaire:"الابتدائي", bac3_cycle_secondaire:"الثانوي",
    bac3_cycle_primaire_hint:"التعليم الابتدائي", bac3_cycle_secondaire_hint:"التعليم الثانوي",
    master_title:"مباريات الماستر", master_badge:"ماستر",
    master_desc:"مباريات ولوج الماستر — ENCG، ENSET، المدرسة العليا للأساتذة بفاس والرباط. أسئلة اختيار من متعدد وتمارين بإجابة محررة حسب المباراة.",
    mode_cours_tag:"وضع المراجعة", mode_cours_title:"سؤال بسؤال",
    mode_cours_desc:"تقدم بالسرعة التي تناسبك، والرجوع للخلف ممكن، بدون توقيت. مثالي لاكتشاف المفاهيم.",
    btn_start:"ابدأ", mode_examen_tag:"وضع الامتحان", mode_examen_title:"محدد بوقت",
    btn_start_timer:"بدء العد", notice_none_corrected:"لا يوجد تصحيح متوفر حاليًا لهذا الامتحان — يمكنك مع ذلك التدرب على الأسئلة.",
    crumb_examen:"امتحان", crumb_cours:"مراجعة", mode_examen_review:"مراجعة الامتحان", mode_examen_timed:"وضع الامتحان المحدد بوقت",
    mode_cours_label:"وضع المراجعة", corrected_tag:"مصححة",
    flag_marked:"★ محددة", flag_mark:"☆ تحديد", flag_title:"وضع علامة للمراجعة (زر F)",
    kbd_hint:'اختصارات: <kbd>A</kbd><kbd>B</kbd><kbd>C</kbd><kbd>D</kbd> للإجابة · <kbd>←</kbd><kbd>→</kbd> للتنقل · <kbd>F</kbd> للتحديد',
    swipe_hint:"→ مرر لتغيير السؤال ←",
    btn_prev:"السابق", btn_next:"التالي ←", btn_finish:"إنهاء", btn_finish_review:"إنهاء المراجعة",
    correct_answer_right:"إجابة صحيحة!", correct_answer_wrong:"هذه ليست الإجابة الصحيحة.",
    correction_label:"التصحيح", no_correction:"التصحيح غير متوفر لهذا السؤال.",
    calculating_score:"جارٍ حساب النتيجة…", session_finished:"انتهت الجلسة", stat_answered:"تمت الإجابة عنها",
    score_label:"النتيجة (المصححة)", no_correction_available:"لا يوجد تصحيح",
    good_score_msg:"نتيجة جيدة في الأسئلة المصححة — واصل على هذا المنوال.",
    notice_no_correctable:"لا يوجد سؤال مصحح في هذا الامتحان حاليًا.",
    review_answers_hint:"راجع إجاباتك بالتفصيل أدناه.", flagged_questions:"الأسئلة المحددة",
    btn_review_answers:"مراجعة الإجابات", btn_other_exams:"امتحانات أخرى", search_no_results:"لا نتائج لـ",
    comments_show:"💬 التعليقات", comments_login_prompt:"سجّل الدخول لطرح سؤال أو الرد على أحد.",
    comments_login_btn:"تسجيل الدخول", comments_placeholder:"اطرح سؤالك أو ساعد أحدًا…",
    comments_reply_placeholder:"ردّك…", comments_send:"نشر", comments_reply:"الرد",
    comments_cancel:"إلغاء", comments_report:"الإبلاغ", comments_reported:"تم الإبلاغ، شكرًا",
    comments_delete:"حذف", comments_you:"أنت", comments_delete_confirm:"حذف هذا التعليق؟", comments_empty:"لا توجد تعليقات بعد — كن أول من يطرح سؤالاً.",
    comments_error:"تعذر تحميل التعليقات.", comments_hidden_reported:"تعليق مخفي (تم الإبلاغ عنه عدة مرات).",
  }
};

const LANG_KEY = "suprepa-lang";
let currentLang = "fr";
try{ currentLang = localStorage.getItem(LANG_KEY) === "ar" ? "ar" : "fr"; }catch(e){}

function t(key){
  const dict = I18N[currentLang] || I18N.fr;
  return (key in dict) ? dict[key] : (I18N.fr[key] || key);
}
// Direction-aware back arrow: in RTL, "back" points visually right (toward where
// reading started), not left — a plain "&larr;" would look backwards to an Arabic reader.
function backArrow(){ return currentLang === "ar" ? "→" : "←"; }

// Arabic noun-number agreement — Arabic has 6 plural categories (CLDR): zero, one,
// two (dual), few (3-10), many (11-99), other (100+). A single fixed noun form next
// to a variable count is grammatically wrong for most values of n, so this picks the
// correct form for the actual count instead of hardcoding one.
function arPlural(n, forms){
  const m = n % 100;
  if (n === 0) return forms.zero;
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  if (m >= 3 && m <= 10) return forms.few;
  if (m >= 11 && m <= 99) return forms.many;
  return forms.other;
}
const AR_NOUNS = {
  exam:     {zero:"امتحان",  one:"امتحان",  two:"امتحانين",  few:"امتحانات", many:"امتحانًا", other:"امتحان"},
  question: {zero:"سؤال",    one:"سؤال",    two:"سؤالين",    few:"أسئلة",    many:"سؤالاً",   other:"سؤال"},
  matiere:  {zero:"مادة",    one:"مادة",    two:"مادتين",    few:"مواد",     many:"مادةً",     other:"مادة"},
  lot:      {zero:"مجموعة",  one:"مجموعة",  two:"مجموعتين",  few:"مجموعات",  many:"مجموعةً",   other:"مجموعة"},
  minute:   {zero:"دقيقة",   one:"دقيقة",   two:"دقيقتين",   few:"دقائق",    many:"دقيقة",     other:"دقيقة"}
};
function nExamens(n){ return currentLang === "ar" ? `${n} ${arPlural(n, AR_NOUNS.exam)}` : `${n} examen${n>1?"s":""}`; }
function nQuestions(n){ return currentLang === "ar" ? `${n} ${arPlural(n, AR_NOUNS.question)}` : `${n} question${n>1?"s":""}`; }
function nMatieres(n){ return currentLang === "ar" ? `${n} ${arPlural(n, AR_NOUNS.matiere)}` : `${n} matière${n>1?"s":""}`; }
function nLots(n){ return currentLang === "ar" ? `${n} ${arPlural(n, AR_NOUNS.lot)}` : `${n} lot${n>1?"s":""}`; }
function nMinutes(n){ return currentLang === "ar" ? `${n} ${arPlural(n, AR_NOUNS.minute)}` : `${n} minute${n>1?"s":""}`; }

function applyStaticTranslations(){
  document.querySelectorAll("[data-i18n]").forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  const toggle = document.getElementById("langToggle");
  if (toggle){
    toggle.querySelector('[data-lang-tag="fr"]').classList.toggle("on", currentLang === "fr");
    toggle.querySelector('[data-lang-tag="ar"]').classList.toggle("on", currentLang === "ar");
    toggle.setAttribute("aria-label", currentLang === "ar" ? t("lang_to_fr") : t("lang_to_ar"));
  }
}

function applyLangToDocument(){
  const root = document.documentElement;
  root.setAttribute("lang", currentLang);
  root.setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");
}

function setLang(next){
  if (next === currentLang) return;
  currentLang = next;
  try{ localStorage.setItem(LANG_KEY, next); }catch(e){}
  applyLangToDocument();
  applyStaticTranslations();
  renderAuthArea();
  if (document.getElementById("authModalOverlay")) setAuthMode(authMode);
  route(); // re-render the current view's dynamic content in the new language
}

(function initLangToggle(){
  applyLangToDocument();
  const btn = document.getElementById("langToggle");
  if (btn) btn.addEventListener("click", () => setLang(currentLang === "ar" ? "fr" : "ar"));
})();

// ---------- Skeletons de chargement (au lieu d'un simple texte "Chargement…") ----------
function skeletonQuestionCard(){
  return `
    <div class="session-head">
      <div><div class="skel skel-line w-40" style="height:16px;"></div>
      <div class="skel skel-line w-70" style="margin-top:8px;"></div></div>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:8%"></div></div>
    <div class="skel-card">
      <div class="skel skel-line w-90"></div>
      <div class="skel skel-line w-70"></div>
      <div class="skel skel-option"></div>
      <div class="skel skel-option"></div>
      <div class="skel skel-option"></div>
      <div class="skel skel-option"></div>
    </div>`;
}
function skeletonRows(n){
  return `<div>${Array.from({length:n}, () => `<div class="skel-row"><div class="skel skel-line w-40" style="margin:16px 0 0;"></div></div>`).join("")}</div>`;
}
function skeletonHome(){
  return `
    <div class="skel-card" style="margin-bottom:16px;">
      <div class="skel skel-line w-40" style="height:22px;"></div>
      <div class="skel skel-line w-90"></div>
      <div class="skel skel-line w-70"></div>
    </div>
    ${skeletonRows(4)}`;
}
function retryBlock(message, onRetry){
  const id = "retryBtn" + Math.random().toString(36).slice(2,8);
  setTimeout(() => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", onRetry);
  }, 0);
  return `<div class="empty">${escapeHtml(message)}<div><button class="btn primary retry-btn" id="${id}" type="button">${t("retry")}</button></div></div>`;
}

// ---------- Theme toggle (dark/light) ----------
(function initTheme(){
  const KEY = "suprepa-theme";
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");

  const ICON_SUN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const ICON_MOON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  function paintButton(theme){
    if (!btn) return;
    btn.innerHTML = theme === "dark" ? ICON_SUN : ICON_MOON;
    btn.setAttribute("aria-label", theme === "dark" ? t("theme_to_light") : t("theme_to_dark"));
  }
  paintButton(root.getAttribute("data-theme") || "light");

  if (btn){
    btn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try{ localStorage.setItem(KEY, next); }catch(e){}
      paintButton(next);
    });
  }
})();

// Animate a single counter element (its <b> tag) from 0 to its target value.
function animateCounterEl(el){
  const raw = el.textContent.trim();
  const m = raw.match(/^([\d][\d,]*)/);
  if (!m) return; // no leading number (e.g. "—") — leave as-is
  const hasComma = m[1].includes(",");
  const target = parseInt(m[1].replace(/,/g, ""), 10);
  if (!isFinite(target)) return;
  const suffix = raw.slice(m[1].length);
  const dur = 550;
  const start = performance.now();
  function tick(now){
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(target * eased);
    el.textContent = (hasComma ? val.toLocaleString("fr-FR") : val) + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = raw;
  }
  requestAnimationFrame(tick);
}

// Animate number counters (stat-cell / summary-stat) from 0 to their target value, immediately.
function animateCounters(root = app){
  if (prefersReducedMotion()) return;
  root.querySelectorAll(".stat-cell b, .summary-stat b").forEach(animateCounterEl);
}

// Reveal home-page sections (and count their stats up) as the user scrolls them into view.
function initScrollReveal(root = app){
  const targets = root.querySelectorAll(
    ".home-page .stat-strip .stat-cell, .home-page .grid > *, .home-page .features-grid > *, " +
    ".home-page .steps-row > *, .home-page .faq-list > *"
  );
  if (!targets.length) return;

  const reveal = (el) => {
    el.classList.add("is-visible");
    const counter = el.matches(".stat-cell") ? el.querySelector("b") : null;
    if (counter && !prefersReducedMotion()) animateCounterEl(counter);
  };

  if (prefersReducedMotion() || !("IntersectionObserver" in window)){
    targets.forEach(reveal);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        reveal(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.15, rootMargin:"0px 0px -40px 0px" });
  targets.forEach(el => io.observe(el));
}

// Enable left/right swipe to navigate between questions on touch devices.
function enableSwipeNav(el, { onNext, onPrev }){
  let sx = 0, sy = 0, tracking = false;
  el.addEventListener("touchstart", e => {
    const t = e.changedTouches[0];
    sx = t.clientX; sy = t.clientY; tracking = true;
  }, { passive:true });
  el.addEventListener("touchend", e => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5){
      if (dx < 0) onNext(); else onPrev();
    }
  }, { passive:true });
}

function renderMath(){
  if (window.renderMathInElement){
    renderMathInElement(app, {
      delimiters: [
        {left:"$$", right:"$$", display:true},
        {left:"$", right:"$", display:false}
      ],
      throwOnError:false
    });
  } else {
    // KaTeX not yet loaded (defer script) — retry shortly
    setTimeout(renderMath, 150);
  }
}

function fmtTime(sec){
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec/60), s = sec%60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// ---------- Data indexing ----------
const CONCOURS_ORDER = ["Médecine","ENSA","ENSAM","ENCG","ISPITS","IAV","IFMIA","ISCAE","UM6P","UM6SS","ENSCK","ENAM","ENA"];
const CONCOURS_DESC = {
  "Médecine":"FMPM, FMPR, FMPF, FMPC — Biologie, Chimie, Physique, Mathématiques",
  "ENSA":"Écoles Nationales des Sciences Appliquées — Mathématiques, Physique, Chimie",
  "ENSAM":"Écoles Nationales Sup. d'Arts et Métiers — Mathématiques, Physique",
  "ENCG":"Concours TAFEM — Culture générale, Linguistique, Résolution de problèmes",
  "ISPITS":"Instituts Sup. des Professions Infirmières — Biologie, Chimie, Physique",
  "IAV":"Institut Agronomique et Vétérinaire Hassan II — Culture générale, Sciences, Logique",
  "IFMIA":"Institut de Formation aux Métiers de l'Industrie Automobile — Physique, Technique, Logique",
  "ISCAE":"Institut Supérieur de Commerce et d'Administration des Entreprises — Mathématiques, Anglais, Culture générale",
  "UM6P":"Université Mohammed VI Polytechnique — Architecture, Informatique, Sciences médicales",
  "UM6SS":"Université Mohammed VI des Sciences et de la Santé — Mathématiques, Physique, Biologie",
  "ENSCK":"École Nationale Supérieure de Chimie de Kénitra — Chimie, Physique, Mathématiques",
  "ENAM":"École Nationale d'Agriculture de Meknès — Biologie, Physique, Mathématiques",
  "ENA":"Écoles Nationales d'Architecture — Culture générale, Logique spatiale, Dessin technique"
};

// Descriptions pour les concours qui n'existent QUE côté Bac+2 (les autres — IAV, ISPITS,
// ENSAM — réutilisent CONCOURS_DESC ci-dessus).
const BAC2_ONLY_DESC = {
  "EHTP":"École Hassania des Travaux Publics — Mathématiques, Physique, Mécanique",
  "EMI":"École Mohammadia d'Ingénieurs — Mathématiques, Physique, Sciences de l'ingénieur",
  "ENSEM":"École Nationale Supérieure d'Électricité et de Mécanique — Mathématiques, Physique, Électricité",
  "ENSIAS":"École Nationale Supérieure d'Informatique et d'Analyse des Systèmes — Mathématiques, Informatique",
  "ENSMR":"École Nationale Supérieure des Mines de Rabat — Algèbre, Analyse, Mécanique, Électricité",
  "INPT":"Institut National des Postes et Télécommunications — Mathématiques, Physique",
  "INSEA":"Institut National de Statistique et d'Économie Appliquée — Mathématiques, Analyse, Probabilités"
};
function bac2Desc(concours){ return CONCOURS_DESC[concours] || BAC2_ONLY_DESC[concours] || ""; }
function bac2ConcoursOrder(){
  const seen = [];
  BAC2_DB.forEach(e => { if (!seen.includes(e.concours)) seen.push(e.concours); });
  return seen;
}
function bac2ByConcours(concours){ return BAC2_DB.filter(e => e.concours === concours); }

// Descriptions pour les concours Master (ENCG y existe aussi côté Bac et Bac+2 — c'est un
// concours d'admission différent, donc une description dédiée plutôt que de réutiliser CONCOURS_DESC).
const MASTER_DESC = {
  "ENCG":"Concours d'admission en Master — épreuves rédigées, cas pratiques",
  "ENSET":"École Normale Supérieure de l'Enseignement Technique — Master GEII, SID",
  "ENS Fès":"École Normale Supérieure de Fès — Master Enseignement",
  "ENS Rabat":"École Normale Supérieure de Rabat — Master Enseignement",
  "FS Agadir":"Faculté des Sciences d'Agadir — Masters scientifiques",
  "FS Aïn Chock":"Faculté des Sciences Aïn Chock (Casablanca) — Masters scientifiques",
  "FS Ben M'Sik":"Faculté des Sciences Ben M'Sik (Casablanca) — Masters scientifiques",
  "FS El Jadida":"Faculté des Sciences d'El Jadida — Masters scientifiques",
  "FS Fès":"Faculté des Sciences Dhar El Mahraz (Fès) — Masters scientifiques",
  "FS Kénitra":"Faculté des Sciences de Kénitra — Masters scientifiques",
  "FS Meknès":"Faculté des Sciences de Meknès — Masters scientifiques",
  "FS Oujda":"Faculté des Sciences d'Oujda — Masters scientifiques",
  "FS Rabat":"Faculté des Sciences de Rabat — Masters scientifiques",
  "FS Tétouan":"Faculté des Sciences de Tétouan — Masters scientifiques",
  "FSSM Marrakech":"Faculté des Sciences Semlalia (Marrakech) — Masters scientifiques",
  "UM6P":"Université Mohammed VI Polytechnique — Master TIUF (Technologies Industrielles de l'Usine du Futur)",
  "ENSAM":"École Nationale Supérieure d'Arts et Métiers — Masters Big Data & IoT, Mécanique, MIT & MIDMS",
  "ENSA":"École Nationale des Sciences Appliquées — Masters SSI, 2ITN",
  "ENSIAS":"École Nationale Supérieure d'Informatique et d'Analyse des Systèmes — Master SDBD",
  "INSEA":"Institut National de Statistique et d'Économie Appliquée — Master M2SI"
};
function masterDesc(concours){ return MASTER_DESC[concours] || ""; }
function masterConcoursOrder(){
  const seen = [];
  MASTER_DB.forEach(e => { if (!seen.includes(e.concours)) seen.push(e.concours); });
  return seen;
}
function masterByConcours(concours){ return MASTER_DB.filter(e => e.concours === concours); }


function byConcours(concours){
  return EXAMS_DB.filter(e => e.concours === concours && e.source !== "suprepa");
}
function byMatiere(concours, matiere){
  return EXAMS_DB.filter(e => e.concours === concours && e.matiere === matiere && e.source !== "suprepa");
}
function matieresOf(concours){
  const set = [...new Set(byConcours(concours).map(e => e.matiere))];
  return set.sort();
}
function examById(id){
  return EXAMS_DB.find(e => e.id === id);
}

// ---------- "Questions inédites" (Original Suprepa) ----------
function ineditConcoursList(){
  return CONCOURS_ORDER.filter(c => EXAMS_DB.some(e => e.concours === c && e.source === "suprepa"));
}
function ineditMatieresOf(concours){
  const set = [...new Set(EXAMS_DB.filter(e => e.concours === concours && e.source === "suprepa").map(e => e.matiere))];
  return set.sort();
}
function byIneditMatiere(concours, matiere){
  return EXAMS_DB.filter(e => e.concours === concours && e.matiere === matiere && e.source === "suprepa");
}

// ---------- Remote data (server-only — jamais expédiées en un seul fichier) ----------
// EXAMS_DB ne contient que les métadonnées (pas les questions ni les corrections).
// Les questions et corrections sont chargées à la demande via /api, examen par examen,
// pour qu'il soit impossible de récupérer toute la banque de QCM en un seul téléchargement.
let EXAMS_DB = [];
const UPLOADED_BY_ID = new Map(); // admin Excel uploads (full exams)
const examQuestionsCache = new Map();
const examCorrectionsCache = new Map();

async function loadExamsMeta(){
  const res = await fetch("/api/exams");
  if (!res.ok) throw new Error("exams meta fetch failed");
  EXAMS_DB = await res.json();
  await loadUploadedContent();
}

async function loadExamQuestions(id){
  if (examQuestionsCache.has(id)) return examQuestionsCache.get(id);
  if (UPLOADED_BY_ID.has(id)){
    const exam = UPLOADED_BY_ID.get(id);
    const questions = (exam.questions || []).map(q => ({
      num: q.num, text: q.text, options: q.options || [], hasCorrection: !!(q.correct)
    }));
    examQuestionsCache.set(id, questions);
    return questions;
  }
  const res = await fetch("/api/exam?id=" + encodeURIComponent(id));
  if (!res.ok) throw new Error("exam fetch failed");
  const data = await res.json();
  examQuestionsCache.set(id, data.questions);
  return data.questions;
}

async function loadCorrections(id){
  if (examCorrectionsCache.has(id)) return examCorrectionsCache.get(id);
  if (UPLOADED_BY_ID.has(id)){
    const exam = UPLOADED_BY_ID.get(id);
    const corrections = (exam.questions || []).map(q => ({ correct: q.correct || null, explanation: q.explanation || null }));
    examCorrectionsCache.set(id, corrections);
    return corrections;
  }
  const res = await fetch("/api/correction?id=" + encodeURIComponent(id));
  if (!res.ok) throw new Error("correction fetch failed");
  const data = await res.json();
  examCorrectionsCache.set(id, data.corrections);
  return data.corrections;
}

// ---------- Bac+2 (réponse libre) — données et stockage séparés du QCM ----------
let BAC2_DB = [];
const bac2QuestionsCache = new Map();
const bac2AnswersCache = new Map();

async function loadBac2Meta(){
  const res = await fetch("/api/bac2-exams");
  if (!res.ok) throw new Error("bac2 exams meta fetch failed");
  BAC2_DB = await res.json();
  await loadUploadedContent();
}
async function loadBac2Questions(id){
  if (bac2QuestionsCache.has(id)) return bac2QuestionsCache.get(id);
  if (UPLOADED_BY_ID.has(id)){
    const exam = UPLOADED_BY_ID.get(id);
    const data = { id: exam.id, questions: exam.questions || [] };
    bac2QuestionsCache.set(id, data);
    return data;
  }
  const res = await fetch("/api/bac2-exam?id=" + encodeURIComponent(id));
  if (!res.ok) throw new Error("bac2 exam fetch failed");
  const data = await res.json();
  bac2QuestionsCache.set(id, data);
  return data;
}
async function loadBac2Answers(id){
  if (bac2AnswersCache.has(id)) return bac2AnswersCache.get(id);
  if (UPLOADED_BY_ID.has(id)){
    const exam = UPLOADED_BY_ID.get(id);
    const answers = (exam.questions || []).map(q => q.answer || q.explanation || "");
    bac2AnswersCache.set(id, answers);
    return answers;
  }
  const res = await fetch("/api/bac2-correction?id=" + encodeURIComponent(id));
  if (!res.ok) throw new Error("bac2 correction fetch failed");
  const data = await res.json();
  bac2AnswersCache.set(id, data.answers);
  return data.answers;
}
function loadBac2Progress(examId){
  try{ return JSON.parse(localStorage.getItem("suprepa:bac2progress:"+examId)) || {}; }
  catch(e){ return {}; }
}
function saveBac2Progress(examId, data){
  try{ localStorage.setItem("suprepa:bac2progress:"+examId, JSON.stringify(data)); }catch(e){}
}

// ---------- Bac+3 (concours d'enseignement) — données et stockage séparés du reste ----------
let BAC3_DB = [];
const bac3QuestionsCache = new Map();
const bac3AnswersCache = new Map();

async function loadBac3Meta(){
  const res = await fetch("/api/bac3-exams");
  if (!res.ok) throw new Error("bac3 exams meta fetch failed");
  BAC3_DB = await res.json();
  await loadUploadedContent();
}
async function loadBac3Questions(id){
  if (bac3QuestionsCache.has(id)) return bac3QuestionsCache.get(id);
  if (UPLOADED_BY_ID.has(id)){
    const exam = UPLOADED_BY_ID.get(id);
    const data = { id: exam.id, questions: exam.questions || [] };
    bac3QuestionsCache.set(id, data);
    return data;
  }
  const res = await fetch("/api/bac3-exam?id=" + encodeURIComponent(id));
  if (!res.ok) throw new Error("bac3 exam fetch failed");
  const data = await res.json();
  bac3QuestionsCache.set(id, data);
  return data;
}
async function loadBac3Answers(id){
  if (bac3AnswersCache.has(id)) return bac3AnswersCache.get(id);
  const res = await fetch("/api/bac3-correction?id=" + encodeURIComponent(id));
  if (!res.ok) throw new Error("bac3 correction fetch failed");
  const data = await res.json();
  bac3AnswersCache.set(id, data.answers);
  return data.answers;
}
function loadBac3Progress(examId){
  try{ return JSON.parse(localStorage.getItem("suprepa:bac3progress:"+examId)) || {}; }
  catch(e){ return {}; }
}
function saveBac3Progress(examId, data){
  try{ localStorage.setItem("suprepa:bac3progress:"+examId, JSON.stringify(data)); }catch(e){}
}
function bac3Cycles(){
  const seen = [];
  BAC3_DB.forEach(e => { if (!seen.includes(e.cycle)) seen.push(e.cycle); });
  return seen;
}
function bac3FilieresOf(cycle){
  const seen = [];
  BAC3_DB.forEach(e => { if (e.cycle === cycle && !seen.includes(e.filiere)) seen.push(e.filiere); });
  return seen;
}
function bac3ByFiliere(cycle, filiere){
  return BAC3_DB.filter(e => e.cycle === cycle && e.filiere === filiere);
}

// ---------- Master (concours d'admission en Master) — données et stockage séparés ----------
let MASTER_DB = [];
const masterQuestionsCache = new Map();
const masterAnswersCache = new Map();

async function loadMasterMeta(){
  const res = await fetch("/api/master-exams");
  if (!res.ok) throw new Error("master exams meta fetch failed");
  MASTER_DB = await res.json();
  await loadUploadedContent();
}
async function loadMasterQuestions(id){
  if (masterQuestionsCache.has(id)) return masterQuestionsCache.get(id);
  if (UPLOADED_BY_ID.has(id)){
    const exam = UPLOADED_BY_ID.get(id);
    const data = { id: exam.id, questions: exam.questions || [] };
    masterQuestionsCache.set(id, data);
    return data;
  }
  const res = await fetch("/api/master-exam?id=" + encodeURIComponent(id));
  if (!res.ok) throw new Error("master exam fetch failed");
  const data = await res.json();
  masterQuestionsCache.set(id, data);
  return data;
}
async function loadMasterAnswers(id){
  if (masterAnswersCache.has(id)) return masterAnswersCache.get(id);
  const res = await fetch("/api/master-correction?id=" + encodeURIComponent(id));
  if (!res.ok) throw new Error("master correction fetch failed");
  const data = await res.json();
  masterAnswersCache.set(id, data.answers);
  return data.answers;
}
function loadMasterProgress(examId){
  try{ return JSON.parse(localStorage.getItem("suprepa:masterprogress:"+examId)) || {}; }
  catch(e){ return {}; }
}
function saveMasterProgress(examId, data){
  try{ localStorage.setItem("suprepa:masterprogress:"+examId, JSON.stringify(data)); }catch(e){}
}

// Approximate self-check, not authoritative grading: two technically-correct answers
// can be phrased very differently (especially for math/derivations), so this is a rough
// word-overlap indicator to nudge self-assessment — always paired with a real reveal button.
function textSimilarity(a, b){
  const tokenize = s => (s || "").toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/).filter(w => w.length > 2);
  const wa = new Set(tokenize(a));
  const wb = new Set(tokenize(b));
  if (!wa.size || !wb.size) return 0;
  let inter = 0;
  wa.forEach(w => { if (wb.has(w)) inter++; });
  const union = new Set([...wa, ...wb]).size;
  return union ? Math.round((inter / union) * 100) : 0;
}


// ---------- Progress storage (QCM) ----------
function loadProgress(examId){
  try{ return JSON.parse(localStorage.getItem("prepari:progress:"+examId)) || {}; }
  catch(e){ return {}; }
}
function saveProgress(examId, data){
  try{ localStorage.setItem("prepari:progress:"+examId, JSON.stringify(data)); }catch(e){}
  // Feed spaced-review queue whenever progress is saved with answers.
  try{ updateSpacedFromProgress(examId, data); }catch(e){}
  try{ touchStudyActivity(); }catch(e){}
  try{ scheduleCloudPush(examId, data); }catch(e){}
}

// ---------- Learning loop: spaced review, streaks, exam-date goal ----------
const SPACED_KEY = "suprepa:spaced-v1";
const STREAK_KEY = "suprepa:streak-v1";
const GOAL_KEY = "suprepa:exam-goal-v1";
// SM-2-lite intervals (days): wrong → 1d, hard → 3d, ok → 7d, easy → 14d
const SPACED_INTERVALS = [1, 3, 7, 14, 30];

function loadSpaced(){
  try{ return JSON.parse(localStorage.getItem(SPACED_KEY)) || {}; }catch(e){ return {}; }
}
function saveSpaced(map){
  try{ localStorage.setItem(SPACED_KEY, JSON.stringify(map)); }catch(e){}
}
function spacedItemKey(examId, qi){ return examId + ":" + qi; }

/** After an answer is scored, schedule next review. quality: 0 wrong, 1 ok, 2 easy */
function scheduleReview(examId, qi, quality){
  const map = loadSpaced();
  const k = spacedItemKey(examId, qi);
  const prev = map[k] || { intervalIdx: 0, due: 0, wrong: 0 };
  let idx = prev.intervalIdx || 0;
  if (quality <= 0){ idx = 0; prev.wrong = (prev.wrong||0)+1; }
  else if (quality === 1){ idx = Math.min(idx + 1, SPACED_INTERVALS.length - 1); }
  else { idx = Math.min(idx + 2, SPACED_INTERVALS.length - 1); }
  const days = SPACED_INTERVALS[idx];
  map[k] = {
    examId, qi, intervalIdx: idx,
    due: Date.now() + days * 86400000,
    wrong: prev.wrong || 0,
    updatedAt: Date.now()
  };
  saveSpaced(map);
}

function updateSpacedFromProgress(examId, data){
  // Without corrections we cannot score; mark answered items as due-soon if flagged only.
  if (!data || !data.answers) return;
  const map = loadSpaced();
  Object.keys(data.answers).forEach(qi => {
    const k = spacedItemKey(examId, qi);
    if (!map[k]){
      map[k] = { examId, qi: Number(qi), intervalIdx: 0, due: Date.now() + 86400000, wrong: 0, updatedAt: Date.now() };
    }
  });
  // Flagged items get accelerated review (due tomorrow at latest)
  Object.keys(data.flagged || {}).forEach(qi => {
    const k = spacedItemKey(examId, qi);
    const cur = map[k] || { examId, qi: Number(qi), intervalIdx: 0, wrong: 0 };
    cur.due = Math.min(cur.due || Infinity, Date.now() + 12 * 3600000);
    cur.flagged = true;
    cur.updatedAt = Date.now();
    map[k] = cur;
  });
  saveSpaced(map);
}

function dueReviews(limit){
  const map = loadSpaced();
  const now = Date.now();
  return Object.values(map)
    .filter(x => x.due && x.due <= now)
    .sort((a,b) => (b.wrong||0) - (a.wrong||0) || a.due - b.due)
    .slice(0, limit || 20);
}

function touchStudyActivity(){
  const today = new Date().toISOString().slice(0,10);
  let s;
  try{ s = JSON.parse(localStorage.getItem(STREAK_KEY)) || {}; }catch(e){ s = {}; }
  if (s.last === today) return;
  const y = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  s.count = (s.last === y) ? (s.count || 0) + 1 : 1;
  s.last = today;
  s.best = Math.max(s.best || 0, s.count);
  try{ localStorage.setItem(STREAK_KEY, JSON.stringify(s)); }catch(e){}
}

function getStreak(){
  try{ return JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, best: 0, last: null }; }
  catch(e){ return { count: 0, best: 0, last: null }; }
}

function getExamGoal(){
  try{ return JSON.parse(localStorage.getItem(GOAL_KEY)) || null; }catch(e){ return null; }
}
function setExamGoal(isoDate, label){
  try{ localStorage.setItem(GOAL_KEY, JSON.stringify({ date: isoDate, label: label || "" })); }catch(e){}
}
function daysUntilGoal(){
  const g = getExamGoal();
  if (!g || !g.date) return null;
  const t = new Date(g.date + "T00:00:00");
  if (isNaN(t.getTime())) return null;
  return Math.ceil((t - new Date()) / 86400000);
}

function learningDashboardHtml(){
  const streak = getStreak();
  const due = dueReviews(50);
  const days = daysUntilGoal();
  const goal = getExamGoal();
  const today = new Date().toISOString().slice(0,10);
  const activeToday = streak.last === today;

  const dueLabel = currentLang === "ar"
    ? `${due.length} للمراجعة`
    : (due.length === 1 ? "1 à revoir" : `${due.length} à revoir`);
  const streakLabel = currentLang === "ar"
    ? `${streak.count || 0} يوم متتالي`
    : `${streak.count || 0} jour${(streak.count||0)>1?"s":""} d'affilée`;
  const goalLabel = days === null
    ? (currentLang === "ar" ? "حدد تاريخ المباراة" : "Fixer la date du concours")
    : (days < 0
      ? (currentLang === "ar" ? "انتهى التاريخ" : "Date dépassée")
      : (currentLang === "ar" ? `${days} يوم متبقي` : (days === 0 ? "C'est aujourd'hui" : `${days} jour${days>1?"s":""} restants`)));

  return `
    <div class="learn-strip" role="region" aria-label="${currentLang === "ar" ? "حلقة التعلم" : "Boucle d'apprentissage"}">
      <div class="learn-card">
        <div class="learn-kicker">${currentLang === "ar" ? "السلسلة" : "Série"}</div>
        <div class="learn-value">${streak.count || 0}</div>
        <div class="learn-sub">${streakLabel}${activeToday ? " · ✓" : ""}</div>
      </div>
      <a class="learn-card learn-card--link" href="#/mistakes">
        <div class="learn-kicker">${currentLang === "ar" ? "مراجعة متباعدة" : "Révision espacée"}</div>
        <div class="learn-value">${due.length}</div>
        <div class="learn-sub">${dueLabel}</div>
      </a>
      <button type="button" class="learn-card learn-card--btn" id="examGoalBtn" aria-haspopup="dialog">
        <div class="learn-kicker">${currentLang === "ar" ? "يوم المباراة" : "Jour J"}</div>
        <div class="learn-value learn-value--sm">${days === null ? "—" : (days < 0 ? "!" : days)}</div>
        <div class="learn-sub">${goal && goal.label ? escapeHtml(goal.label) + " · " : ""}${goalLabel}</div>
      </button>
    </div>`;
}

function wireLearningDashboard(){
  const btn = document.getElementById("examGoalBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const cur = getExamGoal() || {};
    const label = prompt(currentLang === "ar" ? "اسم المباراة (اختياري)" : "Nom du concours (optionnel)", cur.label || "");
    if (label === null) return;
    const date = prompt(currentLang === "ar" ? "تاريخ المباراة (YYYY-MM-DD)" : "Date du concours (YYYY-MM-DD)", cur.date || "");
    if (!date) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)){
      alert(currentLang === "ar" ? "صيغة التاريخ غير صحيحة" : "Format de date invalide (YYYY-MM-DD)");
      return;
    }
    setExamGoal(date, label || "");
    route();
  });
}

function allProgress(){
  const out = [];
  try{
    for (let i=0; i<localStorage.length; i++){
      const key = localStorage.key(i);
      if (!key || !key.startsWith("prepari:progress:")) continue;
      const examId = key.slice("prepari:progress:".length);
      const exam = examById(examId);
      if (!exam) continue;
      let data;
      try{ data = JSON.parse(localStorage.getItem(key)); }catch(e){ continue; }
      out.push({exam, data});
    }
  }catch(e){}
  return out;
}

// ---------- Authentification & synchronisation cloud (Supabase) ----------
// Permet à un étudiant connecté de retrouver sa progression sur un autre appareil.
// Fonctionne en mode "invité" (localStorage uniquement) si Supabase n'est pas configuré.
let sbClient = null, currentUser = null;
const cloudSyncTimers = {};

function initSupabase(){
  try{
    if (!window.supabase || !window.SUPABASE_CONFIG || window.SUPABASE_CONFIG.url === "REMPLACE_MOI"){
      return; // Supabase pas configuré : le site continue de fonctionner en mode invité (localStorage).
    }
    sbClient = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);

    sbClient.auth.getSession().then(({data}) => {
      onAuthChanged(data && data.session ? data.session.user : null);
    });
    sbClient.auth.onAuthStateChange((_event, session) => {
      onAuthChanged(session ? session.user : null);
    });
  }catch(e){ console.warn("Supabase init failed", e); }
}

async function onAuthChanged(user){
  currentUser = user;
  renderAuthArea();
  if (user) await mergeCloudProgress(user.id);
  const parts = parseHash();
  if (parts[0] === "admin") renderAdmin();
}

function renderAuthArea(){
  const el = document.getElementById("authArea");
  if (!el) return;
  if (currentUser){
    el.innerHTML = `
      <div class="auth-user">
        ${isAdmin() ? `<a class="auth-admin-link" href="#/admin">${t("admin_link")}</a>` : ""}
        <span class="auth-email">${escapeHtml(currentUser.email || t("auth_connected"))}</span>
        <button id="authSignOutBtn" type="button">${t("auth_signout")}</button>
      </div>`;
    document.getElementById("authSignOutBtn").addEventListener("click", () => sbClient && sbClient.auth.signOut());
  } else {
    el.innerHTML = `<button class="auth-btn" id="authOpenBtn" type="button" title="${escapeHtml(t("auth_connect_title"))}">${t("auth_login")}</button>`;
    document.getElementById("authOpenBtn").addEventListener("click", openAuthModal);
  }
}

let authMode = "login";
function openAuthModal(){
  if (!sbClient){
    alert(t("auth_not_configured"));
    return;
  }
  const overlay = document.getElementById("authModalOverlay");
  const err = document.getElementById("authError");
  if (err) err.hidden = true;
  if (overlay) overlay.hidden = false;
}
function closeAuthModal(){
  const overlay = document.getElementById("authModalOverlay");
  if (overlay) overlay.hidden = true;
}
function setAuthMode(mode){
  authMode = mode;
  document.getElementById("authModalTitle").textContent = mode === "signup" ? t("auth_create_account") : t("auth_login");
  document.getElementById("authSubmitBtn").textContent = mode === "signup" ? t("auth_signup") : t("auth_login");
  document.getElementById("authSwitchText").textContent = mode === "signup" ? t("auth_have_account") : t("auth_no_account");
  document.getElementById("authSwitchBtn").textContent = mode === "signup" ? t("auth_login") : t("auth_create_account");
  const userWrap = document.getElementById("authUsernameWrap");
  if (userWrap) userWrap.hidden = mode !== "signup";
  const userInput = document.getElementById("authUsername");
  if (userInput){
    userInput.required = mode === "signup";
    if (mode !== "signup") userInput.value = "";
  }
}
function showAuthError(msg){
  const el = document.getElementById("authError");
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
}
function authErrorMessage(e){
  const msg = (e && e.message) || "";
  if (msg.includes("Invalid login credentials")) return t("err_bad_credentials");
  if (msg.includes("already registered") || msg.includes("already exists")) return t("err_account_exists");
  if (msg.includes("Password should be at least")) return t("err_password_short");
  if (msg.includes("Unable to validate email") || msg.includes("invalid")) return t("err_invalid_email");
  if (msg.includes("Email not confirmed")) return t("err_confirm_email");
  return msg || t("err_generic");
}

function initAuthModalEvents(){
  const closeBtn = document.getElementById("authCloseBtn");
  const overlay = document.getElementById("authModalOverlay");
  const form = document.getElementById("authForm");
  const googleBtn = document.getElementById("authGoogleBtn");
  const switchBtn = document.getElementById("authSwitchBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeAuthModal);
  if (overlay) overlay.addEventListener("click", (e) => { if (e.target === overlay) closeAuthModal(); });
  if (switchBtn) switchBtn.addEventListener("click", () => setAuthMode(authMode === "signup" ? "login" : "signup"));
  if (googleBtn) googleBtn.addEventListener("click", async () => {
    if (!sbClient) return;
    try{
      const { error } = await sbClient.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + window.location.pathname }
      });
      if (error) throw error;
      // La page va rediriger vers Google puis revenir : pas besoin de fermer le modal ici.
    }catch(e){ showAuthError(authErrorMessage(e)); }
  });
  if (form) form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!sbClient) return;
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    const usernameEl = document.getElementById("authUsername");
    const username = usernameEl ? usernameEl.value.trim().replace(/\s+/g, "_").slice(0, 32) : "";
    try{
      if (authMode === "signup"){
        if (!username || username.length < 2){
          showAuthError(currentLang === "ar" ? "اختر اسم مستخدم (حرفان على الأقل)" : "Choisis un nom d'utilisateur (2 caractères min.)");
          return;
        }
        const { data, error } = await sbClient.auth.signUp({
          email,
          password,
          options: { data: { username } }
        });
        if (error) throw error;
        if (data.user && !data.session){
          showAuthError(t("auth_signup_success"));
          return;
        }
      } else {
        const { error } = await sbClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      closeAuthModal();
    }catch(e){ showAuthError(authErrorMessage(e)); }
  });
}

// Écrit en local instantanément (déjà fait par saveProgress) puis pousse vers le
// cloud après un court délai, pour éviter une écriture à chaque clic.
function scheduleCloudPush(examId, data){
  if (!currentUser || !sbClient) return;
  clearTimeout(cloudSyncTimers[examId]);
  cloudSyncTimers[examId] = setTimeout(() => {
    sbClient.from("progress").upsert({
      user_id: currentUser.id,
      exam_id: examId,
      data: data,
      updated_at: data.updatedAt || Date.now()
    }).then(({error}) => { if (error) console.warn("cloud push failed", error); });
  }, 2500);
}

// À la connexion : fusionne le cloud et le local (garde toujours la version la plus récente
// de chaque examen, dans les deux sens) pour permettre de changer d'appareil sans rien perdre.
async function mergeCloudProgress(uid){
  if (!sbClient) return;
  try{
    const { data: rows, error } = await sbClient.from("progress").select("exam_id, data").eq("user_id", uid);
    if (error) throw error;
    const cloudMap = {};
    (rows || []).forEach(r => { cloudMap[r.exam_id] = r.data; });

    Object.keys(cloudMap).forEach(examId => {
      const cloudData = cloudMap[examId];
      const localData = loadProgress(examId);
      if ((cloudData.updatedAt||0) > (localData.updatedAt||0)){
        try{ localStorage.setItem("prepari:progress:"+examId, JSON.stringify(cloudData)); }catch(e){}
      }
    });

    allProgress().forEach(({exam, data}) => {
      const cloudData = cloudMap[exam.id];
      if ((data.updatedAt||0) >= ((cloudData && cloudData.updatedAt) || 0)){
        sbClient.from("progress").upsert({
          user_id: uid, exam_id: exam.id, data: data, updated_at: data.updatedAt || Date.now()
        }).then(()=>{});
      }
    });

    if (location.hash.replace(/^#\/?/, "").split("/")[0] === "progression") route();
  }catch(e){ console.warn("cloud merge failed", e); }
}


/** Localize year labels like s.d. / Lot N */
function formatAnnee(annee){
  const a = String(annee == null ? "" : annee).trim();
  if (!a) return "—";
  const low = a.toLowerCase().replace(/\s+/g, "");
  if (low === "s.d." || low === "sd" || low === "s.d" || low === "n/a" || low === "na"){
    return currentLang === "ar" ? "تاريخ غير معروف" : "Date inconnue";
  }
  // Lot 1 / Lot 2 kept as-is unless already mapped to real year in data
  if (/^lot\s*\d+/i.test(a)){
    const n = a.replace(/\D/g, "") || "";
    return currentLang === "ar" ? (`مجموعة ${n}` || a) : a.replace(/^lot/i, "Lot");
  }
  return a;
}

// ---------- Comments (signed-in only to post; own comments deletable) ----------
const FLAG_HIDE_THRESHOLD = 3; // masqué côté client au-delà de ce nombre de signalements

/** Public username shown under questions */
function getUserDisplayName(user){
  if (!user) return currentLang === "ar" ? "طالب" : "Étudiant";
  const meta = user.user_metadata || {};
  const name = (meta.username || meta.user_name || meta.full_name || meta.name || "").trim();
  if (name) return name.slice(0, 32);
  const email = (user.email || "").split("@")[0];
  return (email || (currentLang === "ar" ? "طالب" : "Étudiant")).slice(0, 32);
}

/** Initials from "Nom Prenom" or username (max 2 letters) */
function getInitials(name){
  const s = String(name || "").trim();
  if (!s) return "?";
  const parts = s.replace(/[_-]+/g, " ").split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

async function loadComments(examId, idx){
  if (!sbClient) return [];
  const { data, error } = await sbClient
    .from("comments")
    .select("id, parent_id, user_id, display_name, body, flagged_count, created_at")
    .eq("exam_id", examId)
    .eq("question_idx", idx)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function postComment(examId, idx, body, parentId){
  if (!sbClient || !currentUser){
    openAuthModal();
    throw new Error("auth_required");
  }
  const text = (body || "").trim();
  if (!text) return null;
  const displayName = getUserDisplayName(currentUser);
  const { data, error } = await sbClient
    .from("comments")
    .insert({
      exam_id: examId,
      question_idx: idx,
      parent_id: parentId || null,
      user_id: currentUser.id,
      display_name: displayName,
      body: text
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteComment(commentId){
  if (!sbClient || !currentUser) return;
  const { error } = await sbClient
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", currentUser.id);
  if (error) throw error;
}

async function reportComment(commentId){
  if (!sbClient || !currentUser) return;
  await sbClient.from("comment_reports").insert({ comment_id: commentId, reporter_id: currentUser.id });
}


// ---------- Admin Excel import (Supabase content_exams) ----------
function isAdmin(){
  if (!currentUser) return false;
  const um = currentUser.user_metadata || {};
  const am = currentUser.app_metadata || {};
  // Supabase Dashboard can put role in User Metadata OR App Metadata
  if (um.role === "admin" || um.is_admin === true) return true;
  if (am.role === "admin" || am.is_admin === true) return true;
  // Optional allowlist (your main admin email)
  const email = (currentUser.email || "").toLowerCase().trim();
  const allow = ["ilyas.tammouch@uit.ac.ma"];
  if (email && allow.includes(email)) return true;
  return false;
}

function makeUploadId(niveau, concours, matiere, annee){
  const raw = [niveau, concours, matiere, annee, Date.now()].join("|").toLowerCase();
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
  return "up-" + niveau + "-" + (Math.abs(h).toString(36)) + "-" + Date.now().toString(36);
}

function normHeader(s){
  return String(s || "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\s]+/g, " ");
}

function pickCol(headers, aliases){
  const map = {};
  headers.forEach((h, i) => { map[normHeader(h)] = i; });
  for (const a of aliases){
    const k = normHeader(a);
    if (map[k] !== undefined) return map[k];
  }
  // partial match
  for (const [h, i] of Object.entries(map)){
    for (const a of aliases){
      if (h.includes(normHeader(a)) || normHeader(a).includes(h)) return i;
    }
  }
  return -1;
}

function cell(row, idx){
  if (idx < 0 || !row) return "";
  const v = row[idx];
  return v == null ? "" : String(v).trim();
}

/** Parse SheetJS workbook rows → exam objects for a niveau */
function parseExcelToExams(workbook, niveau, defaults){
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (!rows.length) throw new Error("Fichier vide");
  const headers = rows[0].map(String);
  const iConc = pickCol(headers, ["concours", "exam", "examen"]);
  const iMat = pickCol(headers, ["matiere", "matière", "subject", "filiere", "filière"]);
  const iAnn = pickCol(headers, ["annee", "année", "year", "session"]);
  const iNum = pickCol(headers, ["question number", "num", "n", "numero", "numéro", "#"]);
  const iQ = pickCol(headers, ["question", "enonce", "énoncé", "texte", "text"]);
  const iA = pickCol(headers, ["option a", "a", "choix a", "reponse a"]);
  const iB = pickCol(headers, ["option b", "b", "choix b"]);
  const iC = pickCol(headers, ["option c", "c", "choix c"]);
  const iD = pickCol(headers, ["option d", "d", "choix d"]);
  const iCorr = pickCol(headers, ["correct answer", "correct", "reponse", "réponse", "answer", "bonne reponse"]);
  const iExpl = pickCol(headers, ["explanation", "explication", "corrige", "corrigé"]);

  if (iQ < 0) throw new Error("Colonne « Question » introuvable");

  const groups = new Map();
  for (let r = 1; r < rows.length; r++){
    const row = rows[r];
    if (!row || !row.length) continue;
    const qtext = cell(row, iQ);
    if (!qtext) continue;
    const concours = cell(row, iConc) || defaults.concours || "Import";
    const matiere = cell(row, iMat) || defaults.matiere || (niveau === "bac3" ? "Épreuve" : "Général");
    const annee = cell(row, iAnn) || defaults.annee || new Date().getFullYear().toString();
    const key = concours + "||" + matiere + "||" + annee;
    if (!groups.has(key)) groups.set(key, { concours, matiere, annee, questions: [] });

    const optA = cell(row, iA), optB = cell(row, iB), optC = cell(row, iC), optD = cell(row, iD);
    const hasOpts = !!(optA || optB || optC || optD);
    const corrRaw = cell(row, iCorr);
    const expl = cell(row, iExpl) || null;
    const num = cell(row, iNum) || ("#" + (groups.get(key).questions.length + 1));

    if (hasOpts || niveau === "bac"){
      const options = [];
      [["A", optA], ["B", optB], ["C", optC], ["D", optD]].forEach(([letter, text]) => {
        if (text) options.push({ letter, text });
      });
      if (options.length < 2) continue;
      let correct = (corrRaw || "").toUpperCase().replace(/[^A-D]/g, "").charAt(0) || null;
      if (correct && !options.some(o => o.letter === correct)) correct = null;
      groups.get(key).questions.push({
        num: String(num),
        text: qtext,
        options,
        correct,
        explanation: expl
      });
    } else {
      // libre (bac2 / master style)
      groups.get(key).questions.push({
        num: String(num),
        text: qtext,
        answer: corrRaw || expl || "",
        correct: null,
        explanation: expl
      });
    }
  }

  const exams = [];
  for (const g of groups.values()){
    if (!g.questions.length) continue;
    const id = makeUploadId(niveau, g.concours, g.matiere, g.annee);
    const nCorrected = g.questions.filter(q => q.correct || q.answer).length;
    const type = g.questions.some(q => q.options && q.options.length) ? "qcm" : "libre";
    const exam = {
      id,
      niveau,
      concours: g.concours,
      matiere: g.matiere,
      annee: g.annee,
      n: g.questions.length,
      nCorrected,
      n_corrected: nCorrected,
      type,
      source: "upload",
      questions: g.questions
    };
    exams.push(exam);
  }
  if (!exams.length) throw new Error("Aucune question valide trouvée dans le fichier");
  return exams;
}

function examToMeta(exam){
  const meta = {
    id: exam.id,
    concours: exam.concours,
    matiere: exam.matiere,
    annee: exam.annee,
    n: exam.n,
    nCorrected: exam.nCorrected || exam.n_corrected || 0,
    source: exam.source || "upload"
  };
  if (exam.type) meta.type = exam.type;
  if (exam.cycle) meta.cycle = exam.cycle;
  if (exam.filiere) meta.filiere = exam.filiere;
  return meta;
}

function mergeUploadedIntoDb(niveau, rows){
  const list = rows || [];
  list.forEach(row => {
    const exam = {
      id: row.id,
      concours: row.concours,
      matiere: row.matiere || row.filiere || "",
      annee: row.annee,
      n: row.n,
      nCorrected: row.n_corrected || row.nCorrected || 0,
      type: row.type || "qcm",
      source: row.source || "upload",
      questions: row.questions || [],
      cycle: row.cycle,
      filiere: row.filiere || row.matiere
    };
    UPLOADED_BY_ID.set(exam.id, exam);
    const meta = examToMeta(exam);
    if (niveau === "bac" || niveau === "bac2" && false) {}
    if (niveau === "bac"){
      EXAMS_DB = EXAMS_DB.filter(e => e.id !== meta.id).concat([meta]);
    } else if (niveau === "bac2"){
      BAC2_DB = BAC2_DB.filter(e => e.id !== meta.id).concat([meta]);
    } else if (niveau === "bac3"){
      meta.cycle = row.cycle || "Secondaire";
      meta.filiere = row.filiere || row.matiere || "";
      BAC3_DB = BAC3_DB.filter(e => e.id !== meta.id).concat([meta]);
    } else if (niveau === "master"){
      MASTER_DB = MASTER_DB.filter(e => e.id !== meta.id).concat([meta]);
    }
  });
}

async function loadUploadedContent(){
  if (!sbClient) return;
  try{
    const { data, error } = await sbClient.from("content_exams").select("*");
    if (error) throw error;
    const byNiv = { bac: [], bac2: [], bac3: [], master: [] };
    (data || []).forEach(row => {
      const n = row.niveau;
      if (byNiv[n]) byNiv[n].push(row);
    });
    Object.keys(byNiv).forEach(n => mergeUploadedIntoDb(n, byNiv[n]));
  }catch(e){
    console.warn("loadUploadedContent", e);
  }
}

async function saveExamsToSupabase(exams, niveau){
  if (!sbClient || !currentUser || !isAdmin()) throw new Error("admin");
  const rows = exams.map(e => ({
    id: e.id,
    niveau,
    concours: e.concours,
    matiere: e.matiere,
    annee: e.annee,
    n: e.n,
    n_corrected: e.nCorrected || 0,
    type: e.type || "qcm",
    source: "upload",
    questions: e.questions,
    created_by: currentUser.id,
    updated_at: new Date().toISOString()
  }));
  const { error } = await sbClient.from("content_exams").upsert(rows, { onConflict: "id" });
  if (error) throw error;
  mergeUploadedIntoDb(niveau, rows.map(r => ({ ...r, nCorrected: r.n_corrected })));
  return rows.length;
}

async function deleteUploadedExam(id){
  if (!sbClient || !isAdmin()) return;
  const { error } = await sbClient.from("content_exams").delete().eq("id", id);
  if (error) throw error;
  UPLOADED_BY_ID.delete(id);
  EXAMS_DB = EXAMS_DB.filter(e => e.id !== id);
  BAC2_DB = BAC2_DB.filter(e => e.id !== id);
  BAC3_DB = BAC3_DB.filter(e => e.id !== id);
  MASTER_DB = MASTER_DB.filter(e => e.id !== id);
}

function ensureXlsx(){
  return new Promise((resolve, reject) => {
    if (window.XLSX) return resolve();
    const s = document.createElement("script");
    s.src = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("SheetJS load failed"));
    document.head.appendChild(s);
  });
}

async function renderAdmin(){
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / ${t("admin_title")}`);
  if (!currentUser){
    app.innerHTML = `<div class="admin-panel"><h2>${t("admin_title")}</h2><p>${t("admin_need_login")}</p>
      <button class="btn primary" id="adminLoginBtn" type="button">${t("auth_login")}</button></div>`;
    const b = document.getElementById("adminLoginBtn");
    if (b) b.onclick = openAuthModal;
    return;
  }
  if (!isAdmin()){
    app.innerHTML = `<div class="admin-panel"><h2>${t("admin_title")}</h2><p class="admin-error">${t("admin_denied")}</p>
      <p class="hint">Compte : ${escapeHtml(currentUser.email || "")}</p></div>`;
    return;
  }

  let uploaded = [];
  try{
    if (sbClient){
      const { data } = await sbClient.from("content_exams").select("id,niveau,concours,matiere,annee,n,created_at").order("created_at", { ascending: false });
      uploaded = data || [];
    }
  }catch(e){}

  const listHtml = uploaded.length ? uploaded.map(u => `
    <div class="exam-row">
      <div class="left">
        <span class="year">${escapeHtml(u.niveau)}</span>
        <div>
          <div class="exam-row-title">${escapeHtml(u.concours)} · ${escapeHtml(u.matiere)}</div>
          <div class="n">${escapeHtml(formatAnnee(u.annee))} · ${u.n} Q · ${escapeHtml((u.created_at||"").slice(0,10))}</div>
        </div>
      </div>
      <div class="actions">
        <button type="button" class="btn" data-del-upload="${escapeHtml(u.id)}">${t("admin_delete")}</button>
      </div>
    </div>`).join("") : `<div class="empty">${t("admin_empty_list")}</div>`;

  app.innerHTML = `
    <div class="admin-panel">
      <h2>${t("admin_title")}</h2>
      <p class="hint">${t("admin_hint")}</p>
      <form id="adminUploadForm" class="admin-form">
        <label class="auth-label">${t("admin_niveau")}</label>
        <select id="adminNiveau" class="search-input auth-input" required>
          <option value="bac">Bac / post-bac (QCM)</option>
          <option value="bac2">Bac+2</option>
          <option value="bac3">Enseignement (Bac+3)</option>
          <option value="master">Master</option>
        </select>
        <label class="auth-label">${t("admin_concours")}</label>
        <input id="adminConcours" class="search-input auth-input" type="text" placeholder="ex. ENSA" style="width:100%">
        <label class="auth-label">${t("admin_matiere")}</label>
        <input id="adminMatiere" class="search-input auth-input" type="text" placeholder="ex. Chimie" style="width:100%">
        <label class="auth-label">${t("admin_annee")}</label>
        <input id="adminAnnee" class="search-input auth-input" type="text" placeholder="ex. 2024" style="width:100%">
        <label class="auth-label">${t("admin_file")}</label>
        <input id="adminFile" type="file" accept=".xlsx,.xls,.csv" required>
        <div id="adminStatus" class="admin-status" hidden></div>
        <button class="btn primary" type="submit" id="adminSubmitBtn">${t("admin_upload")}</button>
      </form>
      <h3 style="margin-top:28px;">${t("admin_list")}</h3>
      ${listHtml}
    </div>`;

  document.querySelectorAll("[data-del-upload]").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm(t("admin_delete") + " ?")) return;
      try{
        await deleteUploadedExam(btn.dataset.delUpload);
        renderAdmin();
      }catch(e){ alert(e.message || t("admin_error")); }
    });
  });

  const form = document.getElementById("adminUploadForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = document.getElementById("adminStatus");
    const submit = document.getElementById("adminSubmitBtn");
    const file = document.getElementById("adminFile").files[0];
    if (!file) return;
    status.hidden = false;
    status.className = "admin-status";
    status.textContent = t("admin_parsing");
    submit.disabled = true;
    try{
      await ensureXlsx();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const niveau = document.getElementById("adminNiveau").value;
      const defaults = {
        concours: document.getElementById("adminConcours").value.trim(),
        matiere: document.getElementById("adminMatiere").value.trim(),
        annee: document.getElementById("adminAnnee").value.trim()
      };
      const exams = parseExcelToExams(wb, niveau, defaults);
      status.textContent = t("admin_saving");
      await saveExamsToSupabase(exams, niveau);
      const q = exams.reduce((s, x) => s + x.n, 0);
      status.className = "admin-status admin-ok";
      status.textContent = t("admin_success").replace("{n}", exams.length).replace("{q}", q);
      setTimeout(() => renderAdmin(), 800);
    }catch(err){
      console.warn(err);
      status.className = "admin-status admin-error";
      status.textContent = (err && err.message) ? err.message : t("admin_error");
    }finally{
      submit.disabled = false;
    }
  });
}


// ---------- Router ----------
function parseHash(){
  const h = location.hash.replace(/^#\/?/, "");
  return h.split("/").filter(Boolean).map(decodeURIComponent);
}

window.addEventListener("hashchange", () => {
  navigateWithTransition();
  // Only force scroll-to-top for real app routes (#/...), not in-page anchors like #faq or #concours-grid
  if (location.hash.startsWith("#/") || location.hash === ""){
    window.scrollTo(0, 0);
  }
});

// ---------- Route transitions ----------
// Stage-rank heuristic: raw URL segment count breaks down here — e.g. "#/exam/ID" (mode
// picker) and "#/concours/X" (concours page) both have 2 segments but sit at very
// different points in the actual journey. Rank routes by their real stage instead:
// browse (concours/inedit list) -> narrow (matière list) -> pick exam (mode picker)
// -> session. A higher rank = deeper into the journey = "forward".
function routeRank(parts){
  if (parts.length === 0) return 0; // home
  if (parts[0] === "progression") return 1;
  if (parts[0] === "mistakes") return 1;
  if (parts[0] === "inedit"){
    if (parts.length === 1) return 1;
    if (parts.length === 2) return 2;
    return 3; // inedit/concours/matière
  }
  if (parts[0] === "concours"){
    if (parts.length === 1) return 1; // all-concours listing
    return parts.length === 2 ? 1 : 2; // concours -> concours/matière
  }
  if (parts[0] === "exam"){
    return parts.length === 2 ? 3 : 4; // mode picker -> session
  }
  if (parts[0] === "bac2"){
    if (parts.length === 1) return 1; // all bac2-concours listing
    if (parts[1] === "concours") return 2; // bac2 concours -> exams list
    if (parts[1] === "exam") return 3; // bac2 session
    return 1;
  }
  if (parts[0] === "bac3"){
    if (parts.length === 1) return 1; // cycle picker
    if (parts[1] === "exam") return 4; // session
    return parts.length === 2 ? 2 : 3; // cycle -> filiere list
  }
  if (parts[0] === "master"){
    if (parts.length === 1) return 1; // all master-concours listing
    if (parts[1] === "concours") return 2; // master concours -> exams list
    if (parts[1] === "exam") return 3; // master session
    return 1;
  }
  return 0;
}
let lastRouteRank = null;
function navigateWithTransition(){
  const rank = routeRank(parseHash());
  const direction = lastRouteRank === null ? "same" : rank > lastRouteRank ? "forward" : rank < lastRouteRank ? "back" : "same";
  lastRouteRank = rank;

  const runUpdate = () => route();

  if (direction !== "same" && document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    document.documentElement.classList.remove("nav-forward", "nav-back");
    document.documentElement.classList.add(direction === "forward" ? "nav-forward" : "nav-back");
    const transition = document.startViewTransition(runUpdate);
    transition.finished.finally(() => {
      document.documentElement.classList.remove("nav-forward", "nav-back");
    });
  } else {
    runUpdate();
  }
}

let bootStarted = false;
function boot(){
  if (bootStarted) return;
  bootStarted = true;
  applyStaticTranslations();
  renderAuthArea();
  initAuthModalEvents();
  initSupabase();
  app.innerHTML = skeletonHome();
  loadExamsMeta().then(() => { route(); lastRouteRank = routeRank(parseHash()); }).catch(() => {
    app.innerHTML = retryBlock(t("err_load_exams"), () => {
      bootStarted = false;
      boot();
    });
  });
}
window.addEventListener("DOMContentLoaded", boot);

let examTimerHandle = null;
let sessionKeyHandler = null;

function route(){
  if (examTimerHandle){ clearInterval(examTimerHandle); examTimerHandle = null; }
  if (sessionKeyHandler){ document.removeEventListener("keydown", sessionKeyHandler); sessionKeyHandler = null; }
  const parts = parseHash();
  if (parts.length === 0) return renderHome();
  if (parts[0] === "admin") return renderAdmin();
  if (parts[0] === "progression") return renderProgression();
  if (parts[0] === "mistakes") return renderMistakes();
  if (parts[0] === "inedit" && parts.length === 1) return renderInedit();
  if (parts[0] === "inedit" && parts.length === 2) return renderIneditConcours(parts[1]);
  if (parts[0] === "inedit" && parts.length === 3) return renderIneditMatiere(parts[1], parts[2]);
  if (parts[0] === "concours" && parts.length === 1) return renderAllConcours();
  if (parts[0] === "concours" && parts.length === 2) return renderConcours(parts[1]);
  if (parts[0] === "concours" && parts.length === 3) return renderMatiere(parts[1], parts[2]);
  if (parts[0] === "exam" && parts.length === 2) return renderModePicker(parts[1]);
  if (parts[0] === "exam" && parts.length === 3) return renderSession(parts[1], parts[2]);
  if (parts[0] === "exam" && parts.length === 4) return renderSession(parts[1], parts[2], parseInt(parts[3], 10));
  if (parts[0] === "bac2" && parts.length === 1) return renderBac2Home();
  if (parts[0] === "bac2" && parts[1] === "concours" && parts.length === 3) return renderBac2Concours(parts[2]);
  if (parts[0] === "bac2" && parts[1] === "exam" && parts.length === 3) return renderBac2Session(parts[2]);
  if (parts[0] === "bac2" && parts[1] === "exam" && parts.length === 4) return renderBac2Session(parts[2], parseInt(parts[3], 10));
  if (parts[0] === "bac3" && parts.length === 1) return renderBac3Home();
  if (parts[0] === "bac3" && parts[1] === "exam" && parts.length === 3) return renderBac3Session(parts[2]);
  if (parts[0] === "bac3" && parts[1] === "exam" && parts.length === 4) return renderBac3Session(parts[2], parseInt(parts[3], 10));
  if (parts[0] === "bac3" && parts.length === 2) return renderBac3Cycle(parts[1]);
  if (parts[0] === "bac3" && parts.length === 3) return renderBac3Filiere(parts[1], parts[2]);
  if (parts[0] === "master" && parts.length === 1) return renderMasterHome();
  if (parts[0] === "master" && parts[1] === "concours" && parts.length === 3) return renderMasterConcours(parts[2]);
  if (parts[0] === "master" && parts[1] === "exam" && parts.length === 3) return renderMasterSession(parts[2]);
  if (parts[0] === "master" && parts[1] === "exam" && parts.length === 4) return renderMasterSession(parts[2], parseInt(parts[3], 10));
  return renderHome();
}

function setCrumbs(html){ crumbsEl.innerHTML = html; }

// ---------- Concours picker (Bac / Bac+2 toggle, homepage sample of 5) ----------
let homeLevel = "bac";
function concoursCardHtml(c){
  const exams = byConcours(c);
  const q = exams.reduce((s,e)=>s+e.n,0);
  return `
    <a class="card concours-card" href="#/concours/${encodeURIComponent(c)}">
      <span class="eyebrow">${nMatieres(matieresOf(c).length)}</span>
      <h3>${c}</h3>
      <div class="meta">${CONCOURS_DESC[c]||""}</div>
      <div class="count">${q}<span style="font-size:13px;color:var(--ink-soft);font-weight:500;"> QCM</span></div>
    </a>`;
}
function bac2ConcoursCardHtml(c){
  const exams = bac2ByConcours(c);
  const q = exams.reduce((s,e)=>s+e.n,0);
  const hasQcm = exams.some(e => e.type === "qcm");
  const hasLibre = exams.some(e => e.type !== "qcm");
  const typeLabel = hasQcm && hasLibre ? `${t("bac2_type_qcm")} + ${t("bac2_free_response")}` : hasQcm ? t("bac2_type_qcm") : t("bac2_free_response");
  return `
    <a class="card concours-card" href="#/bac2/concours/${encodeURIComponent(c)}">
      <span class="eyebrow">${typeLabel}</span>
      <h3>${c}</h3>
      <div class="meta">${bac2Desc(c)}</div>
      <div class="count">${q}<span style="font-size:13px;color:var(--ink-soft);font-weight:500;"> QCM</span></div>
    </a>`;
}
function masterConcoursCardHtml(c){
  const exams = masterByConcours(c);
  const q = exams.reduce((s,e)=>s+e.n,0);
  const hasQcm = exams.some(e => e.type === "qcm");
  const hasLibre = exams.some(e => e.type !== "qcm");
  const typeLabel = hasQcm && hasLibre ? `${t("bac2_type_qcm")} + ${t("bac2_free_response")}` : hasQcm ? t("bac2_type_qcm") : t("bac2_free_response");
  return `
    <a class="card concours-card" href="#/master/concours/${encodeURIComponent(c)}">
      <span class="eyebrow">${typeLabel}</span>
      <h3>${c}</h3>
      <div class="meta">${masterDesc(c)}</div>
      <div class="count">${q}<span style="font-size:13px;color:var(--ink-soft);font-weight:500;"> QCM</span></div>
    </a>`;
}
function concoursPickerBodyHtml(){
  if (homeLevel === "bac"){
    const list = CONCOURS_ORDER.filter(c => byConcours(c).length);
    const sample = list.slice(0, 5).map(concoursCardHtml).join("");
    return `<div class="grid">${sample}</div>
      ${list.length > 5 ? `<div style="text-align:center; margin-top:20px;"><a class="btn" href="#/concours">${t("see_all")} (${list.length})</a></div>` : ""}`;
  }
  if (homeLevel === "bac2"){
    if (!BAC2_DB.length) return skeletonRows(2);
    const list = bac2ConcoursOrder();
    const sample = list.slice(0, 5).map(bac2ConcoursCardHtml).join("");
    return `<div class="grid">${sample}</div>
      ${list.length > 5 ? `<div style="text-align:center; margin-top:20px;"><a class="btn" href="#/bac2">${t("see_all")} (${list.length})</a></div>` : ""}`;
  }
  if (homeLevel === "bac3"){
    if (!BAC3_DB.length) return skeletonRows(2);
    const cycles = ["Primaire", "Secondaire"];
    const cards = cycles.map(cy => {
      const n = BAC3_DB.filter(e => e.cycle === cy).reduce((s,e)=>s+e.n,0);
      const nFilieres = bac3FilieresOf(cy).length;
      return `
        <a class="card concours-card" href="#/bac3/${encodeURIComponent(cy.toLowerCase())}">
          <span class="eyebrow">${cy === "Primaire" ? t("bac3_cycle_primaire_hint") : t("bac3_cycle_secondaire_hint")}</span>
          <h3>${cy === "Primaire" ? t("bac3_cycle_primaire") : t("bac3_cycle_secondaire")}</h3>
          <div class="meta">${nFilieres ? nMatieres(nFilieres) : t("bac3_empty")}</div>
          <div class="count">${n}<span style="font-size:13px;color:var(--ink-soft);font-weight:500;"> QCM</span></div>
        </a>`;
    }).join("");
    return `<div class="grid">${cards}</div>`;
  }
  // master
  if (!MASTER_DB.length) return skeletonRows(2);
  const list = masterConcoursOrder();
  const sample = list.slice(0, 5).map(masterConcoursCardHtml).join("");
  return `<div class="grid">${sample}</div>
    ${list.length > 5 ? `<div style="text-align:center; margin-top:20px;"><a class="btn" href="#/master">${t("see_all")} (${list.length})</a></div>` : ""}`;
}
function concoursPickerHtml(){
  const tabs = [
    ["bac", t("level_bac")],
    ["bac2", t("level_bac2")],
    ["bac3", t("level_bac3")],
    ["master", t("level_master")]
  ];
  return `
    <div class="section-head" id="concours-grid">
      <h2>${t("section_choose_concours")}</h2>
      <div class="level-tabs" role="tablist" id="levelTabs">
        <span class="level-tabs-pill" id="levelTabsPill" aria-hidden="true"></span>
        ${tabs.map(([key, label]) => `<button type="button" class="level-tab ${homeLevel===key?'active':''}" data-level="${key}" role="tab" aria-selected="${homeLevel===key}">${label}</button>`).join("")}
      </div>
    </div>
    <div id="concoursPickerBody">${concoursPickerBodyHtml()}</div>`;
}

/** Slide the blue pill under the active level tab */
function moveLevelPill(animate = true){
  const track = document.getElementById("levelTabs");
  const pill = document.getElementById("levelTabsPill");
  if (!track || !pill) return;
  const active = track.querySelector(".level-tab.active") || track.querySelector(".level-tab");
  if (!active) return;
  const tr = track.getBoundingClientRect();
  const ar = active.getBoundingClientRect();
  const x = ar.left - tr.left - track.clientLeft + track.scrollLeft;
  const y = ar.top - tr.top - track.clientTop + track.scrollTop;
  if (!animate) pill.style.transition = "none";
  pill.style.width = ar.width + "px";
  pill.style.height = ar.height + "px";
  pill.style.transform = `translate(${x}px, ${y}px)`;
  if (!animate){
    // force reflow then restore transition
    void pill.offsetWidth;
    pill.style.transition = "";
  }
}

async function loadLevelDataIfNeeded(level){
  if (level === "bac2" && !BAC2_DB.length){ try{ await loadBac2Meta(); }catch(e){} }
  if (level === "bac3" && !BAC3_DB.length){ try{ await loadBac3Meta(); }catch(e){} }
  if (level === "master" && !MASTER_DB.length){ try{ await loadMasterMeta(); }catch(e){} }
}
function wireConcoursPicker(){
  const track = document.getElementById("levelTabs");
  // Initial position (no slide on first paint)
  requestAnimationFrame(() => moveLevelPill(false));
  window.addEventListener("resize", () => moveLevelPill(false), { passive: true });

  document.querySelectorAll(".level-tab").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (btn.dataset.level === homeLevel) return;
      homeLevel = btn.dataset.level;
      document.querySelectorAll(".level-tab").forEach(b => {
        b.classList.toggle("active", b.dataset.level === homeLevel);
        b.setAttribute("aria-selected", b.dataset.level === homeLevel);
      });
      moveLevelPill(true);
      const body = document.getElementById("concoursPickerBody");
      if (!body) return;
      const needsLoad = (homeLevel === "bac2" && !BAC2_DB.length) || (homeLevel === "bac3" && !BAC3_DB.length) || (homeLevel === "master" && !MASTER_DB.length);
      if (needsLoad){
        body.innerHTML = skeletonRows(2);
        await loadLevelDataIfNeeded(homeLevel);
      }
      body.innerHTML = concoursPickerBodyHtml();
    });
  });
}

// ---------- Views ----------
function renderHome(){
  setCrumbs("");
  const browsableExams = EXAMS_DB.filter(e => e.source !== "suprepa");
  const totalQ = browsableExams.reduce((s,e)=>s+e.n,0);
  const totalExams = browsableExams.length;
  const totalCorrected = browsableExams.reduce((s,e)=>s+(e.nCorrected||0),0);

  const resume = allProgress()
    .filter(p => !p.data.finishedAt)
    .sort((a,b) => (b.data.updatedAt||0) - (a.data.updatedAt||0))
    .slice(0,3);
  const resumeHtml = resume.length ? `
    <div class="section-head"><h2>${t("section_resume")}</h2><a class="hint" href="#/progression">${t("see_all")}</a></div>
    <div class="grid">
      ${resume.map(({exam, data}) => {
        const answered = Object.keys(data.answers||{}).length;
        return `
        <a class="card" href="#/exam/${exam.id}/${data.mode||'cours'}">
          <span class="eyebrow">${escapeHtml(exam.concours)} · ${exam.annee}</span>
          <h3>${escapeHtml(exam.matiere)}</h3>
          <div class="meta">${answered} / ${nQuestions(exam.n)}${currentLang === "ar" ? " تمت الإجابة عنها" : " traitées"}</div>
        </a>`;
      }).join("")}
    </div>` : "";

  const nConcours = CONCOURS_ORDER.filter(c=>byConcours(c).length).length;

  const featuresHtml = `
    <div class="section-head"><h2>${t("section_why")}</h2></div>
    <div class="features-grid">
      <div class="feature-card">
        <span class="fnum"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5M12 17h.01"/></svg></span>
        <h3>${t("feature_free_title")}</h3>
        <p>${t("feature_free_desc")}</p>
      </div>
      <div class="feature-card">
        <span class="fnum"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg></span>
        <h3>${t("feature_corrections_title")}</h3>
        <p>${t("feature_corrections_desc")}</p>
      </div>
      <div class="feature-card">
        <span class="fnum"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span>
        <h3>${t("feature_modes_title")}</h3>
        <p>${t("feature_modes_desc")}</p>
      </div>
      <div class="feature-card">
        <span class="fnum"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg></span>
        <h3>${t("feature_progress_title")}</h3>
        <p>${t("feature_progress_desc")}</p>
      </div>
    </div>`;

  const stepsHtml = `
    <div class="section-head"><h2>${t("section_how")}</h2></div>
    <div class="steps-row">
      <div class="step-item">
        <div class="step-num">01</div>
        <h3>${t("step1_title")}</h3>
        <p>${t("step1_desc")}</p>
      </div>
      <div class="step-item">
        <div class="step-num">02</div>
        <h3>${t("step2_title")}</h3>
        <p>${t("step2_desc")}</p>
      </div>
      <div class="step-item">
        <div class="step-num">03</div>
        <h3>${t("step3_title")}</h3>
        <p>${t("step3_desc")}</p>
      </div>
    </div>`;

  const concoursListStr = CONCOURS_ORDER.filter(c=>byConcours(c).length).join(", ");
  const faqData = [
    [t("faq_q1"), t("faq_a1")],
    [t("faq_q2"), currentLang === "ar" ? `يغطي Suprepa حاليًا ${concoursListStr}. قد تُضاف مباريات أخرى تدريجيًا.` : `Suprepa couvre actuellement ${concoursListStr}. D'autres concours pourront être ajoutés progressivement.`],
    [t("faq_q3"), t("faq_a3")],
    [t("faq_q4"), t("faq_a4")],
    [t("faq_q5"), currentLang === "ar" ? `لأي سؤال أو اقتراح أو للإشارة إلى خطأ، اكتب لنا على <a href="mailto:ilyaspay0@gmail.com">ilyaspay0@gmail.com</a>.` : `Pour toute question, suggestion ou signalement d'erreur, écris-nous à <a href="mailto:ilyaspay0@gmail.com">ilyaspay0@gmail.com</a>.`]
  ];
  const faqHtml = `
    <div class="section-head" id="faq"><h2>${t("section_faq")}</h2></div>
    <div class="faq-list">
      ${faqData.map(([q,a]) => `
        <details class="faq-item">
          <summary>${q}</summary>
          <div class="faq-a">${a}</div>
        </details>`).join("")}
    </div>`;

  app.innerHTML = `
    <div class="home-page">
    <section class="hero">
      <div class="hero-copy">
        <span class="hero-badge"><span class="dot"></span>${t("hero_badge")}</span>
        <h1>${currentLang === "ar"
          ? "حضّر لمبارياتك بـ<em>أسئلة مصحّحة</em>"
          : "Prépare tes concours avec des <em>QCM corrigés</em>"}</h1>
        <p>${currentLang === "ar"
          ? "آلاف الأسئلة مع الشرح — وضع الدرس أو الامتحان الموقوت. تقدّمك يُحفظ على هذا الجهاز."
          : "Des milliers de questions expliquées pour ENSA, Médecine, ENCG, Bac+2 et plus. Mode cours ou examen chronométré — progression sauvegardée ici."}</p>
        <div class="cta-row">
          <a class="btn primary lg" href="#concours-grid">${currentLang === "ar" ? "اختيار المباراة" : "Choisir mon concours"}</a>
          <a class="btn lg" href="#/progression">${t("hero_cta_progress")}</a>
        </div>
        <div class="hero-trust" style="display:flex;flex-wrap:wrap;gap:14px;margin-top:18px;font-size:12.5px;font-weight:500;color:var(--ink-soft);">
          <span style="display:inline-flex;align-items:center;gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D5B" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>${currentLang === "ar" ? "تصحيحات مفصّلة" : "Corrections détaillées"}</span>
          <span style="display:inline-flex;align-items:center;gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D5B" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>${currentLang === "ar" ? "مجاني 100٪" : "100 % gratuit"}</span>
          <span style="display:inline-flex;align-items:center;gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D5B" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>FR / AR</span>
        </div>
      </div>
      <div class="hero-preview">
        <div class="preview-card">
          <div class="preview-head">
            <span class="preview-title">${currentLang === "ar" ? "الطب · فيزياء" : "Médecine · Physique"} 2024</span>
            <span class="preview-badge">${currentLang === "ar" ? "وضع الدرس" : "Mode cours"}</span>
          </div>
          <div class="preview-body">
            <p class="preview-q">${currentLang === "ar"
              ? "س12 — كرة كتلتها 430 غ تُقذف بسرعة 20 م/ث بزاوية 20°. ما معادلة المسار (بدون احتكاك)؟"
              : "Q12 — Un ballon de masse 430 g est lancé à 20 m/s sous un angle de 20°. Quelle est l'équation de la trajectoire (sans frottement) ?"}</p>
            <div class="preview-opts" role="list">
              <div class="preview-opt" role="listitem"><span class="letter">A</span><span>z = x·tan α − (g x²)/(2 v₀²)</span></div>
              <div class="preview-opt correct" role="listitem"><span class="letter">B</span><span>z = x·tan α − (g x²)/(2 v₀² cos²α)</span></div>
              <div class="preview-opt" role="listitem"><span class="letter">C</span><span>z = x·sin α − (g x²)/v₀²</span></div>
              <div class="preview-opt" role="listitem"><span class="letter">D</span><span>z = x·cos α − g x² / 2</span></div>
            </div>
            <div class="preview-foot">
              <span class="preview-score"><span class="check" aria-hidden="true">✓</span> ${currentLang === "ar" ? "النتيجة 78 ٪ في هذا الامتحان" : "Score 78 % sur cet examen"}</span>
              <span class="preview-progress">12 / 40</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="stat-strip" role="group" aria-label="${t("stat_questions")}">
      <div class="stat-cell"><b>${totalQ.toLocaleString("fr-FR")}</b><span>${t("stat_questions")}</span></div>
      <div class="stat-cell"><b>${totalExams}</b><span>${t("stat_exams")}</span></div>
      <div class="stat-cell"><b>${nConcours}</b><span>${t("stat_concours")}</span></div>
      <div class="stat-cell"><b>${totalCorrected.toLocaleString("fr-FR")}</b><span>${t("stat_corrected")}</span></div>
    </div>

    ${learningDashboardHtml()}


    ${concoursPickerHtml()}
    ${resumeHtml}
    ${featuresHtml}
    ${stepsHtml}
    ${faqHtml}
    </div>
  `;
  wireConcoursPicker();
  wireLearningDashboard();
  initScrollReveal();
}

function renderProgression(){
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / ${t("progression_title")}`);
  const items = allProgress();

  if (!items.length){
    app.innerHTML = `
      <div class="section-head"><h2>${t("progression_title")}</h2></div>
      <div class="empty">${t("progression_empty")}</div>
    `;
    return;
  }

  app.innerHTML = `<div class="section-head"><h2>${t("progression_title")}</h2></div>` + skeletonRows(Math.min(items.length, 5));

  Promise.all(items.map(({exam}) => loadCorrections(exam.id).catch(() => []))).then(correctionsList => {
    let totalFinished = 0;
    const rows = items.map(({exam, data}, i) => {
      const answered = Object.keys(data.answers||{}).length;
      const corrections = correctionsList[i] || [];
      let nCorrect = 0, nCorrectable = 0;
      corrections.forEach((c, qi) => {
        if (!c || !c.correct) return;
        nCorrectable++;
        if (data.answers && data.answers[qi] === c.correct) nCorrect++;
      });
      if (data.finishedAt) totalFinished++;
      return {exam, data, answered, nCorrect, nCorrectable};
    }).sort((a,b) => (b.data.updatedAt||0) - (a.data.updatedAt||0));

    const totalCorrect = rows.reduce((s,r)=>s+r.nCorrect,0);
    const totalCorrectable = rows.reduce((s,r)=>s+r.nCorrectable,0);

    const rowsHtml = rows.map(({exam, data, answered, nCorrect, nCorrectable}) => `
      <div class="exam-row">
          <div class="left">
            ${exam.source === "suprepa" ? `<span class="badge-original">${t("inedit_badge")}</span>` : `<span class="year">${formatAnnee(exam.annee)}</span>`}
            <div>
              <div style="font-weight:600;">${escapeHtml(exam.concours)} · ${escapeHtml(exam.matiere)}</div>
              <div class="n">${answered} / ${exam.n} ${currentLang === "ar" ? "تمت الإجابة عنها" : "répondues"}${data.finishedAt ? ` · ${t("row_finished")}` : ` · ${t("row_in_progress")}`}${nCorrectable ? ` · ${currentLang === "ar" ? "النتيجة" : "score"} ${nCorrect}/${nCorrectable}` : ""}</div>
            </div>
          </div>
          <div class="actions">
            <a class="btn" href="#/exam/${exam.id}/${data.mode||'cours'}">${data.finishedAt ? t("btn_review") : t("btn_continue")}</a>
          </div>
        </div>
        <div class="progress-track" style="margin-bottom:0;" role="progressbar" aria-valuenow="${answered}" aria-valuemin="0" aria-valuemax="${exam.n}" aria-label="${answered}/${exam.n}">
          <div class="progress-fill" style="width:${Math.round(answered/exam.n*100)}%; ${data.finishedAt ? 'background:var(--green);' : ''}"></div>
        </div>
      </div>`).join("");

    app.innerHTML = `
      <div class="section-head"><h2>${t("progression_title")}</h2><span class="hint">${nExamens(items.length)}</span></div>
      <div class="summary-grid" style="margin-bottom:20px;">
        <div class="summary-stat"><b>${items.length}</b><span>${t("stat_started")}</span></div>
        <div class="summary-stat"><b>${totalFinished}</b><span>${t("stat_finished")}</span></div>
        <div class="summary-stat"><b>${totalCorrectable ? Math.round(100*totalCorrect/totalCorrectable)+"%" : "—"}</b><span>${t("stat_success_rate")}</span></div>
      </div>
      ${totalCorrectable - totalCorrect > 0 ? `<a class="btn gold" href="#/mistakes" style="margin-bottom:32px; display:inline-flex;">${t("btn_review_mistakes")}</a>` : ""}
      ${rowsHtml}
    `;
    animateCounters();
  });
}

function renderMistakes(){
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / <a href="#/progression">${t("progression_title")}</a> / ${t("mistakes_title")}`);
  const items = allProgress();

  if (!items.length){
    app.innerHTML = `
      <div class="section-head"><h2>${t("mistakes_title")}</h2></div>
      <div class="empty">${t("progression_empty")}</div>
    `;
    return;
  }

  app.innerHTML = `<div class="section-head"><h2>${t("mistakes_title")}</h2></div>` + skeletonRows(Math.min(items.length, 5));

  Promise.all(items.map(({exam}) => loadExamQuestions(exam.id).catch(() => []))).then(questionsList => {
    Promise.all(items.map(({exam}) => loadCorrections(exam.id).catch(() => []))).then(correctionsList => {
      // Flatten every wrong answer across every exam the student has touched into one list —
      // this is the thing localStorage-per-exam progress can't show on its own: what to
      // review RIGHT NOW, regardless of which exam it came from.
      const mistakes = [];
      items.forEach(({exam, data}, ei) => {
        const questions = questionsList[ei] || [];
        const corrections = correctionsList[ei] || [];
        Object.keys(data.answers || {}).forEach(qi => {
          const idx = Number(qi);
          const given = data.answers[idx];
          const c = corrections[idx];
          const q = questions[idx];
          if (!q || !c || !c.correct || !given || given === c.correct) return;
          mistakes.push({exam, mode: data.mode || "cours", idx, q, given, correct: c.correct, explanation: c.explanation});
        });
      });

      if (!mistakes.length){
        app.innerHTML = `
          <a class="backlink" href="#/progression">${backArrow()} ${t("progression_title")}</a>
          <div class="section-head"><h2>${t("mistakes_title")}</h2></div>
          <div class="empty">${t("mistakes_empty")}</div>
        `;
        return;
      }

      const rowsHtml = mistakes.map(m => {
        const givenOpt = m.q.options.find(o => o.letter === m.given);
        const correctOpt = m.q.options.find(o => o.letter === m.correct);
        return `
        <div class="question-card" style="margin-bottom:16px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
            <span class="qnum" style="margin-bottom:0;">${escapeHtml(m.exam.concours)} · ${escapeHtml(m.exam.matiere)} · ${m.q.num}</span>
            <a class="btn" href="#/exam/${m.exam.id}/${m.mode}/${m.idx}">${t("btn_review")}</a>
          </div>
          <div class="qtext"><p>${escapeHtml(m.q.text)}</p></div>
          <div class="notice" style="border-color:var(--red);">
            <div>${currentLang === "ar" ? "إجابتك" : "Ta réponse"} : <b style="color:var(--red);">${m.given} — ${escapeHtml(givenOpt ? givenOpt.text : "")}</b></div>
            <div style="margin-top:4px;">${currentLang === "ar" ? "الإجابة الصحيحة" : "Réponse correcte"} : <b style="color:var(--green);">${m.correct} — ${escapeHtml(correctOpt ? correctOpt.text : "")}</b></div>
            ${m.explanation ? `<div style="margin-top:8px;">${escapeHtml(m.explanation)}</div>` : ""}
          </div>
        </div>`;
      }).join("");

      app.innerHTML = `
        <a class="backlink" href="#/progression">${backArrow()} ${t("progression_title")}</a>
        <div class="section-head"><h2>${t("mistakes_title")}</h2><span class="hint">${nQuestions(mistakes.length)}</span></div>
        ${rowsHtml}
      `;
      renderMath();
    });
  });
}

function renderAllConcours(){
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / ${t("section_choose_concours")}`);
  const list = CONCOURS_ORDER.filter(c => byConcours(c).length);
  const cards = list.map(concoursCardHtml).join("");
  app.innerHTML = `
    <a class="backlink" href="#/">${backArrow()} ${t("nav_home")}</a>
    <div class="section-head"><h2>${t("section_choose_concours")}</h2><span class="hint">${nExamens(list.length)}</span></div>
    <div class="grid">${cards}</div>
  `;
}

function renderConcours(concours){
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / ${escapeHtml(concours)}`);
  const matieres = matieresOf(concours);
  if (!matieres.length){
    app.innerHTML = `<a class="backlink" href="#/">${backArrow()} ${t("nav_home")}</a><div class="empty">${t("no_exam_for_concours")}</div>`;
    return;
  }
  const cards = matieres.map(m => {
    const exams = byMatiere(concours, m);
    const q = exams.reduce((s,e)=>s+e.n,0);
    const years = [...new Set(exams.map(e=>e.annee))].sort();
    return `
      <a class="card" href="#/concours/${encodeURIComponent(concours)}/${encodeURIComponent(m)}">
        <span class="eyebrow">${years[0]}–${years[years.length-1]}</span>
        <h3>${escapeHtml(m)}</h3>
        <div class="meta">${nExamens(exams.length)} · ${nQuestions(q)}</div>
      </a>`;
  }).join("");

  app.innerHTML = `
    <a class="backlink" href="#/">${backArrow()} ${t("back_all_concours")}</a>
    <div class="section-head"><h2>${escapeHtml(concours)}</h2><span class="hint">${CONCOURS_DESC[concours]||""}</span></div>
    <div class="grid">${cards}</div>
  `;
}

function renderMatiere(concours, matiere){
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / <a href="#/concours/${encodeURIComponent(concours)}">${escapeHtml(concours)}</a> / ${escapeHtml(matiere)}`);
  const exams = byMatiere(concours, matiere).sort((a,b)=> b.annee.localeCompare(a.annee));

  const rows = exams.map(e => {
    const progress = loadProgress(e.id);
    const answered = Object.keys(progress.answers||{}).length;
    return `
      <div class="exam-row">
          <div class="left">
            <span class="year">${escapeHtml(formatAnnee(e.annee))}</span>
            <div>
              <div style="font-weight:600; view-transition-name:exam-title-${e.id};">${escapeHtml(e.matiere)} ${formatAnnee(e.annee)}</div>
              <div class="n">${nQuestions(e.n)}${answered ? ` · ${answered} ${currentLang === "ar" ? "تم إنجازها" : "traitées"}` : ""}</div>
            </div>
          </div>
          <div class="actions">
            <a class="btn" href="#/exam/${e.id}">${t("btn_open")}</a>
          </div>
        ${answered ? `<div class="exam-row-progress progress-track" role="progressbar" aria-valuenow="${answered}" aria-valuemin="0" aria-valuemax="${e.n}" aria-label="${answered}/${e.n}"><div class="progress-fill" style="width:${Math.round(answered/e.n*100)}%;"></div></div>` : ""}
      </div>`;
  }).join("");

  app.innerHTML = `
    <a class="backlink" href="#/concours/${encodeURIComponent(concours)}">${backArrow()} ${escapeHtml(concours)}</a>
    <div class="section-head"><h2>${escapeHtml(matiere)}</h2><span class="hint">${nExamens(exams.length)}</span></div>
    ${rows || `<div class="empty">${t("empty_no_exam")}</div>`}
  `;
}

function renderInedit(){
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / ${t("inedit_title")}`);
  const concoursList = ineditConcoursList();

  const cards = concoursList.map(c => {
    const exams = EXAMS_DB.filter(e => e.concours === c && e.source === "suprepa");
    const q = exams.reduce((s,e)=>s+e.n,0);
    return `
      <a class="card concours-card" href="#/inedit/${encodeURIComponent(c)}">
        <span class="eyebrow">${nMatieres(ineditMatieresOf(c).length)}</span>
        <h3>${c}</h3>
        <div class="meta">${CONCOURS_DESC[c]||""}</div>
        <div class="count">${q}<span style="font-size:13px;color:var(--ink-soft);font-weight:500;"> QCM</span></div>
      </a>`;
  }).join("");

  app.innerHTML = `
    <div class="inedit-hero">
      <span class="badge-original">${t("inedit_badge")}</span>
      <div class="section-head" style="margin:12px 0 0;"><h2 style="margin:0;">${t("inedit_title")}</h2></div>
      <p>${t("inedit_desc")}</p>
    </div>
    ${concoursList.length ? `<div class="grid">${cards}</div>` : `<div class="empty">${t("inedit_empty")}</div>`}
  `;
}

function renderIneditConcours(concours){
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / <a href="#/inedit">${t("inedit_title")}</a> / ${escapeHtml(concours)}`);
  const matieres = ineditMatieresOf(concours);
  if (!matieres.length){
    app.innerHTML = `<a class="backlink" href="#/inedit">${backArrow()} ${t("inedit_title")}</a><div class="empty">${t("inedit_no_concours")}</div>`;
    return;
  }
  const cards = matieres.map(m => {
    const exams = byIneditMatiere(concours, m);
    const q = exams.reduce((s,e)=>s+e.n,0);
    return `
      <a class="card" href="#/inedit/${encodeURIComponent(concours)}/${encodeURIComponent(m)}">
        <span class="badge-original" style="margin-bottom:8px;">${t("inedit_badge")}</span>
        <h3>${escapeHtml(m)}</h3>
        <div class="meta">${nLots(exams.length)} · ${nQuestions(q)}</div>
      </a>`;
  }).join("");

  app.innerHTML = `
    <a class="backlink" href="#/inedit">${backArrow()} ${t("inedit_title")}</a>
    <div class="section-head"><h2>${escapeHtml(concours)}</h2><span class="hint">${t("inedit_matiere_hint")}</span></div>
    <div class="grid">${cards}</div>
  `;
}

function renderIneditMatiere(concours, matiere){
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / <a href="#/inedit">${t("inedit_title")}</a> / <a href="#/inedit/${encodeURIComponent(concours)}">${escapeHtml(concours)}</a> / ${escapeHtml(matiere)}`);
  const exams = byIneditMatiere(concours, matiere);

  const rows = exams.map(e => {
    const progress = loadProgress(e.id);
    const answered = Object.keys(progress.answers||{}).length;
    return `
      <div class="exam-row">
          <div class="left">
            <span class="badge-original">${t("inedit_badge")}</span>
            <div>
              <div style="font-weight:600; view-transition-name:exam-title-${e.id};">${escapeHtml(e.matiere)} — ${formatAnnee(e.annee)}</div>
              <div class="n">${nQuestions(e.n)}, ${t("corrige_100")}${answered ? ` · ${answered} ${currentLang === "ar" ? "تم إنجازها" : "traitées"}` : ""}</div>
            </div>
          </div>
          <div class="actions">
            <a class="btn" href="#/exam/${e.id}">${t("btn_open")}</a>
          </div>
        ${answered ? `<div class="exam-row-progress progress-track" role="progressbar" aria-valuenow="${answered}" aria-valuemin="0" aria-valuemax="${e.n}" aria-label="${answered}/${e.n}"><div class="progress-fill" style="width:${Math.round(answered/e.n*100)}%;"></div></div>` : ""}
      </div>`;
  }).join("");

  app.innerHTML = `
    <a class="backlink" href="#/inedit/${encodeURIComponent(concours)}">${backArrow()} ${escapeHtml(concours)}</a>
    <div class="section-head"><h2>${escapeHtml(matiere)}</h2><span class="hint">${nLots(exams.length)}</span></div>
    ${rows || `<div class="empty">${t("inedit_empty_lots")}</div>`}
  `;
}

function renderModePicker(examId){
  const exam = examById(examId);
  if (!exam) return renderHome();
  const isOriginal = exam.source === "suprepa";
  const backHref = isOriginal
    ? `#/inedit/${encodeURIComponent(exam.concours)}/${encodeURIComponent(exam.matiere)}`
    : `#/concours/${encodeURIComponent(exam.concours)}/${encodeURIComponent(exam.matiere)}`;
  setCrumbs(isOriginal
    ? `<a href="#/">${t("nav_home")}</a> / <a href="#/inedit">${t("inedit_title")}</a> / <a href="#/inedit/${encodeURIComponent(exam.concours)}">${escapeHtml(exam.concours)}</a> / ${escapeHtml(exam.matiere)}`
    : `<a href="#/">${t("nav_home")}</a> / <a href="#/concours/${encodeURIComponent(exam.concours)}">${escapeHtml(exam.concours)}</a> / ${escapeHtml(exam.matiere)} ${exam.annee}`);

  const nCorrected = exam.nCorrected || 0;
  const noticeHtml = nCorrected === exam.n
    ? `<div class="notice">${currentLang === "ar" ? `جميع أسئلة هذا الامتحان (${exam.n}) مصححة مع شرح.` : `Les ${exam.n} questions de cet examen sont corrigées avec explication.`}</div>`
    : nCorrected > 0
      ? `<div class="notice">${currentLang === "ar" ? `${nCorrected} ${arPlural(nCorrected, AR_NOUNS.question)} من أصل ${exam.n} مصححة مع شرح؛ باقي الأسئلة تبقى متاحة للتدرب بدون تصحيح آلي.` : `${nCorrected} question${nCorrected>1?"s":""} sur ${exam.n} sont corrigées avec explication ; les autres restent disponibles en entraînement sans validation automatique.`}</div>`
      : `<div class="notice">${t("notice_none_corrected")}</div>`;

  app.innerHTML = `
    <a class="backlink" href="${backHref}">${backArrow()} ${escapeHtml(exam.matiere)}</a>
    <div class="section-head">
      <h2 style="view-transition-name:exam-title-${exam.id};">${escapeHtml(exam.concours)} ${escapeHtml(exam.matiere)} ${isOriginal ? "" : exam.annee}</h2>
      <span class="hint">${isOriginal ? `<span class="badge-original">${t("inedit_badge")}</span>` : nQuestions(exam.n)}</span>
    </div>
    ${noticeHtml}
    <div class="mode-grid">
      <a class="mode-card" href="#/exam/${exam.id}/cours">
        <svg class="mode-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        <span class="eyebrow">${t("mode_cours_tag")}</span>
        <h3>${t("mode_cours_title")}</h3>
        <p>${t("mode_cours_desc")}</p>
        <span class="btn primary">${t("btn_start")}</span>
      </a>
      <a class="mode-card" href="#/exam/${exam.id}/examen">
        <svg class="mode-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6M12 2v3"/></svg>
        <span class="eyebrow">${t("mode_examen_tag")}</span>
        <h3>${t("mode_examen_title")}</h3>
        <p>${currentLang === "ar" ? `${nQuestions(exam.n)}، ${nMinutes(Math.round(exam.n*1.5))}. يحاكي ظروف المباراة الحقيقية.` : `${exam.n} questions, ${Math.round(exam.n*1.5)} minutes. Simule les conditions réelles du concours.`}</p>
        <span class="btn gold">${t("btn_start_timer")}</span>
      </a>
    </div>
  `;
}

// ---------- Bac+2 section (réponse libre) — complètement séparée du parcours QCM ----------
async function renderBac2Home(){
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / ${t("bac2_title")}`);
  if (!BAC2_DB.length){
    app.innerHTML = skeletonRows(3);
    try{ await loadBac2Meta(); }
    catch(e){ app.innerHTML = retryBlock(t("err_load_exams"), renderBac2Home); return; }
  }
  const list = bac2ConcoursOrder();
  const cards = list.map(bac2ConcoursCardHtml).join("");
  app.innerHTML = `
    <div class="inedit-hero">
      <span class="badge-original">${t("bac2_badge")}</span>
      <div class="section-head" style="margin:12px 0 0;"><h2 style="margin:0;">${t("bac2_title")}</h2></div>
      <p>${t("bac2_desc")}</p>
    </div>
    ${cards ? `<div class="grid">${cards}</div>` : `<div class="empty">${t("bac2_empty")}</div>`}
  `;
}

async function renderBac2Concours(concours){
  if (!BAC2_DB.length){
    app.innerHTML = skeletonRows(3);
    try{ await loadBac2Meta(); }
    catch(e){ app.innerHTML = retryBlock(t("err_load_exams"), () => renderBac2Concours(concours)); return; }
  }
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / <a href="#/bac2">${t("bac2_title")}</a> / ${escapeHtml(concours)}`);
  const exams = bac2ByConcours(concours);
  const rows = exams.map(e => `
    <div class="exam-row">
      <div class="left">
        <span class="year">${escapeHtml(formatAnnee(e.annee))}</span>
        <div>
          <div style="font-weight:600;">${escapeHtml(e.matiere)}</div>
          <div class="n">${nQuestions(e.n)} · ${e.type === "qcm" ? t("bac2_type_qcm") : t("bac2_free_response")}</div>
        </div>
      </div>
      <div class="actions">
        <a class="btn" href="#/bac2/exam/${e.id}">${t("btn_open")}</a>
      </div>
    </div>`).join("");
  app.innerHTML = `
    <a class="backlink" href="#/bac2">${backArrow()} ${t("bac2_title")}</a>
    <div class="section-head"><h2>${escapeHtml(concours)}</h2><span class="hint">${bac2Desc(concours)}</span></div>
    ${rows || `<div class="empty">${t("empty_no_exam")}</div>`}
  `;
}

async function renderMasterHome(){
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / ${t("master_title")}`);
  if (!MASTER_DB.length){
    app.innerHTML = skeletonRows(3);
    try{ await loadMasterMeta(); }
    catch(e){ app.innerHTML = retryBlock(t("err_load_exams"), renderMasterHome); return; }
  }
  const list = masterConcoursOrder();
  const cards = list.map(masterConcoursCardHtml).join("");
  app.innerHTML = `
    <div class="inedit-hero">
      <span class="badge-original">${t("master_badge")}</span>
      <div class="section-head" style="margin:12px 0 0;"><h2 style="margin:0;">${t("master_title")}</h2></div>
      <p>${t("master_desc")}</p>
    </div>
    ${cards ? `<div class="grid">${cards}</div>` : `<div class="empty">${t("bac2_empty")}</div>`}
  `;
}

async function renderMasterConcours(concours){
  if (!MASTER_DB.length){
    app.innerHTML = skeletonRows(3);
    try{ await loadMasterMeta(); }
    catch(e){ app.innerHTML = retryBlock(t("err_load_exams"), () => renderMasterConcours(concours)); return; }
  }
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / <a href="#/master">${t("master_title")}</a> / ${escapeHtml(concours)}`);
  const exams = masterByConcours(concours);
  const rows = exams.map(e => `
    <div class="exam-row">
      <div class="left">
        <span class="year">${escapeHtml(formatAnnee(e.annee))}</span>
        <div>
          <div style="font-weight:600;">${escapeHtml(e.matiere)}</div>
          <div class="n">${nQuestions(e.n)} · ${e.type === "qcm" ? t("bac2_type_qcm") : t("bac2_free_response")}</div>
        </div>
      </div>
      <div class="actions">
        <a class="btn" href="#/master/exam/${e.id}">${t("btn_open")}</a>
      </div>
    </div>`).join("");
  app.innerHTML = `
    <a class="backlink" href="#/master">${backArrow()} ${t("master_title")}</a>
    <div class="section-head"><h2>${escapeHtml(concours)}</h2><span class="hint">${masterDesc(concours)}</span></div>
    ${rows || `<div class="empty">${t("empty_no_exam")}</div>`}
  `;
}

async function renderBac2Session(examId, startIdx){
  if (!BAC2_DB.length){
    try{ await loadBac2Meta(); }catch(e){ /* exam meta below will 404 gracefully */ }
  }
  const meta = BAC2_DB.find(e => e.id === examId);
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / <a href="#/bac2">${t("bac2_title")}</a> / ${meta ? `<a href="#/bac2/concours/${encodeURIComponent(meta.concours)}">${escapeHtml(meta.concours)}</a>` : "…"}`);

  app.innerHTML = skeletonQuestionCard();
  let exam;
  try{ exam = await loadBac2Questions(examId); }
  catch(e){ app.innerHTML = retryBlock(t("err_load_exam"), () => renderBac2Session(examId, startIdx)); return; }

  const progress = loadBac2Progress(examId);
  const state = {
    idx: (Number.isInteger(startIdx) && startIdx >= 0 && startIdx < exam.questions.length) ? startIdx : 0,
    drafts: progress.drafts || {},    // texte tapé par l'étudiant (type "libre"), par index de question
    revealed: progress.revealed || {},// questions dont la réponse modèle a été affichée (type "libre")
    answers: progress.answers || {}   // lettre choisie par l'étudiant (type "qcm"), par index de question
  };
  const isQcm = exam.type === "qcm";

  function persist(){
    saveBac2Progress(examId, { drafts: state.drafts, revealed: state.revealed, answers: state.answers, updatedAt: Date.now() });
  }

  async function renderQuestion(){
    const q = exam.questions[state.idx];
    const total = exam.questions.length;

    if (isQcm){
      const selected = state.answers[state.idx];
      let optionsHtml = q.options.map(o => {
        let cls = "option";
        if (selected){
          if (o.letter === selected) cls += " selected";
        }
        return `<button class="${cls}" data-letter="${o.letter}" ${selected ? "disabled" : ""}>
          <span class="letter">${o.letter}</span><span>${escapeHtml(o.text)}</span>
        </button>`;
      }).join("");
      let correctionHtml = "";
      if (selected){
        try{
          const answers = await loadBac2Answers(examId);
          const info = answers[state.idx];
          const isRight = info && selected === info.correct;
          correctionHtml = `
            <div class="notice" style="border-color:${isRight? 'var(--green)':'var(--red)'};">
              <b style="color:${isRight? 'var(--green)':'var(--red)'};">${isRight ? t("correct_answer_right") : t("correct_answer_wrong")} — ${currentLang === "ar" ? `الإجابة الصحيحة: ${info.correct}` : `réponse correcte : ${info.correct}`}</b>
              ${info.explanation ? `<div style="margin-top:8px;">${escapeHtml(info.explanation)}</div>` : ""}
            </div>`;
        }catch(e){
          correctionHtml = `<div class="notice">${t("err_load_exam")}</div>`;
        }
      }
      app.innerHTML = `
        <div class="session-head">
          <div>
            <div class="title">${meta ? escapeHtml(meta.concours) : ""} ${meta ? `<span class="badge-original" style="margin-left:6px;">${t("bac2_badge")}</span>` : ""}</div>
            <div class="sub">${currentLang === "ar" ? `${state.idx+1} من ${total}` : `Question ${state.idx+1} sur ${total}`}</div>
          </div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${(state.idx+1)/total*100}%"></div></div>
        <div class="question-card">
          <span class="qnum">${q.num}</span>
          <div class="qtext"><p>${escapeHtml(q.text)}</p></div>
          <div class="options">${optionsHtml}</div>
          ${correctionHtml}
        </div>
        <div class="session-nav" style="margin-top:20px;">
          <button class="btn" id="prevBtn" ${state.idx===0 ? "disabled":""}>${backArrow()} ${t("btn_prev")}</button>
          <span class="mid">${Object.keys(state.answers).length} / ${total} ${currentLang === "ar" ? "تمت الإجابة عنها" : "répondues"}</span>
          <button class="btn primary" id="nextBtn" ${state.idx===total-1 ? "disabled":""}>${t("btn_next")}</button>
        </div>
      `;
      renderMath();
      document.querySelectorAll(".option").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (state.answers[state.idx]) return;
          state.answers[state.idx] = btn.dataset.letter;
          persist();
          await renderQuestion();
        });
      });
    } else {
      const draft = state.drafts[state.idx] || "";
      const isRevealed = !!state.revealed[state.idx];
      let answerHtml = "";
      if (isRevealed){
        try{
          const answers = await loadBac2Answers(examId);
          const modelAnswer = (answers[state.idx] && answers[state.idx].answer) || "";
          const sim = draft.trim() ? textSimilarity(draft, modelAnswer) : null;
          answerHtml = `
            <div class="notice" style="border-color:var(--green);">
              ${sim !== null ? `<div style="margin-bottom:8px;"><b>${t("bac2_similarity")} : ${sim}%</b> <span style="color:var(--ink-soft); font-size:12.5px;">(${t("bac2_similarity_hint")})</span></div>` : ""}
              <b style="color:var(--green);">${t("bac2_model_answer")}</b>
              <div style="margin-top:8px; white-space:pre-wrap;">${escapeHtml(modelAnswer)}</div>
            </div>`;
        }catch(e){
          answerHtml = `<div class="notice">${t("err_load_exam")}</div>`;
        }
      }

      app.innerHTML = `
        <div class="session-head">
          <div>
            <div class="title">${meta ? escapeHtml(meta.concours) : ""} ${meta ? `<span class="badge-original" style="margin-left:6px;">${t("bac2_badge")}</span>` : ""}</div>
            <div class="sub">${currentLang === "ar" ? `${state.idx+1} من ${total}` : `Question ${state.idx+1} sur ${total}`}</div>
          </div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${(state.idx+1)/total*100}%"></div></div>

        <div class="question-card">
          <span class="qnum">${q.num}</span>
          <div class="qtext"><p>${escapeHtml(q.text)}</p></div>
          <textarea id="bac2Answer" rows="6" placeholder="${escapeHtml(t("bac2_placeholder"))}"
            style="width:100%; font-family:var(--font-body); font-size:14.5px; padding:14px; border-radius:var(--radius); border:1px solid var(--line); background:var(--paper); color:var(--ink); resize:vertical;">${escapeHtml(draft)}</textarea>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
            <button class="btn" id="bac2CheckBtn">${t("bac2_check_similarity")}</button>
            <button class="btn gold" id="bac2RevealBtn">${t("bac2_reveal")}</button>
          </div>
          ${answerHtml}
        </div>

        <div class="session-nav" style="margin-top:20px;">
          <button class="btn" id="prevBtn" ${state.idx===0 ? "disabled":""}>${backArrow()} ${t("btn_prev")}</button>
          <span class="mid">${Object.keys(state.revealed).length} / ${total} ${t("bac2_reviewed")}</span>
          <button class="btn primary" id="nextBtn" ${state.idx===total-1 ? "disabled":""}>${t("btn_next")}</button>
        </div>
      `;
      renderMath();

      const textarea = document.getElementById("bac2Answer");
      textarea.addEventListener("input", () => {
        state.drafts[state.idx] = textarea.value;
        persist();
      });
      document.getElementById("bac2CheckBtn").addEventListener("click", async () => {
        state.revealed[state.idx] = true;
        persist();
        await renderQuestion();
      });
      document.getElementById("bac2RevealBtn").addEventListener("click", async () => {
        state.revealed[state.idx] = true;
        persist();
        await renderQuestion();
      });
    }

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    if (prevBtn) prevBtn.addEventListener("click", async () => { if (state.idx>0){ state.idx--; await renderQuestion(); window.scrollTo(0,0); }});
    if (nextBtn) nextBtn.addEventListener("click", async () => { if (state.idx<total-1){ state.idx++; await renderQuestion(); window.scrollTo(0,0); }});
  }

  await renderQuestion();
}

// ---------- Master session (adapté de Bac+2 : QCM ou réponse libre selon exam.type) ----------
async function renderMasterSession(examId, startIdx){
  if (!MASTER_DB.length){
    try{ await loadMasterMeta(); }catch(e){ /* exam meta below will 404 gracefully */ }
  }
  const meta = MASTER_DB.find(e => e.id === examId);
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / <a href="#/master">${t("master_title")}</a> / ${meta ? `<a href="#/master/concours/${encodeURIComponent(meta.concours)}">${escapeHtml(meta.concours)}</a>` : "…"}`);

  app.innerHTML = skeletonQuestionCard();
  let exam;
  try{ exam = await loadMasterQuestions(examId); }
  catch(e){ app.innerHTML = retryBlock(t("err_load_exam"), () => renderMasterSession(examId, startIdx)); return; }

  const progress = loadMasterProgress(examId);
  const state = {
    idx: (Number.isInteger(startIdx) && startIdx >= 0 && startIdx < exam.questions.length) ? startIdx : 0,
    drafts: progress.drafts || {},
    revealed: progress.revealed || {},
    answers: progress.answers || {}
  };
  const isQcm = exam.type === "qcm";

  function persist(){
    saveMasterProgress(examId, { drafts: state.drafts, revealed: state.revealed, answers: state.answers, updatedAt: Date.now() });
  }

  async function renderQuestion(){
    const q = exam.questions[state.idx];
    const total = exam.questions.length;

    if (isQcm){
      const selected = state.answers[state.idx];
      let optionsHtml = q.options.map(o => {
        let cls = "option";
        if (selected){
          if (o.letter === selected) cls += " selected";
        }
        return `<button class="${cls}" data-letter="${o.letter}" ${selected ? "disabled" : ""}>
          <span class="letter">${o.letter}</span><span>${escapeHtml(o.text)}</span>
        </button>`;
      }).join("");
      let correctionHtml = "";
      if (selected){
        try{
          const answers = await loadMasterAnswers(examId);
          const info = answers[state.idx];
          const isRight = info && selected === info.correct;
          correctionHtml = `
            <div class="notice" style="border-color:${isRight? 'var(--green)':'var(--red)'};">
              <b style="color:${isRight? 'var(--green)':'var(--red)'};">${isRight ? t("correct_answer_right") : t("correct_answer_wrong")} — ${currentLang === "ar" ? `الإجابة الصحيحة: ${info.correct}` : `réponse correcte : ${info.correct}`}</b>
              ${info.explanation ? `<div style="margin-top:8px;">${escapeHtml(info.explanation)}</div>` : ""}
            </div>`;
        }catch(e){
          correctionHtml = `<div class="notice">${t("err_load_exam")}</div>`;
        }
      }
      app.innerHTML = `
        <div class="session-head">
          <div>
            <div class="title">${meta ? escapeHtml(meta.concours) : ""} ${meta ? `<span class="badge-original" style="margin-left:6px;">${t("master_badge")}</span>` : ""}</div>
            <div class="sub">${currentLang === "ar" ? `${state.idx+1} من ${total}` : `Question ${state.idx+1} sur ${total}`}</div>
          </div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${(state.idx+1)/total*100}%"></div></div>
        <div class="question-card">
          <span class="qnum">${q.num}</span>
          <div class="qtext"><p>${escapeHtml(q.text)}</p></div>
          <div class="options">${optionsHtml}</div>
          ${correctionHtml}
        </div>
        <div class="session-nav" style="margin-top:20px;">
          <button class="btn" id="prevBtn" ${state.idx===0 ? "disabled":""}>${backArrow()} ${t("btn_prev")}</button>
          <span class="mid">${Object.keys(state.answers).length} / ${total} ${currentLang === "ar" ? "تمت الإجابة عنها" : "répondues"}</span>
          <button class="btn primary" id="nextBtn" ${state.idx===total-1 ? "disabled":""}>${t("btn_next")}</button>
        </div>
      `;
      renderMath();
      document.querySelectorAll(".option").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (state.answers[state.idx]) return;
          state.answers[state.idx] = btn.dataset.letter;
          persist();
          await renderQuestion();
        });
      });
    } else {
      const draft = state.drafts[state.idx] || "";
      const isRevealed = !!state.revealed[state.idx];
      let answerHtml = "";
      if (isRevealed){
        try{
          const answers = await loadMasterAnswers(examId);
          const modelAnswer = (answers[state.idx] && answers[state.idx].answer) || "";
          const sim = draft.trim() ? textSimilarity(draft, modelAnswer) : null;
          answerHtml = `
            <div class="notice" style="border-color:var(--green);">
              ${sim !== null ? `<div style="margin-bottom:8px;"><b>${t("bac2_similarity")} : ${sim}%</b> <span style="color:var(--ink-soft); font-size:12.5px;">(${t("bac2_similarity_hint")})</span></div>` : ""}
              <b style="color:var(--green);">${t("bac2_model_answer")}</b>
              <div style="margin-top:8px; white-space:pre-wrap;">${escapeHtml(modelAnswer)}</div>
            </div>`;
        }catch(e){
          answerHtml = `<div class="notice">${t("err_load_exam")}</div>`;
        }
      }

      app.innerHTML = `
        <div class="session-head">
          <div>
            <div class="title">${meta ? escapeHtml(meta.concours) : ""} ${meta ? `<span class="badge-original" style="margin-left:6px;">${t("master_badge")}</span>` : ""}</div>
            <div class="sub">${currentLang === "ar" ? `${state.idx+1} من ${total}` : `Question ${state.idx+1} sur ${total}`}</div>
          </div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${(state.idx+1)/total*100}%"></div></div>

        <div class="question-card">
          <span class="qnum">${q.num}</span>
          <div class="qtext"><p>${escapeHtml(q.text)}</p></div>
          <textarea id="masterAnswer" rows="6" placeholder="${escapeHtml(t("bac2_placeholder"))}"
            style="width:100%; font-family:var(--font-body); font-size:14.5px; padding:14px; border-radius:var(--radius); border:1px solid var(--line); background:var(--paper); color:var(--ink); resize:vertical;">${escapeHtml(draft)}</textarea>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
            <button class="btn" id="masterCheckBtn">${t("bac2_check_similarity")}</button>
            <button class="btn gold" id="masterRevealBtn">${t("bac2_reveal")}</button>
          </div>
          ${answerHtml}
        </div>

        <div class="session-nav" style="margin-top:20px;">
          <button class="btn" id="prevBtn" ${state.idx===0 ? "disabled":""}>${backArrow()} ${t("btn_prev")}</button>
          <span class="mid">${Object.keys(state.revealed).length} / ${total} ${t("bac2_reviewed")}</span>
          <button class="btn primary" id="nextBtn" ${state.idx===total-1 ? "disabled":""}>${t("btn_next")}</button>
        </div>
      `;
      renderMath();

      const textarea = document.getElementById("masterAnswer");
      textarea.addEventListener("input", () => {
        state.drafts[state.idx] = textarea.value;
        persist();
      });
      document.getElementById("masterCheckBtn").addEventListener("click", async () => {
        state.revealed[state.idx] = true;
        persist();
        await renderQuestion();
      });
      document.getElementById("masterRevealBtn").addEventListener("click", async () => {
        state.revealed[state.idx] = true;
        persist();
        await renderQuestion();
      });
    }

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    if (prevBtn) prevBtn.addEventListener("click", async () => { if (state.idx>0){ state.idx--; await renderQuestion(); window.scrollTo(0,0); }});
    if (nextBtn) nextBtn.addEventListener("click", async () => { if (state.idx<total-1){ state.idx++; await renderQuestion(); window.scrollTo(0,0); }});
  }

  await renderQuestion();
}

// ---------- Bac+3 (concours d'enseignement) — Primaire/Secondaire, puis filière ----------
async function ensureBac3Loaded(retryFn){
  if (BAC3_DB.length) return true;
  app.innerHTML = skeletonRows(2);
  try{ await loadBac3Meta(); return true; }
  catch(e){ app.innerHTML = retryBlock(t("err_load_exams"), retryFn); return false; }
}

async function renderBac3Home(){
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / ${t("bac3_title")}`);
  if (!(await ensureBac3Loaded(renderBac3Home))) return;
  const cycles = ["Primaire", "Secondaire"];
  const cards = cycles.map(cy => {
    const n = BAC3_DB.filter(e => e.cycle === cy).reduce((s,e)=>s+e.n,0);
    const nFilieres = bac3FilieresOf(cy).length;
    return `
      <a class="card concours-card" href="#/bac3/${encodeURIComponent(cy.toLowerCase())}">
        <span class="eyebrow">${cy === "Primaire" ? t("bac3_cycle_primaire_hint") : t("bac3_cycle_secondaire_hint")}</span>
        <h3>${cy === "Primaire" ? t("bac3_cycle_primaire") : t("bac3_cycle_secondaire")}</h3>
        <div class="meta">${nFilieres ? nMatieres(nFilieres) : t("bac3_empty")}</div>
        <div class="count">${n}<span style="font-size:13px;color:var(--ink-soft);font-weight:500;"> QCM</span></div>
      </a>`;
  }).join("");
  app.innerHTML = `
    <div class="inedit-hero">
      <span class="badge-original">${t("bac3_badge")}</span>
      <div class="section-head" style="margin:12px 0 0;"><h2 style="margin:0;">${t("bac3_title")}</h2></div>
      <p>${t("bac3_desc")}</p>
    </div>
    <div class="grid">${cards}</div>
  `;
}

async function renderBac3Cycle(cycleSlug){
  if (!(await ensureBac3Loaded(() => renderBac3Cycle(cycleSlug)))) return;
  const cycle = cycleSlug.toLowerCase() === "primaire" ? "Primaire" : "Secondaire";
  const cycleLabel = cycle === "Primaire" ? t("bac3_cycle_primaire") : t("bac3_cycle_secondaire");
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / <a href="#/bac3">${t("bac3_title")}</a> / ${cycleLabel}`);
  const filieres = bac3FilieresOf(cycle);
  if (!filieres.length){
    app.innerHTML = `<a class="backlink" href="#/bac3">${backArrow()} ${t("bac3_title")}</a><div class="empty">${t("bac3_empty")}</div>`;
    return;
  }
  const cards = filieres.map(fi => {
    const exams = bac3ByFiliere(cycle, fi);
    const n = exams.reduce((s,e)=>s+e.n,0);
    const years = [...new Set(exams.map(e=>e.annee))].sort();
    return `
      <a class="card" href="#/bac3/${encodeURIComponent(cycleSlug.toLowerCase())}/${encodeURIComponent(fi)}">
        <span class="eyebrow">${years[0]}${years.length>1?`–${years[years.length-1]}`:""}</span>
        <h3>${escapeHtml(fi)}</h3>
        <div class="meta">${nExamens(exams.length)} · ${nQuestions(n)}</div>
      </a>`;
  }).join("");
  app.innerHTML = `
    <a class="backlink" href="#/bac3">${backArrow()} ${t("bac3_title")}</a>
    <div class="section-head"><h2>${cycleLabel}</h2></div>
    <div class="grid">${cards}</div>
  `;
}

async function renderBac3Filiere(cycleSlug, filiere){
  if (!(await ensureBac3Loaded(() => renderBac3Filiere(cycleSlug, filiere)))) return;
  const cycle = cycleSlug.toLowerCase() === "primaire" ? "Primaire" : "Secondaire";
  const cycleLabel = cycle === "Primaire" ? t("bac3_cycle_primaire") : t("bac3_cycle_secondaire");
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / <a href="#/bac3">${t("bac3_title")}</a> / <a href="#/bac3/${encodeURIComponent(cycleSlug)}">${cycleLabel}</a> / ${escapeHtml(filiere)}`);
  const exams = bac3ByFiliere(cycle, filiere);
  const rows = exams.map(e => `
    <div class="exam-row">
      <div class="left">
        <span class="year">${escapeHtml(formatAnnee(e.annee))}</span>
        <div>
          <div style="font-weight:600;">${escapeHtml(filiere)}</div>
          <div class="n">${nQuestions(e.n)}</div>
        </div>
      </div>
      <div class="actions">
        <a class="btn" href="#/bac3/exam/${e.id}">${t("btn_open")}</a>
      </div>
    </div>`).join("");
  app.innerHTML = `
    <a class="backlink" href="#/bac3/${encodeURIComponent(cycleSlug)}">${backArrow()} ${cycleLabel}</a>
    <div class="section-head"><h2>${escapeHtml(filiere)}</h2><span class="hint">${nExamens(exams.length)}</span></div>
    ${rows || `<div class="empty">${t("empty_no_exam")}</div>`}
  `;
}

async function renderBac3Session(examId, startIdx){
  if (!BAC3_DB.length){
    try{ await loadBac3Meta(); }catch(e){ /* meta below will 404 gracefully */ }
  }
  const meta = BAC3_DB.find(e => e.id === examId);
  const cycleSlug = meta ? meta.cycle.toLowerCase() : "";
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / <a href="#/bac3">${t("bac3_title")}</a> / ${meta ? `<a href="#/bac3/${encodeURIComponent(cycleSlug)}/${encodeURIComponent(meta.filiere)}">${escapeHtml(meta.filiere)}</a>` : "…"}`);

  app.innerHTML = skeletonQuestionCard();
  let exam;
  try{ exam = await loadBac3Questions(examId); }
  catch(e){ app.innerHTML = retryBlock(t("err_load_exam"), () => renderBac3Session(examId, startIdx)); return; }

  const progress = loadBac3Progress(examId);
  const state = {
    idx: (Number.isInteger(startIdx) && startIdx >= 0 && startIdx < exam.questions.length) ? startIdx : 0,
    answers: progress.answers || {}
  };
  function persist(){
    saveBac3Progress(examId, { answers: state.answers, updatedAt: Date.now() });
  }

  async function renderQuestion(){
    const q = exam.questions[state.idx];
    const total = exam.questions.length;
    const selected = state.answers[state.idx];
    const optionsHtml = q.options.map(o => {
      let cls = "option";
      if (selected && o.letter === selected) cls += " selected";
      return `<button class="${cls}" data-letter="${o.letter}" ${selected ? "disabled" : ""}>
        <span class="letter">${o.letter}</span><span>${escapeHtml(o.text)}</span>
      </button>`;
    }).join("");
    let correctionHtml = "";
    if (selected){
      try{
        const answers = await loadBac3Answers(examId);
        const info = answers[state.idx];
        const isRight = info && selected === info.correct;
        correctionHtml = `
          <div class="notice" style="border-color:${isRight? 'var(--green)':'var(--red)'};">
            <b style="color:${isRight? 'var(--green)':'var(--red)'};">${isRight ? t("correct_answer_right") : t("correct_answer_wrong")} — ${currentLang === "ar" ? `الإجابة الصحيحة: ${info.correct}` : `réponse correcte : ${info.correct}`}</b>
            ${info.explanation ? `<div style="margin-top:8px;">${escapeHtml(info.explanation)}</div>` : ""}
          </div>`;
      }catch(e){
        correctionHtml = `<div class="notice">${t("err_load_exam")}</div>`;
      }
    }
    app.innerHTML = `
      <div class="session-head">
        <div>
          <div class="title">${meta ? escapeHtml(meta.filiere) : ""} ${meta ? `<span class="badge-original" style="margin-left:6px;">${t("bac3_badge")}</span>` : ""}</div>
          <div class="sub">${currentLang === "ar" ? `${state.idx+1} من ${total}` : `Question ${state.idx+1} sur ${total}`}</div>
        </div>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${(state.idx+1)/total*100}%"></div></div>
      <div class="question-card">
        <span class="qnum">${q.num}</span>
        <div class="qtext"><p>${escapeHtml(q.text)}</p></div>
        <div class="options">${optionsHtml}</div>
        ${correctionHtml}
      </div>
      <div class="session-nav" style="margin-top:20px;">
        <button class="btn" id="prevBtn" ${state.idx===0 ? "disabled":""}>${backArrow()} ${t("btn_prev")}</button>
        <span class="mid">${Object.keys(state.answers).length} / ${total} ${currentLang === "ar" ? "تمت الإجابة عنها" : "répondues"}</span>
        <button class="btn primary" id="nextBtn" ${state.idx===total-1 ? "disabled":""}>${t("btn_next")}</button>
      </div>
    `;
    renderMath();
    document.querySelectorAll(".option").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (state.answers[state.idx]) return;
        state.answers[state.idx] = btn.dataset.letter;
        persist();
        await renderQuestion();
      });
    });
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    if (prevBtn) prevBtn.addEventListener("click", async () => { if (state.idx>0){ state.idx--; await renderQuestion(); window.scrollTo(0,0); }});
    if (nextBtn) nextBtn.addEventListener("click", async () => { if (state.idx<total-1){ state.idx++; await renderQuestion(); window.scrollTo(0,0); }});
  }

  await renderQuestion();
}

async function renderSession(examId, mode, startIdx){
  const exam = examById(examId);
  if (!exam) return renderHome();
  setCrumbs(`<a href="#/">${t("nav_home")}</a> / <a href="#/exam/${exam.id}">${escapeHtml(exam.concours)} ${escapeHtml(exam.matiere)} ${exam.annee}</a> / ${mode === "examen" ? t("crumb_examen") : t("crumb_cours")}`);

  app.innerHTML = skeletonQuestionCard();
  let questions;
  try{
    questions = await loadExamQuestions(examId);
  }catch(e){
    app.innerHTML = retryBlock(t("err_load_exam"), () => renderSession(examId, mode));
    return;
  }

  const progress = loadProgress(examId);
  const state = {
    idx: (Number.isInteger(startIdx) && startIdx >= 0 && startIdx < questions.length) ? startIdx : 0,
    answers: progress.answers || {},
    flagged: progress.flagged || {},
    mode,
    secondsLeft: mode === "examen" ? Math.round(exam.n * 90) : null,
    finished: false,
    reviewMode: !!progress.finishedAt,
    corrections: null,
    commentsOpen: {},
    commentsCache: {},
    replyTo: null
  };

  function persist(finishedNow){
    saveProgress(examId, {
      answers: state.answers,
      flagged: state.flagged,
      mode,
      updatedAt: Date.now(),
      finishedAt: finishedNow ? Date.now() : (progress.finishedAt || null)
    });
  }

  // Les corrections (bonne réponse + explication) ne sont récupérées qu'au moment
  // où elles doivent réellement être révélées, jamais chargées d'avance en bloc.
  async function ensureCorrections(){
    if (!state.corrections){
      try{ state.corrections = await loadCorrections(examId); }
      catch(e){ state.corrections = questions.map(() => ({correct:null, explanation:null})); }
    }
    return state.corrections;
  }

  function renderCommentsBlock(idx){
    const open = !!state.commentsOpen[idx];
    const cache = state.commentsCache[idx]; // undefined = pas encore chargé, "error" = échec, tableau = chargé
    let count = "";
    let body = "";

    if (open){
      if (cache === undefined){
        body = `<div class="comments-loading">…</div>`;
      } else if (cache === "error"){
        body = `<div class="comments-empty">${t("comments_error")}</div>`;
      } else {
        const visible = cache.filter(c => c.flagged_count < FLAG_HIDE_THRESHOLD);
        const hiddenCount = cache.length - visible.length;
        const byNewest = (a, b) => new Date(b.created_at) - new Date(a.created_at);
        const topLevel = visible.filter(c => !c.parent_id).sort(byNewest);
        const repliesByParent = {};
        visible.filter(c => c.parent_id).forEach(c => {
          (repliesByParent[c.parent_id] = repliesByParent[c.parent_id] || []).push(c);
        });
        Object.keys(repliesByParent).forEach(pid => repliesByParent[pid].sort(byNewest));
        count = ` (${topLevel.length})`;

        const dateFmt = (iso) => new Date(iso).toLocaleDateString(currentLang === "ar" ? "ar" : "fr-FR", {day:"numeric", month:"short"});
        const renderOne = (c, isReply) => {
          const mine = currentUser && c.user_id === currentUser.id;
          const uname = (c.display_name || "Étudiant").trim();
          const initials = getInitials(uname);
          return `
          <div class="comment-item${isReply ? " comment-reply" : ""}${mine ? " comment-mine" : ""}">
            <div class="comment-meta">
              <span class="comment-avatar" title="${escapeHtml(uname)}" aria-label="${escapeHtml(uname)}">${escapeHtml(initials)}</span>
              <b class="comment-user">${escapeHtml(uname)}</b>
              ${mine ? `<span class="comment-you">${t("comments_you")}</span>` : ""}
              <span class="comment-date">${dateFmt(c.created_at)}</span>
            </div>
            <div class="comment-body">${escapeHtml(c.body)}</div>
            <div class="comment-actions">
              ${!isReply && currentUser ? `<button class="comment-action-btn" data-reply-to="${c.id}">${t("comments_reply")}</button>` : ""}
              ${currentUser && !mine ? `<button class="comment-action-btn" data-report="${c.id}">${t("comments_report")}</button>` : ""}
              ${mine ? `<button class="comment-action-btn comment-delete-btn" data-delete="${c.id}">${t("comments_delete")}</button>` : ""}
            </div>
            ${state.replyTo === c.id ? `
              <form class="comment-reply-form" data-parent="${c.id}">
                <textarea required maxlength="2000" placeholder="${escapeHtml(t("comments_reply_placeholder"))}"></textarea>
                <div style="display:flex; gap:8px; margin-top:6px;">
                  <button type="submit" class="btn primary" style="padding:6px 14px;">${t("comments_send")}</button>
                  <button type="button" class="btn" data-cancel-reply style="padding:6px 14px;">${t("comments_cancel")}</button>
                </div>
              </form>` : ""}
            ${(repliesByParent[c.id]||[]).map(r => renderOne(r, true)).join("")}
          </div>`;
        };

        body = `
          ${topLevel.length ? topLevel.map(c => renderOne(c, false)).join("") : `<div class="comments-empty">${t("comments_empty")}</div>`}
          ${hiddenCount ? `<div class="comments-hidden-note">${hiddenCount} ${t("comments_hidden_reported")}</div>` : ""}
          ${currentUser ? `
            <form class="comment-new-form">
              <textarea required maxlength="2000" placeholder="${escapeHtml(t("comments_placeholder"))}"></textarea>
              <button type="submit" class="btn primary" style="margin-top:8px;">${t("comments_send")}</button>
            </form>` : `
            <div class="comments-login-prompt">
              <span>${t("comments_login_prompt")}</span><br>
              <button type="button" class="btn primary" id="commentsLoginBtn" style="margin-top:8px;">${t("comments_login_btn")}</button>
            </div>`}
        `;
      }
    }

    return `
      <div class="comments-block">
        <button class="comments-toggle" id="commentsToggle" type="button" aria-expanded="${open}">${t("comments_show")}${count}</button>
        <div class="comments-body" ${open ? "" : "hidden"}>${body}</div>
      </div>`;
  }

  async function renderQuestion(){
    if (state.finished) return renderSummary();
    const q = questions[state.idx];
    const selected = state.answers[state.idx];
    const total = questions.length;

    // Reveal correction: always in review mode, or immediately in cours mode once answered.
    const reveal = !!(state.reviewMode || (mode === "cours" && selected));
    const hasCorrection = !!q.hasCorrection;
    let correctInfo = null;
    if (reveal){
      const corrections = await ensureCorrections();
      correctInfo = corrections[state.idx] || null;
    }

    const optionsHtml = q.options.map(o => {
      let cls = selected === o.letter ? "selected" : "";
      if (reveal && hasCorrection && correctInfo && correctInfo.correct){
        if (o.letter === correctInfo.correct) cls += " correct";
        else if (o.letter === selected) cls += " incorrect";
      }
      return `
      <button class="option ${cls}" data-letter="${o.letter}">
        <span class="letter">${o.letter}</span>
        <span>${escapeHtml(o.text)}</span>
      </button>`;
    }).join("");

    let correctionHtml = "";
    if (reveal){
      if (hasCorrection && correctInfo && correctInfo.correct){
        const isRight = selected === correctInfo.correct;
        correctionHtml = `
          <div class="notice" style="border-color:${isRight? 'var(--green)':'var(--red)'};">
            <b style="color:${isRight? 'var(--green)':'var(--red)'};">${selected ? (isRight ? t("correct_answer_right") : t("correct_answer_wrong")) : t("correction_label")} — ${currentLang === "ar" ? `الإجابة الصحيحة: ${correctInfo.correct}` : `réponse correcte : ${correctInfo.correct}`}</b>
            ${correctInfo.explanation ? `<div style="margin-top:8px;">${escapeHtml(correctInfo.explanation)}</div>` : ""}
          </div>`;
      } else {
        correctionHtml = `<div class="notice">${t("no_correction")}</div>`;
      }
    }

    app.innerHTML = `
      <div class="session-head">
        <div>
          <div class="title">${escapeHtml(exam.concours)} · ${escapeHtml(exam.matiere)} ${exam.source === "suprepa" ? `<span class="badge-original" style="margin-left:6px;">${t("inedit_badge")}</span>` : exam.annee}</div>
          <div class="sub">${mode === "examen" ? (state.reviewMode ? t("mode_examen_review") : t("mode_examen_timed")) : t("mode_cours_label")} — ${state.idx+1} / ${total}</div>
        </div>
        ${mode === "examen" && !state.reviewMode ? `<div class="timer" id="timer">${fmtTime(state.secondsLeft)}</div>` : ""}
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${(state.idx+1)/total*100}%"></div></div>

      <div class="question-card">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
          <span class="qnum" style="margin-bottom:0;">${q.num} · ${currentLang === "ar" ? `${state.idx+1} من ${total}` : `Question ${state.idx+1} sur ${total}`}${hasCorrection ? ` · ${t("corrected_tag")}` : ""}</span>
          <button class="flag-btn ${state.flagged[state.idx] ? "on":""}" id="flagBtn" title="${t("flag_title")}">${state.flagged[state.idx] ? t("flag_marked") : t("flag_mark")}</button>
        </div>
        <div class="qtext"><p>${escapeHtml(q.text)}</p></div>
        <div class="options">${optionsHtml}</div>
        ${correctionHtml}
        <div class="kbd-hint">${t("kbd_hint")}</div>
        <div class="swipe-hint">${t("swipe_hint")}</div>
      </div>

      ${renderCommentsBlock(state.idx)}

      <div class="session-nav" style="margin-top:20px;">
        <button class="btn" id="prevBtn" ${state.idx===0 ? "disabled":""}>${backArrow()} ${t("btn_prev")}</button>
        <span class="mid">${Object.keys(state.answers).length} / ${total} ${currentLang === "ar" ? "تمت الإجابة عنها" : "répondues"}</span>
        <button class="btn primary" id="nextBtn">${state.idx === total-1 ? (state.reviewMode ? t("btn_finish_review") : t("btn_finish")) : t("btn_next")}</button>
      </div>
    `;
    renderMath();

    async function selectOption(letter, btnEl){
      if (state.reviewMode && mode === "examen") return; // read-only review of a timed exam
      state.answers[state.idx] = letter;
      persist();
      // Spaced repetition: schedule based on correctness when correction is known
      try{
        const corrections = await ensureCorrections();
        const c = corrections[state.idx];
        if (c && c.correct){
          scheduleReview(examId, state.idx, letter === c.correct ? 1 : 0);
        }
      }catch(e){}
      // Retour visuel immédiat : si une correction va être révélée (mode cours),
      // l'appel réseau peut prendre un instant — on ne laisse jamais l'écran figé sans rien.
      const willFetchCorrection = mode === "cours";
      if (willFetchCorrection && btnEl){
        app.querySelectorAll(".option").forEach(b => b.classList.add("pending"));
        btnEl.classList.add("selected");
      }
      await renderQuestion();
    }

    app.querySelectorAll(".option").forEach(btn => {
      btn.addEventListener("click", () => selectOption(btn.dataset.letter, btn));
    });
    $("#flagBtn").addEventListener("click", async () => {
      if (state.flagged[state.idx]) delete state.flagged[state.idx];
      else state.flagged[state.idx] = true;
      persist();
      await renderQuestion();
    });
    $("#prevBtn").addEventListener("click", async () => { if(state.idx>0){ state.idx--; await renderQuestion(); window.scrollTo(0,0); }});
    $("#nextBtn").addEventListener("click", async () => {
      if (state.idx < total-1){ state.idx++; await renderQuestion(); window.scrollTo(0,0); }
      else { state.finished = true; state.reviewMode = true; persist(true); await renderQuestion(); window.scrollTo(0,0); }
    });

    const commentsToggle = $("#commentsToggle");
    if (commentsToggle){
      commentsToggle.addEventListener("click", async () => {
        const idxAtClick = state.idx;
        const wasOpen = !!state.commentsOpen[idxAtClick];
        state.commentsOpen[idxAtClick] = !wasOpen;
        if (!wasOpen && state.commentsCache[idxAtClick] === undefined){
          await renderQuestion(); // affiche l'état "ouvert + chargement" tout de suite
          try{ state.commentsCache[idxAtClick] = await loadComments(examId, idxAtClick); }
          catch(e){ state.commentsCache[idxAtClick] = "error"; }
        }
        await renderQuestion();
      });
    }
    const commentsBody = $(".comments-body");
    if (commentsBody){
      const newForm = commentsBody.querySelector(".comment-new-form");
      if (newForm){
        newForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const idxAtClick = state.idx;
          const ta = newForm.querySelector("textarea");
          const body = ta.value.trim();
          if (!body) return;
          try{
            const inserted = await postComment(examId, idxAtClick, body, null);
            if (Array.isArray(state.commentsCache[idxAtClick])) state.commentsCache[idxAtClick].unshift(inserted);
          }catch(err){ console.warn("post comment failed", err); }
          await renderQuestion();
        });
      }
      commentsBody.querySelectorAll(".comment-reply-form").forEach(form => {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const idxAtClick = state.idx;
          const ta = form.querySelector("textarea");
          const body = ta.value.trim();
          if (!body) return;
          try{
            const inserted = await postComment(examId, idxAtClick, body, form.dataset.parent);
            if (Array.isArray(state.commentsCache[idxAtClick])) state.commentsCache[idxAtClick].unshift(inserted);
          }catch(err){ console.warn("post reply failed", err); }
          state.replyTo = null;
          await renderQuestion();
        });
      });
      commentsBody.querySelectorAll("[data-reply-to]").forEach(btn => {
        btn.addEventListener("click", async () => {
          state.replyTo = state.replyTo === btn.dataset.replyTo ? null : btn.dataset.replyTo;
          await renderQuestion();
        });
      });
      commentsBody.querySelectorAll("[data-cancel-reply]").forEach(btn => {
        btn.addEventListener("click", async () => { state.replyTo = null; await renderQuestion(); });
      });
      commentsBody.querySelectorAll("[data-report]").forEach(btn => {
        btn.addEventListener("click", async () => {
          btn.disabled = true; btn.textContent = t("comments_reported");
          try{ await reportComment(btn.dataset.report); }catch(err){ console.warn("report failed", err); }
        });
      });
      commentsBody.querySelectorAll("[data-delete]").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (!currentUser){ openAuthModal(); return; }
          if (!confirm(t("comments_delete_confirm"))) return;
          const idxAtClick = state.idx;
          const id = btn.dataset.delete;
          btn.disabled = true;
          try{
            await deleteComment(id);
            if (Array.isArray(state.commentsCache[idxAtClick])){
              state.commentsCache[idxAtClick] = state.commentsCache[idxAtClick].filter(c => c.id !== id && c.parent_id !== id);
            }
          }catch(err){ console.warn("delete comment failed", err); }
          await renderQuestion();
        });
      });
      const loginBtn = commentsBody.querySelector("#commentsLoginBtn");
      if (loginBtn) loginBtn.addEventListener("click", openAuthModal);
    }

    // Swipe gauche/droite pour naviguer entre les questions (mobile)
    enableSwipeNav($(".question-card"), {
      onNext: async () => { if (state.idx < total-1){ state.idx++; await renderQuestion(); window.scrollTo(0,0); } },
      onPrev: async () => { if (state.idx > 0){ state.idx--; await renderQuestion(); window.scrollTo(0,0); } }
    });
  }

  async function renderSummary(){
    if (examTimerHandle){ clearInterval(examTimerHandle); examTimerHandle = null; }
    const total = questions.length;
    const answered = Object.keys(state.answers).length;
    const skipped = total - answered;

    // Immediate feedback: the corrections fetch below is a real network round-trip,
    // and this is the single most anticipation-charged moment in the whole app (did I
    // pass?). Never leave that silent, even on a slow connection.
    app.innerHTML = `
      <div class="session-head">
        <div>
          <div class="title">${t("calculating_score")}</div>
          <div class="sub">${escapeHtml(exam.concours)} · ${escapeHtml(exam.matiere)}</div>
        </div>
      </div>
      <div class="summary-grid">
        <div class="summary-stat"><b>${total}</b><span>${t("stat_questions")}</span></div>
        <div class="summary-stat"><b>${answered}</b><span>${t("stat_answered")}</span></div>
        <div class="summary-stat skel-stat"><b>···</b><span>${t("score_label")}</span></div>
      </div>`;

    const corrections = await ensureCorrections();

    const correctableIdx = [];
    let nCorrect = 0, nWrong = 0;
    questions.forEach((q, i) => {
      const c = corrections[i];
      if (!c || !c.correct) return;
      correctableIdx.push(i);
      const given = state.answers[i];
      if (given && given === c.correct) nCorrect++;
      else if (given) nWrong++;
    });

    const scorePct = correctableIdx.length ? nCorrect / correctableIdx.length : null;
    const scoreBlock = correctableIdx.length
      ? `<div class="summary-stat${scorePct >= 0.6 ? ' summary-stat--good' : ''}"><b>${nCorrect} / ${correctableIdx.length}</b><span>${t("score_label")}</span></div>`
      : `<div class="summary-stat"><b>—</b><span>${t("no_correction_available")}</span></div>`;
    const encouragementHtml = scorePct !== null && scorePct >= 0.6
      ? `<div class="notice notice--good">${t("good_score_msg")}</div>`
      : "";

    const flaggedIdx = Object.keys(state.flagged || {}).map(Number).sort((a,b)=>a-b);
    const flaggedHtml = flaggedIdx.length ? `
      <div class="section-head" style="margin-top:32px;"><h2 style="font-size:18px;">${t("flagged_questions")}</h2><span class="hint">${flaggedIdx.length}</span></div>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(90px,1fr));">
        ${flaggedIdx.map(i => `<a class="btn ghost" style="text-align:center;" href="#/exam/${exam.id}/${mode}/${i}">${questions[i].num}</a>`).join("")}
      </div>` : "";

    const correctableNotice = correctableIdx.length
      ? (currentLang === "ar" ? `كان لدى ${correctableIdx.length} ${arPlural(correctableIdx.length, AR_NOUNS.question)} من أصل ${total} تصحيح متوفر.` : `${correctableIdx.length} question${correctableIdx.length>1?"s":""} sur ${total} avaient une correction disponible.`)
      : t("notice_no_correctable");

    app.innerHTML = `
      <div class="session-head">
        <div>
          <div class="title">${t("session_finished")}</div>
          <div class="sub">${escapeHtml(exam.concours)} · ${escapeHtml(exam.matiere)} ${exam.source === "suprepa" ? `<span class="badge-original" style="margin-left:6px;">${t("inedit_badge")}</span>` : exam.annee}</div>
        </div>
      </div>
      <div class="summary-grid">
        <div class="summary-stat"><b>${total}</b><span>${t("stat_questions")}</span></div>
        <div class="summary-stat"><b>${answered}</b><span>${t("stat_answered")}</span></div>
        ${scoreBlock}
      </div>
      ${encouragementHtml}
      <div class="notice">${correctableNotice} ${t("review_answers_hint")}</div>
      ${flaggedHtml}
      <div class="session-nav" style="margin-top:24px;">
        <a class="btn" href="#/exam/${exam.id}/${mode}">${backArrow()} ${t("btn_review_answers")}</a>
        <a class="btn primary" href="${exam.source === "suprepa" ? `#/inedit/${encodeURIComponent(exam.concours)}/${encodeURIComponent(exam.matiere)}` : `#/concours/${encodeURIComponent(exam.concours)}/${encodeURIComponent(exam.matiere)}`}">${t("btn_other_exams")}</a>
      </div>
    `;
    animateCounters();
  }

  if (mode === "examen" && state.secondsLeft !== null){
    examTimerHandle = setInterval(() => {
      state.secondsLeft--;
      const t = $("#timer");
      if (t){
        t.textContent = fmtTime(state.secondsLeft);
        if (state.secondsLeft <= 60) t.classList.add("low");
      }
      if (state.secondsLeft <= 0){
        clearInterval(examTimerHandle);
        state.finished = true;
        state.reviewMode = true;
        persist(true);
        renderSummary();
        window.scrollTo(0,0);
      }
    }, 1000);
  }

  sessionKeyHandler = async (e) => {
    if (state.finished) return;
    const total = questions.length;
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    const letter = {a:"A",b:"B",c:"C",d:"D","1":"A","2":"B","3":"C","4":"D"}[e.key.toLowerCase()];
    if (letter){
      const q = questions[state.idx];
      if (q.options.some(o => o.letter === letter)){
        if (!(state.reviewMode && mode === "examen")){
          state.answers[state.idx] = letter;
          persist();
          await renderQuestion();
        }
      }
    } else if (e.key === "ArrowRight"){
      if (state.idx < total-1){ state.idx++; await renderQuestion(); window.scrollTo(0,0); }
    } else if (e.key === "ArrowLeft"){
      if (state.idx > 0){ state.idx--; await renderQuestion(); window.scrollTo(0,0); }
    } else if (e.key.toLowerCase() === "f"){
      if (state.flagged[state.idx]) delete state.flagged[state.idx];
      else state.flagged[state.idx] = true;
      persist();
      await renderQuestion();
    }
  };
  document.addEventListener("keydown", sessionKeyHandler);

  renderQuestion();
}

boot();

// ---------- Global search ----------
(function initSearch(){
  const input = document.getElementById("globalSearch");
  const results = document.getElementById("searchResults");
  if (!input || !results) return;

  function norm(s){
    return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  }

  function search(q){
    q = norm(q).trim();
    if (!q) return [];
    return EXAMS_DB.filter(e =>
      norm(e.concours).includes(q) ||
      norm(e.matiere).includes(q) ||
      norm(e.annee).includes(q) ||
      norm(e.concours+" "+e.matiere+" "+e.annee).includes(q)
    ).slice(0, 8);
  }

  function render(list, q){
    if (!list.length){
      results.innerHTML = `<div class="search-empty">${t("search_no_results")} « ${escapeHtml(q)} »</div>`;
      results.classList.add("open");
      return;
    }
    results.innerHTML = list.map(e => `
      <a href="#/exam/${e.id}">
        <div>${escapeHtml(e.concours)} · ${escapeHtml(e.matiere)} ${formatAnnee(e.annee)}</div>
        <div class="sr-meta">${nQuestions(e.n)}${e.nCorrected ? ` · ${e.nCorrected} ${currentLang === "ar" ? "مصححة" : "corrigées"}` : ""}</div>
      </a>`).join("");
    results.classList.add("open");
  }

  input.addEventListener("input", () => {
    const list = search(input.value);
    if (input.value.trim()) render(list, input.value.trim());
    else results.classList.remove("open");
  });
  input.addEventListener("focus", () => { if (input.value.trim()) results.classList.add("open"); });
  document.addEventListener("click", (e) => {
    if (!results.contains(e.target) && e.target !== input) results.classList.remove("open");
  });
  results.addEventListener("click", () => { results.classList.remove("open"); input.value=""; });
  input.addEventListener("keydown", (e) => { if (e.key === "Escape"){ input.blur(); results.classList.remove("open"); } });
})();

// ---------- Level dropdown (Bac / Bac+2 / Bac+3) ----------
(function initLevelDropdown(){
  const btn = document.getElementById("levelDropdownBtn");
  const menu = document.getElementById("levelDropdownMenu");
  if (!btn || !menu) return;

  function closeMenu(){
    if (menu.hidden) return;
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  }
  function openMenu(){
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  }
  function toggleMenu(e){
    e.preventDefault();
    e.stopPropagation();
    menu.hidden ? openMenu() : closeMenu();
  }

  // pointerdown is more reliable than click on mobile (no 300ms / double-fire quirks)
  btn.addEventListener("pointerdown", toggleMenu);
  // Keep keyboard activation
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " "){ e.preventDefault(); toggleMenu(e); }
    if (e.key === "ArrowDown"){ e.preventDefault(); openMenu(); menu.querySelector("a")?.focus(); }
  });

  // Close on outside press — use contains() so clicks on the chevron/label still count as the button
  document.addEventListener("pointerdown", (e) => {
    if (menu.hidden) return;
    if (menu.contains(e.target) || btn.contains(e.target)) return;
    closeMenu();
  }, true);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  menu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => closeMenu());
  });
})();


// ---------- Mobile tab bar + niveau bottom sheet ----------
(function initMobileChrome(){
  const tabbar = document.getElementById("mobileTabbar");
  const sheet = document.getElementById("mobileLevelSheet");
  const levelBtn = document.getElementById("mobileLevelBtn");
  if (!tabbar) return;

  function currentTab(){
    const h = (location.hash || "#/").replace(/^#\/?/, "");
    const root = h.split("/")[0] || "";
    if (!root) return "home";
    if (root === "concours" || root === "exam") return "concours";
    if (root === "inedit") return "inedit";
    if (root === "progression" || root === "mistakes") return "progress";
    if (root === "bac2" || root === "bac3" || root === "master") return "concours";
    return "home";
  }

  function paintTabs(){
    const tab = currentTab();
    tabbar.querySelectorAll(".tabbar-item[data-tab]").forEach(el => {
      const on = el.getAttribute("data-tab") === tab;
      el.classList.toggle("active", on);
      if (on) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
  }

  function openSheet(){
    if (!sheet) return;
    sheet.hidden = false;
    if (levelBtn) levelBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeSheet(){
    if (!sheet) return;
    sheet.hidden = true;
    if (levelBtn) levelBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if (levelBtn){
    levelBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      sheet && !sheet.hidden ? closeSheet() : openSheet();
    });
  }
  if (sheet){
    sheet.querySelectorAll("[data-close-sheet]").forEach(el => {
      el.addEventListener("click", closeSheet);
    });
    sheet.querySelectorAll(".sheet-link").forEach(a => {
      a.addEventListener("click", () => closeSheet());
    });
  }

  window.addEventListener("hashchange", () => {
    paintTabs();
    closeSheet();
  });
  paintTabs();
})();

// ---------- Offline support ----------
// Registered after "load" so it never competes with the initial page render for
// bandwidth/priority. A previously-opened exam stays reviewable with no connection —
// see sw.js for what's actually cached and why.
if ("serviceWorker" in navigator){
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
    // New deploy → new CACHE_VERSION → user gets a lightweight toast to refresh
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      const bar = document.createElement("div");
      bar.setAttribute("role", "status");
      bar.style.cssText = "position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:9999;background:var(--brand-blue,#1660D1);color:#fff;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(15,42,74,.25);display:flex;gap:12px;align-items:center;max-width:92vw;";
      bar.innerHTML = (typeof currentLang !== "undefined" && currentLang === "ar"
        ? "تحديث متاح"
        : "Nouvelle version disponible") +
        ' <button type="button" style="background:#fff;color:#0F2A4A;border:0;border-radius:7px;padding:6px 10px;font-weight:700;cursor:pointer;">' +
        (typeof currentLang !== "undefined" && currentLang === "ar" ? "تحديث" : "Actualiser") +
        "</button>";
      bar.querySelector("button").onclick = () => location.reload();
      document.body.appendChild(bar);
    });
  });
}
