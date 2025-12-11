/**
 * @file page.tsx
 * @description 통계 대시보드 페이지
 *
 * 전국 관광지 통계를 차트로 시각화하여 표시하는 페이지입니다.
 * Server Component로 구현되어 초기 데이터를 서버에서 페칭합니다.
 *
 * @see {@link docs/PRD.md} 2.6장 - 통계 대시보드
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { Loading } from "@/components/ui/loading";
import { Error } from "@/components/ui/error";
import { StatsSummary, StatsSummarySkeleton } from "@/components/stats/stats-summary";
import { RegionChart, RegionChartSkeleton } from "@/components/stats/region-chart";
import { TypeChart, TypeChartSkeleton } from "@/components/stats/type-chart";

/**
 * 데이터 캐싱 설정
 * 통계 데이터는 변동이 적으므로 1시간(3600초)마다 재검증합니다.
 */
export const revalidate = 3600;

/**
 * 통계 페이지 컨텐츠 컴포넌트 (Suspense 래핑용)
 * 모든 통계 컴포넌트를 통합하여 표시합니다.
 */
async function StatsContent() {
  return (
    <div className="space-y-8">
      {/* 통계 요약 카드 섹션 */}
      <section aria-labelledby="stats-summary-heading">
        <Suspense fallback={<StatsSummarySkeleton />}>
          <StatsSummary />
        </Suspense>
      </section>

      {/* 지역별 분포 차트 섹션 */}
      <section aria-labelledby="region-chart-heading">
        <Suspense fallback={<RegionChartSkeleton />}>
          <RegionChart />
        </Suspense>
      </section>

      {/* 타입별 분포 차트 섹션 */}
      <section aria-labelledby="type-chart-heading">
        <Suspense fallback={<TypeChartSkeleton />}>
          <TypeChart />
        </Suspense>
      </section>
    </div>
  );
}

/**
 * 동적 메타데이터 생성
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "통계 대시보드",
    description: "전국 관광지 통계를 한눈에 확인하세요",
  };
}

/**
 * 통계 대시보드 페이지 메인 컴포넌트
 */
export default async function StatsPage() {
  return (
    <div className="min-h-screen">
      {/* 반응형 컨테이너 */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* 헤더 섹션 */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
            통계 대시보드
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            전국 관광지 통계를 한눈에 확인하세요
          </p>
        </header>

        {/* 메인 컨텐츠 */}
        <main>
          <Suspense
            fallback={
              <div className="py-12">
                <Loading size="lg" text="통계 데이터를 불러오는 중..." />
              </div>
            }
          >
            <StatsContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

