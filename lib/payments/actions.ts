'use server';

import { createCheckoutSession } from './stripe';

export const checkoutAction = async (formData: FormData) => {
  const priceId = formData.get('priceId') as string;
  await createCheckoutSession({priceId});
};
