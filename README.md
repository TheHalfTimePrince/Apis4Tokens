# Next.js APIs for Tokens SaaS Starter

This is a starter template for building an API marketplace using **Next.js**. It includes features for authentication, Stripe integration for payments, documentation page, and a dashboard for users to manage their API Keys and token balance. There is also a helper function to create new API endpoints, simply add the logic and the token cost.

## Features

* Landing Page (/)
* Pricing page connected to Stripe Checkout
* User dashboard for managing API tokens and creating custom endpoints
* Token-based system for API usage
* Email/password authentication with JWTs stored in cookies
* Global middleware to protect routes for logged-in users
* Local middleware for protecting Server Actions or validating Zod schemas
* Activity logging system for tracking API usage and token consumption

## Tech Stack

* **Framework**: [Next.js](https://nextjs.org/)
* **Database**: [Postgres](https://www.postgresql.org/)
* **ORM**: [Drizzle](https://orm.drizzle.team/)
* **Payments**: [Stripe](https://stripe.com/)
* **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

1. Clone the repository:

```bash
`git clone` [https://github.com/yourusername/your-repo-name](https://github.com/yourusername/your-repo-name)
`cd` your-repo-name
pnpm install
```

1. Use the included setup script to create your `.env` file:

```bash
pnpm db\:setup
```

1. Run the database migrations and seed the database with initial data:

```bash
pnpm db\:migrate
pnpm db\:seed
```

1. Start the Next.js development server:

```bash
pnpm dev
```

1. Open [http://localhost:3000](http://localhost:3000) to see the app.

## Creating an API Endpoint

To create a new API endpoint, use the `apiTemplate` function. Here's an example:

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiTemplate } from '@/lib/easy-api-template';

async function exampleLogic(req: NextRequest) {
  const message = "Hello from the API!";
  return NextResponse.json({ message }, { status: 200 });
}

export const POST = apiTemplate({
  tokenCost: 100, // Cost of this API call in tokens`
  logic: exampleLogic,
});
```

This creates a new POST endpoint at `/api/example` that costs 100 tokens per call.

To test the endpoint, create an account and generate an API key from the dashboard. Each account starts with 1000 tokens by default. You can make a request to the endpoint using `curl` like this:


Copy code
```bash
`curl -X POST `[`https://yourdomain.com/api/example`](https://yourdomain.com/api/example)` -H "Authorization: Bearer <YOUR_API_KEY>"`
```

## Add Documentaiton

To add documentation for your new API, create a new markdown file in the `@/contents/docs` folder and explain how to use it.

The token usage will be deducted from the user's balance.

## Testing Payments

To test Stripe payments, use the following test card details:

* **Card Number**: 4242 4242 4242 4242
* **Expiration**: Any future date
* **CVC**: Any 3-digit number

## Going to Production

When you're ready to deploy your API marketplace to production, follow these steps:

### Deploy with Coolify

1. **Push your code to a Git repository**: This can be a public or private repository.
2. **Set up Coolify**: Install [Coolify]() on your server or use Coolify's managed service.
3. **Connect to your Git repository**: Once Coolify is installed, add your repository to Coolify by following the instructions in the platform's dashboard.
4. **Configure environment variables**: Add the necessary environment variables in Coolify's project settings. Make sure to include:
   * `BASE_URL`: Your production domain.
   * `STRIPE_SECRET_KEY`: Your Stripe production secret key.
   * `POSTGRES_URL`: Your production Postgres database URL.
   * `AUTH_SECRET`: A random string (use `openssl rand -base64 32` to generate one).
5. **Set up the database**: Use Coolify's database feature or your own managed Postgres instance. Make sure the database URL matches what’s in your `.env` file.
6. **Run database migrations**: In Coolify's dashboard, open the terminal and run:

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

7. **Deploy the app**: Once everything is set up, click deploy in Coolify, and it will handle the rest.

### Set up the Stripe Webhook

After deployment, set up the Stripe webhook for the production environment. Use the following command:

```bash
pnpm deployWebhook
```

This script will create a webhook and update your `.env` file with the new `STRIPE_WEBHOOK_SECRET`.

## Scripts

* **pnpm db**: Create your `.env` file
* **pnpm db**: Run database migrations
* **pnpm db**: Seed the database with initial data
* **pnpm deployWebhook**: Deploy the Stripe webhook for production


