import { cn } from '../../lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-neutral-200/80', className)}
      aria-hidden
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white p-3 border border-brand-border/25 rounded-2xl">
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <Skeleton className="h-3 w-2/3 mt-3" />
      <Skeleton className="h-4 w-1/2 mt-2" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 6, cols = 'grid-cols-2 md:grid-cols-3' }: { count?: number; cols?: string }) {
  return (
    <div className={`grid gap-6 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HomeSectionSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 mb-16 max-w-6xl mx-auto w-full space-y-4">
      <div className="flex justify-center gap-4">
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="flex gap-4 overflow-hidden justify-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-[260px] shrink-0 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function HomeSplitSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 mb-16 max-w-6xl mx-auto">
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        <Skeleton className="h-[360px] rounded-3xl" />
        <Skeleton className="h-[360px] rounded-3xl" />
      </div>
      <div className="md:hidden grid grid-cols-2 grid-rows-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 font-display">
      <div className="flex justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="max-w-[320px] mx-auto space-y-2 w-full">
            <Skeleton className="aspect-[4/5] max-h-[400px] w-full rounded-xl" />
            <div className="flex gap-2 justify-center">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-16 aspect-[4/5] rounded-lg shrink-0" />
              ))}
            </div>
          </div>
          <div className="space-y-4 max-w-xl mx-auto lg:mx-0 w-full">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-14 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShopFiltersSkeleton() {
  return (
    <div className="space-y-6 w-56">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

export function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-brand-border/30 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-24 sm:ml-2 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="flex gap-2 shrink-0 w-40 sm:w-48">
                <Skeleton className="w-14 h-16 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

export function BlogsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-brand-border/25 rounded-2xl overflow-hidden flex flex-col space-y-4 p-5">
          <Skeleton className="aspect-[16/10] w-full rounded-xl" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex justify-between border-t border-brand-border/20 pt-4 mt-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BlogDetailSkeleton() {
  return (
    <div className="bg-brand-cream min-h-screen w-full ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <Skeleton className="h-4 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
          <div className="lg:col-span-5 xl:col-span-5">
            <Skeleton className="w-full aspect-[4/3] lg:min-h-[500px] rounded-2xl" />
          </div>
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-2/3" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="bg-white border border-brand-border/25 rounded-2xl p-6 space-y-4">
              <Skeleton className="h-6 w-full border-l-4 border-neutral-300 pl-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
