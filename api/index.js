/**
 * Single Vercel Hobby-friendly API entrypoint.
 * Routes:
 *   GET /api?op=exams&niveau=bac|bac2|bac3|master|licence
 *   GET /api?op=exam&id=...
 *   GET /api?op=correction&id=...
 * Also accepts legacy paths rewritten to these query params (see vercel.json).
 */
const { getServiceClient, sendJson } = require("../lib/supabase-server");

function params(req) {
  const out = { ...(req.query || {}) };
  try {
    const u = new URL(req.url, "http://x");
    u.searchParams.forEach((v, k) => {
      if (out[k] == null) out[k] = v;
    });
  } catch (_) {}
  return out;
}

async function handleExams(req, res, niveau) {
  niveau = String(niveau || "bac").toLowerCase();
  const allowed = ["bac", "bac2", "bac3", "master", "licence"];
  if (!allowed.includes(niveau)) {
    return sendJson(res, 400, { error: "invalid niveau" });
  }
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("content_exams")
    .select(
      "id,concours,matiere,annee,n,n_corrected,type,source,cycle,filiere,sort_order"
    )
    .eq("niveau", niveau)
    .order("sort_order", { ascending: true })
    .order("concours", { ascending: true });
  if (error) throw error;
  const meta = (data || []).map((e) => ({
    id: e.id,
    concours: e.concours,
    matiere: e.matiere,
    annee: e.annee,
    n: e.n,
    nCorrected: e.n_corrected,
    type: e.type || (niveau === "bac2" ? "libre" : "qcm"),
    source: e.source || "core",
    cycle: e.cycle || undefined,
    filiere: e.filiere || undefined,
  }));
  return sendJson(
    res,
    200,
    meta,
    "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800"
  );
}

async function handleExam(req, res, id) {
  if (!id) return sendJson(res, 400, { error: "missing id" });
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("content_exams")
    .select(
      "id,niveau,concours,matiere,annee,n,n_corrected,type,cycle,filiere,questions"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return sendJson(res, 404, { error: "exam not found" });
  const questions = (data.questions || []).map((q) => ({
    num: q.num,
    text: q.text,
    options: q.options || undefined,
    hasCorrection: !!(q.correct || q.answer),
  }));
  return sendJson(
    res,
    200,
    {
      id: data.id,
      niveau: data.niveau,
      concours: data.concours,
      matiere: data.matiere,
      annee: data.annee,
      n: data.n,
      nCorrected: data.n_corrected,
      type: data.type || "qcm",
      cycle: data.cycle || undefined,
      filiere: data.filiere || undefined,
      questions,
    },
    "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
  );
}

async function handleCorrection(req, res, id) {
  if (!id) return sendJson(res, 400, { error: "missing id" });
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("content_exams")
    .select("id,niveau,questions")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return sendJson(res, 404, { error: "exam not found" });
  const corrections = (data.questions || []).map((q) => ({
    correct: q.correct || null,
    explanation: q.explanation || null,
    answer: q.answer || null,
  }));
  return sendJson(
    res,
    200,
    { id: data.id, corrections, answers: corrections },
    "private, max-age=60"
  );
}

module.exports = async (req, res) => {
  try {
    const q = params(req);
    // Support path-style via rewrite: /api/exams → ?op=exams
    let op = (q.op || "").toLowerCase();
    if (!op) {
      // Fallback: inspect pathname if present
      try {
        const path = new URL(req.url, "http://x").pathname.replace(/\/+$/, "");
        if (path.endsWith("/exams") || path === "/api") op = q.niveau ? "exams" : "exams";
        if (path.endsWith("/exam")) op = "exam";
        if (path.endsWith("/correction")) op = "correction";
      } catch (_) {}
    }
    if (!op) op = "exams";

    if (op === "exams") return await handleExams(req, res, q.niveau || "bac");
    if (op === "exam") return await handleExam(req, res, q.id);
    if (op === "correction") return await handleCorrection(req, res, q.id);

    return sendJson(res, 400, {
      error: "unknown op",
      use: [
        "/api?op=exams&niveau=bac",
        "/api?op=exam&id=...",
        "/api?op=correction&id=...",
      ],
    });
  } catch (e) {
    console.error("api/index", e);
    return sendJson(res, e.code === "NO_SUPABASE_ENV" ? 503 : 500, {
      error: e.message || "server error",
    });
  }
};
