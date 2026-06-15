import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { useBlogPost } from '../hooks/useBlogs';
import { BlogDetailSkeleton } from '../components/ui/skeleton';
import { useLanguage } from '../context/LanguageContext';

function renderContent(content: string) {
  const blocks = content.split(/\n\n+/).filter(Boolean);
  return blocks.map((block, i) => {
    const trimmed = block.trim();

    if (trimmed.startsWith('## ')) {
      return (
        <h2
          key={i}
          className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#1a1208] mt-12 mb-5 text-left rtl:text-right"
        >
          {trimmed.replace(/^##\s+/, '')}
        </h2>
      );
    }

    if (trimmed.startsWith('### ')) {
      return (
        <h3
          key={i}
          className="font-display text-lg sm:text-xl font-black uppercase tracking-tight text-[#8b1a2a] mt-8 mb-4 text-left rtl:text-right"
        >
          {trimmed.replace(/^###\s+/, '')}
        </h3>
      );
    }

    return (
      <p
        key={i}
        className="text-[15px] md:text-base text-[#5a4a38] leading-[1.85] mb-5 last:mb-0 text-left rtl:text-right"
      >
        {trimmed}
      </p>
    );
  });
}

export const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError } = useBlogPost(slug);
  const { language, t } = useLanguage();

  if (isLoading) {
    return <BlogDetailSkeleton />;
  }

  if (isError || !post) {
    return (
      <PageShell className="bg-[#faf6f0]">
        <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
          <p className="text-base text-[#7a6a58] font-medium">
            {language === 'ar' ? 'تعذر العثور على هذه المقالة.' : 'This story could not be found.'}
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-[#8b1a2a] text-[11px] font-black uppercase tracking-[0.22em] hover:-translate-x-0.5 transition-transform duration-200"
          >
            <ArrowLeft size={14} className="rtl:rotate-180" />
            {language === 'ar' ? 'العودة إلى المجلة' : 'Back to Journal'}
          </Link>
        </div>
      </PageShell>
    );
  }

  const dateStr = new Date(post.publishedAt || post.createdAt).toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: post.title, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="bg-[#faf6f0] min-h-screen w-full font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">

        {/* ── Back nav ──────────────────────────────────── */}
        <Link
          to="/blogs"
          className="group inline-flex items-center gap-2 text-[#8b1a2a] text-[10px] font-black uppercase tracking-[0.25em] mb-8 lg:mb-12 hover:text-[#d4af37] transition-colors duration-200"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-200 rtl:rotate-180" />
          {language === 'ar' ? 'مجلة الأناقة' : 'Style Journal'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ── Left: sticky cover ────────────────────────── */}
          <aside className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="relative w-full aspect-[16/10] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-[#e8dcc8] shadow-sm bg-[#f0e8da]">
              {post.coverImage ? (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              ) : (
                /* Branded placeholder — same weave used across the site */
                <div className="absolute inset-0 bg-[#8b1a2a] flex items-center justify-center">
                  <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-[0.07]">
                    <defs>
                      <pattern id="weaveBlog" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M0 12h24M12 0v24" stroke="#d4af37" strokeWidth="0.75" fill="none" />
                        <rect x="10" y="10" width="4" height="4" fill="#d4af37" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#weaveBlog)" />
                  </svg>
                  <span className="relative font-display text-white/40 text-4xl font-black uppercase tracking-[0.3em]">
                    ST
                  </span>
                </div>
              )}
            </div>
          </aside>

          {/* ── Right: article card ───────────────────────── */}
          <div className="lg:col-span-7 min-w-0">
            <article className="bg-white border border-[#e8dcc8] rounded-2xl shadow-sm overflow-hidden text-left rtl:text-right">

              {/* Card body */}
              <div className="p-6 sm:p-9 lg:p-12">

                {/* Tag */}
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 text-[9px] font-black uppercase tracking-[0.25em] text-[#b8942a] mb-5">
                  {post.tag || (language === 'ar' ? 'افتتاحية' : 'Editorial')}
                </span>

                {/* Title */}
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-[#1a1208] leading-[1.1] tracking-tight mb-5">
                  {post.title}
                </h1>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#a09080] font-medium uppercase tracking-[0.15em] pb-6 border-b border-[#e8dcc8] mb-7">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#8b1a2a] shrink-0" strokeWidth={2} />
                    {dateStr}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} className="text-[#8b1a2a] shrink-0" strokeWidth={2} />
                    {language === 'ar' ? `قراءة ${post.readMinutes} دقائق` : `${post.readMinutes} min read`}
                  </span>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 text-[#1a1208] hover:text-[#8b1a2a] transition-colors duration-200 ltr:ml-auto rtl:mr-auto"
                    aria-label="Share this article"
                  >
                    <Share2 size={13} strokeWidth={2} />
                    {language === 'ar' ? 'مشاركة' : 'Share'}
                  </button>
                </div>

                {/* Excerpt — pull quote style */}
                <blockquote className="border-l-[3px] border-[#8b1a2a] rtl:border-l-0 rtl:border-r-[3px] pl-5 rtl:pl-0 rtl:pr-5 mb-8">
                  <p className="text-[17px] sm:text-lg text-[#1a1208] font-display font-black leading-snug italic">
                    {post.excerpt}
                  </p>
                </blockquote>

                {/* Body content */}
                <div>
                  {post.content ? renderContent(post.content) : null}
                </div>
              </div>

              {/* ── Card footer CTA ─────────────────────── */}
              <div className="border-t border-[#e8dcc8] bg-[#faf6f0] px-6 sm:px-9 lg:px-12 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1a1208] mb-0.5">
                    {t('common.superiorTrends')}
                  </p>
                  <p className="text-[13px] text-[#7a6a58]">
                    {t('common.alAlishaCollection')}
                  </p>
                </div>
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center bg-[#8b1a2a] text-white px-7 py-3 text-[11px] font-black uppercase tracking-[0.22em] rounded-full hover:bg-[#701522] hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#8b1a2a]/20 active:scale-95 transition-all duration-200 shrink-0 cursor-pointer"
                >
                  {language === 'ar' ? 'تسوق المجموعة' : 'Shop the Collection'}
                </Link>
              </div>

            </article>
          </div>
        </div>
      </div>
    </div>
  );
};