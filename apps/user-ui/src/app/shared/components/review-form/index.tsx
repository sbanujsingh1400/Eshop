// In `components/reviews/ReviewForm.tsx`
'use client';

import React, { useState, useEffect } from 'react';
import Ratings from '../ratings';
// import { StarInput } from './StarInput'; // <-- IMPORTING THE INPUT COMPONENT

// Type definition for a single review
export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userId:string
  users: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

interface ReviewFormProps {
  existingReview: Review | null;
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  isSubmitting: boolean;
}

export const ReviewForm = ({
  existingReview,
  onSubmit,
  onDelete,
  isSubmitting,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync form state (no changes to logic)
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
  }, [existingReview]);

  // Submit handler (no changes to logic)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError(null);
    await onSubmit({ rating, comment });
  };

  // Delete handler (no changes to logic)
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your review?')) {
      await onDelete();
    }
  };

  return (
    // --- Beautified UI ---
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 md:p-8">
      <h4 className="text-xl font-bold text-slate-900 mb-6">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h4>
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your Rating
            </label>
            {/* --- Using the correct StarInput component --- */}
            <Ratings rating={rating} setRating={setRating} />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Your Review
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={5}
              className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike?"
            />
          </div>
          <div className="flex justify-between items-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 py-2.5 px-7 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
            >
              {isSubmitting
                ? 'Submitting...'
                : existingReview
                ? 'Update Review'
                : 'Submit Review'}
            </button>
            {existingReview && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDelete}
                className="inline-flex justify-center rounded-lg text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50/70 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
    // --- End Beautified UI ---
  );
};