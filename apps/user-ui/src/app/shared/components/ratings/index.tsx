// In `components/reviews/StarInput.tsx`
'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarInputProps {
  rating: number;
  setRating?: (rating: number) => void;
}

 const Ratings = ({ rating, setRating }: StarInputProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => {
        const ratingValue = i + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            className={`
              h-8 w-8 transition-colors duration-150
              ${
                ratingValue <= (hoverRating || rating)
                  ? 'text-yellow-400'
                  : 'text-slate-300'
              }
            `}
            onClick={() => setRating && setRating(ratingValue)}
            onMouseEnter={() =>setRating && setHoverRating(ratingValue)}
            onMouseLeave={() =>setRating && setHoverRating(0)}
          >
            <Star size={24} fill="currentColor" />
          </button>
        );
      })}
    </div>
  );
};

export default Ratings;