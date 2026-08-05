#!/usr/bin/env node
/**
 * Generate a fuller sitemap from exam metadata (Supabase content_exams).
 *   node scripts/generate-sitemap.js
 *
 * Falls back to /data/exams-meta.json or api list shape if Supabase is down.
 *
 * Note: hash URLs are a temporary bridge. Long-term, use path-based routes
 * (/concours/ENSA, /exam/:id) with server fallback to index.html for SEO.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BASE = "https://suprepa.com";
const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  "https://pxlmtyhwqmbqenyytgos.supabase.co"
).replace(/\/$/, "");
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_6eCvwSzX4P4UK6n2SuVOrA_F60J1ZVO";

async function loadFromSupabase() {
  const exams = [];
  let offset = 0;
  const page = 1000;
  for (;;) {
    const url =
      SUPABASE_URL +
      "/rest/v1/content_exams?select=id,concours,matiere,source,niveau&niveau=eq.bac&offset=" +
      offset +
      "&limit=" +
      page;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
      },
    });
    if (!res.ok) throw new Error("Supabase " + res.status);
    const rows = await res.json();
    rows.forEach((e) => {
      exams.push({
        id: e.id,
        concours: e.concours,
        matiere: e.matiere,
        source: e.source || "archive",
      });
    });
    if (rows.length < page) break;
    offset += page;
  }
  return exams;
}

function loadFromLocalMeta() {
  const candidates = [
    path.join(ROOT, "data", "exams-meta.json"),
    path.join(ROOT, "api", "_data", "exams-meta.json"),
  ];
  for (const fp of candidates) {
    if (!fs.existsSync(fp)) continue;
    const data = JSON.parse(fs.readFileSync(fp, "utf8"));
    return data.map((e) => ({
      id: e.id,
      concours: e.concours,
      matiere: e.matiere,
      source: e.source || "archive",
    }));
  }
  return [];
}

async function loadMeta() {
  try {
    const exams = await loadFromSupabase();
    if (exams.length) {
      console.log(`Loaded ${exams.length} bac exams from Supabase`);
      return exams;
    }
  } catch (e) {
    console.warn("Supabase meta failed:", e.message);
  }
  const local = loadFromLocalMeta();
  console.log(`Loaded ${local.length} exams from local meta fallback`);
  return local;
}

function urlEntry(loc, priority, changefreq) {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function main() {
  const exams = await loadMeta();
  const concours = [
    ...new Set(
      exams.filter((e) => e.source !== "suprepa").map((e) => e.concours)
    ),
  ].sort();
  const pairs = new Map();
  exams
    .filter((e) => e.source !== "suprepa")
    .forEach((e) => {
      pairs.set(`${e.concours}||${e.matiere}`, e);
    });

  const urls = [
    urlEntry(`${BASE}/`, "1.0", "weekly"),
    urlEntry(`${BASE}/#/concours`, "0.9", "weekly"),
    urlEntry(`${BASE}/#/inedit`, "0.8", "weekly"),
    urlEntry(`${BASE}/#/bac2`, "0.8", "weekly"),
    urlEntry(`${BASE}/#/bac3`, "0.8", "weekly"),
    urlEntry(`${BASE}/#/master`, "0.8", "weekly"),
  ];

  concours.forEach((c) => {
    urls.push(
      urlEntry(
        `${BASE}/#/concours/${encodeURIComponent(c)}`,
        "0.85",
        "weekly"
      )
    );
  });

  let matCount = 0;
  for (const key of pairs.keys()) {
    if (matCount >= 80) break;
    const [c, m] = key.split("||");
    urls.push(
      urlEntry(
        `${BASE}/#/concours/${encodeURIComponent(c)}/${encodeURIComponent(m)}`,
        "0.7",
        "monthly"
      )
    );
    matCount++;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

  const out = path.join(ROOT, "sitemap.xml");
  fs.writeFileSync(out, xml);
  console.log(`Wrote ${urls.length} URLs → sitemap.xml`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
