// In `components/reviews/ProductReviews.tsx`
'use client';

import React from 'react';
import { ReviewForm } from '../review-form'; // Adjusted path
import { ReviewCard } from '../review-card'; // Adjusted path
import { MessageSquareDashed } from 'lucide-react'; // Icon for empty state

// Type definition for a single review
export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userId:string,
  users: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

// Type definition for the currently logged-in user
export type CurrentUser = {
  id: string;
  name: string | null;
};

interface ProductReviewsProps {
  productTitle: string;
  productId: string;
  reviews: Review[];
  currentUser: CurrentUser | null;
  onReviewSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  onReviewDelete: (reviewId: string) => Promise<void>;
  isSubmitting: boolean;
  
}

export const ProductReviews = ({
  productTitle,
  productId,
  reviews,
  currentUser,
  onReviewSubmit,
  onReviewDelete,
  isSubmitting,
}: ProductReviewsProps) => {
    // console.log(reviews)
    // console.log(currentUser)
  const userReview =
    reviews.find((r) => r?.userId === currentUser?.id) || null;

  const otherReviews = reviews.filter(
    (r) => r?.userId!== currentUser?.id
  );
// console.log(userReview)
  const handleFormSubmit = async (data: { rating: number; comment: string }) => {

    await onReviewSubmit(data);
  };

  const handleFormDelete = async () => {
    if (!userReview) return;
    await onReviewDelete(userReview.id);
  };

  // --- Beautified Render Logic ---
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
      {/* Column 1: Review Form (Sticky) */}
      <div className="lg:w-1/3 w-full lg:sticky lg:top-24 self-start">
        {currentUser ? (
          <ReviewForm
            existingReview={null}
            onSubmit={handleFormSubmit}
            onDelete={handleFormDelete}
            isSubmitting={isSubmitting}
          />
        ) : (
          // Beautified logged-out state
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 text-center">
            <h5 className="text-lg font-semibold text-slate-800 mb-2">
              Want to share your thoughts?
            </h5>
            <p className="text-slate-600">
              Please{' '}
              <a
                href="/login" // Or use Next.js <Link>
                className="font-semibold text-blue-600 hover:underline"
              >
                log in
              </a>{' '}
              to write a review.
            </p>
          </div>
        )}
      </div>

      {/* Column 2: Review List (Scrollable) */}
      <div className="lg:w-2/3 w-full h-[30vh] overflow-y-scroll p-3">
        <h4 className="text-xl font-bold text-slate-900 pb-5 mb-1 border-b border-slate-200">
          All Reviews{' '}
          <span className="text-base font-medium text-slate-500">
            ({reviews.length})
          </span>
        </h4>

        {/* Beautified scrollable container */}
        <div
          className="relative max-h-[80vh] overflow-y-auto -mr-2 pr-4 space-y-4 
                     scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
        >
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewCard key={review?.id} review={review} />
            ))
          ) : (
            // Beautified "empty" state
            <div className="flex flex-col items-center justify-center text-center py-24 text-slate-500">
              <MessageSquareDashed size={48} className="text-slate-300 mb-4" />
              <span className="text-lg font-semibold text-slate-700">
                No Reviews Yet
              </span>
              <span className="text-sm">
                Be the first to share your thoughts!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};