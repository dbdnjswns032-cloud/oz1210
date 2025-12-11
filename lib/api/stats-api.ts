/**
 * @file stats-api.ts
 * @description 통계 데이터 수집 API
 *
 * 통계 대시보드에 필요한 데이터를 수집하는 함수들을 제공합니다.
 * 지역별, 타입별 관광지 개수를 집계하고, 통계 요약 정보를 생성합니다.
 *
 * @see {@link docs/PRD.md} 2.6장 - 통계 대시보드
 */

import { getAreaCode, getAreaBasedList, TourApiError } from "@/lib/api/tour-api";
import type { AreaCode } from "@/lib/types/tour";
import type {
  RegionStats,
  TypeStats,
  StatsSummary,
} from "@/lib/types/stats";
import { getAllContentTypes } from "@/lib/types/stats";

/**
 * 지역별 관광지 통계 조회
 * 각 시/도별 관광지 개수를 집계합니다.
 *
 * @returns 지역별 통계 배열 (code, name, count)
 * @throws {TourApiError} API 호출 실패 시
 */
export async function getRegionStats(): Promise<RegionStats[]> {
  try {
    // 1. 지역 코드 목록 조회 (시/도 레벨)
    const areaCodes = await getAreaCode();

    // 2. 각 지역별 totalCount 병렬 조회
    const statsPromises = areaCodes.map(async (area: AreaCode) => {
      try {
        const result = await getAreaBasedList({
          areaCode: area.code,
          numOfRows: 1,
          pageNo: 1,
        });
        return {
          code: area.code,
          name: area.name,
          count: result.totalCount,
        } as RegionStats;
      } catch (error) {
        // 개별 지역 조회 실패는 무시하고 계속 진행
        if (process.env.NODE_ENV === "development") {
          console.error(
            `Failed to get stats for area ${area.name} (${area.code}):`,
            error
          );
        }
        return null;
      }
    });

    const results = await Promise.all(statsPromises);
    const validResults = results.filter(
      (r): r is RegionStats => r !== null
    );

    // 모든 지역 조회 실패 시 에러 throw
    if (validResults.length === 0) {
      throw new TourApiError(
        "Failed to get region stats: All area queries failed"
      );
    }

    return validResults;
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `Failed to get region stats: ${
        error instanceof Error ? error.message : String(error)
      }`,
      undefined,
      error
    );
  }
}

/**
 * 타입별 관광지 통계 조회
 * 각 관광 타입별 관광지 개수를 집계하고 비율을 계산합니다.
 *
 * @returns 타입별 통계 배열 (contentTypeId, typeName, count, percentage)
 * @throws {TourApiError} API 호출 실패 시
 */
export async function getTypeStats(): Promise<TypeStats[]> {
  try {
    // 1. 타입 목록 조회
    const contentTypes = getAllContentTypes();

    // 2. 각 타입별 totalCount 병렬 조회
    const statsPromises = contentTypes.map(async (type) => {
      try {
        const result = await getAreaBasedList({
          contentTypeId: type.id,
          numOfRows: 1,
          pageNo: 1,
        });
        return {
          contentTypeId: type.id,
          typeName: type.name,
          count: result.totalCount,
        } as Omit<TypeStats, "percentage">;
      } catch (error) {
        // 개별 타입 조회 실패는 무시하고 계속 진행
        if (process.env.NODE_ENV === "development") {
          console.error(
            `Failed to get stats for type ${type.name} (${type.id}):`,
            error
          );
        }
        return null;
      }
    });

    const results = await Promise.all(statsPromises);
    const validResults = results.filter(
      (r): r is Omit<TypeStats, "percentage"> => r !== null
    );

    // 모든 타입 조회 실패 시 에러 throw
    if (validResults.length === 0) {
      throw new TourApiError(
        "Failed to get type stats: All content type queries failed"
      );
    }

    // 3. 비율 계산
    const total = validResults.reduce((sum, r) => sum + r.count, 0);
    const typeStats: TypeStats[] = validResults.map((r) => ({
      ...r,
      percentage:
        total > 0 ? Math.round((r.count / total) * 100 * 10) / 10 : 0,
    }));

    return typeStats;
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `Failed to get type stats: ${
        error instanceof Error ? error.message : String(error)
      }`,
      undefined,
      error
    );
  }
}

/**
 * 통계 요약 정보 조회
 * 전체 통계 요약 정보를 생성합니다.
 *
 * @returns 통계 요약 정보 (totalCount, topRegions, topTypes, lastUpdated)
 * @throws {TourApiError} API 호출 실패 시
 */
export async function getStatsSummary(): Promise<StatsSummary> {
  try {
    // 1. 지역별 및 타입별 통계 병렬 호출
    const [regionStats, typeStats] = await Promise.all([
      getRegionStats(),
      getTypeStats(),
    ]);

    // 2. 전체 관광지 수 계산 (모든 타입의 count 합계)
    const totalCount = typeStats.reduce((sum, t) => sum + t.count, 0);

    // 3. Top 3 지역 계산 (count 기준 내림차순 정렬)
    const topRegions = [...regionStats]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // 4. Top 3 타입 계산 (count 기준 내림차순 정렬)
    const topTypes = [...typeStats]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // 5. 마지막 업데이트 시간
    const lastUpdated = new Date().toISOString();

    return {
      totalCount,
      topRegions,
      topTypes,
      lastUpdated,
    };
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `Failed to get stats summary: ${
        error instanceof Error ? error.message : String(error)
      }`,
      undefined,
      error
    );
  }
}


