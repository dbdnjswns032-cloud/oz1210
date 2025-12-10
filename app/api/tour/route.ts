/**
 * @file route.ts
 * @description 한국관광공사 API Route
 *
 * Next.js API Route로 한국관광공사 API 클라이언트 함수들을 래핑합니다.
 * 쿼리 파라미터 `endpoint`로 엔드포인트를 구분하며, 각 엔드포인트별 파라미터를 처리합니다.
 *
 * 사용 예시:
 * - GET /api/tour?endpoint=area-code
 * - GET /api/tour?endpoint=area-based-list&areaCode=1&contentTypeId=12
 * - GET /api/tour?endpoint=search&keyword=경복궁
 * - GET /api/tour?endpoint=detail/common&contentId=125266
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAreaCode,
  getAreaBasedList,
  searchKeyword,
  getDetailCommon,
  getDetailIntro,
  getDetailImage,
  getDetailPetTour,
  TourApiError,
  type GetAreaCodeParams,
  type GetAreaBasedListParams,
  type SearchKeywordParams,
  type GetDetailCommonParams,
  type GetDetailIntroParams,
  type GetDetailImageParams,
  type GetDetailPetTourParams,
} from "@/lib/api/tour-api";

/**
 * 통일된 API 응답 형식
 */
type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

type ApiErrorResponse = {
  success: false;
  error: string;
  statusCode?: number;
};

/**
 * 쿼리 파라미터에서 값을 추출하고 검증하는 헬퍼 함수
 */
function getQueryParam(
  searchParams: URLSearchParams,
  key: string,
  required: boolean = false
): string | undefined {
  const value = searchParams.get(key);
  if (required && !value) {
    throw new Error(`Missing required parameter: ${key}`);
  }
  return value || undefined;
}

