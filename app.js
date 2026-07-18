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
  return `<div class="empty">${escapeHtml(message)}<div><button class="btn primary retry-btn" id="${id}" type="button">↻ Réessayer</button></div></div>`;
}

// ---------- Theme toggle (dark/light) ----------
(function initTheme(){
  const KEY = "suprepa-theme";
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");

  function paintButton(theme){
    if (!btn) return;
    btn.textContent = theme === "dark" ? "☀" : "🌙";
    btn.setAttribute("aria-label", theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre");
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
const CONCOURS_ORDER = ["Médecine","ENSA","ENSAM","ENCG","ISPITS"];
const CONCOURS_DESC = {
  "Médecine":"FMPM, FMPR, FMPF, FMPC — Biologie, Chimie, Physique, Mathématiques",
  "ENSA":"Écoles Nationales des Sciences Appliquées — Mathématiques, Physique, Chimie",
  "ENSAM":"Écoles Nationales Sup. d'Arts et Métiers — Mathématiques, Physique",
  "ENCG":"Concours TAFEM — Culture générale, Linguistique, Résolution de problèmes",
  "ISPITS":"Instituts Sup. des Professions Infirmières — Biologie, Chimie, Physique"
};

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
const examQuestionsCache = new Map();
const examCorrectionsCache = new Map();

async function loadExamsMeta(){
  const res = await fetch("/api/exams");
  if (!res.ok) throw new Error("exams meta fetch failed");
  EXAMS_DB = await res.json();
}

async function loadExamQuestions(id){
  if (examQuestionsCache.has(id)) return examQuestionsCache.get(id);
  const res = await fetch("/api/exam?id=" + encodeURIComponent(id));
  if (!res.ok) throw new Error("exam fetch failed");
  const data = await res.json();
  examQuestionsCache.set(id, data.questions);
  return data.questions;
}

async function loadCorrections(id){
  if (examCorrectionsCache.has(id)) return examCorrectionsCache.get(id);
  const res = await fetch("/api/correction?id=" + encodeURIComponent(id));
  if (!res.ok) throw new Error("correction fetch failed");
  const data = await res.json();
  examCorrectionsCache.set(id, data.corrections);
  return data.corrections;
}

// ---------- Progress storage ----------
function loadProgress(examId){
  try{ return JSON.parse(localStorage.getItem("prepari:progress:"+examId)) || {}; }
  catch(e){ return {}; }
}
function saveProgress(examId, data){
  try{ localStorage.setItem("prepari:progress:"+examId, JSON.stringify(data)); }catch(e){}
  scheduleCloudPush(examId, data);
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
}

function renderAuthArea(){
  const el = document.getElementById("authArea");
  if (!el) return;
  if (currentUser){
    el.innerHTML = `
      <div class="auth-user">
        <span class="auth-email">${escapeHtml(currentUser.email || "Connecté")}</span>
        <button id="authSignOutBtn" type="button">Se déconnecter</button>
      </div>`;
    document.getElementById("authSignOutBtn").addEventListener("click", () => sbClient && sbClient.auth.signOut());
  } else {
    el.innerHTML = `<button class="auth-btn" id="authOpenBtn" type="button" title="Facultatif — connecte-toi pour garder ta progression entre ton téléphone et ton ordinateur">Se connecter</button>`;
    document.getElementById("authOpenBtn").addEventListener("click", openAuthModal);
  }
}

let authMode = "login";
function openAuthModal(){
  if (!sbClient){
    alert("La connexion n'est pas encore configurée sur ce site. Réessaie plus tard.");
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
  document.getElementById("authModalTitle").textContent = mode === "signup" ? "Créer un compte" : "Se connecter";
  document.getElementById("authSubmitBtn").textContent = mode === "signup" ? "Créer mon compte" : "Se connecter";
  document.getElementById("authSwitchText").textContent = mode === "signup" ? "Déjà un compte ?" : "Pas encore de compte ?";
  document.getElementById("authSwitchBtn").textContent = mode === "signup" ? "Se connecter" : "Créer un compte";
}
function showAuthError(msg){
  const el = document.getElementById("authError");
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
}
function authErrorMessage(e){
  const msg = (e && e.message) || "";
  if (msg.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (msg.includes("already registered") || msg.includes("already exists")) return "Un compte existe déjà avec cet email.";
  if (msg.includes("Password should be at least")) return "Le mot de passe doit contenir au moins 6 caractères.";
  if (msg.includes("Unable to validate email") || msg.includes("invalid")) return "Adresse email invalide.";
  if (msg.includes("Email not confirmed")) return "Confirme d'abord ton adresse email (vérifie ta boîte mail).";
  return msg || "Une erreur est survenue. Réessaie.";
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
    try{
      if (authMode === "signup"){
        const { data, error } = await sbClient.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && !data.session){
          showAuthError("Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.");
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

// ---------- Router ----------
function parseHash(){
  const h = location.hash.replace(/^#\/?/, "");
  return h.split("/").filter(Boolean).map(decodeURIComponent);
}

window.addEventListener("hashchange", () => {
  route();
  // Only force scroll-to-top for real app routes (#/...), not in-page anchors like #faq or #concours-grid
  if (location.hash.startsWith("#/") || location.hash === ""){
    window.scrollTo(0, 0);
  }
});

let bootStarted = false;
function boot(){
  if (bootStarted) return;
  bootStarted = true;
  renderAuthArea();
  initAuthModalEvents();
  initSupabase();
  app.innerHTML = skeletonHome();
  loadExamsMeta().then(route).catch(() => {
    app.innerHTML = retryBlock("Impossible de charger les données de Suprepa. Vérifie ta connexion.", () => {
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
  if (parts[0] === "progression") return renderProgression();
  if (parts[0] === "inedit" && parts.length === 1) return renderInedit();
  if (parts[0] === "inedit" && parts.length === 2) return renderIneditConcours(parts[1]);
  if (parts[0] === "inedit" && parts.length === 3) return renderIneditMatiere(parts[1], parts[2]);
  if (parts[0] === "concours" && parts.length === 2) return renderConcours(parts[1]);
  if (parts[0] === "concours" && parts.length === 3) return renderMatiere(parts[1], parts[2]);
  if (parts[0] === "exam" && parts.length === 2) return renderModePicker(parts[1]);
  if (parts[0] === "exam" && parts.length === 3) return renderSession(parts[1], parts[2]);
  return renderHome();
}

function setCrumbs(html){ crumbsEl.innerHTML = html; }

// ---------- Views ----------
function renderHome(){
  setCrumbs("");
  const totalQ = EXAMS_DB.reduce((s,e)=>s+e.n,0);
  const totalExams = EXAMS_DB.length;
  const totalCorrected = EXAMS_DB.reduce((s,e)=>s+(e.nCorrected||0),0);

  const cards = CONCOURS_ORDER.filter(c => byConcours(c).length).map(c => {
    const exams = byConcours(c);
    const q = exams.reduce((s,e)=>s+e.n,0);
    return `
      <a class="card concours-card" href="#/concours/${encodeURIComponent(c)}">
        <span class="eyebrow">${matieresOf(c).length} matière${matieresOf(c).length>1?"s":""}</span>
        <h3>${c}</h3>
        <div class="meta">${CONCOURS_DESC[c]||""}</div>
        <div class="count">${q}<span style="font-size:13px;color:var(--ink-soft);font-weight:500;"> QCM</span></div>
      </a>`;
  }).join("");

  const resume = allProgress()
    .filter(p => !p.data.finishedAt)
    .sort((a,b) => (b.data.updatedAt||0) - (a.data.updatedAt||0))
    .slice(0,3);
  const resumeHtml = resume.length ? `
    <div class="section-head"><h2>Reprendre mes révisions</h2><a class="hint" href="#/progression">Voir tout</a></div>
    <div class="grid">
      ${resume.map(({exam, data}) => {
        const answered = Object.keys(data.answers||{}).length;
        return `
        <a class="card" href="#/exam/${exam.id}/${data.mode||'cours'}">
          <span class="eyebrow">${escapeHtml(exam.concours)} · ${exam.annee}</span>
          <h3>${escapeHtml(exam.matiere)}</h3>
          <div class="meta">${answered} / ${exam.n} questions traitées</div>
        </a>`;
      }).join("")}
    </div>` : "";

  const nConcours = CONCOURS_ORDER.filter(c=>byConcours(c).length).length;

  const featuresHtml = `
    <div class="section-head"><h2>Pourquoi Suprepa ?</h2></div>
    <div class="features-grid">
      <div class="feature-card">
        <span class="fnum">01</span>
        <h3>100% gratuit</h3>
        <p>Toute la banque de QCM est accessible librement, sans compte obligatoire et sans frais cachés.</p>
      </div>
      <div class="feature-card">
        <span class="fnum">02</span>
        <h3>Corrections détaillées</h3>
        <p>Chaque question corrigée est accompagnée d'une explication claire : la bonne réponse, et pourquoi les autres sont fausses.</p>
      </div>
      <div class="feature-card">
        <span class="fnum">03</span>
        <h3>Deux modes d'entraînement</h3>
        <p>Mode cours pour apprendre à ton rythme, mode examen chronométré pour simuler les conditions réelles du concours.</p>
      </div>
      <div class="feature-card">
        <span class="fnum">04</span>
        <h3>Progression sauvegardée</h3>
        <p>Ton avancement est enregistré automatiquement sur cet appareil : reprends un examen là où tu l'as laissé.</p>
      </div>
    </div>`;

  const stepsHtml = `
    <div class="section-head"><h2>Comment ça marche</h2></div>
    <div class="steps-row">
      <div class="step-item">
        <div class="step-num">01</div>
        <h3>Choisis ton concours et un examen</h3>
        <p>Médecine, ENSA, ENSAM, ENCG ou ISPITS — sélectionne la matière et l'année qui t'intéressent.</p>
      </div>
      <div class="step-item">
        <div class="step-num">02</div>
        <h3>Réponds aux QCM</h3>
        <p>En mode cours avec correction immédiate, ou en mode examen chronométré pour te mettre en conditions réelles.</p>
      </div>
      <div class="step-item">
        <div class="step-num">03</div>
        <h3>Analyse tes résultats</h3>
        <p>Consulte ton score, revois tes erreurs et les explications, et suis ta progression au fil des examens.</p>
      </div>
    </div>`;

  const faqData = [
    ["Est-ce que Suprepa est vraiment gratuit ?", "Oui. L'accès à l'ensemble des QCM, examens et corrections disponibles sur Suprepa est entièrement gratuit."],
    ["Quels concours sont couverts ?", `Suprepa couvre actuellement ${CONCOURS_ORDER.filter(c=>byConcours(c).length).join(", ")}. D'autres concours pourront être ajoutés progressivement.`],
    ["Quelle est la différence entre mode cours et mode examen ?", "Le mode cours te permet d'avancer à ton rythme avec correction et explication immédiates après chaque réponse. Le mode examen chronomètre ta session pour simuler les conditions réelles du concours, avec un bilan à la fin."],
    ["Est-ce que toutes les questions sont corrigées ?", "Non, certaines questions n'ont pas encore de correction disponible. Elles restent néanmoins accessibles à l'entraînement pour t'habituer aux énoncés du concours."],
    ["Comment vous contacter ?", `Pour toute question, suggestion ou signalement d'erreur, écris-nous à <a href="mailto:ilyaspay0@gmail.com">ilyaspay0@gmail.com</a>.`]
  ];
  const faqHtml = `
    <div class="section-head" id="faq"><h2>Questions fréquentes</h2></div>
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
        <span class="hero-badge"><span class="dot"></span>Plateforme gratuite · Maroc</span>
        <h1>Prépare ton <em>concours</em>,<br>question par question.</h1>
        <p>Banque de QCM corrigés pour les concours d'accès aux grandes écoles et facultés marocaines — mode cours pour apprendre, mode examen chronométré pour t'entraîner en conditions réelles.</p>
        <div class="cta-row">
          <a class="btn primary lg" href="#concours-grid">Commencer maintenant →</a>
          <a class="btn lg" href="#/progression">Voir ma progression</a>
        </div>
      </div>
      <div class="exam-cover">
        <div class="row"><span>Candidat(e)</span><span>Toi</span></div>
        <div class="row"><span>Concours</span><span>Au choix</span></div>
        <div class="row"><span>Durée</span><span>Chronométrée</span></div>
        <div class="row"><span>Questions</span><span>${totalQ.toLocaleString("fr-FR")} disponibles</span></div>
        <div class="row"><span>Statut</span><span>Prêt</span></div>
        <div class="stamp"><img src="images/logo-96.png" alt="Suprepa"></div>
      </div>
    </section>

    <div class="stat-strip">
      <div class="stat-cell"><b>${totalQ.toLocaleString("fr-FR")}</b><span>Questions</span></div>
      <div class="stat-cell"><b>${totalExams}</b><span>Examens</span></div>
      <div class="stat-cell"><b>${nConcours}</b><span>Concours</span></div>
      <div class="stat-cell"><b>${totalCorrected.toLocaleString("fr-FR")}</b><span>Corrigées</span></div>
    </div>

    <div class="section-head" id="concours-grid"><h2>Choisis ton concours</h2><span class="hint">${totalExams} examens indexés</span></div>
    <div class="grid">${cards}</div>
    ${resumeHtml}
    ${featuresHtml}
    ${stepsHtml}
    ${faqHtml}
    </div>
  `;
  initScrollReveal();
}

function renderProgression(){
  setCrumbs(`<a href="#/">Accueil</a> / Ma progression`);
  const items = allProgress();

  if (!items.length){
    app.innerHTML = `
      <div class="section-head"><h2>Ma progression</h2></div>
      <div class="empty">Tu n'as pas encore commencé d'examen. <a href="#/">Choisis un concours</a> pour démarrer.</div>
    `;
    return;
  }

  app.innerHTML = `<div class="section-head"><h2>Ma progression</h2></div>` + skeletonRows(Math.min(items.length, 5));

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
          ${exam.source === "suprepa" ? `<span class="badge-original">Original</span>` : `<span class="year">${exam.annee}</span>`}
          <div>
            <div style="font-weight:600;">${escapeHtml(exam.concours)} · ${escapeHtml(exam.matiere)}</div>
            <div class="n">${answered} / ${exam.n} répondues${data.finishedAt ? " · terminé" : " · en cours"}${nCorrectable ? ` · score ${nCorrect}/${nCorrectable}` : ""}</div>
          </div>
        </div>
        <div class="actions">
          <a class="btn" href="#/exam/${exam.id}/${data.mode||'cours'}">${data.finishedAt ? "Revoir" : "Continuer"}</a>
        </div>
      </div>`).join("");

    app.innerHTML = `
      <div class="section-head"><h2>Ma progression</h2><span class="hint">${items.length} examen${items.length>1?"s":""} entamé${items.length>1?"s":""}</span></div>
      <div class="summary-grid" style="margin-bottom:32px;">
        <div class="summary-stat"><b>${items.length}</b><span>Examens entamés</span></div>
        <div class="summary-stat"><b>${totalFinished}</b><span>Terminés</span></div>
        <div class="summary-stat"><b>${totalCorrectable ? Math.round(100*totalCorrect/totalCorrectable)+"%" : "—"}</b><span>Taux de réussite (corrigées)</span></div>
      </div>
      ${rowsHtml}
    `;
    animateCounters();
  });
}

function renderConcours(concours){
  setCrumbs(`<a href="#/">Accueil</a> / ${escapeHtml(concours)}`);
  const matieres = matieresOf(concours);
  if (!matieres.length){
    app.innerHTML = `<a class="backlink" href="#/">&larr; Accueil</a><div class="empty">Aucun examen pour ce concours.</div>`;
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
        <div class="meta">${exams.length} examen${exams.length>1?"s":""} · ${q} questions</div>
      </a>`;
  }).join("");

  app.innerHTML = `
    <a class="backlink" href="#/">&larr; Tous les concours</a>
    <div class="section-head"><h2>${escapeHtml(concours)}</h2><span class="hint">${CONCOURS_DESC[concours]||""}</span></div>
    <div class="grid">${cards}</div>
  `;
}

function renderMatiere(concours, matiere){
  setCrumbs(`<a href="#/">Accueil</a> / <a href="#/concours/${encodeURIComponent(concours)}">${escapeHtml(concours)}</a> / ${escapeHtml(matiere)}`);
  const exams = byMatiere(concours, matiere).sort((a,b)=> b.annee.localeCompare(a.annee));

  const rows = exams.map(e => {
    const progress = loadProgress(e.id);
    const answered = Object.keys(progress.answers||{}).length;
    return `
      <div class="exam-row">
        <div class="left">
          <span class="year">${e.annee}</span>
          <div>
            <div style="font-weight:600;">${escapeHtml(e.matiere)} ${e.annee}</div>
            <div class="n">${e.n} questions${answered ? ` · ${answered} traitées` : ""}</div>
          </div>
        </div>
        <div class="actions">
          <a class="btn" href="#/exam/${e.id}">Ouvrir</a>
        </div>
      </div>`;
  }).join("");

  app.innerHTML = `
    <a class="backlink" href="#/concours/${encodeURIComponent(concours)}">&larr; ${escapeHtml(concours)}</a>
    <div class="section-head"><h2>${escapeHtml(matiere)}</h2><span class="hint">${exams.length} examens</span></div>
    ${rows || '<div class="empty">Aucun examen.</div>'}
  `;
}

function renderInedit(){
  setCrumbs(`<a href="#/">Accueil</a> / Questions inédites`);
  const concoursList = ineditConcoursList();

  const cards = concoursList.map(c => {
    const exams = EXAMS_DB.filter(e => e.concours === c && e.source === "suprepa");
    const q = exams.reduce((s,e)=>s+e.n,0);
    return `
      <a class="card concours-card" href="#/inedit/${encodeURIComponent(c)}">
        <span class="eyebrow">${ineditMatieresOf(c).length} matière${ineditMatieresOf(c).length>1?"s":""}</span>
        <h3>${c}</h3>
        <div class="meta">${CONCOURS_DESC[c]||""}</div>
        <div class="count">${q}<span style="font-size:13px;color:var(--ink-soft);font-weight:500;"> QCM</span></div>
      </a>`;
  }).join("");

  app.innerHTML = `
    <div class="inedit-hero">
      <span class="badge-original">Original Suprepa</span>
      <div class="section-head" style="margin:12px 0 0;"><h2 style="margin:0;">Questions inédites</h2></div>
      <p>Des QCM entièrement inédits, écrits dans l'esprit des concours marocains — <b>jamais tombés</b> dans une vraie session. Idéal pour tester ta compréhension au-delà des annales déjà connues, avec une correction et une explication systématiques sur chaque question.</p>
    </div>
    ${concoursList.length ? `<div class="grid">${cards}</div>` : '<div class="empty">Aucune question inédite disponible pour le moment.</div>'}
  `;
}

function renderIneditConcours(concours){
  setCrumbs(`<a href="#/">Accueil</a> / <a href="#/inedit">Questions inédites</a> / ${escapeHtml(concours)}`);
  const matieres = ineditMatieresOf(concours);
  if (!matieres.length){
    app.innerHTML = `<a class="backlink" href="#/inedit">&larr; Questions inédites</a><div class="empty">Aucune question inédite pour ce concours.</div>`;
    return;
  }
  const cards = matieres.map(m => {
    const exams = byIneditMatiere(concours, m);
    const q = exams.reduce((s,e)=>s+e.n,0);
    return `
      <a class="card" href="#/inedit/${encodeURIComponent(concours)}/${encodeURIComponent(m)}">
        <span class="badge-original" style="margin-bottom:8px;">Original Suprepa</span>
        <h3>${escapeHtml(m)}</h3>
        <div class="meta">${exams.length} lot${exams.length>1?"s":""} · ${q} questions</div>
      </a>`;
  }).join("");

  app.innerHTML = `
    <a class="backlink" href="#/inedit">&larr; Questions inédites</a>
    <div class="section-head"><h2>${escapeHtml(concours)}</h2><span class="hint">Questions inédites, jamais tombées en concours</span></div>
    <div class="grid">${cards}</div>
  `;
}

function renderIneditMatiere(concours, matiere){
  setCrumbs(`<a href="#/">Accueil</a> / <a href="#/inedit">Questions inédites</a> / <a href="#/inedit/${encodeURIComponent(concours)}">${escapeHtml(concours)}</a> / ${escapeHtml(matiere)}`);
  const exams = byIneditMatiere(concours, matiere);

  const rows = exams.map(e => {
    const progress = loadProgress(e.id);
    const answered = Object.keys(progress.answers||{}).length;
    return `
      <div class="exam-row">
        <div class="left">
          <span class="badge-original">Original Suprepa</span>
          <div>
            <div style="font-weight:600;">${escapeHtml(e.matiere)} — ${e.annee}</div>
            <div class="n">${e.n} questions, 100% corrigées${answered ? ` · ${answered} traitées` : ""}</div>
          </div>
        </div>
        <div class="actions">
          <a class="btn" href="#/exam/${e.id}">Ouvrir</a>
        </div>
      </div>`;
  }).join("");

  app.innerHTML = `
    <a class="backlink" href="#/inedit/${encodeURIComponent(concours)}">&larr; ${escapeHtml(concours)}</a>
    <div class="section-head"><h2>${escapeHtml(matiere)}</h2><span class="hint">${exams.length} lot${exams.length>1?"s":""} inédit${exams.length>1?"s":""}</span></div>
    ${rows || '<div class="empty">Aucun lot disponible.</div>'}
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
    ? `<a href="#/">Accueil</a> / <a href="#/inedit">Questions inédites</a> / <a href="#/inedit/${encodeURIComponent(exam.concours)}">${escapeHtml(exam.concours)}</a> / ${escapeHtml(exam.matiere)}`
    : `<a href="#/">Accueil</a> / <a href="#/concours/${encodeURIComponent(exam.concours)}">${escapeHtml(exam.concours)}</a> / ${escapeHtml(exam.matiere)} ${exam.annee}`);

  const nCorrected = exam.nCorrected || 0;
  const noticeHtml = nCorrected === exam.n
    ? `<div class="notice">Les ${exam.n} questions de cet examen sont corrigées avec explication.</div>`
    : nCorrected > 0
      ? `<div class="notice">${nCorrected} question${nCorrected>1?"s":""} sur ${exam.n} sont corrigées avec explication ; les autres restent disponibles en entraînement sans validation automatique.</div>`
      : `<div class="notice">Aucune correction disponible pour le moment sur cet examen — tu peux quand même t'entraîner sur les énoncés.</div>`;

  app.innerHTML = `
    <a class="backlink" href="${backHref}">&larr; ${escapeHtml(exam.matiere)}</a>
    <div class="section-head">
      <h2>${escapeHtml(exam.concours)} ${escapeHtml(exam.matiere)} ${isOriginal ? "" : exam.annee}</h2>
      <span class="hint">${isOriginal ? `<span class="badge-original">Original Suprepa</span>` : `${exam.n} questions`}</span>
    </div>
    ${noticeHtml}
    <div class="mode-grid">
      <a class="mode-card" href="#/exam/${exam.id}/cours">
        <span class="icon">Mode cours</span>
        <h3>Question par question</h3>
        <p>Avance à ton rythme, reviens en arrière, pas de chronomètre. Idéal pour découvrir les notions.</p>
        <span class="btn primary">Commencer</span>
      </a>
      <a class="mode-card" href="#/exam/${exam.id}/examen">
        <span class="icon">Mode examen</span>
        <h3>Chronométré</h3>
        <p>${exam.n} questions, ${Math.round(exam.n*1.5)} minutes. Simule les conditions réelles du concours.</p>
        <span class="btn gold">Démarrer le chrono</span>
      </a>
    </div>
  `;
}

async function renderSession(examId, mode){
  const exam = examById(examId);
  if (!exam) return renderHome();
  setCrumbs(`<a href="#/">Accueil</a> / <a href="#/exam/${exam.id}">${escapeHtml(exam.concours)} ${escapeHtml(exam.matiere)} ${exam.annee}</a> / ${mode === "examen" ? "Examen" : "Cours"}`);

  app.innerHTML = skeletonQuestionCard();
  let questions;
  try{
    questions = await loadExamQuestions(examId);
  }catch(e){
    app.innerHTML = retryBlock("Impossible de charger cet examen. Vérifie ta connexion.", () => renderSession(examId, mode));
    return;
  }

  const progress = loadProgress(examId);
  const state = {
    idx: 0,
    answers: progress.answers || {},
    flagged: progress.flagged || {},
    mode,
    secondsLeft: mode === "examen" ? Math.round(exam.n * 90) : null,
    finished: false,
    reviewMode: !!progress.finishedAt,
    corrections: null
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
        <span>${o.text}</span>
      </button>`;
    }).join("");

    let correctionHtml = "";
    if (reveal){
      if (hasCorrection && correctInfo && correctInfo.correct){
        const isRight = selected === correctInfo.correct;
        correctionHtml = `
          <div class="notice" style="border-color:${isRight? 'var(--green)':'var(--red)'};">
            <b style="color:${isRight? 'var(--green)':'var(--red)'};">${selected ? (isRight ? "Bonne réponse !" : "Ce n'est pas la bonne réponse.") : "Correction"} — réponse correcte : ${correctInfo.correct}</b>
            ${correctInfo.explanation ? `<div style="margin-top:8px;">${correctInfo.explanation}</div>` : ""}
          </div>`;
      } else {
        correctionHtml = `<div class="notice">Correction non disponible pour cette question.</div>`;
      }
    }

    app.innerHTML = `
      <div class="session-head">
        <div>
          <div class="title">${escapeHtml(exam.concours)} · ${escapeHtml(exam.matiere)} ${exam.source === "suprepa" ? `<span class="badge-original" style="margin-left:6px;">Original Suprepa</span>` : exam.annee}</div>
          <div class="sub">${mode === "examen" ? (state.reviewMode ? "Revue de l'examen" : "Mode examen chronométré") : "Mode cours"} — question ${state.idx+1} / ${total}</div>
        </div>
        ${mode === "examen" && !state.reviewMode ? `<div class="timer" id="timer">${fmtTime(state.secondsLeft)}</div>` : ""}
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${(state.idx+1)/total*100}%"></div></div>

      <div class="question-card">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
          <span class="qnum" style="margin-bottom:0;">${q.num} · Question ${state.idx+1} sur ${total}${hasCorrection ? " · Corrigée" : ""}</span>
          <button class="flag-btn ${state.flagged[state.idx] ? "on":""}" id="flagBtn" title="Marquer pour révision (touche F)">${state.flagged[state.idx] ? "★ Marquée" : "☆ Marquer"}</button>
        </div>
        <div class="qtext"><p>${q.text}</p></div>
        <div class="options">${optionsHtml}</div>
        ${correctionHtml}
        <div class="kbd-hint">Raccourcis : <kbd>A</kbd><kbd>B</kbd><kbd>C</kbd><kbd>D</kbd> répondre · <kbd>←</kbd><kbd>→</kbd> naviguer · <kbd>F</kbd> marquer</div>
        <div class="swipe-hint">← Glisse pour changer de question →</div>
      </div>

      <div class="session-nav" style="margin-top:20px;">
        <button class="btn" id="prevBtn" ${state.idx===0 ? "disabled":""}>&larr; Précédente</button>
        <span class="mid">${Object.keys(state.answers).length} / ${total} répondues</span>
        <button class="btn primary" id="nextBtn">${state.idx === total-1 ? (state.reviewMode ? "Terminer la revue" : "Terminer") : "Suivante →"}</button>
      </div>
    `;
    renderMath();

    async function selectOption(letter, btnEl){
      if (state.reviewMode && mode === "examen") return; // read-only review of a timed exam
      state.answers[state.idx] = letter;
      persist();
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

    const scoreBlock = correctableIdx.length
      ? `<div class="summary-stat"><b>${nCorrect} / ${correctableIdx.length}</b><span>Score (corrigées)</span></div>`
      : `<div class="summary-stat"><b>—</b><span>Aucune correction dispo</span></div>`;

    const flaggedIdx = Object.keys(state.flagged || {}).map(Number).sort((a,b)=>a-b);
    const flaggedHtml = flaggedIdx.length ? `
      <div class="section-head" style="margin-top:32px;"><h2 style="font-size:18px;">Questions marquées</h2><span class="hint">${flaggedIdx.length}</span></div>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(90px,1fr));">
        ${flaggedIdx.map(i => `<a class="btn ghost" style="text-align:center;" href="#/exam/${exam.id}/${mode}" data-goto="${i}">${questions[i].num}</a>`).join("")}
      </div>` : "";

    app.innerHTML = `
      <div class="session-head">
        <div>
          <div class="title">Session terminée</div>
          <div class="sub">${escapeHtml(exam.concours)} · ${escapeHtml(exam.matiere)} ${exam.source === "suprepa" ? `<span class="badge-original" style="margin-left:6px;">Original Suprepa</span>` : exam.annee}</div>
        </div>
      </div>
      <div class="summary-grid">
        <div class="summary-stat"><b>${total}</b><span>Questions</span></div>
        <div class="summary-stat"><b>${answered}</b><span>Répondues</span></div>
        ${scoreBlock}
      </div>
      <div class="notice">${correctableIdx.length ? `${correctableIdx.length} question${correctableIdx.length>1?"s":""} sur ${total} avaient une correction disponible.` : "Aucune question de cet examen n'est corrigée pour le moment."} Revois tes réponses en détail ci-dessous.</div>
      ${flaggedHtml}
      <div class="session-nav" style="margin-top:24px;">
        <a class="btn" href="#/exam/${exam.id}/${mode}">&larr; Revoir les réponses</a>
        <a class="btn primary" href="${exam.source === "suprepa" ? `#/inedit/${encodeURIComponent(exam.concours)}/${encodeURIComponent(exam.matiere)}` : `#/concours/${encodeURIComponent(exam.concours)}/${encodeURIComponent(exam.matiere)}`}">Autres examens</a>
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
      results.innerHTML = `<div class="search-empty">Aucun résultat pour « ${escapeHtml(q)} »</div>`;
      results.classList.add("open");
      return;
    }
    results.innerHTML = list.map(e => `
      <a href="#/exam/${e.id}">
        <div>${escapeHtml(e.concours)} · ${escapeHtml(e.matiere)} ${e.annee}</div>
        <div class="sr-meta">${e.n} questions${e.nCorrected ? ` · ${e.nCorrected} corrigées` : ""}</div>
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
