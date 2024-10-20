
import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { User, users, tokenTransactions } from '@/lib/db/schema';
import { getUser, getUserById } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { sql, eq } from 'drizzle-orm';
import { addTokens } from '@/lib/db/queries';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Function to create a checkout session for purchasing tokens
export async function createCheckoutSession({
  priceId,
}: {
  priceId: string;
}) {
  const user = await getUser();

  if (!user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer_email: user.email,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
  });

  redirect(session.url!);
}

// Function to handle successful payments and update the user's token balance
export async function handlePaymentSuccess(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product'],
  });

  const userId = parseInt(session.client_reference_id || '0');
  if (!userId) {
    console.error('Invalid client reference ID');
    return;
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    console.error('User not found for ID:', userId);
    return;
  }

  // Calculate tokens purchased based on the price ID
  // Assuming you have a mapping between price IDs and token amounts
  const lineItem = session.line_items?.data[0];
  const price = lineItem?.price;

  if (!price) {
    console.error('Price not found in session');
    return;
  }

  // Define your token amounts per price ID
  const tokenAmounts: Record<string, number> = {
    'price_1': 100, // Example: 'price_1' corresponds to 100 tokens
    'price_2': 500,
    'price_3': 1000,
  };

  const tokensPurchased = tokenAmounts[price.id] || 0;

  if (tokensPurchased === 0) {
    console.error('No token amount found for price ID:', price.id);
    return;
  }

  // Update user's token balance
  await db.transaction(async (tx: any) => {
    await tx
      .update(users)
      .set({
        tokenBalance: sql`${users.tokenBalance} + ${tokensPurchased}`,
      })
      .where(eq(users.id, userId));

    // Record the token transaction
    await tx.insert(tokenTransactions).values({
      userId: userId,
      amount: tokensPurchased,
      type: 'purchase',
      description: 'Token purchase via Stripe',
      createdAt: new Date(),
    });
  });
}

// Function to get Stripe prices for one-time payments
export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'one_time',
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    productName:
      typeof price.product === 'string' ? '' : "Tokens",
    // No recurring properties since it's a one-time payment
  }));
}

// Function to get Stripe products
export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price'],
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    metadata: product.metadata,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id,
  }));
}
// In lib/payments/stripe.ts


 // Function to add tokens to user's balance

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.client_reference_id;
  if (!userId) {
    console.error('No client_reference_id in session');
    return;
  }

  const user = await getUserById(parseInt(userId));
  if (!user) {
    console.error('User not found for client_reference_id:', userId);
    return;
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

  let totalTokens = 0;

  for (const item of lineItems.data) {
    const priceId = item.price?.id;
    const quantity = item.quantity || 1;
    if (priceId) {
      const price = await stripe.prices.retrieve(priceId, {
        expand: ['product'],
      });

      const tokenAmount = parseInt(
        (price.product as Stripe.Product)?.metadata?.token_amount || '0'
      );
      if (tokenAmount > 0) {
        totalTokens += tokenAmount * quantity;
      } else {
        console.error(
          'No token_amount metadata on product for price:',
          priceId
        );
      }
    }
  }

  if (totalTokens > 0) {
    // Add tokens to the user's balance
    await addTokens(user.id, totalTokens, 'Token purchase via Stripe');
  } else {
    console.error('No tokens to add for session:', session.id);
  }
}
