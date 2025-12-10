/**
 * @file stats.ts
 * @description 통계 대시보드 데이터 타입 정의
 *
 * 이 파일은 통계 페이지에서 사용하는 데이터 구조를 TypeScript 타입으로 정의합니다.
 * 지역별, 타입별 관광지 통계 및 통계 요약 정보를 포함합니다.
 *
 * @see {@link docs/PRD.md} 2.6장 통계 대시보드
 */

/**
 * 지역별 관광지 통계
 */
export interface RegionStats {
  code: string; // 지역 코드
  name: string; // 지역명 (서울, 부산, 제주 등)
  count: number; // 관광지 개수
}

/**
 * 관광 타입별 통계
 */
export interface TypeStats {
  contentTypeId: string; // 타입 ID (12, 14, 15, 25, 28, 32, 38, 39)
  typeName: string; // 타입명 (관광지, 문화시설, 축제/행사, 여행코스, 레포츠, 숙박, 쇼핑, 음식점)
  count: number; // 관광지 개수
  percentage?: number; // 비율 (백분율, 0-100)
}

/**
 * 통계 요약 정보
 */
export interface StatsSummary {
  totalCount: number; // 전체 관광지 수
  topRegions: RegionStats[]; // Top 3 지역
  topTypes: TypeStats[]; // Top 3 타입
  lastUpdated: string; // 마지막 업데이트 시간 (ISO 8601 형식)
}

/**
 * Content Type ID 타입
 * PRD 4.4장 참조: 관광 타입 ID 정의
 */
export type ContentTypeId = "12" | "14" | "15" | "25" | "28" | "32" | "38" | "39";

/**
 * Content Type ID와 타입명 매핑
 * PRD 4.4장 참조
 */
export const CONTENT_TYPES: Record<ContentTypeId, { id: ContentTypeId; name: string }> = {
  "12": { id: "12", name: "관광지" },
  "14": { id: "14", name: "문화시설" },
  "15": { id: "15", name: "축제/행사" },
  "25": { id: "25", name: "여행코스" },
  "28": { id: "28", name: "레포츠" },
  "32": { id: "32", name: "숙박" },
  "38": { id: "38", name: "쇼핑" },
  "39": { id: "39", name: "음식점" },
} as const;

/**
 * Content Type ID로 타입명 조회
 * @param id - Content Type ID (예: "12", "14")
 * @returns 타입명 (예: "관광지", "문화시설")
 */
export function getContentTypeName(id: string): string {
  return CONTENT_TYPES[id as ContentTypeId]?.name || "알 수 없음";
}

/**
 * 타입명으로 Content Type ID 조회
 * @param name - 타입명 (예: "관광지", "문화시설")
 * @returns Content Type ID 또는 undefined
 */
export function getContentTypeId(name: string): ContentTypeId | undefined {
  const entry = Object.values(CONTENT_TYPES).find((type) => type.name === name);
  return entry?.id;
}

/**
 * 전체 Content Type 목록 반환
 * @returns Content Type 배열
 */
export function getAllContentTypes(): Array<{ id: ContentTypeId; name: string }> {
  return Object.values(CONTENT_TYPES);
}