function getQueryParamAsNumber(
  searchParams: URLSearchParams,
  key: string,
  defaultValue?: number
): number | undefined {
  const value = searchParams.get(key);
  if (!value) return defaultValue;
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Invalid number parameter: ${key}`);
  }
  return num;
}

/**
 * 에러를 HTTP 응답으로 변환
 */
function handleError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof TourApiError) {
    const statusCode = error.statusCode || 500;
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        error: error.message,
        statusCode,
      },
      { status: statusCode }
    );
  }

  if (error instanceof Error) {
    // 파라미터 검증 에러는 400
    if (error.message.includes("Missing required parameter") || error.message.includes("Invalid")) {
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: error.message,
          statusCode: 400,
        },
        { status: 400 }
      );
    }
  }

  // 예상치 못한 에러
  console.error("Unexpected error in /api/tour:", error);
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      error: "Internal server error",
      statusCode: 500,
    },
    { status: 500 }
  );
}

/**
 * 지역코드 조회 처리
 */
async function handleAreaCode(searchParams: URLSearchParams): Promise<NextResponse> {
  const params: GetAreaCodeParams = {
    numOfRows: getQueryParamAsNumber(searchParams, "numOfRows"),
    pageNo: getQueryParamAsNumber(searchParams, "pageNo"),
    areaCode: getQueryParam(searchParams, "areaCode"),
  };

  const data = await getAreaCode(params);
  return NextResponse.json<ApiSuccessResponse<typeof data>>({
    success: true,
    data,
  });
}

/**
 * 지역 기반 목록 조회 처리
 */
async function handleAreaBasedList(searchParams: URLSearchParams): Promise<NextResponse> {
  const params: GetAreaBasedListParams = {
    areaCode: getQueryParam(searchParams, "areaCode"),
    contentTypeId: getQueryParam(searchParams, "contentTypeId"),
    numOfRows: getQueryParamAsNumber(searchParams, "numOfRows", 10),
    pageNo: getQueryParamAsNumber(searchParams, "pageNo", 1),
    sigunguCode: getQueryParam(searchParams, "sigunguCode"),
    cat1: getQueryParam(searchParams, "cat1"),
    cat2: getQueryParam(searchParams, "cat2"),
    cat3: getQueryParam(searchParams, "cat3"),
  };

  const data = await getAreaBasedList(params);
  return NextResponse.json<ApiSuccessResponse<typeof data>>({
    success: true,
    data,
  });
}

/**
 * 키워드 검색 처리
 */
async function handleSearch(searchParams: URLSearchParams): Promise<NextResponse> {
  const keyword = getQueryParam(searchParams, "keyword", true);
  if (!keyword) {
    throw new Error("Missing required parameter: keyword");
  }

  const params: SearchKeywordParams = {
    keyword,
    areaCode: getQueryParam(searchParams, "areaCode"),
    contentTypeId: getQueryParam(searchParams, "contentTypeId"),
    numOfRows: getQueryParamAsNumber(searchParams, "numOfRows", 10),
    pageNo: getQueryParamAsNumber(searchParams, "pageNo", 1),
  };

  const data = await searchKeyword(params);
  return NextResponse.json<ApiSuccessResponse<typeof data>>({
    success: true,
    data,
  });
}

/**
 * 상세 공통 정보 조회 처리
 */
async function handleDetailCommon(searchParams: URLSearchParams): Promise<NextResponse> {
  const contentId = getQueryParam(searchParams, "contentId", true);
  if (!contentId) {
    throw new Error("Missing required parameter: contentId");
  }

  const params: GetDetailCommonParams = {
    contentId,
    contentTypeId: getQueryParam(searchParams, "contentTypeId"),
    defaultYN: getQueryParam(searchParams, "defaultYN"),
    firstImageYN: getQueryParam(searchParams, "firstImageYN"),
    areacodeYN: getQueryParam(searchParams, "areacodeYN"),
    catcodeYN: getQueryParam(searchParams, "catcodeYN"),
    addrinfoYN: getQueryParam(searchParams, "addrinfoYN"),
    mapinfoYN: getQueryParam(searchParams, "mapinfoYN"),
    overviewYN: getQueryParam(searchParams, "overviewYN"),
  };

  const data = await getDetailCommon(params);
  return NextResponse.json<ApiSuccessResponse<typeof data>>({
    success: true,
    data,
  });
}

/**
 * 상세 소개 정보 조회 처리
 */
async function handleDetailIntro(searchParams: URLSearchParams): Promise<NextResponse> {
  const contentId = getQueryParam(searchParams, "contentId", true);
  const contentTypeId = getQueryParam(searchParams, "contentTypeId", true);

  if (!contentId) {
    throw new Error("Missing required parameter: contentId");
  }
  if (!contentTypeId) {
    throw new Error("Missing required parameter: contentTypeId");
  }

  const params: GetDetailIntroParams = {
    contentId,
    contentTypeId,
  };

  const data = await getDetailIntro(params);
  return NextResponse.json<ApiSuccessResponse<typeof data>>({
    success: true,
    data,
  });
}

/**
 * 이미지 목록 조회 처리
 */
async function handleDetailImage(searchParams: URLSearchParams): Promise<NextResponse> {
  const contentId = getQueryParam(searchParams, "contentId", true);
  if (!contentId) {
    throw new Error("Missing required parameter: contentId");
  }

  const params: GetDetailImageParams = {
    contentId,
    imageYN: getQueryParam(searchParams, "imageYN"),
    subImageYN: getQueryParam(searchParams, "subImageYN"),
  };

  const data = await getDetailImage(params);
  return NextResponse.json<ApiSuccessResponse<typeof data>>({
    success: true,
    data,
  });
}

/**
 * 반려동물 정보 조회 처리
 */
async function handleDetailPet(searchParams: URLSearchParams): Promise<NextResponse> {
  const contentId = getQueryParam(searchParams, "contentId", true);
  if (!contentId) {
    throw new Error("Missing required parameter: contentId");
  }

  const params: GetDetailPetTourParams = {
    contentId,
  };

  const data = await getDetailPetTour(params);
  return NextResponse.json<ApiSuccessResponse<typeof data>>({
    success: true,
    data,
  });
}

/**
 * GET 핸들러
 * 쿼리 파라미터 `endpoint`로 엔드포인트를 구분하여 처리
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: "Missing required parameter: endpoint",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // 엔드포인트별 라우팅
    switch (endpoint) {
      case "area-code":
        return await handleAreaCode(searchParams);

      case "area-based-list":
        return await handleAreaBasedList(searchParams);

      case "search":
        return await handleSearch(searchParams);

      case "detail/common":
        return await handleDetailCommon(searchParams);

      case "detail/intro":
        return await handleDetailIntro(searchParams);

      case "detail/image":
        return await handleDetailImage(searchParams);

      case "detail/pet":
        return await handleDetailPet(searchParams);

      default:
        return NextResponse.json<ApiErrorResponse>(
          {
            success: false,
            error: `Unknown endpoint: ${endpoint}`,
            statusCode: 400,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    return handleError(error);
  }
}

