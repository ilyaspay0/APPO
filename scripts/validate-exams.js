#!/usr/bin/env node
/**
 * Suprepa content validation — run before deploy:
 *   node scripts/validate-exams.js
 *
 * Checks: unique ids, QCM options A–D, correct ∈ options,
 * non-empty text, corrected items have explanations when expected,
 * basic Math delimiter balance ($ ... $).
 */
"use strict";

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "api", "_data");
const FILES = [
  { name: "exams-full.json", kind: "qcm", expectCorrect: true },
  { name: "bac2-full.json", kind: "mixed", expectCorrect: false },
  { name: "bac3-full.json", kind: "qcm", expectCorrect: true },
  { name: "master-full.json", kind: "mixed", expectCorrect: false },
];

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
  const prefix = `${ctx.file} · ${exam.id || "?"}`;
  if (!exam.id) err(`${prefix}: missing id`);
  if (!exam.n || exam.n !== (exam.questions || []).length) {
    err(
      `${prefix}: n=${exam.n} but questions.length=${(exam.questions || []).length}`
    );
  }
  if (!Array.isArray(exam.questions) || !exam.questions.length) {
    err(`${prefix}: no questions`);
    return;
  }

  const type = exam.type || (ctx.kind === "qcm" ? "qcm" : "libre");
  exam.questions.forEach((q, i) => {
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
          // Some official papers use E or numeric codes — flag only if options exist
          err(`${qp}: correct="${q.correct}" not in options [${letters.filter(Boolean).join(",")}]`);
        }
        if (ctx.expectCorrect && (!q.explanation || !String(q.explanation).trim())) {
          warn(`${qp}: has correct but empty explanation`);
        }
      } else if (ctx.expectCorrect && exam.nCorrected > 0) {
        // partial banks are allowed; only warn if nCorrected claims more
      }
    } else {
      // libre
      if (!q.answer || !String(q.answer).trim()) {
        warn(`${qp}: libre question without model answer`);
      }
    }
  });

  if (typeof exam.nCorrected === "number") {
    const withCorrect = exam.questions.filter((q) => q.correct).length;
    if (exam.nCorrected !== withCorrect) {
      warn(
        `${prefix}: nCorrected=${exam.nCorrected} but ${withCorrect} questions have correct`
      );
    }
  }
}

function main() {
  console.log("Suprepa exam validation\n");
  const allIds = new Set();

  for (const f of FILES) {
    const fp = path.join(DATA_DIR, f.name);
    if (!fs.existsSync(fp)) {
      warn(`missing file ${f.name}`);
      continue;
    }
    let data;
    try {
      data = JSON.parse(fs.readFileSync(fp, "utf8"));
    } catch (e) {
      err(`${f.name}: invalid JSON — ${e.message}`);
      continue;
    }
    if (!Array.isArray(data)) {
      err(`${f.name}: root must be an array`);
      continue;
    }
    console.log(`\n▸ ${f.name} (${data.length} exams)`);
    data.forEach((exam) => {
      if (exam.id) {
        if (allIds.has(exam.id)) err(`duplicate id across files: ${exam.id}`);
        allIds.add(exam.id);
      }
      validateExam(exam, { file: f.name, kind: f.kind, expectCorrect: f.expectCorrect });
    });
    ok(`${data.length} exams scanned`);
  }

  console.log("\n────────────────────────────");
  console.log(`Done: ${errors} error(s), ${warnings} warning(s)`);
  process.exit(errors > 0 ? 1 : 0);
}

main();
