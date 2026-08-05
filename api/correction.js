/**
 * GET /api/correction?id=...
 * Returns corrections + answers (bac2 libre uses answers).
 */
const { getServiceClient, getId, sendJson } = require("../lib/supabase-server");

module.exports = async (req, res) => {
  const id = getId(req);
  if (!id) return sendJson(res, 400, { error: "missing id" });

  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("content_exams")
      .select("id,niveau,questions")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return sendJson(res, 404, { error: "exam not found" });

    const corrections = (data.questions || []).map((q) => ({
      correct: q.correct || null,
      explanation: q.explanation || null,
      answer: q.answer || null,
    }));

    return sendJson(
      res,
      200,
      {
        id: data.id,
        corrections,
        answers: corrections, // bac2 / master libre clients
      },
      "private, max-age=60"
    );
  } catch (e) {
    console.error("api/correction", e);
    return sendJson(res, e.code === "NO_SUPABASE_ENV" ? 503 : 500, {
      error: e.message || "server error",
    });
  }
};
