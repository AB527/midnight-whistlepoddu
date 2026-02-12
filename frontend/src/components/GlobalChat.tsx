'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { 
  Send, 
  MessageSquare, 
  Building2,
  Smile,
  Frown,
  Minus,
  Briefcase,
  DollarSign,
  Users,
  TrendingUp,
  MoreHorizontal,
  LogOut
} from 'lucide-react';
import { Review, CompanyData } from '../lib/types';

interface GlobalChatProps {
  companyData: CompanyData;
  userHash: string;
  addLog: (message: string) => void;
  onLogout: () => void;
}
export default function GlobalChat({ 
  companyData, 
  userHash,
  addLog,
  onLogout
}: GlobalChatProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [category, setCategory] = useState<Review['category']>('culture');
  const [sentiment, setSentiment] = useState<Review['sentiment']>('neutral');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('whistle_reviews');
    if (stored) {
      const parsed = JSON.parse(stored);
      setReviews(parsed.map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp)
      })));
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [reviews]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    const review: Review = {
      id: Date.now().toString(),
      company: companyData.companyName,
      content: newReview,
      timestamp: new Date(),
      userHash: userHash.substring(0, 10),
      category,
      sentiment
    };

    const updated = [review, ...reviews];
    setReviews(updated);
    localStorage.setItem('whistle_reviews', JSON.stringify(updated));
    
    addLog(`Review posted anonymously for ${companyData.companyName}`);
    setNewReview('');
  };

  const categoryIcons: Record<Review['category'], any> = {
    culture: Users,
    management: Briefcase,
    compensation: DollarSign,
    worklife: TrendingUp,
    other: MoreHorizontal
  };

  const sentimentColors = {
    positive: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    negative: 'text-red-400 bg-red-400/10 border-red-400/30',
    neutral: 'text-amber-400 bg-amber-400/10 border-amber-400/30'
  };

  const sentimentIcons: Record<Review['sentiment'], any> = {
    positive: Smile,
    negative: Frown,
    neutral: Minus
  };

  return (
    <div className="flex flex-col h-full animate-in">
      <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-white/10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-500/20 rounded-2xl border-2 border-orange-400/30">
            <MessageSquare className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Anonymous Workplace Reviews</h2>
            <p className="text-white/50 text-sm mt-1">Speak truth to power, protected by ZK proofs</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-500/10 border-2 border-emerald-400/30 rounded-full">
            <span className="text-emerald-400 font-bold text-sm">{reviews.length} Reviews</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-2 border-red-400/30 rounded-full text-red-400 hover:bg-red-500/20 transition-all text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20 py-20">
            <MessageSquare className="w-16 h-16" />
            <p className="text-lg font-bold">No reviews yet. Be the first to share!</p>
          </div>
        ) : (
          reviews.map((review) => {
            const CategoryIcon = categoryIcons[review.category];
            const SentimentIcon = sentimentIcons[review.sentiment];
            
            return (
              <div 
                key={review.id}
                className="p-6 bg-white/5 border-2 border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-black text-sm">
                      A
                    </div>
                    <div>
                      <p className="font-black text-white text-lg">Anonymous</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-orange-400" />
                        <p className="text-orange-400 font-bold text-sm">{review.company}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-full border-2 flex items-center gap-2 ${sentimentColors[review.sentiment]}`}>
                      <SentimentIcon className="w-3.5 h-3.5" />
                      <span className="text-xs font-black uppercase">{review.sentiment}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full border-2 border-white/10 bg-white/5 flex items-center gap-2 text-white/60">
                      <CategoryIcon className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold uppercase">{review.category}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-white/80 leading-relaxed mb-4">{review.content}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs text-white/30 font-mono">
                    Hash: {review.userHash}...
                  </span>
                  <span className="text-xs text-white/40">
                    {review.timestamp.toLocaleDateString()} at {review.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Review['category'])}
              className="w-full bg-white/5 border-2 border-white/10 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400/50 transition-all cursor-pointer"
            >
              <option value="culture">Culture</option>
              <option value="management">Management</option>
              <option value="compensation">Compensation</option>
              <option value="worklife">Work-Life Balance</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Sentiment</label>
            <select
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value as Review['sentiment'])}
              className="w-full bg-white/5 border-2 border-white/10 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400/50 transition-all cursor-pointer"
            >
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Share your workplace experience anonymously..."
            className="w-full bg-white/5 border-2 border-white/10 rounded-xl p-4 pr-16 text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400/50 transition-all resize-none h-32"
          />
          <button
            type="submit"
            disabled={!newReview.trim()}
            className="absolute right-3 bottom-3 p-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <p className="text-xs text-white/40 text-center">
          Posted as: <span className="font-bold text-orange-400">Anonymous</span> · 
          <span className="font-bold text-orange-400 ml-1">{companyData.companyName}</span> · 
          Verified by ZK Proof
        </p>
      </form>
    </div>
  );
}
