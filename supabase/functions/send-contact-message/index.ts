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
    const { name, email, type, message } = await req.json();

    if (!name || !email || !type || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const contactToEmail = Deno.env.get("CONTACT_TO_EMAIL") || "support@motivtrading.com";
    const contactFromEmail = Deno.env.get("CONTACT_FROM_EMAIL") || "MotivTrading <onboarding@resend.dev>";

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY environment variable." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const resend = new Resend(resendApiKey);

    const result = await resend.emails.send({
      from: contactFromEmail,
      to: [contactToEmail],
      replyTo: email,
      subject: `New MotivTrading contact form message — ${type}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
          <h2 style="margin-bottom:16px;">New message from MotivTrading contact form</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Question type:</strong> ${type}</p>
          <p><strong>Message:</strong></p>
          <div style="padding:16px;border:1px solid #e5e7eb;border-radius:12px;white-space:pre-wrap;">${message}</div>
        </div>
      `,
      text: `New message from MotivTrading contact form

Name: ${name}
Email: ${email}
Question type: ${type}

Message:
${message}`
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
