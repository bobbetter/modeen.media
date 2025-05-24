import * as React from "react";
import { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe("pk_test_123");

export default function Checkout() {
  const fetchClientSecret = useCallback(() => {

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');

    return fetch("/create-checkout-session", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'productId' : productId})
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched clientSecret:", data.clientSecret); 
        return data.clientSecret; // MUST return string only
      });
  }, []);

  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
