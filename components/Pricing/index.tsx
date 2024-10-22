"use client";
import { useState } from "react";
import SectionTitle from "../Common/SectionTitle";
import OfferList from "./OfferList";
import PricingBox from "./PricingBox";
import Link from "next/link";

const Pricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);

  // Define Token Packages
  const tokenPackages = [
    {
      name: "10,000 Tokens",
      amount: 10000,
      price: 100, // £1.00 in pence
      bonus: 0, // No bonus
    },
    {
      name: "110,000 Tokens",
      amount: 110000, // 10,000 + 10% bonus
      price: 1000, // £10.00 in pence
      bonus: 10,
    },
    {
      name: "1,150,000 Tokens",
      amount: 1150000, // 1,000,000 + 15% bonus
      price: 10000, // £100.00 in pence
      bonus: 15,
    },
  ];

  return (
    <section
      id="pricing"
      className="relative px-4 z-[4] py-16 md:py-20 lg:py-28"
    >
      <div className="container">
        <SectionTitle
          title="Simple and Affordable Token Packages"
          paragraph="Choose from a range of token packages that fit your API usage needs. More tokens, more value!"
          center
          width="665px"
        />
        <div className="w-full flex justify-center pb-12 ">
          <div className="shadow-md dark:shadow-white/20 rounded-full py-2 px-4 bg-gradient-to-r from-blue-400 to-red-400  text-neutral-800 dark:text-white w-fit">
            Get <span className="italic">FREE&nbsp;</span>&nbsp;tokens when you <Link href="/sign-up" className="underline italic font-bold">sign up!</Link>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {tokenPackages.map((pkg) => (
            <PricingBox
              key={pkg.name}
              packageName={pkg.name}
              price={`£${pkg.price / 100}`} // Convert pence to pounds
              duration="one-time"
              subtitle={`Get ${pkg.bonus}% bonus with this package`}
            >
              <OfferList
                text={`Receive ${pkg.amount.toLocaleString()} Tokens`}
                status="active"
              />
              <OfferList
                text={`Bonus: ${pkg.bonus}%`}
                status={pkg.bonus ? "active" : "inactive"}
              />
            </PricingBox>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 z-[-1]"></div>
    </section>
  );
};

export default Pricing;
