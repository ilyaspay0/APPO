/**
 * Supabase server client (service role) — NEVER expose this key to the browser.
 * Env on Vercel:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
const { createClient } = require("@supabase/supabase-js");

let _client = null;

function getServiceClient() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    const err = new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY on the server"
    );
    err.code = "NO_SUPABASE_ENV";
    throw err;
  }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

function getId(req) {
  if (req.query && req.query.id) return String(req.query.id);
  try {
    return new URL(req.url, "http://x").searchParams.get("id");
  } catch (e) {
    return null;
  }
}

function sendJson(res, status, body, cache) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (cache) res.setHeader("Cache-Control", cache);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(body));
}

module.exports = { getServiceClient, getId, sendJson };
