import React from 'react';

// Base skeleton element
const SkeletonElement: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`skeleton ${className}`}></div>
);

// Skeleton for new ContentCreation.tsx
export const ContentCreationSkeleton: React.FC = () => (
    <div className="grid md:grid-cols-2 gap-6 animate-on-scroll is-visible">
        <SkeletonElement className="w-full aspect-square rounded-lg" />
        <div className="flex flex-col">
            <div className="bg-slate-100 p-4 rounded-lg space-y-2 flex-grow">
                <SkeletonElement className="h-3 w-full" />
                <SkeletonElement className="h-3 w-11/12" />
                <SkeletonElement className="h-3 w-full" />
                <SkeletonElement className="h-3 w-5/6" />
                <SkeletonElement className="h-3 w-full" />
            </div>
            <SkeletonElement className="h-10 w-40 mt-4 rounded-lg" />
            <div className="mt-4 pt-4 border-t border-slate-200">
                <SkeletonElement className="h-4 w-1/3 mb-2" />
                <SkeletonElement className="h-8 w-full mb-2" />
                <SkeletonElement className="h-8 w-full" />
            </div>
        </div>
    </div>
);

// Skeleton for CampaignAssistant.tsx
export const CampaignAssistantSkeleton: React.FC = () => (
    <div className="mt-8 animate-on-scroll is-visible">
        <SkeletonElement className="h-8 w-1/2 mb-4" />
        <div className="grid md:grid-cols-2 gap-6">
            {/* Column 1 */}
            <div className="space-y-6">
                {/* Ad Copy Card Skeleton */}
                <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 space-y-3">
                    <SkeletonElement className="h-4 w-1/3 mb-2" />
                    <SkeletonElement className="h-3 w-full" />
                    <SkeletonElement className="h-3 w-5/6" />
                    <SkeletonElement className="h-3 w-full" />
                     <div className="pt-2">
                        <SkeletonElement className="h-7 w-24 rounded-full" />
                    </div>
                </div>
                {/* Creative Suggestion Card Skeleton */}
                <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 space-y-3">
                    <SkeletonElement className="h-4 w-1/2" />
                    <SkeletonElement className="h-3 w-3/4" />
                     <SkeletonElement className="h-3 w-full" />
                </div>
            </div>
            {/* Column 2 */}
            <div className="space-y-6">
                 {/* Audience Card Skeleton */}
                 <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 space-y-3">
                    <SkeletonElement className="h-4 w-1/3 mb-2" />
                    <div className="space-y-2">
                        <div className="flex gap-2"><SkeletonElement className="h-3 w-1/4" /><SkeletonElement className="h-3 w-3/4" /></div>
                        <div className="flex gap-2"><SkeletonElement className="h-3 w-1/5" /><SkeletonElement className="h-3 w-2/5" /></div>
                        <div className="flex gap-2"><SkeletonElement className="h-3 w-1/6" /><SkeletonElement className="h-3 w-1/2" /></div>
                        <div className="flex gap-2"><SkeletonElement className="h-3 w-1/4" /><SkeletonElement className="h-3 w-3/4" /></div>
                    </div>
                </div>
                {/* Budget Card Skeleton */}
                <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 space-y-3">
                    <SkeletonElement className="h-4 w-1/3" />
                    <div className="flex gap-2"><SkeletonElement className="h-3 w-2/5" /><SkeletonElement className="h-3 w-1/2" /></div>
                     <div className="flex gap-2"><SkeletonElement className="h-3 w-1/2" /><SkeletonElement className="h-3 w-1/2" /></div>
                </div>
            </div>
        </div>
    </div>
);

// Skeleton for FeedAnalyzer in Tools.tsx
export const FeedAnalyzerSkeleton: React.FC = () => (
    <div className="mt-6 space-y-4 animate-on-scroll is-visible">
        <SkeletonElement className="h-6 w-1/2 mx-auto mb-4" />
        {/* Palette Card */}
        <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 space-y-2">
            <SkeletonElement className="h-5 w-1/3" />
            <SkeletonElement className="h-4 w-full" />
        </div>
        {/* Tone Card */}
        <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 space-y-2">
            <SkeletonElement className="h-5 w-1/4" />
            <SkeletonElement className="h-4 w-5/6" />
        </div>
        {/* Content Suggestions Card */}
        <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 space-y-3">
            <SkeletonElement className="h-5 w-1/2 mb-2" />
             <div className="flex items-start gap-3 p-3 bg-white rounded-md border border-slate-200">
                <SkeletonElement className="h-8 w-8 rounded-lg flex-shrink-0" />
                <div className="space-y-2 w-full">
                     <SkeletonElement className="h-4 w-3/4" />
                     <SkeletonElement className="h-3 w-full" />
                </div>
            </div>
             <div className="flex items-start gap-3 p-3 bg-white rounded-md border border-slate-200">
                 <SkeletonElement className="h-8 w-8 rounded-lg flex-shrink-0" />
                 <div className="space-y-2 w-full">
                     <SkeletonElement className="h-4 w-2/3" />
                     <SkeletonElement className="h-3 w-5/6" />
                </div>
            </div>
             <div className="flex items-start gap-3 p-3 bg-white rounded-md border border-slate-200">
                 <SkeletonElement className="h-8 w-8 rounded-lg flex-shrink-0" />
                 <div className="space-y-2 w-full">
                     <SkeletonElement className="h-4 w-3/4" />
                     <SkeletonElement className="h-3 w-full" />
                </div>
            </div>
        </div>
         {/* Visual Improvements Card */}
         <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 space-y-2">
            <SkeletonElement className="h-5 w-1/3" />
            <SkeletonElement className="h-4 w-full" />
        </div>
    </div>
);