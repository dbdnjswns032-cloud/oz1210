/**
 * @file region-chart-client.tsx
 * @description 지역별 관광지 분포 차트 클라이언트 컴포넌트
 *
 * recharts를 사용하여 Bar Chart를 렌더링하는 클라이언트 컴포넌트입니다.
 * 바 클릭 시 해당 지역의 관광지 목록 페이지로 이동합니다.
 */

"use client";

import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartDataItem } from "./region-chart";

interface RegionChartClientProps {
  data: ChartDataItem[];
}

/**
 * 차트 설정
 */
const chartConfig = {
  value: {
    label: "관광지 개수",
    color: "hsl(var(--primary))",
  },
} as const;

/**
 * 지역별 분포 차트 클라이언트 컴포넌트
 */
export function RegionChartClient({ data }: RegionChartClientProps) {
  const router = useRouter();

  /**
   * 바 클릭 핸들러
   * 해당 지역의 관광지 목록 페이지로 이동합니다.
   */
  const handleBarClick = (data: ChartDataItem) => {
    if (data?.code) {
      router.push(`/?areaCode=${data.code}`);
    }
  };

  return (
    <Card id="region-chart-heading" aria-labelledby="region-chart-heading">
      <CardHeader>
        <CardTitle id="region-chart-heading">지역별 관광지 분포</CardTitle>
        <CardDescription>각 시/도별 관광지 개수 (상위 10개 지역)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] sm:h-[500px] w-full">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            aria-label="지역별 관광지 분포 차트"
            role="img"
            onClick={(e: any) => {
              if (e?.activePayload?.[0]?.payload) {
                const clickedData = e.activePayload[0].payload as ChartDataItem;
                handleBarClick(clickedData);
              }
            }}
          >
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
              interval={0}
            />
            <YAxis
              tickFormatter={(value) => value.toLocaleString()}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartDataItem;
                  return (
                    <ChartTooltipContent
                      label={data.name}
                      formatter={(value: number) => [`${value.toLocaleString()}개`, "관광지 개수"]}
                    />
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="value"
              fill="hsl(var(--primary))"
              style={{ cursor: "pointer" }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill="hsl(var(--primary))"
                  style={{
                    transition: "opacity 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onClick={() => handleBarClick(entry)}
                  aria-label={`${entry.name}: ${entry.value.toLocaleString()}개`}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

