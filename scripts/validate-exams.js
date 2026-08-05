#!/usr/bin/env node
/**
 * Suprepa content validation — run before deploy:
 *   node scripts/validate-exams.js
 *
 * Prefers Supabase content_exams (source of truth).
 * Falls back to local api/_data/*-full.json only if SUPABASE is unreachable
 * and seed files still exist (legacy).
 *
 *   set SUPABASE_URL=...
 *   set SUPABASE_ANON_KEY=...   # or SERVICE_ROLE
 *   node scripts/validate-exams.js
 *   node scripts/validate-exams.js --local   # force local JSON
 */
"use strict";

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "api", "_data");
const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  "https://pxlmtyhwqmbqenyytgos.supabase.co"
).replace(/\/$/, "");
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_6eCvwSzX4P4UK6n2SuVOrA_F60J1ZVO";

const NIVEAUX = [
  { niveau: "bac", kind: "qcm", expectCorrect: true, file: "exams-full.json" },
  { niveau: "bac2", kind: "mixed", expectCorrect: false, file: "bac2-full.json" },
  { niveau: "bac3", kind: "qcm", expectCorrect: true, file: "bac3-full.json" },
  { niveau: "master", kind: "mixed", expectCorrect: false, file: "master-full.json" },
];

const forceLocal = process.argv.includes("--local");

let errors = 0;
let warnings = 0;

function err(msg) {
  console.error("  ✗ " + msg);
  errors++;
}
function warn(msg) {
  console.warn("  ⚠ " + msg);
  warnings++;
}
function ok(msg) {
  console.log("  ✓ " + msg);
}

function countDollars(s) {
  const m = String(s).match(/\$/g);
  return m ? m.length : 0;
}

function validateExam(exam, ctx) {
  const prefix = `${ctx.label} · ${exam.id || "?"}`;
  if (!exam.id) err(`${prefix}: missing id`);
  const qs = exam.questions || [];
  if (!exam.n || exam.n !== qs.length) {
    err(`${prefix}: n=${exam.n} but questions.length=${qs.length}`);
  }
  if (!Array.isArray(qs) || !qs.length) {
    err(`${prefix}: no questions`);
    return;
  }

  const type = exam.type || (ctx.kind === "qcm" ? "qcm" : "libre");
  qs.forEach((q, i) => {
    const qp = `${prefix} Q${i + 1} (${q.num || i})`;
    if (!q.text || !String(q.text).trim()) err(`${qp}: empty text`);

    const dollars = countDollars(q.text || "");
    if (dollars % 2 !== 0) warn(`${qp}: odd number of $ (possible broken math)`);

    if (type === "qcm") {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        err(`${qp}: QCM needs options`);
        return;
      }
      const letters = q.options.map((o) => o && o.letter);
      const uniq = new Set(letters);
      if (uniq.size !== letters.length) err(`${qp}: duplicate option letters`);
      q.options.forEach((o, j) => {
        if (!o || !o.letter) err(`${qp}: option ${j} missing letter`);
        if (!o.text || !String(o.text).trim())
          warn(`${qp}: option ${o.letter || j} empty text`);
      });
      if (q.correct) {
        if (!letters.includes(q.correct)) {
          err(
            `${qp}: correct="${q.correct}" not in options [${letters.filter(Boolean).join(",")}]`
          );
        }
        if (ctx.expectCorrect && (!q.explanation || !String(q.explanation).trim())) {
          warn(`${qp}: has correct but empty explanation`);
        }
      }
    } else {
      if (!q.answer || !String(q.answer).trim()) {
        warn(`${qp}: libre question without model answer`);
      }
    }
  });

  const nCorrected = exam.nCorrected != null ? exam.nCorrected : exam.n_corrected;
  if (typeof nCorrected === "number") {
    const withCorrect = qs.filter((q) => q.correct).length;
    if (nCorrected !== withCorrect) {
      warn(`${prefix}: nCorrected=${nCorrected} but ${withCorrect} questions have correct`);
    }
  }
}

async function fetchNiveauFromSupabase(niveau) {
  const all = [];
  let offset = 0;
  const page = 100;
  for (;;) {
    const url =
      SUPABASE_URL +
      "/rest/v1/content_exams?select=id,niveau,concours,matiere,annee,n,n_corrected,type,source,cycle,filiere,questions&niveau=eq." +
      encodeURIComponent(niveau) +
      "&order=id.asc&offset=" +
      offset +
      "&limit=" +
      page;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
      },
    });
    if (!res.ok) throw new Error("Supabase " + res.status + " " + (await res.text()));
    const rows = await res.json();
    rows.forEach((r) => {
      all.push({
        id: r.id,
        n: r.n,
        nCorrected: r.n_corrected,
        type: r.type,
        source: r.source,
        questions: r.questions || [],
      });
    });
    if (rows.length < page) break;
    offset += page;
  }
  return all;
}

function loadLocal(file) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, "utf8"));
}

async function main() {
  console.log("Suprepa exam validation\n");
  const allIds = new Set();
  let source = forceLocal ? "local" : "supabase";

  if (!forceLocal) {
    try {
      const probe = await fetch(
        SUPABASE_URL + "/rest/v1/content_exams?select=id&limit=1",
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: "Bearer " + SUPABASE_KEY,
          },
        }
      );
      if (!probe.ok) throw new Error("status " + probe.status);
      console.log("Source: Supabase content_exams\n");
    } catch (e) {
      console.warn("Supabase unreachable (" + e.message + "), falling back to local JSON\n");
      source = "local";
    }
  } else {
    console.log("Source: local JSON (--local)\n");
  }

  for (const n of NIVEAUX) {
    let data;
    const label = source === "supabase" ? `content_exams/${n.niveau}` : n.file;
    try {
      if (source === "supabase") {
        data = await fetchNiveauFromSupabase(n.niveau);
      } else {
        data = loadLocal(n.file);
        if (!data) {
          warn(`missing file ${n.file}`);
          continue;
        }
      }
    } catch (e) {
      err(`${label}: load failed — ${e.message}`);
      continue;
    }
    if (!Array.isArray(data)) {
      err(`${label}: root must be an array`);
      continue;
    }
    console.log(`\n▸ ${label} (${data.length} exams)`);
    data.forEach((exam) => {
      if (exam.id) {
        if (allIds.has(exam.id)) err(`duplicate id across banks: ${exam.id}`);
        allIds.add(exam.id);
      }
      validateExam(exam, {
        label,
        kind: n.kind,
        expectCorrect: n.expectCorrect,
      });
    });
    ok(`${data.length} exams scanned`);
  }

  console.log("\n────────────────────────────");
  console.log(`Done: ${errors} error(s), ${warnings} warning(s)`);
  process.exit(errors > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
