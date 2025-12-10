/**
 * @file map.ts
 * @description 지도 관련 유틸리티 함수
 *
 * 좌표 변환 및 지도 관련 헬퍼 함수를 제공합니다.
 */

/**
 * KATEC 좌표계를 WGS84 좌표계로 변환
 *
 * 한국관광공사 API는 KATEC 좌표계를 정수형으로 저장하며,
 * 이를 10000000으로 나누어 WGS84 좌표로 변환합니다.
 *
 * @param mapx - 경도 (KATEC 좌표계, 정수형 문자열)
 * @param mapy - 위도 (KATEC 좌표계, 정수형 문자열)
 * @returns WGS84 좌표 (longitude, latitude)
 *
 * @example
 * ```typescript
 * const { lng, lat } = convertKatecToWgs84("1277672345", "351129876");
 * // lng: 127.7672345, lat: 35.1129876
 * ```
 */
export function convertKatecToWgs84(
  mapx: string,
  mapy: string
): { lng: number; lat: number } {
  const lng = parseInt(mapx, 10) / 10000000;
  const lat = parseInt(mapy, 10) / 10000000;

  return { lng, lat };
}

/**
 * 관광지 목록의 중심 좌표 계산
 *
 * 모든 관광지의 좌표를 평균내어 중심 좌표를 계산합니다.
 *
 * @param items - 관광지 목록 (mapx, mapy 필드 포함)
 * @returns 중심 좌표 (longitude, latitude) 또는 null
 *
 * @example
 * ```typescript
 * const center = calculateCenter(items);
 * if (center) {
 *   // 지도 중심 설정
 * }
 * ```
 */
export function calculateCenter(
  items: Array<{ mapx: string; mapy: string }>
): { lng: number; lat: number } | null {
  if (items.length === 0) {
    return null;
  }

  let totalLng = 0;
  let totalLat = 0;
  let validCount = 0;

  for (const item of items) {
    if (item.mapx && item.mapy) {
      const { lng, lat } = convertKatecToWgs84(item.mapx, item.mapy);
      if (!isNaN(lng) && !isNaN(lat) && lng !== 0 && lat !== 0) {
        totalLng += lng;
        totalLat += lat;
        validCount++;
      }
    }
  }

  if (validCount === 0) {
    return null;
  }

  return {
    lng: totalLng / validCount,
    lat: totalLat / validCount,
  };
}

