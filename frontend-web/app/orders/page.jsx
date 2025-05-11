'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import OrdersPageContent from './OrdersPageContent';

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading orders...</div>}>
      <OrdersPageContent />
    </Suspense>
  );
}
