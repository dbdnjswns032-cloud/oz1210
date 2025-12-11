/**
 * @file region-chart-skeleton.tsx
 * @description 지역별 분포 차트 스켈레톤 UI
 *
 * 차트 로딩 중 표시하는 스켈레톤 컴포넌트입니다.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 지역별 분포 차트 스켈레톤 UI
 */
export function RegionChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[500px] w-full" />
      </CardContent>
    </Card>
  );
}


