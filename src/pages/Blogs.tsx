import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { PageHeader } from '../components/PageHeader';
import { usePublishedBlogs } from '../hooks/useBlogs';
import type { BlogPost } from '../lib/blogTypes';
import { BlogsSkeleton } from '../components/ui/skeleton';

function formatBlogDate(post: BlogPost) {
  const d = post.publishedAt || post.createdAt;
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const Blogs: React.FC = () => {
  const { data: posts, isLoading, isError } = usePublishedBlogs();

  return (
    <PageShell className="bg-[#faf6f0] font-sans text-[#1a1208] pb-24">
      <PageHeader
        eyebrow="Editorial"
        title="Style Journal"
        subtitle="Trends, styling tips, and stories from Superior Trends — Al Alisha Collection."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14">

        {/* ── Loading ─────────────────────────────────────── */}
        {isLoading ? (
          <BlogsSkeleton />

        ) : isError ? (
          /* ── Error state ────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-14 px-8 bg-red-50/40 border border-red-100 rounded-2xl max-w-xl mx-auto text-center">
            <AlertCircle className="text-red-400 mb-4" size={28} strokeWidth={1.5} />
            <p className="text-red-800 font-semibold tracking-wide text-[15px]">
              Couldn't load journal entries.
            </p>
            <p className="text-sm text-red-500/80 mt-1.5">
              Please refresh the page or try again later.
            </p>
          </div>

        ) : !posts?.length ? (
          /* ── Empty state ────────────────────────────────── */
          <div className="flex flex-col items-center justify-center text-center py-20 px-8 bg-white border border-[#e8dcc8] rounded-2xl max-w-2xl mx-auto shadow-sm">
            <div className="w-14 h-14 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-xl flex items-center justify-center mb-5">
              <BookOpen className="text-[#d4af37]" size={24} strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-display font-black uppercase tracking-wide text-[#1a1208] mb-2">
              The Journal is Empty
            </h3>
            <p className="text-[14px] text-[#7a6a58] max-w-sm leading-relaxed">
              Our editors are curating new stories, trends, and styling tips. Check back shortly for the
              latest from the Al Alisha Collection.
            </p>
          </div>

        ) : (
          /* ── Posts grid ─────────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {posts.map((post: BlogPost, i: number) => (
              <Link
                key={post.id}
                to={`/blogs/${post.slug}`}
                className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#e8dcc8] hover:border-[#8b1a2a]/20 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(139,26,42,0.12)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b1a2a] focus-visible:ring-offset-4 focus-visible:ring-offset-[#faf6f0]"
              >
                {/* ── Cover image ───────────────────────────── */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#f0e8da] shrink-0">

                  {/* Tag badge */}
                  <div className="absolute top-3.5 left-3.5 z-20">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/92 backdrop-blur-sm border border-white/60 text-[9px] font-black uppercase tracking-[0.22em] text-[#8b1a2a] shadow-sm">
                      {post.tag || 'Editorial'}
                    </span>
                  </div>

                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                    />
                  ) : (
                    /* Placeholder when no cover image — weave texture */
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-[0.08]">
                        <defs>
                          <pattern id={`weave-${i}`} width="24" height="24" patternUnits="userSpaceOnUse">
                            <path d="M0 12h24M12 0v24" stroke="#d4af37" strokeWidth="0.75" fill="none" />
                            <rect x="10" y="10" width="4" height="4" fill="#d4af37" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#weave-${i})`} />
                      </svg>
                      <span className="relative text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37]/60">
                        Superior Trends
                      </span>
                    </div>
                  )}

                  {/* Bottom scrim — only when image exists, for contrast on title hover */}
                  {post.coverImage && (
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none z-10" />
                  )}
                </div>

                {/* ── Content ───────────────────────────────── */}
                <div className="flex flex-col flex-1 p-5 sm:p-6 gap-3">

                  {/* Title */}
                  <h2 className="font-display text-[17px] sm:text-lg font-black text-[#1a1208] group-hover:text-[#8b1a2a] transition-colors duration-250 line-clamp-2 leading-snug tracking-tight">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-[13px] text-[#7a6a58] line-clamp-3 leading-relaxed flex-1">
                    {post.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-[#e8dcc8] pt-3.5 mt-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#a09080] font-medium">
                      <Calendar size={12} className="text-[#d4af37] shrink-0" strokeWidth={2} />
                      <span>
                        {formatBlogDate(post)}
                        <span className="mx-1.5 opacity-40">·</span>
                        {post.readMinutes} min read
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8b1a2a] opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-250">
                      Read
                      <ArrowRight size={12} className="shrink-0" />
                    </span>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        )}

      </div>
    </PageShell>
  );
};