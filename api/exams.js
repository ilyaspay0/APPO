const { getServiceClient, sendJson } = require("./_lib/supabase");

module.exports = async (req, res) => {
  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("content_exams")
      .select(
        "id,concours,matiere,annee,n,n_corrected,type,source,cycle,filiere,sort_order"
      )
      .eq("niveau", "bac")
      .order("sort_order", { ascending: true })
      .order("concours", { ascending: true });

    if (error) throw error;

    const meta = (data || []).map((e) => ({
      id: e.id,
      concours: e.concours,
      matiere: e.matiere,
      annee: e.annee,
      n: e.n,
      nCorrected: e.n_corrected,
      type: e.type || "qcm",
      source: e.source || "core",
      cycle: e.cycle || undefined,
      filiere: e.filiere || undefined,
    }));

    return sendJson(
      res,
      200,
      meta,
      "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800"
    );
  } catch (e) {
    console.error("api/exams", e);
    const status = e.code === "NO_SUPABASE_ENV" ? 503 : 500;
    return sendJson(res, status, { error: e.message || "server error" });
  }
};
