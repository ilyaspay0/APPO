const EXAMS = require("./_data/bac2-full.json");
const byId = new Map(EXAMS.map(e => [e.id, e]));

module.exports = (req, res) => {
  const id = (req.query && req.query.id) || new URL(req.url, "http://x").searchParams.get("id");
  const exam = id && byId.get(id);
  if (!exam) {
    res.status(404).json({ error: "exam not found" });
    return;
  }
  // Jamais la réponse modèle / la lettre correcte ici — uniquement l'énoncé (et les options
  // pour les questions de type QCM). Réponse/correction servies à part par bac2-correction.js.
  const questions = exam.questions.map(q => ({
    num: q.num,
    text: q.text,
    options: q.options || undefined
  }));
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).send(JSON.stringify({
    id: exam.id,
    concours: exam.concours,
    matiere: exam.matiere,
    annee: exam.annee,
    n: exam.n,
    type: exam.type || "libre",
    questions
  }));
};
