const EXAMS = require("./_data/exams-full.json");

// Métadonnées uniquement — jamais les questions ni les corrections.
const META = EXAMS.map(e => ({
  id: e.id,
  concours: e.concours,
  matiere: e.matiere,
  annee: e.annee,
  n: e.n,
  nCorrected: e.nCorrected,
  source: e.source || "archive"
}));

module.exports = (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).send(JSON.stringify(META));
};
