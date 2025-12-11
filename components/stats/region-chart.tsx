/**
 * @file region-chart.tsx
 * @description 지역별 관광지 분포 차트 컴포넌트
 *
 * 지역별 관광지 개수를 Bar Chart로 시각화하는 컴포넌트입니다.
 * recharts 기반의 shadcn/ui Chart 컴포넌트를 사용하여 구현합니다.
 *
 * @see {@link docs/PRD.md} 2.6.1장 - 지역별 관광지 분포
 */

import { getRegionStats } from "@/lib/api/stats-api";
import { Error } from "@/components/ui/error";
import { RegionChartClient } from "./region-chart-client";
import { RegionChartSkeleton } from "./region-chart-skeleton";

/**
 * 차트 데이터 형식
 */
export interface ChartDataItem {
  name: string; // 지역명
  value: number; // 관광지 개수
  code: string; // 지역 코드 (클릭 이벤트용)
}

/**
 * 지역별 분포 차트 컴포넌트 (Server Component)
 * 데이터를 서버에서 페칭하고 클라이언트 컴포넌트로 전달합니다.
 */
export async function RegionChart() {
  try {
    // 1. 지역별 통계 데이터 조회
    const regionStats = await getRegionStats();

    // 2. 상위 10개 지역 선택 및 정렬 (count 기준 내림차순)
    const chartData: ChartDataItem[] = regionStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((region) => ({
        name: region.name,
        value: region.count,
        code: region.code,
      }));

    // 3. 클라이언트 컴포넌트로 데이터 전달
    return <RegionChartClient data={chartData} />;
  } catch (error) {
    return (
      <div id="region-chart-heading" aria-labelledby="region-chart-heading">
        <Error
          message="지역별 통계 데이터를 불러올 수 없습니다"
          description="잠시 후 다시 시도해주세요"
          showRetry={false}
        />
      </div>
    );
  }
}

/**
 * 지역별 분포 차트 스켈레톤 UI
 * 로딩 상태를 표시하는 컴포넌트입니다.
 */
export { RegionChartSkeleton };


