import { checkoutAction } from "@/lib/payments/actions";
import { Check } from "lucide-react";
import { getStripePrices, getStripeProducts } from "@/lib/payments/stripe";
import { SubmitButton } from "./submit-button";

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
    <div className="pt-6 border border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-4xl font-medium text-gray-900 mb-6">
        £{(price / 100).toFixed(2)}
      </p>

      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton />
      </form>
    </div>
  );
}
