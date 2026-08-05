const { getServiceClient, getId, sendJson } = require("./_lib/supabase");

module.exports = async (req, res) => {
  const id = getId(req);
  if (!id) return sendJson(res, 400, { error: "missing id" });
  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("content_exams")
      .select("id,questions")
      .eq("id", id)
      .eq("niveau", "bac2")
      .maybeSingle();
    if (error) throw error;
    if (!data) return sendJson(res, 404, { error: "exam not found" });
    const answers = (data.questions || []).map((q) => ({
      answer: q.answer || null,
      explanation: q.explanation || null,
      correct: q.correct || null,
    }));
    return sendJson(res, 200, { id: data.id, answers }, "private, max-age=60");
  } catch (e) {
    console.error("api/bac2-correction", e);
    return sendJson(res, e.code === "NO_SUPABASE_ENV" ? 503 : 500, {
      error: e.message || "server error",
    });
  }
};
