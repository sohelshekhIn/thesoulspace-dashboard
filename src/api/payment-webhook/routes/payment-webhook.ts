export default {
  routes: [
    {
      method: "POST",
      path: "/payment-webhook",
      handler: "payment-webhook.paymentWebhook",
    },
  ],
};
