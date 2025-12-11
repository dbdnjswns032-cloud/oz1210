/**
 * @file recommendations.tsx
 * @description 추천 관광지 섹션
 *
 * 같은 지역 또는 타입의 다른 관광지를 추천하는 섹션입니다.
 * 카드 형태로 표시하며, 반응형 디자인을 지원합니다.
 *
 * @see {@link docs/PRD.md} 2.4장 - 상세페이지
 */

"use client";

import type { TourItem } from "@/lib/types/tour";
import { TourCard } from "@/components/tour-card";

interface RecommendationsProps {
  items: TourItem[];
  title?: string;
}

/**
 * 추천 관광지 섹션 컴포넌트
 * 
 * @param items - 추천할 관광지 목록
 * @param title - 섹션 제목 (기본값: "이런 곳은 어떠세요?")
 */
export function Recommendations({ items, title = "이런 곳은 어떠세요?" }: RecommendationsProps) {
  if (!items.length) return null;

  return (
    <section
      className="border rounded-lg p-4 sm:p-6 bg-card space-y-4"
      aria-labelledby="recommendations-heading"
    >
      <h2 id="recommendations-heading" className="text-lg sm:text-xl font-semibold">
        {title}
      </h2>
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="추천 관광지 목록"
      >
        {items.map((item) => (
          <div key={item.contentid} role="listitem">
            <TourCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

