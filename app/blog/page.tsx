"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Custom styles for text truncation
const truncateStyles = {
  title: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  excerpt: {
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  featuredTitle: {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  featuredExcerpt: {
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ApiBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  shortDescription: string;
  tags: string[];
  ctaText: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogPost {
  title: string;
  excerpt: string;
  tags: string[];
  readTime: string;  
  date: string;
  cta: string;
  image: string;
  href: string;
  featured: boolean;
}

// ─────────────────────────────────────────────
// Utility functions
// ─────────────────────────────────────────────
const API_BASE_URL = "https://alpa-be.onrender.com/api";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};
const slugify = (slug: string): string => {
  return slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-');
};
const transformApiDataToBlogPost = (apiPost: ApiBlogPost, index: number): BlogPost => {
  return {
    title: apiPost.title,
    excerpt: apiPost.shortDescription,
    tags: apiPost.tags.length > 0 ? apiPost.tags : ["General"],
    readTime: "5 min read", // Default read time since API doesn't provide it
    date: formatDate(apiPost.createdAt),
    cta: apiPost.ctaText || "Read more",
    image: apiPost.coverImage || "/images/default-blog.jpg",
    href: `/blog/${slugify(apiPost.slug)}`, 
    featured: index === 0, // First blog post is featured
  };
};

// ─────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────
function BlogCard({
  post,
}: {
  post: BlogPost;
}) {
  return (
    <Link href={post.href} className="group block h-130"> 
    <article className="group flex flex-col bg-white border border-[#e8d5c0] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-130">
      {/* Image */}
      <div className="relative w-full h-56 min-h-56 overflow-hidden bg-[#F4E9DC]">
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
      <div className="flex flex-col p-6 flex-1">
        <div className="flex-1 min-h-0">
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

          <h3 className="text-lg font-bold text-[#1a0a06] leading-snug mb-3 group-hover:text-[#803512] transition-colors duration-200" style={truncateStyles.title}>
            {post.title}
          </h3>
          <div className="overflow-hidden">
            <p className="text-sm text-gray-500 leading-relaxed" style={truncateStyles.excerpt}>
              {post.excerpt}
            </p>
          </div>
        </div>

        {/* CTA - Always at bottom */}
        <div className="pt-4 border-t border-[#e8d5c0] mt-auto">
          <span
            // href={post.href}
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
          </span>
        </div>
      </div>
    </article>
     </Link>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function BlogPage() {
  const [activeTag, setActiveTag] = useState("All");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blog posts from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/blogs`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }

        const data = await response.json();
        
        // Handle different possible response formats
        let blogArray;
        if (Array.isArray(data)) {
          blogArray = data;
        } else if (data && Array.isArray(data.data)) {
          blogArray = data.data;
        } else if (data && Array.isArray(data.blogs)) {
          blogArray = data.blogs;
        } else {
          console.error('Unexpected API response format:', data);
          throw new Error('Invalid data format - expected array of blogs');
        }

        const transformedPosts = blogArray
          .filter((post: ApiBlogPost) => post.status === 'PUBLISHED')
          .map((post: ApiBlogPost, index: number) => transformApiDataToBlogPost(post, index));
        setBlogPosts(transformedPosts);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Generate tags from fetched posts
  const allTags = [
    "All",
    ...Array.from(new Set(blogPosts.flatMap((p) => p.tags))),
  ];

  const featured = blogPosts.find((p) => p.featured);
  const filtered =
    activeTag === "All"
      ? blogPosts.filter((p) => !p.featured)
      : blogPosts.filter(
          (p) => !p.featured && p.tags.includes(activeTag)
        );

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#EAD7B7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#803512] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#803512] font-semibold">Loading blogs...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-[#EAD7B7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">Error loading blogs</p>
          <p className="text-[#803512]">{error}</p>
        </div>
      </main>
    );
  }

  // No blogs state
  if (blogPosts.length === 0) {
    return (
      <main className="min-h-screen bg-[#EAD7B7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#803512] font-semibold">No blogs available</p>
        </div>
      </main>
    );
  }

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

          {featured && (
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

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1a0a06] leading-snug mb-4 group-hover:text-[#803512] transition-colors duration-300" style={truncateStyles.featuredTitle}>
                  {featured.title}
                </h2>
                <p className="text-base text-gray-500 leading-relaxed mb-8" style={truncateStyles.featuredExcerpt}>
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
          )}
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
            {allTags.map((tag) => (
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
