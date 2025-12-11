/**
 * @file type-chart.tsx
 * @description 타입별 관광지 분포 차트 컴포넌트
 *
 * 타입별 관광지 개수를 Donut Chart로 시각화하는 컴포넌트입니다.
 * recharts 기반의 shadcn/ui Chart 컴포넌트를 사용하여 구현합니다.
 *
 * @see {@link docs/PRD.md} 2.6.2장 - 관광 타입별 분포
 */

import { getTypeStats } from "@/lib/api/stats-api";
import { Error } from "@/components/ui/error";
import { TypeChartClient } from "./type-chart-client";
import { TypeChartSkeleton } from "./type-chart-skeleton";

/**
 * 차트 데이터 형식
 */
export interface TypeChartDataItem {
  name: string; // 타입명
  value: number; // 관광지 개수
  percentage: number; // 비율 (백분율)
  code: string; // 타입 ID (클릭 이벤트용)
}

/**
 * 타입별 분포 차트 컴포넌트 (Server Component)
 * 데이터를 서버에서 페칭하고 클라이언트 컴포넌트로 전달합니다.
 */
export async function TypeChart() {
  try {
    // 1. 타입별 통계 데이터 조회
    const typeStats = await getTypeStats();

    // 2. 차트 데이터 형식으로 변환
    const chartData: TypeChartDataItem[] = typeStats.map((type) => ({
      name: type.typeName,
      value: type.count,
      percentage: type.percentage || 0,
      code: type.contentTypeId,
    }));

    // 3. 클라이언트 컴포넌트로 데이터 전달
    return <TypeChartClient data={chartData} />;
  } catch (error) {
    return (
      <div id="type-chart-heading" aria-labelledby="type-chart-heading">
        <Error
          message="타입별 통계 데이터를 불러올 수 없습니다"
          description="잠시 후 다시 시도해주세요"
          showRetry={false}
        />
      </div>
    );
  }
}

/**
 * 타입별 분포 차트 스켈레톤 UI
 * 로딩 상태를 표시하는 컴포넌트입니다.
 */
export { TypeChartSkeleton };


