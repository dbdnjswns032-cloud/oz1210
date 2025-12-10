/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 한국관광공사 API를 활용하여 관광지 목록을 표시하는 메인 페이지입니다.
 * Server Component로 구현되어 초기 데이터를 서버에서 페칭합니다.
 */

import { Suspense } from "react";
import { getAreaBasedList, searchKeyword } from "@/lib/api/tour-api";
import type { HomePageSearchParams } from "@/lib/types/home";
import type { TourItem } from "@/lib/types/tour";
import { Loading } from "@/components/ui/loading";
import { Error } from "@/components/ui/error";
import { SearchParamsProvider } from "@/components/home/search-params-provider";
import { HeroSection } from "@/components/home/hero-section";
import { FiltersSection } from "@/components/home/filters-section";
import { ContentSection } from "@/components/home/content-section";

interface HomeProps {
  searchParams: Promise<HomePageSearchParams>;
}

/**
 * 초기 데이터 페칭 함수
 * 쿼리 파라미터에 따라 적절한 API를 호출합니다.
 */
async function fetchInitialData(searchParams: HomePageSearchParams) {
  const { keyword, areaCode, contentTypeId, pageNo = "1" } = searchParams;
  const pageNoNumber = parseInt(pageNo, 10) || 1;

  try {
    if (keyword && keyword.trim()) {
      // 키워드 검색
      return await searchKeyword({
        keyword: keyword.trim(),
        areaCode,
        contentTypeId,
        pageNo: pageNoNumber,
        numOfRows: 20,
      });
    } else {
      // 지역 기반 목록 조회
      return await getAreaBasedList({
        areaCode,
        contentTypeId,
        pageNo: pageNoNumber,
        numOfRows: 20,
      });
    }
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    throw error;
  }
}



/**
 * 홈페이지 메인 컴포넌트
 */
export default async function Home({ searchParams }: HomeProps) {
  // Next.js 15: searchParams를 await 처리
  const params = await searchParams;
  
  let initialData: { items: TourItem[]; totalCount: number } | undefined;
  let error: { message: string } | undefined;

  try {
    initialData = await fetchInitialData(params);
  } catch (err) {
    let errorMessage = "알 수 없는 오류가 발생했습니다.";
    try {
      if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
    } catch {
      // ignore
    }
    error = {
      message: errorMessage,
    };
  }

  return (
    <SearchParamsProvider initialParams={params}>
      {/* Hero Section */}
      <HeroSection />

      {/* Filters Section */}
      <FiltersSection />

      {/* Content Section */}
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Loading
              size="lg"
              text={
                params.keyword
                  ? `"${params.keyword}" 검색 중...`
                  : "관광지 정보를 불러오는 중..."
              }
            />
          </div>
        }
      >
        <ContentSection data={initialData} error={error} />
      </Suspense>
    </SearchParamsProvider>
  );
}
