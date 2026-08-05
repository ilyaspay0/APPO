/**
 * GET /api/exams?niveau=bac|bac2|bac3|master|licence
 * Lightweight meta (no questions).
 */
const { getServiceClient, sendJson } = require("../lib/supabase-server");

module.exports = async (req, res) => {
  try {
    let niveau = "bac";
    try {
      niveau =
        (req.query && req.query.niveau) ||
        new URL(req.url, "http://x").searchParams.get("niveau") ||
        "bac";
    } catch (_) {}
    niveau = String(niveau).toLowerCase();
    const allowed = ["bac", "bac2", "bac3", "master", "licence"];
    if (!allowed.includes(niveau)) {
      return sendJson(res, 400, { error: "invalid niveau" });
    }

    const sb = getServiceClient();
    let q = sb
      .from("content_exams")
      .select(
        "id,concours,matiere,annee,n,n_corrected,type,source,cycle,filiere,sort_order"
      )
      .eq("niveau", niveau)
      .order("sort_order", { ascending: true })
      .order("concours", { ascending: true });

    const { data, error } = await q;
    if (error) throw error;

    const meta = (data || []).map((e) => ({
      id: e.id,
      concours: e.concours,
      matiere: e.matiere,
      annee: e.annee,
      n: e.n,
      nCorrected: e.n_corrected,
      type: e.type || (niveau === "bac2" ? "libre" : "qcm"),
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
    return sendJson(res, e.code === "NO_SUPABASE_ENV" ? 503 : 500, {
      error: e.message || "server error",
    });
  }
};
