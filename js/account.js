import { supabase } from "./supabase-client.js";

const emailEl = document.getElementById("accountEmail");
const statusEl = document.getElementById("accountStatus");
const accessBadgeEl = document.getElementById("accessBadge");
const accessCopyEl = document.getElementById("accessCopy");
const primaryAction = document.getElementById("primaryAction");
const secondaryAction = document.getElementById("secondaryAction");
const buyNowBtn = document.getElementById("buyNowBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loadingState = document.getElementById("accountLoading");
const accountContent = document.getElementById("accountContent");

function setLoading(done = false) {
  if (loadingState) loadingState.style.display = done ? "none" : "block";
  if (accountContent) accountContent.style.display = done ? "grid" : "none";
}

function setAccountState({ email = "Not available", paid = false }) {
  if (emailEl) emailEl.textContent = email;
  if (statusEl) statusEl.textContent = paid ? "Paid member" : "Free account";
  if (accessBadgeEl) {
    accessBadgeEl.textContent = paid ? "Active access" : "No course access yet";
    accessBadgeEl.className = `status-chip ${paid ? "active" : "inactive"}`;
  }
  if (accessCopyEl) {
    accessCopyEl.textContent = paid
      ? "Your MotivTrading access is active. You can go straight into the members dashboard."
      : "Your account is active, but this email does not have paid course access yet. Use the Buy course button below to continue to Stripe checkout.";
  }
  if (primaryAction) {
    primaryAction.textContent = paid ? "Open dashboard" : "View course page";
    primaryAction.href = paid ? "./members/dashboard.html" : "./motivtrading_start.html";
  }
  if (secondaryAction) {
    secondaryAction.textContent = paid ? "Back to main site" : "Go to login";
    secondaryAction.href = paid ? "./index.html" : "./motivtrading_login.html";
  }
  if (buyNowBtn) {
    buyNowBtn.style.display = paid ? "none" : "inline-flex";
  }
}

async function loadAccount() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    window.location.replace("./motivtrading_login.html");
    return;
  }

  const user = userData.user;
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("course_access")
    .eq("user_id", user.id)
    .eq("course_slug", "motivtrading")
    .maybeSingle();

  setAccountState({
    email: user.email || "Unknown email",
    paid: !!enrollment?.course_access
  });

  setLoading(true);
}

logoutBtn?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "./index.html";
});

loadAccount();
