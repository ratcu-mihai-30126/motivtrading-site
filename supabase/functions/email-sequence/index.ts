// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EnrollmentRow = {
  id: string;
  email: string;
  created_at: string;
  sequence_step: number;
  purchased: boolean;
};

function email2Html() {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
      <h2>Why most traders never make money</h2>
      <p>Most traders fail for one reason: they do not understand structure.</p>
      <p>They enter randomly, chase moves, and get trapped. This is exactly what I did for years.</p>
      <p>Inside the full system, I break down:</p>
      <ul>
        <li>how to read the market</li>
        <li>how to avoid fake breakouts</li>
        <li>how to trade with logic</li>
      </ul>
      <p>Tomorrow I’ll show you the setup that changed everything.</p>
      <p>- MotivTrading</p>
    </div>
  `;
}

function email3Html(courseUrl: string) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
      <h2>The setup that changed everything</h2>
      <p>One setup changed everything for me:</p>
      <p><strong>Breakout + structure + confirmation.</strong></p>
      <p>This is where most beginners fail: they enter too early.</p>
      <p>Inside the full system, I show:</p>
      <ul>
        <li>exact entries</li>
        <li>stop loss placement</li>
        <li>risk to reward logic</li>
      </ul>
      <p>
        <a href="${courseUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
          See the full system
        </a>
      </p>
      <p>- MotivTrading</p>
    </div>
  `;
}

function email4Html(courseUrl: string) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
      <h2>Full system access</h2>
      <p>You’ve seen how the system works. Now it’s your decision.</p>
      <p>The full MotivTrading system includes:</p>
      <ul>
        <li>all setups</li>
        <li>execution rules</li>
        <li>psychology module</li>
        <li>real trade examples</li>
      </ul>
      <p>Early price: <strong>$199</strong></p>
      <p>
        <a href="${courseUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
          Access the full course
        </a>
      </p>
      <p>If you're serious, this is your moment.</p>
      <p>- MotivTrading</p>
    </div>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL")!;
    const courseUrl = Deno.env.get("COURSE_URL")!;

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const resend = new Resend(resendApiKey);

    // pull candidates who are still in the sequence and have not purchased
    const { data: rows, error } = await supabase
      .from("enrollments")
      .select("id,email,created_at,sequence_step,purchased")
      .eq("guide_sent", true)
      .eq("purchased", false)
      .lt("sequence_step", 3);

    if (error) {
      throw error;
    }

    const now = Date.now();
    let processed = 0;

    for (const row of (rows ?? []) as EnrollmentRow[]) {
      const createdAt = new Date(row.created_at).getTime();
      const ageHours = (now - createdAt) / (1000 * 60 * 60);

      let nextStep: number | null = null;
      let subject = "";
      let html = "";

      if (row.sequence_step === 0 && ageHours >= 24) {
        nextStep = 1;
        subject = "Why most traders never make money";
        html = email2Html();
      } else if (row.sequence_step === 1 && ageHours >= 48) {
        nextStep = 2;
        subject = "The setup that changed everything";
        html = email3Html(courseUrl);
      } else if (row.sequence_step === 2 && ageHours >= 72) {
        nextStep = 3;
        subject = "Full system access";
        html = email4Html(courseUrl);
      }

      if (nextStep === null) continue;

      const sendResult = await resend.emails.send({
        from: resendFromEmail,
        to: [row.email],
        subject,
        html,
      });

      if ((sendResult as any)?.error) {
        console.error("Resend error for", row.email, (sendResult as any).error);
        continue;
      }

      const { error: updateError } = await supabase
        .from("enrollments")
        .update({
          sequence_step: nextStep,
          last_email_sent_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (updateError) {
        console.error("Update error for", row.email, updateError);
        continue;
      }

      processed++;
    }

    return new Response(JSON.stringify({ ok: true, processed }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});