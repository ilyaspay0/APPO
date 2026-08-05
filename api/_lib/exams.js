/**
 * content_exams data access — single source of truth (Supabase).
 * All serverless routes go through this module; no local JSON.
 */

const { sbRest } = require("./supabase");

/** Meta columns only — never pull questions for list endpoints. */
const META_SELECT =
  "id,niveau,concours,matiere,annee,n,n_corrected,type,source,cycle,filiere,sort_order";

function encodeEq(value) {
  // PostgREST filter value: encode special chars
  return encodeURIComponent(String(value));
}

function getQueryId(req) {
  if (req.query && req.query.id) return String(req.query.id);
  try {
    return new URL(req.url, "http://x").searchParams.get("id");
  } catch (e) {
    return null;
  }
}

function nCorrectedOf(row) {
  return row.n_corrected != null
    ? row.n_corrected
    : row.nCorrected != null
      ? row.nCorrected
      : 0;
}

/** Map a DB row to the bac (QCM archives) meta shape expected by the client. */
function metaBac(row) {
  return {
    id: row.id,
    concours: row.concours,
    matiere: row.matiere,
    annee: row.annee,
    n: row.n,
    nCorrected: nCorrectedOf(row),
    source: row.source || "archive",
  };
}

function metaBac2(row) {
  return {
    id: row.id,
    concours: row.concours,
    matiere: row.matiere,
    annee: row.annee,
    n: row.n,
    type: row.type || "libre",
    source: row.source || "archive",
  };
}

function metaBac3(row) {
  return {
    id: row.id,
    cycle: row.cycle,
    filiere: row.filiere || row.matiere,
    annee: row.annee,
    n: row.n,
    type: row.type || "qcm",
    source: row.source || "archive",
  };
}

function metaMaster(row) {
  return {
    id: row.id,
    concours: row.concours,
    matiere: row.matiere,
    annee: row.annee,
    n: row.n,
    type: row.type || "libre",
    source: row.source || "archive",
  };
}

function metaLicence(row) {
  return {
    id: row.id,
    concours: row.concours,
    matiere: row.matiere,
    filiere: row.filiere || row.matiere,
    annee: row.annee,
    n: row.n,
    nCorrected: nCorrectedOf(row),
    type: row.type || "qcm",
    source: row.source || "upload",
  };
}

const META_MAPPERS = {
  bac: metaBac,
  bac2: metaBac2,
  bac3: metaBac3,
  master: metaMaster,
  licence: metaLicence,
};

/**
 * List exam metadata for a niveau (no questions).
 * Ordered by sort_order then id for stable UI.
 */
async function listMeta(niveau) {
  const path =
    "content_exams?select=" +
    META_SELECT +
    "&niveau=eq." +
    encodeEq(niveau) +
    "&order=sort_order.asc.nullslast,created_at.desc&limit=2000";
  const rows = (await sbRest(path)) || [];
  const map = META_MAPPERS[niveau] || metaBac;
  return rows.map(map);
}

/**
 * Fetch one full exam row by id. Optionally constrain by niveau.
 */
async function getExamRow(id, niveau) {
  if (!id) return null;
  let path =
    "content_exams?id=eq." + encodeEq(id) + "&select=*&limit=1";
  if (niveau) path += "&niveau=eq." + encodeEq(niveau);
  const rows = (await sbRest(path)) || [];
  return rows[0] || null;
}

/** Public exam payload: énoncé only, never correct/explanation/answer. */
function publicQuestions(exam) {
  const type = exam.type || "qcm";
  return (exam.questions || []).map((q) => {
    const out = {
      num: q.num,
      text: q.text,
    };
    if (q.options && q.options.length) out.options = q.options;
    // Bac QCM: expose only whether a correction exists (not the letter).
    if (type === "qcm" || (q.correct != null && q.correct !== "")) {
      out.hasCorrection = !!(q.correct || q.answer);
    }
    return out;
  });
}

