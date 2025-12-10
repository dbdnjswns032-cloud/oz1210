/**
 * @file home.ts
 * @description 홈페이지 관련 타입 정의
 */

/**
 * 정렬 옵션 타입
 */
export type SortBy = "latest" | "name";

/**
 * 반려동물 크기 타입
 */
export type PetSize = "small" | "medium" | "large";

/**
 * 홈페이지 쿼리 파라미터 타입
 */
export interface HomePageSearchParams {
  keyword?: string;
  areaCode?: string;
  contentTypeId?: string;
  pageNo?: string;
  sortBy?: SortBy;
  petFriendly?: string; // "true" 또는 undefined (URL 쿼리는 문자열)
  petSize?: PetSize;
}

