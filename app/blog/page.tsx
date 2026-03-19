"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ─────────────────────────────────────────────
// Blog post data
// ─────────────────────────────────────────────
const ALL_BLOG_POSTS = [
  {
    title: "Understanding Yolŋu Art: Symbols, Stories & Sacred Meaning",
    excerpt:
      "Every dot, line, and colour in Yolŋu art carries generations of knowledge. We explore the visual language behind some of our most celebrated works.",
    tags: ["Culture", "Art"],
    readTime: "5 min read",
    date: "12 Mar 2026",
    cta: "Read the story",
    image: "/images/about2.png",
    href: "/blog/yolngu-art-symbols",
    featured: true,
  },
  {
    title: "From Arnhem Land to Your Doorstep: How We Ship with Care",
    excerpt:
      "Sending fragile, handcrafted pieces across Australia isn't simple. Here's how our fulfilment team ensures every order arrives safely and on time.",
    tags: ["Delivery", "Behind the Scenes"],
    readTime: "4 min read",
    date: "28 Feb 2026",
    cta: "Learn how we do it",
    image: "/images/about-us-what-we-offer.jpg",
    href: "/blog/how-we-ship",
    featured: false,
  },
  {
    title: "Meet the Makers: Spotlight on Three Aboriginal Artists",
    excerpt:
      "We sat down with three creators from our seller community to hear their stories, their craft, and what inspires their most iconic pieces.",
    tags: ["Makers", "Community"],
    readTime: "6 min read",
    date: "15 Feb 2026",
    cta: "Meet the artists",
    image: "/images/main.png",
    href: "/blog/meet-the-makers",
    featured: false,
  },
  {
    title: "The Significance of Bark Painting in Yolŋu Ceremony",
    excerpt:
      "Bark paintings are far more than decorative artworks — they are sacred maps, ancestral records, and living connections to Country. Discover their deeper meaning.",
    tags: ["Culture", "Art"],
    readTime: "7 min read",
    date: "5 Feb 2026",
    cta: "Explore the tradition",
    image: "/images/about2.png",
    href: "/blog/bark-painting-ceremony",
    featured: false,
  },
  {
    title: "How to Identify Authentic Aboriginal Art When You Shop",
    excerpt:
      "With the rise of inauthentic replicas, knowing how to recognise genuine Aboriginal artwork is more important than ever. Here's your practical guide.",
    tags: ["Art", "Guide"],
    readTime: "5 min read",
    date: "22 Jan 2026",
    cta: "Read the guide",
    image: "/images/about-us-what-we-offer.jpg",
    href: "/blog/identify-authentic-art",
    featured: false,
  },
  {
    title: "The Didgeridoo: Voice of the Ancestors",
    excerpt:
      "One of the world's oldest musical instruments, the didgeridoo carries ceremony, healing, and story within every breath. We trace its origins and its makers.",
    tags: ["Culture", "Music"],
    readTime: "4 min read",
    date: "10 Jan 2026",
    cta: "Listen to the story",
    image: "/images/main.png",
    href: "/blog/didgeridoo-voice-of-ancestors",
    featured: false,
  },
  {
    title: "Sustainable Packaging: Our Journey Toward Zero Waste",
    excerpt:
      "We've been quietly reimagining how we pack and ship your orders without adding to landfill. Here's a transparent look at where we are and where we're headed.",
    tags: ["Behind the Scenes", "Sustainability"],
    readTime: "3 min read",
    date: "29 Dec 2025",
    cta: "See our commitment",
    image: "/images/about-us-what-we-offer.jpg",
    href: "/blog/sustainable-packaging",
    featured: false,
  },
  {
    title: "Community Stories: Life and Craft in Arnhem Land",
    excerpt:
      "Through the eyes of artists, elders, and families, we share what everyday life looks like in the remote communities that power this marketplace.",
    tags: ["Community", "Culture"],
    readTime: "8 min read",
    date: "14 Dec 2025",
    cta: "Hear their stories",
    image: "/images/about2.png",
    href: "/blog/community-stories",
    featured: false,
  },
  {
    title: "A Complete Buyer's Guide to Aboriginal Weaving & Textiles",
    excerpt:
      "From pandanus baskets to woven mats, Aboriginal textiles are tactile stories of land and lineage. Learn what to look for before you buy.",
    tags: ["Guide", "Art"],
    readTime: "6 min read",
    date: "1 Dec 2025",
    cta: "Start reading",
    image: "/images/main.png",
    href: "/blog/weaving-textiles-guide",
    featured: false,
  },
];

const ALL_TAGS = [
  "All",
  ...Array.from(new Set(ALL_BLOG_POSTS.flatMap((p) => p.tags))),
];

