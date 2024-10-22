import { checkoutAction } from "@/lib/payments/actions";
import { Check } from "lucide-react";
import { getStripePrices, getStripeProducts } from "@/lib/payments/stripe";
import { SubmitButton } from "./submit-button";
import Link from "next/link";

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  // Filter products to only include token packages
  const tokenProducts = products.filter(
    (product) => product.metadata && product.metadata.token_amount
  );

  const tokenPackages = tokenProducts.map((product) => {
    const price = prices.find((price) => price.productId === product.id);

    const tokenAmount = parseInt(product.metadata.token_amount);
    const priceAmount = price?.unitAmount || 0;

    return {
      id: product.id,
      name: product.name,
      price: priceAmount,
      tokenAmount,
      priceId: price?.id,
    };
  });

  // Sort packages by price ascending
  tokenPackages.sort((a, b) => a.price - b.price);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {process.env.NEXT_PUBLIC_FREE_TOKENS && (
        <div className="w-full flex justify-center pb-12 ">
          <div className="rounded-full py-2 px-4 bg-gradient-to-r   text-neutral-800 dark:text-white w-fit">
            Get {process.env.NEXT_PUBLIC_FREE_TOKENS}{" "}
            <span className="italic">FREE&nbsp;</span>&nbsp;tokens when you{" "}
            <Link href="/sign-up" className="underline italic font-bold">
              sign up!
            </Link>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
        {tokenPackages.map((pkg) => (
          <PricingCard
            key={pkg.id}
            name={pkg.name}
            price={pkg.price}
            tokenAmount={pkg.tokenAmount}
            priceId={pkg.priceId}
          />
        ))}
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  tokenAmount,
  priceId,
}: {
  name: string;
  price: number;
  tokenAmount: number;
  priceId?: string;
}) {
  return (
    <div className="pt-6 border border-border shadow-md rounded-lg p-6 bg-card text-card-foreground">
      <h2 className="text-2xl font-medium mb-2">{name}</h2>
      <p className="text-4xl font-medium mb-6">£{(price / 100).toFixed(2)}</p>
      <p className="text-muted-foreground mb-6">{tokenAmount} tokens</p>
      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton />
      </form>
    </div>
  );
}
