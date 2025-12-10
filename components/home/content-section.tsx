/**
 * @file content-section.tsx
 * @description 콘텐츠 영역 컴포넌트
 *
 * 관광지 목록과 지도를 표시하는 콘텐츠 섹션입니다.
 * Client Component로 구현하여 정렬 옵션 및 지도-리스트 연동을 처리합니다.
 *
 * 반응형 레이아웃:
 * - 데스크톱 (lg 이상): 리스트(좌측 50%) + 지도(우측 50%) 분할
 * - 모바일/태블릿: 탭 형태로 리스트/지도 전환
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { TourItem } from "@/lib/types/tour";
import { useSearchParamsContext } from "@/components/home/search-params-provider";
import { TourList } from "@/components/tour-list";
import { Error as ErrorDisplay } from "@/components/ui/error";
import { NaverMap } from "@/components/naver-map";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Map as MapIcon } from "lucide-react";
import { calculateCenter } from "@/lib/utils/map";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Loading } from "@/components/ui/loading";

interface ContentSectionProps {
  data?: { items: TourItem[]; totalCount: number };
  error?: { message: string };
}

export function ContentSection({ data, error }: ContentSectionProps) {
  const { params } = useSearchParamsContext();
  const [selectedContentId, setSelectedContentId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");
  const mapInstanceRef = useRef<any>(null);

  // 페이지네이션 상태 관리
  const [allItems, setAllItems] = useState<TourItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [paginationError, setPaginationError] = useState<string | null>(null);

  // 초기 데이터 설정 및 필터 변경 시 리셋
  useEffect(() => {
    if (data) {
      setAllItems(data.items);
      setTotalCount(data.totalCount);
      setCurrentPage(1);
      setPaginationError(null);
    }
  }, [data, params.keyword, params.areaCode, params.contentTypeId]);

  // 다음 페이지 존재 여부 계산
  const hasNextPage = allItems.length < totalCount;

  // 다음 페이지 데이터 로드 함수
  const fetchNextPage = useCallback(async () => {
    if (isLoadingNextPage || !hasNextPage) {
      return;
    }

    setIsLoadingNextPage(true);
    setPaginationError(null);

    try {
      const nextPage = currentPage + 1;
      const endpoint = params.keyword ? "search" : "area-based-list";
      
      const searchParams = new URLSearchParams();
      searchParams.set("endpoint", endpoint);
      searchParams.set("pageNo", String(nextPage));
      searchParams.set("numOfRows", "20");

      if (params.keyword) {
        searchParams.set("keyword", params.keyword);
      }
      if (params.areaCode) {
        searchParams.set("areaCode", params.areaCode);
      }
      if (params.contentTypeId) {
        searchParams.set("contentTypeId", params.contentTypeId);
      }

      const response = await fetch(`/api/tour?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "데이터를 불러올 수 없습니다");
      }

      const newItems = result.data.items || [];
      
      // 중복 제거 (contentid 기준)
      setAllItems((prev) => {
        const existingIds = new Set(prev.map((item) => item.contentid));
        const uniqueNewItems = newItems.filter(
          (item: TourItem) => !existingIds.has(item.contentid)
        );
        return [...prev, ...uniqueNewItems];
      });

      setCurrentPage(nextPage);
    } catch (err) {
      console.error("다음 페이지 로드 실패:", err);
      setPaginationError(
        err instanceof Error ? err.message : "다음 페이지를 불러올 수 없습니다"
      );
    } finally {
      setIsLoadingNextPage(false);
    }
  }, [isLoadingNextPage, hasNextPage, currentPage, params]);

  // 무한 스크롤 훅
  const { ref: infiniteScrollRef } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage: isLoadingNextPage,
    fetchNextPage,
    enabled: !error && !!data,
  });

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <ErrorDisplay
          message="데이터를 불러올 수 없습니다"
          description={error?.message || "알 수 없는 오류가 발생했습니다."}
          showRetry
          onRetry={() => window.location.reload()}
        />
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const isSearchMode = !!params.keyword;

  // 지도 중심 좌표 계산 (모든 로드된 아이템 기준)
  const mapCenter = allItems.length > 0 
    ? calculateCenter(allItems) || undefined
    : undefined;

  // 리스트 항목 클릭 핸들러 (지도 이동)
  const handleCardClick = (contentId: string) => {
    setSelectedContentId(contentId);
    // 모바일에서는 지도 탭으로 전환
    if (window.innerWidth < 1024) {
      setActiveTab("map");
    }
    // 지도 이동은 NaverMap 컴포넌트 내부에서 처리
  };

  // 지도 준비 완료 콜백
  const handleMapReady = (map: any) => {
    mapInstanceRef.current = map;
  };

  // 마커 클릭 핸들러
  const handleMarkerClick = (contentId: string) => {
    setSelectedContentId(contentId);
    // 모바일에서는 리스트 탭으로 전환하지 않음 (선택 사항)
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        {isSearchMode ? (
          <>
            <h2 className="text-2xl font-semibold">
              검색 결과: &quot;{params.keyword}&quot;
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              총 {totalCount.toLocaleString()}개의 검색 결과가 있습니다
              {allItems.length < totalCount && (
                <span className="ml-2">({allItems.length}개 로드됨)</span>
              )}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold">관광지 목록</h2>
            <p className="text-sm text-muted-foreground mt-1">
              총 {totalCount.toLocaleString()}개의 관광지가 있습니다
              {allItems.length < totalCount && (
                <span className="ml-2">({allItems.length}개 로드됨)</span>
              )}
            </p>
          </>
        )}
      </div>

      {/* 반응형 레이아웃 */}
      {/* 데스크톱: 분할 레이아웃 */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        {/* 좌측: 리스트 */}
        <div className="space-y-6">
          <TourList
            items={allItems}
            totalCount={totalCount}
            sortBy={params.sortBy}
            searchKeyword={params.keyword}
            onCardClick={handleCardClick}
            selectedContentId={selectedContentId}
          />

          {/* 무한 스크롤 감지 영역 및 로딩 인디케이터 */}
          <div ref={infiniteScrollRef} className="py-4">
            {isLoadingNextPage && (
              <div className="flex justify-center items-center py-4">
                <Loading size="md" text="더 많은 관광지를 불러오는 중..." />
              </div>
            )}
            {paginationError && (
              <div className="text-center py-4">
                <p className="text-sm text-destructive">{paginationError}</p>
                <button
                  onClick={fetchNextPage}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  다시 시도
                </button>
              </div>
            )}
            {!hasNextPage && allItems.length > 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                모든 관광지를 불러왔습니다
              </div>
            )}
          </div>
        </div>

        {/* 우측: 지도 */}
        <div className="sticky top-20 h-[calc(100vh-8rem)]">
          <NaverMap
            items={allItems}
            center={mapCenter}
            zoom={12}
            selectedContentId={selectedContentId}
            onMarkerClick={handleMarkerClick}
            onMapReady={handleMapReady}
          />
        </div>
      </div>

      {/* 모바일/태블릿: 탭 레이아웃 */}
      <div className="lg:hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "list" | "map")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              목록
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapIcon className="h-4 w-4" />
              지도
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <TourList
              items={allItems}
              totalCount={totalCount}
              sortBy={params.sortBy}
              searchKeyword={params.keyword}
              onCardClick={handleCardClick}
              selectedContentId={selectedContentId}
            />

            {/* 무한 스크롤 감지 영역 및 로딩 인디케이터 */}
            <div ref={infiniteScrollRef} className="py-4">
              {isLoadingNextPage && (
                <div className="flex justify-center items-center py-4">
                  <Loading size="md" text="더 많은 관광지를 불러오는 중..." />
                </div>
              )}
              {paginationError && (
                <div className="text-center py-4">
                  <p className="text-sm text-destructive">{paginationError}</p>
                  <button
                    onClick={fetchNextPage}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    다시 시도
                  </button>
                </div>
              )}
              {!hasNextPage && allItems.length > 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  모든 관광지를 불러왔습니다
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="map">
            <NaverMap
              items={allItems}
              center={mapCenter}
              zoom={12}
              selectedContentId={selectedContentId}
              onMarkerClick={handleMarkerClick}
              onMapReady={handleMapReady}
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
