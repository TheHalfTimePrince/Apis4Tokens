import { stripe } from "../payments/stripe";

async function deployWebhook(webhookUrl: string) {
  try {
    const webhookEndpoint = await stripe.webhookEndpoints.create({
      enabled_events: ["checkout.session.completed"],
      url: webhookUrl,
    });
    console.log(`Created Stripe webhook endpoint: ${webhookEndpoint.id}`);
  } catch (error) {
    console.error("Error creating Stripe webhook endpoint:", error);
  }
}

if (require.main === module) {
  const webhookUrl = process.argv[2];
  if (!webhookUrl) {
    console.error("Please provide a webhook URL as an argument.");
    process.exit(1);
  }
  deployWebhook(webhookUrl);
}

export { deployWebhook };
