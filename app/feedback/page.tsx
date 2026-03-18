"use client";

import { useState } from "react";
import {
  Star,
  CheckCircle,
  MessageSquare,
  Send,
  ChevronRight,
  HandHeart,
  Zap,
  Link2,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

// ─── Cultural Pillars Data ────────────────────────────────────────────────────
const PILLARS = [
  {
    icon: <HandHeart className="w-6 h-6" />,
    accent: "#7C1D10",
    badge: "Respect",
    title: "Cultural Authenticity",
    question:
      "Did the products and sellers honor Aboriginal culture with authenticity and respect?",
    measures: [
      "Authentic representation",
      "Cultural sensitivity",
      "Traditional knowledge honored",
    ],
  },
  {
    icon: <Zap className="w-6 h-6" />,
    accent: "#5C6D2E",
    badge: "Empowerment",
    title: "Community Support",
    question:
      "Did this purchase empower Aboriginal communities and businesses economically?",
    measures: [
      "Economic impact felt",
      "Community benefit clear",
      "Supporting local artisans",
    ],
  },
  {
    icon: <Link2 className="w-6 h-6" />,
    accent: "#2B5E7E",
    badge: "Connection",
    title: "Cultural Stories",
    question:
      "Did you feel connected to the culture and stories behind the products?",
    measures: [
      "Emotional connection",
      "Understanding the story",
      "Cultural education value",
    ],
  },
  {
    icon: <Award className="w-6 h-6" />,
    accent: "#7A5C1E",
    badge: "Pride",
    title: "Ownership Joy",
    question:
      "Are you proud to own and share these authentic Aboriginal products?",
    measures: [
      "Pride of ownership",
      "Willingness to share / recommend",
      "Value perception",
    ],
  },
];

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ rating }: { rating: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center px-6 py-20 gap-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
        className="w-24 h-24 rounded-full bg-[#5A1E12]/10 flex items-center justify-center"
      >
        <CheckCircle className="w-12 h-12 text-[#5A1E12]" strokeWidth={1.5} />
      </motion.div>

      <div>
        <h2 className="text-3xl font-bold text-[#3b1a08] mb-2">Thank You!</h2>
        <p className="text-base text-[#973c00]/70 max-w-md mx-auto leading-relaxed">
          Your feedback has been received. We read every submission and use it to
          make our platform better for every community member and buyer.
        </p>
      </div>

      <div className="flex gap-2 mt-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={26}
            className={
              s <= rating
                ? "fill-[#973c00] text-[#973c00]"
                : "fill-[#EAD7B7] text-[#EAD7B7]"
            }
          />
        ))}
      </div>

      <motion.a
        href="/"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 inline-flex items-center gap-2 bg-[#440C03] text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#5A1E12] transition-colors"
      >
        Back to Home <ChevronRight className="w-4 h-4" />
      </motion.a>
    </motion.div>
  );
}