// ─────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────
function BlogCard({
  post,
}: {
  post: (typeof ALL_BLOG_POSTS)[number];
}) {
  return (
    <article className="group flex flex-col bg-white border border-[#e8d5c0] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative w-full aspect-video overflow-hidden bg-[#F4E9DC]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Read time pill */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-semibold text-white/90">
            <svg
              className="w-3 h-3 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {post.readTime}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-6">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-[#F4E9DC] text-[#803512] text-[11px] font-semibold tracking-wide border border-[#e8d5c0]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Date */}
        <p className="text-[11px] text-[#803512]/50 font-medium mb-2 tracking-wide">
          {post.date}
        </p>

        <h3 className="text-lg font-bold text-[#1a0a06] leading-snug mb-3 group-hover:text-[#803512] transition-colors duration-200">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-5">
          {post.excerpt}
        </p>

        {/* CTA */}
        <div className="pt-4 border-t border-[#e8d5c0]">
          <Link
            href={post.href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#803512] hover:text-[#5A1E12] transition-colors group/cta"
          >
            {post.cta}
            <svg
              className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function BlogPage() {
  const [activeTag, setActiveTag] = useState("All");

  const featured = ALL_BLOG_POSTS.find((p) => p.featured)!;
  const filtered =
    activeTag === "All"
      ? ALL_BLOG_POSTS.filter((p) => !p.featured)
      : ALL_BLOG_POSTS.filter(
          (p) => !p.featured && p.tags.includes(activeTag)
        );

  return (
    <main className="min-h-screen bg-[#EAD7B7]">

      {/* ── PAGE HEADER ── */}
      <section className="relative bg-[#3a1208] overflow-hidden pt-52 pb-32 px-6">
        {/* dot-grid watermark */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="blog-dots"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="#EAD7B7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blog-dots)" />
        </svg>

        {/* Aboriginal concentric-ring watermark — top right */}
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          fill="none"
          className="absolute -top-8 -right-8 w-56 h-56 text-[#ead7b7] opacity-[0.06] pointer-events-none"
        >
          {[90, 68, 48, 30, 14].map((r, i) => (
            <circle
              key={r}
              cx="100"
              cy="100"
              r={r}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity={1 - i * 0.15}
            />
          ))}
          <circle cx="100" cy="100" r="6" fill="currentColor" />
          {[
            [100, 4],
            [100, 196],
            [4, 100],
            [196, 100],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3.5" fill="currentColor" />
          ))}
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#ead7b7]/40 mb-6">
            <Link href="/" className="hover:text-[#ead7b7]/70 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#ead7b7]/70">Journal</span>
          </div>

          {/* Label */}
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#ead7b7]/50 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ead7b7] animate-pulse" />
            From the Journal
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white mb-5">
            Stories &{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#ead7b7]">Insights</span>
              <span className="absolute left-0 -bottom-1 w-full h-1 rounded-full bg-[#ead7b7]/20" />
            </span>
          </h1>
          <p className="text-base text-white/55 max-w-xl leading-relaxed">
            Explore culture, craft, community, and the stories behind every
            product on our marketplace — straight from Arnhem Land.
          </p>
        </div>
      </section>

      {/* ── FEATURED POST ── */}
      <section className="bg-[#EAD7B7] pt-16 pb-0 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#803512]/60 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#803512] animate-pulse" />
            Featured Story
          </span>

          <Link href={featured.href} className="group block">
            <article className="relative grid grid-cols-1 lg:grid-cols-2 bg-white border border-[#e8d5c0] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              {/* Image */}
              <div className="relative w-full min-h-72 lg:min-h-96 overflow-hidden bg-[#F4E9DC]">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Read time pill */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-[11px] font-semibold text-white/90">
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {featured.readTime}
                  </span>
                </div>
                {/* Featured badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#803512] text-[11px] font-bold text-white tracking-wide uppercase">
                    Featured
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col justify-center p-8 lg:p-12">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {featured.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-[#F4E9DC] text-[#803512] text-[11px] font-semibold tracking-wide border border-[#e8d5c0]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-[#803512]/50 font-medium mb-3 tracking-wide">
                  {featured.date}
                </p>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1a0a06] leading-snug mb-4 group-hover:text-[#803512] transition-colors duration-300">
                  {featured.title}
                </h2>
                <p className="text-base text-gray-500 leading-relaxed mb-8">
                  {featured.excerpt}
                </p>

                <div className="pt-6 border-t border-[#e8d5c0]">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#803512] group-hover:text-[#5A1E12] transition-colors">
                    {featured.cta}
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </div>
      </section>

      {/* ── ALL POSTS ── */}
      <section className="bg-[#EAD7B7] py-16 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Section label + tag filter row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#803512]/60 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#803512] animate-pulse" />
                All Articles
              </span>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-[#3a1208]">
                Browse by{" "}
                <span className="text-[#803512]">Topic</span>
              </h2>
            </div>

            {/* Result count */}
            <p className="text-sm text-[#803512]/60 font-medium shrink-0">
              {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Tag filter pills */}
          <div className="flex flex-wrap gap-2 mb-12">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-200 border ${
                  activeTag === tag
                    ? "bg-[#803512] text-white border-[#803512] shadow-md"
                    : "bg-white text-[#803512] border-[#e8d5c0] hover:border-[#803512] hover:bg-[#F4E9DC]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Cards grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((post) => (
                <BlogCard key={post.href} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F4E9DC] flex items-center justify-center mb-5 border border-[#e8d5c0]">
                <svg
                  className="w-7 h-7 text-[#803512]/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-[#803512]/70 font-semibold text-base mb-1">
                No articles found
              </p>
              <p className="text-sm text-[#803512]/40">
                Try selecting a different category
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER / CTA STRIP ── */}
      <section className="bg-[#3a1208] py-20 px-4 overflow-hidden relative">
        {/* dot-grid */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="cta-dots"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="#EAD7B7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-dots)" />
        </svg>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#ead7b7]/50 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ead7b7] animate-pulse" />
            Stay in the loop
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
            Never miss a{" "}
            <span className="text-[#ead7b7]">story</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-md mx-auto">
            Get the latest articles, artist spotlights, and cultural stories
            from Arnhem Land delivered straight to your inbox.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
              className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ead7b7]/60 transition-colors"
            />
            <button
              type="submit"
              className="shrink-0 px-7 py-3.5 bg-[#ead7b7] hover:bg-white text-[#3a1208] font-bold text-sm rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
            >
              Subscribe
            </button>
          </form>
          <p className="text-white/25 text-[11px] mt-4">
            No spam, unsubscribe at any time.
          </p>
        </div>
      </section>

    </main>
  );
}
