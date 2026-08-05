const { getServiceClient, getId, sendJson } = require("./_lib/supabase");

module.exports = async (req, res) => {
  const id = getId(req);
  if (!id) return sendJson(res, 400, { error: "missing id" });
  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("content_exams")
      .select("id,concours,matiere,annee,n,n_corrected,type,questions")
      .eq("id", id)
      .eq("niveau", "bac2")
      .maybeSingle();
    if (error) throw error;
    if (!data) return sendJson(res, 404, { error: "exam not found" });
    const questions = (data.questions || []).map((q) => ({
      num: q.num,
      text: q.text,
      options: q.options || undefined,
    }));
    return sendJson(
      res,
      200,
      {
        id: data.id,
        concours: data.concours,
        matiere: data.matiere,
        annee: data.annee,
        n: data.n,
        type: data.type || "libre",
        questions,
      },
      "public, max-age=300, s-maxage=3600"
    );
  } catch (e) {
    console.error("api/bac2-exam", e);
    return sendJson(res, e.code === "NO_SUPABASE_ENV" ? 503 : 500, {
      error: e.message || "server error",
    });
  }
};
