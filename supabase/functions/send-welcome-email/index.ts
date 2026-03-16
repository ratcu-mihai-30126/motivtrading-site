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
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:640px;margin:0 auto;">
          <h1 style="margin-bottom:16px;">Welcome to MotivTrading</h1>
          <p>Thank you for joining MotivTrading Academy.</p>
          <p>Your account has been created successfully. You can now sign in and access your profile. If you later purchase the academy, your members area access will unlock automatically for your account.</p>
          <p>We built MotivTrading to help traders develop structure, discipline, and repeatable execution — not random decisions.</p>
          <p style="margin-top:24px;">See you inside,<br><strong>MotivTrading</strong></p>
        </div>
      `,
      text: `Welcome to MotivTrading

Thank you for joining MotivTrading Academy. Your account has been created successfully. You can now sign in and access your profile.

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
