'use client';
import { Suspense } from 'react';
import WishList from './WishList';


export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    }>
      <WishList />
    </Suspense>
  );
}
