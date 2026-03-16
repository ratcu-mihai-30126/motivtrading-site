import { supabase } from "./supabase-client.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const messageBox = document.getElementById("message");
const WELCOME_EMAIL_FUNCTION_URL = "https://duinpadqwekrpdcyjvpb.supabase.co/functions/v1/send-welcome-email";

function showMessage(text, type = "info") {
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}


async function sendWelcomeEmail(email) {
  if (!WELCOME_EMAIL_FUNCTION_URL || !email) return;

  try {
    await fetch(WELCOME_EMAIL_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });
  } catch (error) {
    console.error("Welcome email error:", error);
  }
}

function validateInputs() {
  const email = emailInput?.value.trim() || "";
  const password = passwordInput?.value.trim() || "";

  if (!email || !password) {
    showMessage("Please enter both your email address and password.", "error");
    return null;
  }

  return { email, password };
}

async function ensureProfileRow() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) return null;

  const user = userData.user;

  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    showMessage(`Could not check profile: ${selectError.message}`, "error");
    return user;
  }

  if (!existingProfile) {
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email
    });

    if (insertError) {
      showMessage(`Profile creation failed: ${insertError.message}`, "error");
    }
  }

  return user;
}

async function redirectAfterLogin() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    showMessage("Login succeeded, but session could not be verified.", "error");
    return;
  }

  const user = userData.user;

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("course_access")
    .eq("user_id", user.id)
    .eq("course_slug", "motivtrading")
    .maybeSingle();

  if (enrollmentError) {
    showMessage(`Access check failed: ${enrollmentError.message}`, "error");
    return;
  }

  if (!enrollment?.course_access) {
    window.location.href = "./account.html";
    return;
  }

  window.location.href = "./members/dashboard.html";
}

signUpBtn?.addEventListener("click", async () => {
  const values = validateInputs();
  if (!values) return;

  showMessage("Creating your account...", "info");

  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password
  });

  if (error) {
    showMessage(error.message, "error");
    return;
  }

  await ensureProfileRow();
  await sendWelcomeEmail(values.email);

  showMessage(
    "Account created. If email confirmation is enabled, check your inbox before signing in.",
    "success"
  );
});

signInBtn?.addEventListener("click", async () => {
  const values = validateInputs();
  if (!values) return;

  showMessage("Signing you in...", "info");

  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password
  });

  if (error) {
    showMessage(error.message, "error");
    return;
  }

  await ensureProfileRow();
  await redirectAfterLogin();
});

forgotPasswordBtn?.addEventListener("click", async (event) => {
  event.preventDefault();

  const email = emailInput?.value.trim() || "";

  if (!email) {
    showMessage("Enter your email first, then click Forgot password.", "error");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/motivtrading_login.html`
  });

  if (error) {
    showMessage(error.message, "error");
    return;
  }

  showMessage("Password reset email sent. Check your inbox.", "success");
});
