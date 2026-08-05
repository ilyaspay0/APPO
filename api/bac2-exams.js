const { getServiceClient, sendJson } = require("./_lib/supabase");

module.exports = async (req, res) => {
  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("content_exams")
      .select("id,concours,matiere,annee,n,n_corrected,type,source")
      .eq("niveau", "bac2")
      .order("concours", { ascending: true });
    if (error) throw error;
    const meta = (data || []).map((e) => ({
      id: e.id,
      concours: e.concours,
      matiere: e.matiere,
      annee: e.annee,
      n: e.n,
      nCorrected: e.n_corrected,
      type: e.type || "libre",
      source: e.source || "core",
    }));
    return sendJson(
      res,
      200,
      meta,
      "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800"
    );
  } catch (e) {
    console.error("api/bac2-exams", e);
    return sendJson(res, e.code === "NO_SUPABASE_ENV" ? 503 : 500, {
      error: e.message || "server error",
    });
  }
};
