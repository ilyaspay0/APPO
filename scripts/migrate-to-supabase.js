/**
 * Migrate static JSON banks → Supabase content_exams (source = "core").
 *
 * Usage (from repo root):
 *   npm install
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/migrate-to-supabase.js
 *
 * Options:
 *   --niveau=bac|bac2|bac3|master|all   (default: all)
 *   --dry-run
 *
 * Requires SQL (once) so niveau check includes licence if not already:
 *   ALTER TABLE content_exams DROP CONSTRAINT IF EXISTS content_exams_niveau_check;
 *   ALTER TABLE content_exams ADD CONSTRAINT content_exams_niveau_check
 *     CHECK (niveau IN ('bac','bac2','bac3','master','licence'));
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "api", "_data");

const FILES = {
  bac: "exams-full.json",
  bac2: "bac2-full.json",
  bac3: "bac3-full.json",
  master: "master-full.json",
};

// Known year fixes applied during migration (no redeploy needed later for these)
const YEAR_FIXES = {
  e2db12096cfbf9370cb9d183: "2026", // ENSAM Math was "Lot 3"
};

function loadJson(file) {
  const p = path.join(DATA, file);
  if (!fs.existsSync(p)) {
    console.warn("skip missing", file);
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(p, "utf8"));
  return Array.isArray(raw) ? raw : raw.exams || [];
}

function toRow(exam, niveau, index) {
  const questions = exam.questions || [];
  const n = exam.n || questions.length;
  const nCorrected =
    exam.nCorrected ||
    exam.n_corrected ||
    questions.filter((q) => q.correct || q.answer).length;
  const type =
    exam.type ||
    (questions.some((q) => q.options && q.options.length) ? "qcm" : "libre");
  let annee = YEAR_FIXES[exam.id] || String(exam.annee || "");
  return {
    id: exam.id,
    niveau,
    concours: exam.concours || "Import",
    matiere: exam.matiere || exam.filiere || "",
    annee,
    n,
    n_corrected: nCorrected,
    type,
    source: "core",
    questions,
    cycle: exam.cycle || null,
    filiere: exam.filiere || null,
    sort_order: index,
    updated_at: new Date().toISOString(),
  };
}

async function upsertBatch(sb, rows, dry) {
  if (dry) {
    console.log("  dry-run batch", rows.length, "ex:", rows[0] && rows[0].id);
    return;
  }
  const { error } = await sb.from("content_exams").upsert(rows, {
    onConflict: "id",
  });
  if (error) throw error;
}

async function migrateNiveau(sb, niveau, dry) {
  const file = FILES[niveau];
  const exams = loadJson(file);
  console.log(`\n[${niveau}] ${exams.length} exams from ${file}`);
  const BATCH = 25;
  for (let i = 0; i < exams.length; i += BATCH) {
    const slice = exams.slice(i, i + BATCH).map((e, j) => toRow(e, niveau, i + j));
    await upsertBatch(sb, slice, dry);
    process.stdout.write(`  upserted ${Math.min(i + BATCH, exams.length)}/${exams.length}\r`);
  }
  console.log(`  done ${exams.length}/${exams.length}          `);
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry-run");
  const nivArg = (args.find((a) => a.startsWith("--niveau=")) || "").split("=")[1];
  const niveaux = nivArg && nivArg !== "all" ? [nivArg] : Object.keys(FILES);

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Migration → content_exams", dry ? "(DRY RUN)" : "");
  for (const n of niveaux) {
    if (!FILES[n]) {
      console.warn("unknown niveau", n);
      continue;
    }
    await migrateNiveau(sb, n, dry);
  }
  console.log("\nOK. Fix example (Lot 3 → 2026) already applied in YEAR_FIXES if present.");
  console.log("Verify in Supabase: select count(*), source from content_exams group by source;");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
