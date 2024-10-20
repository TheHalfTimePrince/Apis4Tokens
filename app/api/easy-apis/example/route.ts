import { NextRequest, NextResponse } from 'next/server';
import { apiTemplate } from '@/lib/easy-api-template';

async function exampleLogic(req: NextRequest) {
  // Your custom logic here
  const message = "Hello from the API!";
  return NextResponse.json({ message }, { status: 200 });
}

export const POST = apiTemplate({
  tokenCost: 100, // Cost of this API call in tokens
  logic: exampleLogic
});