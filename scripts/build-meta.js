#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "api", "_data");

function metaFrom(fullName, outName) {
  const fullPath = path.join(dataDir, fullName);
  if (!fs.existsSync(fullPath)) {
    console.warn("skip missing", fullName);
    return;
  }
  const exams = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  const meta = exams.map((e) => {
    const m = {
      id: e.id,
      concours: e.concours,
      matiere: e.matiere,
      annee: e.annee,
      n: e.n,
      nCorrected: e.nCorrected || e.n_corrected || 0,
      source: e.source || "archive",
    };
    if (e.type) m.type = e.type;
    if (e.cycle) m.cycle = e.cycle;
    if (e.filiere) m.filiere = e.filiere;
    return m;
  });
  const outPath = path.join(dataDir, outName);
  fs.writeFileSync(outPath, JSON.stringify(meta));
  const fullSize = fs.statSync(fullPath).size;
  const metaSize = fs.statSync(outPath).size;
  console.log(
    outName,
    meta.length,
    "exams |",
    Math.round(fullSize / 1024) + "KB ->",
    Math.round(metaSize / 1024) + "KB"
  );
}

metaFrom("exams-full.json", "exams-meta.json");
metaFrom("bac2-full.json", "bac2-meta.json");
metaFrom("bac3-full.json", "bac3-meta.json");
metaFrom("master-full.json", "master-meta.json");
console.log("done");