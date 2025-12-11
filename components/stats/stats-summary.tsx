/**
 * @file stats-summary.tsx
 * @description 통계 요약 카드 컴포넌트
 *
 * 통계 요약 정보를 카드 형태로 표시하는 컴포넌트입니다.
 * 전체 관광지 수, Top 3 지역, Top 3 타입, 마지막 업데이트 시간을 표시합니다.
 *
 * @see {@link docs/PRD.md} 2.6.3장 - 통계 요약 카드
 */

import { Globe, Award, Tag, Clock } from "lucide-react";
import { getStatsSummary } from "@/lib/api/stats-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Error } from "@/components/ui/error";
import type { StatsSummary as StatsSummaryType } from "@/lib/types/stats";

/**
 * 날짜 포맷팅 함수
 * ISO 8601 형식을 사용자 친화적인 형식으로 변환합니다.
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 통계 요약 카드 컴포넌트
 * Server Component로 구현되어 데이터를 서버에서 페칭합니다.
 */
export async function StatsSummary() {
  try {
    const data = await getStatsSummary();

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-summary-heading" aria-labelledby="stats-summary-heading">
        {/* 전체 관광지 수 카드 */}
        <div className="border rounded-lg p-4 sm:p-6 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
            <h3 className="text-sm font-medium text-muted-foreground">
              전체 관광지
            </h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-primary" aria-label={`전체 관광지 수: ${data.totalCount.toLocaleString()}개`}>
            {data.totalCount.toLocaleString()}
          </p>
        </div>

        {/* Top 3 지역 카드 */}
        <div className="border rounded-lg p-4 sm:p-6 bg-card md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Top 3 지역</span>
          </h3>
          <div className="space-y-3" role="list" aria-label="상위 3개 지역 목록">
            {data.topRegions.map((region, index) => (
              <div
                key={region.code}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
                role="listitem"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-8" aria-label={`${index + 1}위`}>
                    {index + 1}위
                  </span>
                  <span className="font-medium">{region.name}</span>
                </div>
                <span className="text-sm text-muted-foreground" aria-label={`${region.name}: ${region.count.toLocaleString()}개`}>
                  {region.count.toLocaleString()}개
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 타입 카드 */}
        <div className="border rounded-lg p-4 sm:p-6 bg-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <Tag className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Top 3 타입</span>
          </h3>
          <div className="space-y-3" role="list" aria-label="상위 3개 타입 목록">
            {data.topTypes.map((type, index) => (
              <div
                key={type.contentTypeId}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
                role="listitem"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-8" aria-label={`${index + 1}위`}>
                    {index + 1}위
                  </span>
                  <span className="font-medium">{type.typeName}</span>
                </div>
                <span className="text-sm text-muted-foreground" aria-label={`${type.typeName}: ${type.count.toLocaleString()}개`}>
                  {type.count.toLocaleString()}개
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 마지막 업데이트 시간 */}
        <div className="col-span-full flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>마지막 업데이트: {formatDate(data.lastUpdated)}</span>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <Error
        message="통계 데이터를 불러올 수 없습니다"
        description="잠시 후 다시 시도해주세요"
        showRetry={false}
      />
    );
  }
}

/**
 * 통계 요약 카드 스켈레톤 UI
 * 로딩 상태를 표시하는 컴포넌트입니다.
 */
export function StatsSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 전체 관광지 수 스켈레톤 */}
      <div className="border rounded-lg p-6 bg-card">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Top 3 지역 스켈레톤 */}
      <div className="border rounded-lg p-6 bg-card md:col-span-2">
        <Skeleton className="h-4 w-20 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>

      {/* Top 3 타입 스켈레톤 */}
      <div className="border rounded-lg p-6 bg-card">
        <Skeleton className="h-4 w-20 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>

      {/* 마지막 업데이트 시간 스켈레톤 */}
      <div className="col-span-full">
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}


