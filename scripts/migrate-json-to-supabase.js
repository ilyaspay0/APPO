#!/usr/bin/env node
/**
 * One-shot migration: local full JSON banks → Supabase content_exams.
 *
 * Usage:
 *   set SUPABASE_URL=https://xxxx.supabase.co
 *   set SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Dashboard → Settings → API → service_role
 *   node scripts/migrate-json-to-supabase.js
 *
 * Options:
 *   --dry-run     Parse & map rows, do not write
 *   --niveau=bac  Only migrate one niveau (bac|bac2|bac3|master)
 *   --force       Upsert even if id already exists with source=upload (overwrites)
 *
 * Safe defaults:
 *   - Does NOT overwrite rows whose source is "upload" (admin Excel imports)
 *   - Upserts archive/suprepa rows by id
 *   - Batches of 25 to stay under payload limits
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "api", "_data");

const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  "https://pxlmtyhwqmbqenyytgos.supabase.co"
).replace(/\/$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || "";

const SOURCES = [
  { file: "exams-full.json", niveau: "bac", defaultType: "qcm" },
  { file: "bac2-full.json", niveau: "bac2", defaultType: "libre" },
  { file: "bac3-full.json", niveau: "bac3", defaultType: "qcm" },
  { file: "master-full.json", niveau: "master", defaultType: "libre" },
];

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const FORCE = args.includes("--force");
const onlyNiveau = (args.find((a) => a.startsWith("--niveau=")) || "").split("=")[1];

function headers(extra) {
  return {
    apikey: SERVICE_KEY,
    Authorization: "Bearer " + SERVICE_KEY,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function sb(pathAndQuery, options) {
  options = options || {};
  const url = SUPABASE_URL + "/rest/v1/" + pathAndQuery.replace(/^\//, "");
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: headers(options.headers),
    body: options.body != null ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_) {
      data = text;
    }
  }
  if (!res.ok) {
    const msg =
      (data && data.message) ||
      (typeof data === "string" ? data : JSON.stringify(data)) ||
      res.statusText;
    throw new Error("Supabase " + res.status + ": " + msg);
  }
  return data;
}

function examToRow(exam, niveau, defaultType, sortBase, index) {
  const nCorrected =
    exam.nCorrected != null
      ? exam.nCorrected
      : exam.n_corrected != null
        ? exam.n_corrected
        : (exam.questions || []).filter((q) => q.correct || q.answer).length;

  const row = {
    id: exam.id,
    niveau,
    concours: exam.concours || (niveau === "bac3" ? exam.filiere || "Enseignement" : null),
    matiere: exam.matiere || exam.filiere || null,
    annee: exam.annee != null ? String(exam.annee) : null,
    n: exam.n != null ? exam.n : (exam.questions || []).length,
    n_corrected: nCorrected,
    type: exam.type || defaultType,
    source: exam.source || "archive",
    questions: exam.questions || [],
    sort_order: sortBase + index,
    updated_at: new Date().toISOString(),
  };

  if (niveau === "bac3") {
    row.cycle = exam.cycle || "Secondaire";
    row.filiere = exam.filiere || exam.matiere || exam.concours || "Import";
    row.matiere = row.filiere;
    row.concours = row.concours || row.filiere;
  }
  if (exam.filiere && niveau !== "bac3") row.filiere = exam.filiere;
  if (exam.cycle && niveau !== "bac3") row.cycle = exam.cycle;

  return row;
}

async function fetchExistingIds(niveau) {
  const ids = new Set();
  const uploadIds = new Set();
  let offset = 0;
  const page = 1000;
  for (;;) {
    const rows =
      (await sb(
        "content_exams?select=id,source&niveau=eq." +
          encodeURIComponent(niveau) +
          "&offset=" +
          offset +
          "&limit=" +
          page
      )) || [];
    rows.forEach((r) => {
      ids.add(r.id);
      if (r.source === "upload") uploadIds.add(r.id);
    });
    if (rows.length < page) break;
    offset += page;
  }
  return { ids, uploadIds };
}

async function upsertBatch(rows) {
  // resolution=merge-duplicates → ON CONFLICT update
  return sb("content_exams?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: rows,
  });
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function migrateOne(src) {
  const fp = path.join(DATA_DIR, src.file);
  if (!fs.existsSync(fp)) {
    console.warn("  ⚠ missing", src.file, "— skip");
    return { inserted: 0, skipped: 0, total: 0 };
  }
  const exams = JSON.parse(fs.readFileSync(fp, "utf8"));
  if (!Array.isArray(exams)) throw new Error(src.file + ": root must be array");

  console.log(`\n▸ ${src.file} → niveau=${src.niveau} (${exams.length} exams)`);

  const { uploadIds } = DRY
    ? { uploadIds: new Set() }
    : await fetchExistingIds(src.niveau);

  const sortBase = { bac: 100000, bac2: 200000, bac3: 300000, master: 400000 }[
    src.niveau
  ] || 500000;

  const rows = [];
  let skipped = 0;
  exams.forEach((exam, i) => {
    if (!exam.id) {
      console.warn("  ⚠ exam without id at index", i);
      skipped++;
      return;
    }
    if (!FORCE && uploadIds.has(exam.id)) {
      skipped++;
      return;
    }
    rows.push(examToRow(exam, src.niveau, src.defaultType, sortBase, i));
  });

  if (DRY) {
    console.log(`  dry-run: would upsert ${rows.length}, skip ${skipped}`);
    const sample = rows[0];
    if (sample) {
      console.log("  sample keys:", Object.keys(sample).join(", "));
      console.log(
        "  sample:",
        sample.id,
        sample.concours || sample.filiere,
        "n=" + sample.n,
        "qs=" + (sample.questions || []).length
      );
    }
    return { inserted: rows.length, skipped, total: exams.length };
  }

  let inserted = 0;
  const batches = chunk(rows, 15); // questions payloads can be large
  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    process.stdout.write(
      `  batch ${b + 1}/${batches.length} (${batch.length} rows)… `
    );
    try {
      await upsertBatch(batch);
      inserted += batch.length;
      console.log("ok");
    } catch (e) {
      console.log("FAIL");
      // Retry one-by-one to isolate bad rows
      for (const row of batch) {
        try {
          await upsertBatch([row]);
          inserted++;
        } catch (e2) {
          console.error("    ✗", row.id, e2.message);
          skipped++;
        }
      }
    }
  }

  console.log(`  ✓ upserted ${inserted}, skipped ${skipped}`);
  return { inserted, skipped, total: exams.length };
}

async function main() {
  console.log("Suprepa JSON → content_exams migration");
  console.log("URL:", SUPABASE_URL);
  console.log(DRY ? "Mode: DRY-RUN" : "Mode: WRITE");

  if (!DRY && !SERVICE_KEY) {
    console.error(`
ERROR: SUPABASE_SERVICE_ROLE_KEY is required for writes.

  PowerShell:
    $env:SUPABASE_SERVICE_ROLE_KEY = "eyJ..."   # from Supabase Dashboard → Settings → API
    node scripts/migrate-json-to-supabase.js

  The anon key cannot bypass RLS insert policies.
`);
    process.exit(1);
  }

  if (!DRY) {
    // Connectivity check
    try {
      const probe = await sb("content_exams?select=id&limit=1");
      console.log("Connected. Sample row present:", Array.isArray(probe) && probe.length > 0);
    } catch (e) {
      console.error("Cannot reach content_exams:", e.message);
      process.exit(1);
    }
  }

  const summary = [];
  for (const src of SOURCES) {
    if (onlyNiveau && src.niveau !== onlyNiveau) continue;
    summary.push({ niveau: src.niveau, ...(await migrateOne(src)) });
  }

  console.log("\n────────────────────────────");
  summary.forEach((s) =>
    console.log(
      `  ${s.niveau}: ${s.inserted}/${s.total} upserted, ${s.skipped} skipped`
    )
  );
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
