import { db } from './drizzle';
import { users, apiKeys } from './schema';
import { hashPassword } from '@/lib/auth/session';
import { createApiKey } from '@/lib/db/queries';
import { stripe } from '../payments/stripe';

async function seed() {
  // Create Test User
  const passwordHash = await hashPassword('password123');
  const [testUser] = await db
    .insert(users)
    .values({
      email: 'test@example.com',
      passwordHash,
      role: 'member',
      tokenBalance: 0,
    })
    .returning();

  // Generate API Key for Test User
  const newApiKey = await createApiKey(testUser.id);

  console.log('Test user created with email: test@example.com');
  console.log('API Key:', newApiKey.key);

  // Create Stripe Products


  // Define Token Packages
  const tokenPackages = [
    {
      name: '1,000 Tokens',
      amount: 1000,
      price: 100, // £1.00 in pence
      bonus: 0, // No bonus
    },
    {
      name: '11,000 Tokens',
      amount: 11000, // 10,000 + 10% bonus
      price: 1000, // £10.00 in pence
      bonus: 10,
    },
    {
      name: '115,000 Tokens',
      amount: 115000, // 100,000 + 15% bonus
      price: 10000, // £100.00 in pence
      bonus: 15,
    },
  ];

  for (const pkg of tokenPackages) {
    // Create Product
    const product = await stripe.products.create({
      name: pkg.name,
      description: `${pkg.amount.toLocaleString()} tokens package`,
      metadata: {
        token_amount: pkg.amount.toString(),
      },
    });

    // Create Price
    await stripe.prices.create({
      product: product.id,
      unit_amount: pkg.price,
      currency: 'gbp',
    });

    console.log(`Created Stripe product: ${pkg.name}`);
  }

  try {
    const webhookEndpoint = await stripe.webhookEndpoints.create({
      enabled_events: ['checkout.session.completed'],
      url: `${process.env.BASE_URL}/api/stripe/webhook`,
    });
    console.log(`Created Stripe webhook endpoint: ${webhookEndpoint.id}`);
  } catch (error) {
    console.error('Error creating Stripe webhook endpoint:', error);
  }

}

seed()
  .then(() => {
    console.log('Seeding completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });
