/**
 * @file filters-section.tsx
 * @description 필터 및 컨트롤 영역 컴포넌트
 *
 * 지역 필터, 관광 타입 필터, 정렬 옵션 등을 제공하는 필터 섹션입니다.
 * TourFilters 컴포넌트를 사용하여 필터 UI를 표시합니다.
 *
 * @see {@link docs/PRD.md} 2.1장 - 관광지 목록 + 지역/타입 필터
 */

"use client";

import { TourFilters } from "@/components/tour-filters";

export function FiltersSection() {
  return (
    <section className="sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <TourFilters />
      </div>
    </section>
  );
}

