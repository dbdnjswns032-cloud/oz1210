/**
 * @file type-chart-client.tsx
 * @description 타입별 관광지 분포 차트 클라이언트 컴포넌트
 *
 * recharts를 사용하여 Donut Chart를 렌더링하는 클라이언트 컴포넌트입니다.
 * 섹션 클릭 시 해당 타입의 관광지 목록 페이지로 이동합니다.
 */

"use client";

import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { TypeChartDataItem } from "./type-chart";

interface TypeChartClientProps {
  data: TypeChartDataItem[];
}

/**
 * 차트 설정
 */
const chartConfig = {
  value: {
    label: "관광지 개수",
  },
} as const;

/**
 * 색상 팔레트 (8개 타입)
 * primary 색상 기반 변형 및 고정 색상 조합
 */
const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.85)",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--primary) / 0.55)",
  "hsl(var(--primary) / 0.4)",
  "hsl(var(--primary) / 0.25)",
  "hsl(var(--primary) / 0.1)",
  "hsl(var(--muted-foreground))",
] as const;

/**
 * 타입별 분포 차트 클라이언트 컴포넌트
 */
export function TypeChartClient({ data }: TypeChartClientProps) {
  const router = useRouter();

  /**
   * Pie 섹션 클릭 핸들러
   * 해당 타입의 관광지 목록 페이지로 이동합니다.
   */
  const handlePieClick = (data: TypeChartDataItem) => {
    if (data?.code) {
      router.push(`/?contentTypeId=${data.code}`);
    }
  };

  return (
    <Card id="type-chart-heading" aria-labelledby="type-chart-heading">
      <CardHeader>
        <CardTitle id="type-chart-heading">관광 타입별 분포</CardTitle>
        <CardDescription>각 관광 타입별 관광지 개수 및 비율</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] md:h-[400px] lg:h-[500px] w-full">
          <PieChart role="img" aria-label="관광 타입별 분포 도넛 차트">
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as TypeChartDataItem;
                  return (
                    <ChartTooltipContent
                      label={data.name}
                      formatter={(value: number) => [
                        `${value.toLocaleString()}개 (${data.percentage.toFixed(1)}%)`,
                        "관광지 개수",
                      ]}
                    />
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={2}
              label={false}
              onClick={(_, index) => {
                if (data[index]) {
                  handlePieClick(data[index]);
                }
              }}
              style={{ cursor: "pointer" }}
              aria-label="관광 타입별 분포 차트"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
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
                  onClick={() => handlePieClick(entry)}
                  aria-label={`${entry.name}: ${entry.value.toLocaleString()}개 (${entry.percentage.toFixed(1)}%)`}
                />
              ))}
            </Pie>
            <Legend
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                return (
                  <ChartLegendContent
                    payload={payload}
                    nameKey="name"
                    className="mt-4"
                  />
                );
              }}
              verticalAlign="bottom"
              height={36}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

