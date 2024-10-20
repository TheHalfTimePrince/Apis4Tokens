import { NextResponse } from 'next/server';
import { getUser, getUserTransactions } from '@/lib/db/queries';

export async function GET(request: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const transactions = await getUserTransactions(user.id);

  return NextResponse.json(transactions);
}
