import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const welcomeFromEmail = Deno.env.get("WELCOME_FROM_EMAIL") || "MotivTrading <onboarding@resend.dev>";

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY environment variable." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const resend = new Resend(resendApiKey);

    const result = await resend.emails.send({
      from: welcomeFromEmail,
      to: [email],
      subject: "Welcome to MotivTrading",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.65;color:#111827;max-width:640px;margin:0 auto;padding:12px 0;">
          <div style="background:#081224;border-radius:20px;padding:36px 32px;border:1px solid #182742;">
            <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(217,184,103,.12);border:1px solid rgba(217,184,103,.28);color:#d9b867;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Welcome to MotivTrading</div>
            <h1 style="margin:18px 0 12px;font-size:34px;line-height:1.1;color:#f8fbff;letter-spacing:-.03em;">Your account is ready.</h1>
            <p style="margin:0 0 16px;color:#cdd8eb;font-size:16px;">Thank you for joining MotivTrading Academy. Your account has been created successfully and you can now explore the platform, review the training structure, and see how the system works before upgrading.</p>
            <p style="margin:0 0 18px;color:#cdd8eb;font-size:16px;">Inside MotivTrading you will learn breakout execution, liquidity concepts, continuation structures, and the risk management principles behind disciplined trading.</p>
            <div style="margin:28px 0 16px;">
              <a href="https://motivtrading.com/motivtrading_start.html" style="display:inline-block;background:linear-gradient(180deg,#f0d18c,#d9b867);color:#0a111e;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:800;">Start Learning</a>
            </div>
            <p style="margin:0 0 10px;color:#cdd8eb;font-size:15px;">Ready to go deeper? The full academy and members area are available here:</p>
            <p style="margin:0 0 20px;"><a href="https://motivtrading.com/motivtrading_start.html#offer" style="color:#f0d18c;text-decoration:none;font-weight:700;">Unlock the full course</a></p>
            <p style="margin:0;color:#8fa2c2;font-size:14px;">You can also return to the main site any time at <a href="https://motivtrading.com" style="color:#f0d18c;text-decoration:none;">motivtrading.com</a>.</p>
          </div>
          <p style="margin:18px 0 0;color:#66758f;font-size:13px;text-align:center;">See you inside,<br><strong style="color:#111827;">MotivTrading</strong></p>
        </div>
      `,
      text: `Welcome to MotivTrading

Your account is ready.

Thank you for joining MotivTrading Academy. You can now explore the platform, review the training structure, and see how the system works.

Start here: https://motivtrading.com/motivtrading_start.html

Ready to go deeper? Unlock the full course here: https://motivtrading.com/motivtrading_start.html#offer

Main site: https://motivtrading.com

See you inside,
MotivTrading`
    });

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Unexpected error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
