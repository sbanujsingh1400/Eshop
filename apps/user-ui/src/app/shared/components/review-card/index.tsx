// In `components/reviews/ReviewCard.tsx`

import React from 'react';
import Ratings from '../ratings'; // <-- Using your display component

// Type definition for a single review
export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  users: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  
  return (
    // --- Beautified UI ---
    <article className="py-6 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center mb-3">
        {/* Users avatar/initials placeholder */}
        <div className="h-11 w-11 rounded-full bg-slate-100 text-indigo-500 flex items-center justify-center text-lg font-semibold mr-3 shrink-0">
          {review?.users?.name?.charAt(0)?.toUpperCase() || 'A'}
        </div>
        <div>
          <h5 className="text-sm font-semibold text-slate-800">
            {review?.users?.name || 'Anonymous'}
          </h5>
          <div className="text-xs text-slate-500">
            {new Date(review.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>

      {/* Using your existing Ratings component */}
      <div className="flex items-center mb-3">
        <Ratings rating={review?.rating} />
      </div>

      {review?.comment && (
        <div className="text-sm text-slate-700 leading-relaxed space-y-3 prose prose-sm max-w-none">
          {/* Using 'prose' makes it easy to style paragraphs if they exist */}
          <p>{review?.comment}</p>
        </div>
      )}
    </article>
    // --- End Beautified UI ---
  );
};