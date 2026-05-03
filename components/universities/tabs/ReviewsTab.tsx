"use client";

import { UniversityDetails } from "@/types/universityDetails";
import { Star } from "lucide-react";

interface Props {
  university: UniversityDetails;
}

export default function ReviewsTab({ university }: Props) {
  const { reviewsList, rating } = university;

  if (!reviewsList || reviewsList.length === 0) {
    return (
      <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl animate-in fade-in slide-in-from-bottom-4">
        <Star size={48} className="mx-auto text-textSecondary mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-white mb-2">No reviews yet</h3>
        <p className="text-textSecondary">Be the first to review {university.name}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Aggregate Score */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="text-6xl font-black text-white mb-2">{rating?.toFixed(1) || "0.0"}</div>
          <div className="flex text-yellow-500 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={20} className={(rating || 0) >= star ? "fill-yellow-500" : "opacity-30"} />
            ))}
          </div>
          <div className="text-sm text-textSecondary">{reviewsList.length} reviews</div>
        </div>

        <div className="flex-grow w-full space-y-3">
          {/* Mock category averages based on the first review for demo purposes */}
          {[
            { label: "Academics", score: 4.8 },
            { label: "Infrastructure", score: 4.2 },
            { label: "Placements", score: 4.6 },
            { label: "Faculty", score: 4.7 },
            { label: "Campus Life", score: 4.0 },
          ].map((cat, idx) => (
            <div key={idx} className="flex items-center text-sm">
              <span className="w-32 text-textSecondary shrink-0">{cat.label}</span>
              <div className="flex-grow bg-white/10 h-2 rounded-full mx-4 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: `${(cat.score / 5) * 100}%` }}></div>
              </div>
              <span className="w-8 text-right font-medium text-white">{cat.score.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold text-white">Student Reviews</h3>
          <button className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">
            Write a Review
          </button>
        </div>

        {reviewsList.map((review) => (
          <div key={review.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {review.authorName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white">{review.authorName}</h4>
                  <div className="text-xs text-textSecondary">
                    {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded-lg">
                <span className="text-yellow-500 font-bold text-sm mr-1">{review.rating.toFixed(1)}</span>
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
              </div>
            </div>

            <p className="text-textSecondary text-sm leading-relaxed mb-4">
              {review.comment}
            </p>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
              <div className="text-xs text-textSecondary">Academics: <span className="text-white font-medium">{review.categories.academics}</span></div>
              <div className="text-xs text-textSecondary">Infrastructure: <span className="text-white font-medium">{review.categories.infrastructure}</span></div>
              <div className="text-xs text-textSecondary">Placements: <span className="text-white font-medium">{review.categories.placements}</span></div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
