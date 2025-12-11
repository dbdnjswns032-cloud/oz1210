/**
 * @file tour-api.ts
 * @description 한국관광공사 공공 API 클라이언트
 *
 * 한국관광공사 KorService2 API를 호출하는 함수들을 제공합니다.
 * 모든 API 호출은 공통 파라미터 처리, 에러 처리, 재시도 로직을 포함합니다.
 *
 * @see {@link https://www.data.go.kr/data/15101578/openapi.do} - 한국관광공사 API 문서
 */

import type {
  TourItem,
  TourDetail,
  TourIntro,
  TourImage,
  PetTourInfo,
  AreaCode,
  ApiResponse,
  ListResponse,
} from "@/lib/types/tour";

/**
 * API Base URL
 */
const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

/**
 * 커스텀 에러 클래스
 */
export class TourApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = "TourApiError";
    Object.setPrototypeOf(this, TourApiError.prototype);
  }
}

/**
 * API 키 가져오기
 * 서버 사이드: TOUR_API_KEY 우선, 없으면 NEXT_PUBLIC_TOUR_API_KEY
 * 클라이언트 사이드: NEXT_PUBLIC_TOUR_API_KEY만 사용 가능
 */
function getApiKey(): string {
  // 서버 사이드에서 TOUR_API_KEY 우선 사용
  const serverKey =
    typeof window === "undefined" ? process.env.TOUR_API_KEY : undefined;
  const publicKey = process.env.NEXT_PUBLIC_TOUR_API_KEY;

  const apiKey = serverKey || publicKey;

  if (!apiKey) {
    throw new TourApiError(
      "Tour API key is missing. Please set TOUR_API_KEY or NEXT_PUBLIC_TOUR_API_KEY environment variable.",
    );
  }

  return apiKey;
}

/**
 * 공통 파라미터 생성
 */
function getCommonParams(): Record<string, string> {
  return {
    serviceKey: getApiKey(),
    MobileOS: "ETC",
    MobileApp: "MyTrip",
    _type: "json",
  };
}

/**
 * URL 생성 (쿼리 파라미터 포함)
 */
function buildUrl(
  endpoint: string,
  params: Record<string, string | number | undefined> | Record<string, any>,
): string {
  const commonParams = getCommonParams();
  const allParams = { ...commonParams, ...params };

  // undefined 값 제거
  const filteredParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(allParams)) {
    if (value !== undefined && value !== null) {
      filteredParams[key] = String(value);
    }
  }

  const queryString = new URLSearchParams(filteredParams).toString();
  return `${BASE_URL}${endpoint}?${queryString}`;
}

/**
 * 지수 백오프로 대기
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 재시도 로직이 포함된 fetch 래퍼
 * 최대 3회 재시도, 지수 백오프 (1초, 2초, 4초)
 * 네트워크 에러 또는 5xx 에러만 재시도
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // 4xx 에러는 재시도하지 않음
      if (response.status >= 400 && response.status < 500) {
        throw new TourApiError(
          `API request failed with status ${response.status}`,
          response.status,
        );
      }

      // 5xx 에러는 재시도
      if (response.status >= 500) {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 1초, 2초, 4초
          if (process.env.NODE_ENV === "development") {
            console.log(
              `[Tour API] Retrying after ${delay}ms (attempt ${
                attempt + 1
              }/${maxRetries})`,
            );
          }
          await sleep(delay);
          continue;
        }
        throw new TourApiError(
          `API request failed with status ${response.status} after ${maxRetries} retries`,
          response.status,
        );
      }

      // 성공
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // TourApiError는 즉시 throw
      if (error instanceof TourApiError) {
        throw error;
      }

      // 네트워크 에러는 재시도
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 1초, 2초, 4초
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[Tour API] Network error, retrying after ${delay}ms (attempt ${
              attempt + 1
            }/${maxRetries})`,
          );
        }
        await sleep(delay);
        continue;
      }
    }
  }

  // 모든 재시도 실패
  throw new TourApiError(
    `API request failed after ${maxRetries} retries: ${lastError?.message}`,
    undefined,
    lastError,
  );
}

/**
 * API 응답 파싱
 * 응답 구조: { response: { body: { items: { item: T | T[] } } } }
 */
