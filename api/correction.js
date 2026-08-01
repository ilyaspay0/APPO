const EXAMS = require("./_data/exams-full.json");
const byId = new Map(EXAMS.map(e => [e.id, e]));

module.exports = (req, res) => {
  const id = (req.query && req.query.id) || new URL(req.url, "http://x").searchParams.get("id");
  const exam = id && byId.get(id);
  if (!exam) {
    res.status(404).json({ error: "exam not found" });
    return;
  }
  const corrections = exam.questions.map(q => ({
    correct: q.correct,
    explanation: q.explanation
  }));
  // Pas de cache long ni public agressif sur les corrections : on limite un peu la mise en cache CDN.
  res.setHeader("Cache-Control", "private, max-age=60");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).send(JSON.stringify({ id: exam.id, corrections }));
};
