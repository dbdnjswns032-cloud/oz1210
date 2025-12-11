/**
 * @file bookmark-list-skeleton.tsx
 * @description 북마크 목록 스켈레톤 UI
 *
 * 로딩 상태를 표시하는 스켈레톤 컴포넌트입니다.
 */

import { Skeleton } from "@/components/ui/skeleton";

/**
 * 북마크 목록 스켈레톤 컴포넌트
 */
export function BookmarkListSkeleton() {
  return (
    <div className="space-y-6">
      {/* 컨트롤 섹션 스켈레톤 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* 카드 그리드 스켈레톤 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden bg-card">
            {/* 이미지 스켈레톤 */}
            <Skeleton className="w-full h-48" />
            {/* 내용 스켈레톤 */}
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