// ─── Main Feedback Page ───────────────────────────────────────────────────────
export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setError("Please select a star rating."); return; }
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!comment.trim()) { setError("Please enter your feedback description."); return; }
    if (comment.trim().length < 20) { setError("Feedback description must be at least 20 characters long."); return; }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("https://alpa-be.onrender.com/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          rating: String(rating),
          comment: comment.trim(),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Unable to submit feedback. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[#f3e9dd] min-h-screen">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-[url('/images/main.png')] bg-cover bg-center min-h-[40vh] md:min-h-[50vh] lg:min-h-[65vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 text-center px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-5">
              <MessageSquare className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Share Your Feedback
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Help us grow by telling us how we&apos;re doing. Every voice
              matters — yours shapes the future of MIA Marketplace.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Cultural Pillars Section ── */}
      <div className="bg-[#440C03] py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              The Four Cultural Pillars
            </h2>
            <p className="text-white/60 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Each pillar represents a core value of authentic Aboriginal cultural commerce
            </p>
          </motion.div>

          {/* cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.badge}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
                className="flex flex-col bg-white/08 backdrop-blur-sm border border-white/10 rounded-2xl p-6 gap-4"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              >
                {/* icon + badge */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: pillar.accent }}
                  >
                    {pillar.icon}
                  </div>
                  <span
                    className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ color: pillar.accent, backgroundColor: `${pillar.accent}22` }}
                  >
                    {pillar.badge}
                  </span>
                </div>

                {/* title + question */}
                <div>
                  <h3 className="text-white font-bold text-base leading-snug mb-1.5">
                    {pillar.title}
                  </h3>
                  <p className="text-white/55 text-xs leading-relaxed">
                    {pillar.question}
                  </p>
                </div>

                {/* measures */}
                <div className="mt-auto pt-3 border-t border-white/10">
                  <p className="text-white/35 text-[10px] font-semibold uppercase tracking-widest mb-2">
                    Measures
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {pillar.measures.map((m) => (
                      <li key={m} className="flex items-start gap-1.5 text-white/65 text-xs leading-snug">
                        <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: pillar.accent }} />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Feedback Form ── */}
      <div className="max-w-3xl mx-auto px-4 py-14 md:py-20">
        <AnimatePresence mode="wait">

          {/* ── Success ── */}
          {submitted && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-[#973c00]/10 overflow-hidden"
            >
              <SuccessScreen rating={rating} />
            </motion.div>
          )}

          {/* ── Form ── */}
          {!submitted && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="bg-white rounded-3xl shadow-sm border border-[#973c00]/10 overflow-hidden"
            >
              {/* form header */}
              <div className="bg-[#440C03] px-6 py-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">Your Feedback</p>
                  <p className="text-white/50 text-xs">All fields marked * are required</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-7">

                {/* Star Rating */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-semibold text-[#973c00]/70 uppercase tracking-wider">
                    Overall Rating <span className="text-[#973c00]">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseEnter={() => setHovered(s)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setRating(s)}
                        className="transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-none"
                        aria-label={`Rate ${s} out of 5`}
                      >
                        <Star
                          size={36}
                          className={`transition-colors duration-150 ${
                            s <= (hovered || rating)
                              ? "fill-[#973c00] text-[#973c00]"
                              : "fill-stone-200 text-stone-200"
                          }`}
                        />
                      </button>
                    ))}
                    <AnimatePresence mode="wait">
                      {(hovered || rating) > 0 && (
                        <motion.span
                          key={hovered || rating}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="ml-2 text-sm font-semibold text-[#5A1E12]"
                        >
                          {RATING_LABELS[hovered || rating]}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#973c00]/70 uppercase tracking-wider">
                      Name <span className="text-[#973c00]">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 text-sm rounded-xl border border-[#973c00]/20 bg-[#fdf7f1] text-[#3b1a08] placeholder-[#973c00]/30 outline-none focus:border-[#5A1E12] focus:ring-2 focus:ring-[#5A1E12]/10 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#973c00]/70 uppercase tracking-wider">
                      Email <span className="text-[#973c00]">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 text-sm rounded-xl border border-[#973c00]/20 bg-[#fdf7f1] text-[#3b1a08] placeholder-[#973c00]/30 outline-none focus:border-[#5A1E12] focus:ring-2 focus:ring-[#5A1E12]/10 transition-all"
                    />
                  </div>
                </div>

                {/* Comment */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#973c00]/70 uppercase tracking-wider">
                      Your Feedback <span className="text-[#973c00]">*</span>
                    </label>
                    <span className={`text-xs font-medium ${
                      comment.trim().length >= 20
                        ? 'text-green-600'
                        : comment.trim().length > 0
                        ? 'text-amber-600'
                        : 'text-[#973c00]/50'
                    }`}>
                      {comment.trim().length}/20 min
                    </span>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what went well, what could be better, or anything else on your mind… (minimum 20 characters)"
                    rows={5}
                    className={`w-full px-4 py-3 text-sm rounded-xl border ${
                      comment.trim().length >= 20
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500/10'
                        : comment.trim().length > 0
                        ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500/10'
                        : 'border-[#973c00]/20 focus:border-[#5A1E12] focus:ring-[#5A1E12]/10'
                    } bg-[#fdf7f1] text-[#3b1a08] placeholder-[#973c00]/30 outline-none focus:ring-2 transition-all resize-none leading-relaxed`}
                  />
                  {comment.trim().length > 0 && comment.trim().length < 20 && (
                    <p className="text-xs text-amber-600 mt-1">
                      {20 - comment.trim().length} more characters needed
                    </p>
                  )}
                  {comment.trim().length >= 20 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Minimum requirement met
                    </p>
                  )}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#440C03] hover:bg-[#5A1E12] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition-colors text-sm"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Feedback
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-[#973c00]/40 -mt-3">
                  Your feedback is confidential and used solely to improve our platform.
                </p>

              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
