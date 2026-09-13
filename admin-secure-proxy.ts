import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Authentication required" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const adminClient = createClient(supabaseUrl, serviceKey);

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: "Invalid session" }, 401);

  const { data: profile, error: profileError } = await adminClient
    .from("profiles").select("role,status").eq("id", user.id).single();
  if (profileError || profile?.role !== "admin" || profile?.status !== "active") {
    return json({ error: "Administrator access required" }, 403);
  }

  let body: { action?: string; args?: Record<string, unknown> };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const allowed: Record<string, string> = {
    credit_wallet: "admin_credit_wallet",
    debit_wallet: "admin_debit_wallet",
    review_funding: "admin_review_funding",
    review_qard: "admin_review_qard",
    disburse_qard: "admin_disburse_qard",
    review_qard_repayment: "admin_review_qard_repayment",
    set_member_status: "admin_set_member_status",
    issue_member_id: "admin_issue_member_id",
    set_member_transaction_pin: "admin_set_member_transaction_pin",
    set_member_feature_control: "admin_set_member_feature_control",
    post_cooperative_account: "admin_post_cooperative_account",
  };
  const fn = body.action ? allowed[body.action] : undefined;
  if (!fn) return json({ error: "Unsupported admin action" }, 400);

  const { data, error } = await adminClient.rpc(fn, body.args ?? {});
  if (error) return json({ error: error.message }, 400);
  return json({ data });
});