function publicExamPayload(exam, kind) {
  kind = kind || exam.niveau || "bac";
  const base = {
    id: exam.id,
    annee: exam.annee,
    n: exam.n,
    questions: publicQuestions(exam),
  };
  if (kind === "bac3") {
    base.cycle = exam.cycle;
    base.filiere = exam.filiere || exam.matiere;
    base.type = exam.type || "qcm";
  } else if (kind === "bac") {
    base.concours = exam.concours;
    base.matiere = exam.matiere;
    base.nCorrected = nCorrectedOf(exam);
  } else if (kind === "licence") {
    base.concours = exam.concours;
    base.matiere = exam.matiere;
    base.filiere = exam.filiere || exam.matiere;
    base.nCorrected = nCorrectedOf(exam);
    base.type = exam.type || "qcm";
  } else {
    // bac2 / master
    base.concours = exam.concours;
    base.matiere = exam.matiere;
    base.type = exam.type || "libre";
  }
  return base;
}

/** Correction / model-answer payload (private cache headers on callers). */
function correctionPayload(exam, kind) {
  kind = kind || exam.niveau || "bac";
  const type = exam.type || (kind === "bac" || kind === "licence" ? "qcm" : "libre");
  const questions = exam.questions || [];

  if (kind === "bac" || kind === "licence") {
    return {
      id: exam.id,
      corrections: questions.map((q) => ({
        correct: q.correct || null,
        explanation: q.explanation || null,
      })),
    };
  }

  // bac2 / bac3 / master — "answers" array
  return {
    id: exam.id,
    answers: questions.map((q) =>
      type === "qcm"
        ? { correct: q.correct, explanation: q.explanation }
        : { answer: q.answer || q.explanation || "" }
    ),
  };
}

function sendJson(res, status, body, cacheControl) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (cacheControl) res.setHeader("Cache-Control", cacheControl);
  res.status(status).send(typeof body === "string" ? body : JSON.stringify(body));
}

function sendError(res, err) {
  const status = err && err.status === 404 ? 404 : 500;
  console.error("[content_exams]", err && err.message ? err.message : err);
  sendJson(res, status, {
    error: status === 404 ? "exam not found" : "internal error",
  });
}

/** Factory: GET list of meta for a niveau */
function createListHandler(niveau) {
  return async function listHandler(req, res) {
    try {
      const meta = await listMeta(niveau);
      sendJson(res, 200, meta, "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
    } catch (err) {
      sendError(res, err);
    }
  };
}

/** Factory: GET one exam (énoncé only) */
function createExamHandler(niveau) {
  return async function examHandler(req, res) {
    try {
      const id = getQueryId(req);
      if (!id) {
        sendJson(res, 400, { error: "missing id" });
        return;
      }
      const exam = await getExamRow(id, niveau);
      if (!exam) {
        sendJson(res, 404, { error: "exam not found" });
        return;
      }
      sendJson(
        res,
        200,
        publicExamPayload(exam, niveau),
        "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
      );
    } catch (err) {
      sendError(res, err);
    }
  };
}

/** Factory: GET corrections / model answers */
function createCorrectionHandler(niveau) {
  return async function correctionHandler(req, res) {
    try {
      const id = getQueryId(req);
      if (!id) {
        sendJson(res, 400, { error: "missing id" });
        return;
      }
      const exam = await getExamRow(id, niveau);
      if (!exam) {
        sendJson(res, 404, { error: "exam not found" });
        return;
      }
      // Private short cache — do not put corrections on shared CDN aggressively.
      sendJson(res, 200, correctionPayload(exam, niveau), "private, max-age=60");
    } catch (err) {
      sendError(res, err);
    }
  };
}

module.exports = {
  META_SELECT,
  listMeta,
  getExamRow,
  getQueryId,
  publicExamPayload,
  correctionPayload,
  createListHandler,
  createExamHandler,
  createCorrectionHandler,
  metaBac,
  metaBac2,
  metaBac3,
  metaMaster,
  metaLicence,
  sendJson,
  sendError,
};
