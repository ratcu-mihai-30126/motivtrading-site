import { supabase } from "./supabase-client.js";

const STRIPE_PRICE_ID = "price_1TAXMG2MStSyV2hijSFodcKd";
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/4gMbIU8HQ4yBcd601t14402";

async function startCheckout(event) {
  if (event) event.preventDefault();

  if (!STRIPE_PAYMENT_LINK) {
    alert(`Stripe payment link missing.\n\nCurrent Stripe Price ID: ${STRIPE_PRICE_ID}`);
    return;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      window.location.href = "./motivtrading_login.html";
      return;
    }

    const email = user.email || "";
    const separator = STRIPE_PAYMENT_LINK.includes("?") ? "&" : "?";
    const checkoutUrl = `${STRIPE_PAYMENT_LINK}${separator}locked_prefilled_email=${encodeURIComponent(email)}`;

    window.location.href = checkoutUrl;
  } catch (err) {
    console.error("Checkout start failed:", err);
    alert("Could not start checkout. Please refresh the page and try again.");
  }
}

window.startMotivTradingCheckout = startCheckout;

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll('[data-stripe-buy="motivtrading"]')
    .forEach((button) => {
      button.addEventListener("click", startCheckout);
    });
});
