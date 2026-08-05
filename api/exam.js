/**
 * GET /api/exam?id=...
 * Any niveau. No correct/explanation in payload.
 */
const { getServiceClient, getId, sendJson } = require("../lib/supabase-server");

module.exports = async (req, res) => {
  const id = getId(req);
  if (!id) return sendJson(res, 400, { error: "missing id" });

  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("content_exams")
      .select(
        "id,niveau,concours,matiere,annee,n,n_corrected,type,cycle,filiere,questions"
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return sendJson(res, 404, { error: "exam not found" });

    const questions = (data.questions || []).map((q) => ({
      num: q.num,
      text: q.text,
      options: q.options || undefined,
      hasCorrection: !!(q.correct || q.answer),
    }));

    return sendJson(
      res,
      200,
      {
        id: data.id,
        niveau: data.niveau,
        concours: data.concours,
        matiere: data.matiere,
        annee: data.annee,
        n: data.n,
        nCorrected: data.n_corrected,
        type: data.type || "qcm",
        cycle: data.cycle || undefined,
        filiere: data.filiere || undefined,
        questions,
      },
      "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
    );
  } catch (e) {
    console.error("api/exam", e);
    return sendJson(res, e.code === "NO_SUPABASE_ENV" ? 503 : 500, {
      error: e.message || "server error",
    });
  }
};
