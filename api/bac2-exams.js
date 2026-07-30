const EXAMS = require("./_data/bac2-full.json");

// Métadonnées uniquement — jamais les questions ni les réponses modèles.
const META = EXAMS.map(e => ({
  id: e.id,
  concours: e.concours,
  matiere: e.matiere,
  annee: e.annee,
  n: e.n,
  type: e.type || "libre",
  source: e.source || "archive"
}));

module.exports = (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).send(JSON.stringify(META));
};
