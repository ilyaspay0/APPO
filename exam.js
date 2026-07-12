const EXAMS = require("./_data/exams-full.json");
const byId = new Map(EXAMS.map(e => [e.id, e]));

module.exports = (req, res) => {
  const id = (req.query && req.query.id) || new URL(req.url, "http://x").searchParams.get("id");
  const exam = id && byId.get(id);
  if (!exam) {
    res.status(404).json({ error: "exam not found" });
    return;
  }
  // On ne renvoie JAMAIS correct/explanation ici — uniquement l'énoncé, les options,
  // et un simple booléen indiquant si une correction existe (sans la révéler).
  const questions = exam.questions.map(q => ({
    num: q.num,
    text: q.text,
    options: q.options,
    hasCorrection: !!q.correct
  }));
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).send(JSON.stringify({
    id: exam.id,
    concours: exam.concours,
    matiere: exam.matiere,
    annee: exam.annee,
    n: exam.n,
    nCorrected: exam.nCorrected,
    questions
  }));
};