function parseApiResponse<T>(data: ApiResponse<T>): T | T[] {
  const items = data.response?.body?.items?.item;

  if (items === undefined || items === null) {
    throw new TourApiError("Invalid API response: items.item is missing");
  }

  return items;
}

/**
 * 배열로 정규화 (단일 항목도 배열로 변환)
 */
function normalizeToArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item];
}

/**
 * 지역코드 조회 파라미터
 */
export interface GetAreaCodeParams {
  numOfRows?: number;
  pageNo?: number;
  areaCode?: string; // 시/도 코드 (선택)
}

/**
 * 지역코드 조회 (areaCode2)
 */
export async function getAreaCode(
  params?: GetAreaCodeParams,
): Promise<AreaCode[]> {
  try {
    const url = buildUrl("/areaCode2", params || {});
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new TourApiError(
        `Failed to fetch area codes: ${response.statusText}`,
        response.status,
      );
    }

    const data: ApiResponse<AreaCode> = await response.json();
    const items = parseApiResponse(data);
    return normalizeToArray(items);
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `Failed to get area codes: ${
        error instanceof Error ? error.message : String(error)
      }`,
      undefined,
      error,
    );
  }
}

/**
 * 지역 기반 목록 조회 파라미터
 */
export interface GetAreaBasedListParams {
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
  sigunguCode?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
}

/**
 * 지역 기반 목록 조회 (areaBasedList2)
 */
export async function getAreaBasedList(
  params: GetAreaBasedListParams = {},
): Promise<ListResponse<TourItem>> {
  try {
    const { numOfRows = 10, pageNo = 1, ...restParams } = params;
    const url = buildUrl("/areaBasedList2", {
      numOfRows,
      pageNo,
      ...restParams,
    });

    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new TourApiError(
        `Failed to fetch area based list: ${response.statusText}`,
        response.status,
      );
    }

    const data: ApiResponse<TourItem> = await response.json();
    const items = parseApiResponse(data);
    const normalizedItems = normalizeToArray(items);

    return {
      items: normalizedItems,
      totalCount: data.response.body.totalCount || normalizedItems.length,
      pageNo: data.response.body.pageNo || pageNo,
      numOfRows: data.response.body.numOfRows || numOfRows,
    };
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `Failed to get area based list: ${
        error instanceof Error ? error.message : String(error)
      }`,
      undefined,
      error,
    );
  }
}

/**
 * 키워드 검색 파라미터
 */
export interface SearchKeywordParams {
  keyword: string;
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
}

/**
 * 키워드 검색 (searchKeyword2)
 */
export async function searchKeyword(
  params: SearchKeywordParams,
): Promise<ListResponse<TourItem>> {
  try {
    const { numOfRows = 10, pageNo = 1, ...restParams } = params;
    const url = buildUrl("/searchKeyword2", {
      numOfRows,
      pageNo,
      ...restParams,
    });

    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new TourApiError(
        `Failed to search keyword: ${response.statusText}`,
        response.status,
      );
    }

    const data: ApiResponse<TourItem> = await response.json();
    const items = parseApiResponse(data);
    const normalizedItems = normalizeToArray(items);

    return {
      items: normalizedItems,
      totalCount: data.response.body.totalCount || normalizedItems.length,
    };
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `Failed to search keyword: ${
        error instanceof Error ? error.message : String(error)
      }`,
      undefined,
      error,
    );
  }
}

/**
 * 상세 공통 정보 조회 파라미터
 */
export interface GetDetailCommonParams {
  contentId: string;
  contentTypeId?: string;
  defaultYN?: string;
  firstImageYN?: string;
  areacodeYN?: string;
  catcodeYN?: string;
  addrinfoYN?: string;
  mapinfoYN?: string;
  overviewYN?: string;
}

/**
 * 상세 공통 정보 조회 (detailCommon2)
 */
