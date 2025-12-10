/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 * TourCard 컴포넌트를 사용하여 카드 형태로 표시하며,
 * 로딩 상태와 빈 상태를 처리합니다.
 * 정렬 기능도 포함합니다.
 *
 * @see {@link docs/PRD.md} 2.1장 - 관광지 목록 + 지역/타입 필터
 */

import { useMemo } from "react";
import type { TourItem } from "@/lib/types/tour";
import type { SortBy } from "@/lib/types/home";
import { TourCard } from "@/components/tour-card";
import { Skeleton } from "@/components/ui/skeleton";

interface TourListProps {
  items: TourItem[];
  totalCount: number;
  isLoading?: boolean;
  sortBy?: SortBy;
  searchKeyword?: string;
  onCardClick?: (contentId: string) => void;
  selectedContentId?: string;
}

/**
 * 스켈레톤 카드 컴포넌트 (로딩 상태용)
 */
function TourCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* 이미지 스켈레톤 */}
      <Skeleton className="w-full h-48" />
      {/* 내용 스켈레톤 */}
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

/**
 * 정렬 함수
 */
function sortItems(items: TourItem[], sortBy?: SortBy): TourItem[] {
  if (!sortBy) {
    return items;
  }

  const sorted = [...items];

  switch (sortBy) {
    case "latest":
      // 최신순: modifiedtime 기준 내림차순
      return sorted.sort((a, b) => {
        const dateA = new Date(a.modifiedtime).getTime();
        const dateB = new Date(b.modifiedtime).getTime();
        return dateB - dateA; // 내림차순 (최신이 먼저)
      });

    case "name":
      // 이름순: title 기준 오름차순 (가나다순)
      return sorted.sort((a, b) => {
        return a.title.localeCompare(b.title, "ko", { numeric: true });
      });

    default:
      return items;
  }
}

export function TourList({
  items,
  totalCount,
  isLoading = false,
  sortBy,
  searchKeyword,
  onCardClick,
  selectedContentId,
}: TourListProps) {
  // 정렬된 항목 계산
  const sortedItems = useMemo(() => sortItems(items, sortBy), [items, sortBy]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <TourCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // 빈 상태
  if (sortedItems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {searchKeyword ? (
          <>
            <p className="text-lg font-medium">
              &quot;{searchKeyword}&quot;에 대한 검색 결과가 없습니다
            </p>
            <p className="text-sm mt-2">다른 검색어나 필터를 시도해보세요.</p>
          </>
        ) : (
          <>
            <p className="text-lg font-medium">표시할 관광지가 없습니다</p>
            <p className="text-sm mt-2">다른 검색어나 필터를 시도해보세요.</p>
          </>
        )}
      </div>
    );
  }

  // 목록 표시
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedItems.map((item) => (
        <div
          key={item.contentid}
          onClick={() => onCardClick?.(item.contentid)}
          className={selectedContentId === item.contentid ? "ring-2 ring-primary rounded-lg" : ""}
        >
          <TourCard item={item} />
        </div>
      ))}
    </div>
  );
}

