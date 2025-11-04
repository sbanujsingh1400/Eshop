
'use client'
import { Suspense } from 'react';
import InboxClient from './InboxClient';
// import Loading from './loading'; // Your fallback component

// apps/seller-ui/app/(routes)/dashboard/inbox/loading.tsx


import { Loader2 } from 'lucide-react';

 function Loading() {
  return (
    <div className="w-full h-screen flex flex-col gap-4 items-center justify-center bg-gray-950 text-white">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      <span className="font-semibold">Loading Your Conversations...</span>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<Loading />}>
      <InboxClient />
    </Suspense>
  );
}