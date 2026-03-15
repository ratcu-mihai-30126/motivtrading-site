import { supabase } from "./supabase-client.js";

async function checkAccess() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "../motivtrading_login.html";
    return;
  }

  const { data, error } = await supabase
    .from("enrollments")
    .select("course_access")
    .eq("user_id", user.id)
    .eq("course_slug", "motivtrading")
    .maybeSingle();

  if (error || !data || data.course_access !== true) {
    window.location.href = "../account.html";
  }
}

checkAccess();
