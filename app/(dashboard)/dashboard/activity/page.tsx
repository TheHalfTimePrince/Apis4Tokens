'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { TokenTransaction } from '@/lib/db/schema';

export default function ActivityPage() {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchTransactions() {
      if (user) {
        try {
          const response = await fetch('/api/transactions');
          if (response.ok) {
            const data = await response.json();
            setTransactions(data);
          } else {
            // Handle errors, e.g., unauthorized
            console.error('Error fetching transactions:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching transactions:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [user]);

  if (!user) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <p className="text-center text-gray-500">
          Please log in to view your transactions.
        </p>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Transaction History
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : transactions.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t">
                    <td className="py-2">
                      {format(new Date(tx.createdAt), 'PPpp')}
                    </td>
                    <td className="py-2 capitalize">{tx.type}</td>
                    <td className="py-2">{tx.amount}</td>
                    <td className="py-2">{tx.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">You have no transactions yet.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
