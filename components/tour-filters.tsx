/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역 필터, 관광 타입 필터, 정렬 옵션을 제공하는 필터 컴포넌트입니다.
 * SearchParamsProvider를 통해 URL 쿼리 파라미터를 관리합니다.
 *
 * @see {@link docs/PRD.md} 2.1장 - 관광지 목록 + 지역/타입 필터
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParamsContext } from "@/components/home/search-params-provider";
import { getAllContentTypes } from "@/lib/types/stats";
import type { AreaCode } from "@/lib/types/tour";
import type { PetSize } from "@/lib/types/home";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 지역 필터 컴포넌트
 */
function AreaFilter({ areaCodes }: { areaCodes: AreaCode[] }) {
  const { params, setAreaCode } = useSearchParamsContext();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">지역</label>
      <Select
        value={params.areaCode || "all"}
        onValueChange={(value) => setAreaCode(value === "all" ? undefined : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="전체 지역" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          {areaCodes.map((area) => (
            <SelectItem key={area.code} value={area.code}>
              {area.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * 관광 타입 필터 컴포넌트
 */
function ContentTypeFilter() {
  const { params, setContentTypeId } = useSearchParamsContext();
  const contentTypes = getAllContentTypes();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">관광 타입</label>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={params.contentTypeId ? "outline" : "default"}
          size="sm"
          onClick={() => setContentTypeId(undefined)}
        >
          전체
        </Button>
        {contentTypes.map((type) => (
          <Button
            key={type.id}
            variant={params.contentTypeId === type.id ? "default" : "outline"}
            size="sm"
            onClick={() => setContentTypeId(type.id)}
          >
            {type.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * 정렬 옵션 컴포넌트
 */
function SortFilter() {
  const { params, setSortBy } = useSearchParamsContext();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">정렬</label>
      <Select
        value={params.sortBy || "none"}
        onValueChange={(value) => setSortBy(value === "none" ? undefined : (value as "latest" | "name"))}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="정렬 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">정렬 안함</SelectItem>
          <SelectItem value="latest">최신순</SelectItem>
          <SelectItem value="name">이름순</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * 반려동물 필터 컴포넌트
 */
function PetFilter() {
  const { params, setPetFriendly, setPetSize } = useSearchParamsContext();
  const isPetFriendlyEnabled = params.petFriendly === "true";

  const petSizes: Array<{ value: PetSize; label: string }> = [
    { value: "small", label: "소형" },
    { value: "medium", label: "중형" },
    { value: "large", label: "대형" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label htmlFor="pet-friendly" className="text-sm font-medium">
          반려동물 동반 가능
        </label>
        <Switch
          id="pet-friendly"
          checked={isPetFriendlyEnabled}
          onCheckedChange={(checked) => {
            setPetFriendly(checked || undefined);
            if (!checked) {
              // 토글 비활성화 시 크기 필터도 초기화
              setPetSize(undefined);
            }
          }}
        />
      </div>
      {isPetFriendlyEnabled && (
        <div className="flex flex-wrap gap-2 mt-1">
          {petSizes.map((size) => (
            <Button
              key={size.value}
              variant={params.petSize === size.value ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setPetSize(params.petSize === size.value ? undefined : size.value)
              }
            >
              {size.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 필터 컴포넌트 메인
 */
export function TourFilters() {
  const [areaCodes, setAreaCodes] = useState<AreaCode[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 지역 목록 로드
  useEffect(() => {
    async function loadAreaCodes() {
      try {
        setIsLoadingAreas(true);
        setError(null);
        const response = await fetch("/api/tour?endpoint=area-code&numOfRows=20");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "지역 목록을 불러올 수 없습니다");
        }

        setAreaCodes(data.data || []);
      } catch (err) {
        console.error("Failed to load area codes:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
      } finally {
        setIsLoadingAreas(false);
      }
    }

    loadAreaCodes();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
      {/* 지역 필터 */}
      {isLoadingAreas ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-full sm:w-[180px]" />
        </div>
      ) : error ? (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">지역</label>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      ) : (
        <AreaFilter areaCodes={areaCodes} />
      )}

      {/* 관광 타입 필터 */}
      <ContentTypeFilter />

      {/* 정렬 옵션 */}
      <SortFilter />

      {/* 반려동물 필터 */}
      <PetFilter />
    </div>
  );
}

