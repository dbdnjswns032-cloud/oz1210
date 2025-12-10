/**
 * @file recommendations.tsx
 * @description 추천 관광지 섹션
 */

"use client";

import type { TourItem } from "@/lib/types/tour";
import TourCard from "@/components/tour-card";

interface RecommendationsProps {
  items: TourItem[];
  title?: string;
}

export function Recommendations({ items, title = "추천 관광지" }: RecommendationsProps) {
  if (!items.length) return null;

  return (
    <section className="border rounded-lg p-6 bg-card space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <TourCard key={item.contentid} item={item} />
        ))}
      </div>
    </section>
  );
}

