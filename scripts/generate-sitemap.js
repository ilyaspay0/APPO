#!/usr/bin/env node
/**
 * Generate a fuller sitemap from exam metadata.
 *   node scripts/generate-sitemap.js
 *
 * Note: hash URLs are a temporary bridge. Long-term, use path-based routes
 * (/concours/ENSA, /exam/:id) with server fallback to index.html for SEO.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const META_SOURCES = [
  path.join(ROOT, "api", "_data", "exams-full.json"),
];

const BASE = "https://suprepa.com";

function loadMeta() {
  const exams = [];
  for (const fp of META_SOURCES) {
    if (!fs.existsSync(fp)) continue;
    const data = JSON.parse(fs.readFileSync(fp, "utf8"));
    data.forEach((e) => {
      exams.push({
        id: e.id,
        concours: e.concours,
        matiere: e.matiere,
        source: e.source || "archive",
      });
    });
  }
  return exams;
}

function urlEntry(loc, priority, changefreq) {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function main() {
  const exams = loadMeta();
  const concours = [...new Set(exams.filter((e) => e.source !== "suprepa").map((e) => e.concours))].sort();
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

  // Cap matière pages to keep sitemap reasonable
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

main();