export async function getDetailCommon(
  params: GetDetailCommonParams,
): Promise<TourDetail> {
  try {
    const url = buildUrl("/detailCommon2", params);
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new TourApiError(
        `Failed to fetch detail common: ${response.statusText}`,
        response.status,
      );
    }

    const data: ApiResponse<TourDetail> = await response.json();
    const items = parseApiResponse(data);
    const normalizedItems = normalizeToArray(items);

    if (normalizedItems.length === 0) {
      throw new TourApiError(
        `Tour detail not found for contentId: ${params.contentId}`,
        404,
      );
    }

    return normalizedItems[0];
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `Failed to get detail common: ${
        error instanceof Error ? error.message : String(error)
      }`,
      undefined,
      error,
    );
  }
}

/**
 * 상세 소개 정보 조회 파라미터
 */
export interface GetDetailIntroParams {
  contentId: string;
  contentTypeId: string;
}

/**
 * 상세 소개 정보 조회 (detailIntro2)
 */
export async function getDetailIntro(
  params: GetDetailIntroParams,
): Promise<TourIntro> {
  try {
    const url = buildUrl("/detailIntro2", params);
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new TourApiError(
        `Failed to fetch detail intro: ${response.statusText}`,
        response.status,
      );
    }

    const data: ApiResponse<TourIntro> = await response.json();
    const items = parseApiResponse(data);
    const normalizedItems = normalizeToArray(items);

    if (normalizedItems.length === 0) {
      throw new TourApiError(
        `Tour intro not found for contentId: ${params.contentId}`,
        404,
      );
    }

    return normalizedItems[0];
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `Failed to get detail intro: ${
        error instanceof Error ? error.message : String(error)
      }`,
      undefined,
      error,
    );
  }
}

/**
 * 상세 이미지 목록 조회 파라미터
 */
export interface GetDetailImageParams {
  contentId: string;
  imageYN?: string;
  subImageYN?: string;
}

/**
 * 상세 이미지 목록 조회 (detailImage2)
 */
export async function getDetailImage(
  params: GetDetailImageParams,
): Promise<TourImage[]> {
  try {
    const url = buildUrl("/detailImage2", params);
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      // 404는 데이터가 없는 것으로 간주
      if (response.status === 404) {
        return [];
      }
      throw new TourApiError(
        `Failed to fetch detail image: ${response.statusText}`,
        response.status,
      );
    }

    const data: ApiResponse<TourImage> = await response.json();

    // items.item이 없으면 빈 배열 반환
    if (!data.response?.body?.items?.item) {
      return [];
    }

    const items = parseApiResponse(data);
    return normalizeToArray(items);
  } catch (error) {
    // TourApiError에서 "items.item is missing" 에러는 빈 배열로 처리
    if (
      error instanceof TourApiError &&
      error.message.includes("items.item is missing")
    ) {
      return [];
    }

    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `Failed to get detail image: ${
        error instanceof Error ? error.message : String(error)
      }`,
      undefined,
      error,
    );
  }
}

/**
 * 반려동물 정보 조회 파라미터
 */
export interface GetDetailPetTourParams {
  contentId: string;
}

/**
 * 반려동물 정보 조회 (detailPetTour2)
 * 정보가 없을 수 있으므로 null 반환 가능
 */
export async function getDetailPetTour(
  params: GetDetailPetTourParams,
): Promise<PetTourInfo | null> {
  try {
    const url = buildUrl("/detailPetTour2", params);
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      // 404는 데이터가 없는 것으로 간주
      if (response.status === 404) {
        return null;
      }
      throw new TourApiError(
        `Failed to fetch pet tour info: ${response.statusText}`,
        response.status,
      );
    }

    const data: ApiResponse<PetTourInfo> = await response.json();

    // items.item이 없으면 null 반환
    if (!data.response?.body?.items?.item) {
      return null;
    }

    const items = parseApiResponse(data);
    const normalizedItems = normalizeToArray(items);

    // 정보가 없으면 null 반환
    if (normalizedItems.length === 0) {
      return null;
    }

    return normalizedItems[0];
  } catch (error) {
    // TourApiError에서 "items.item is missing" 에러는 null로 처리
    if (
      error instanceof TourApiError &&
      error.message.includes("items.item is missing")
    ) {
      return null;
    }

    // 404 에러는 정보가 없는 것으로 간주하고 null 반환
    if (error instanceof TourApiError && error.statusCode === 404) {
      return null;
    }

    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `Failed to get pet tour info: ${
        error instanceof Error ? error.message : String(error)
      }`,
      undefined,
      error,
    );
  }
}
