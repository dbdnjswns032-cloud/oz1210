/**
 * @file tour.ts
 * @description 한국관광공사 공공 API 응답 데이터 타입 정의
 *
 * 이 파일은 한국관광공사 KorService2 API의 응답 데이터 구조를 TypeScript 타입으로 정의합니다.
 * 모든 필드는 API 응답에 없을 수 있으므로 선택적(optional)으로 정의합니다.
 *
 * @see {@link https://www.data.go.kr/data/15101578/openapi.do} - 한국관광공사 API 문서
 */

/**
 * 관광지 목록 항목 (areaBasedList2, searchKeyword2 응답)
 */
export interface TourItem {
  addr1: string; // 주소
  addr2?: string; // 상세주소
  areacode: string; // 지역코드
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  title: string; // 제목
  mapx: string; // 경도 (KATEC 좌표계, 정수형)
  mapy: string; // 위도 (KATEC 좌표계, 정수형)
  firstimage?: string; // 대표이미지1
  firstimage2?: string; // 대표이미지2
  tel?: string; // 전화번호
  cat1?: string; // 대분류
  cat2?: string; // 중분류
  cat3?: string; // 소분류
  modifiedtime: string; // 수정일
}

/**
 * 관광지 상세 정보 (detailCommon2 응답)
 */
export interface TourDetail {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  zipcode?: string;
  tel?: string;
  homepage?: string;
  overview?: string; // 개요 (긴 설명)
  firstimage?: string;
  firstimage2?: string;
  mapx: string; // 경도 (KATEC 좌표계)
  mapy: string; // 위도 (KATEC 좌표계)
  areacode?: string; // 지역코드 (추천 기능용)
}

/**
 * 관광지 운영 정보 (detailIntro2 응답)
 * contenttypeid에 따라 필드가 다르므로 모든 가능한 필드를 선택적으로 정의
 */
export interface TourIntro {
  contentid: string;
  contenttypeid: string;
  // 공통 필드
  infocenter?: string; // 문의처
  restdate?: string; // 휴무일
  usetime?: string; // 이용시간/개장시간
  parking?: string; // 주차 가능 여부
  chkpet?: string; // 반려동물 동반 가능 여부
  // 관광지(12) 관련
  expguide?: string; // 체험 안내
  expagerange?: string; // 체험 가능 연령
  // 문화시설(14) 관련
  usefee?: string; // 이용요금
  discountinfo?: string; // 할인 정보
  spendtime?: string; // 관람 소요시간
  // 축제/행사(15) 관련
  eventstartdate?: string; // 행사 시작일
  eventenddate?: string; // 행사 종료일
  eventplace?: string; // 행사 장소
  eventhomepage?: string; // 행사 홈페이지
  // 여행코스(25) 관련
  distance?: string; // 코스 총 거리
  taketime?: string; // 코스 총 소요시간
  // 레포츠(28) 관련
  openperiod?: string; // 개장 기간
  reservation?: string; // 예약 안내
  // 숙박(32) 관련
  checkintime?: string; // 체크인 시간
  checkouttime?: string; // 체크아웃 시간
  roomcount?: string; // 객실 수
  roomtype?: string; // 객실 유형
  // 쇼핑(38) 관련
  opentime?: string; // 영업시간
  resttime?: string; // 쉬는 시간
  // 음식점(39) 관련
  firstmenu?: string; // 대표 메뉴
  treatmenu?: string; // 취급 메뉴
  // 기타
  [key: string]: string | undefined; // 타입별 추가 필드 대응
}

/**
 * 관광지 이미지 정보 (detailImage2 응답)
 */
export interface TourImage {
  contentid: string;
  imagename?: string; // 이미지명
  originimgurl?: string; // 원본 이미지 URL
  serialnum?: string; // 이미지 일련번호
  smallimageurl?: string; // 썸네일 이미지 URL
}

/**
 * 반려동물 동반 여행 정보 (detailPetTour2 응답)
 */
export interface PetTourInfo {
  contentid: string;
  contenttypeid: string;
  chkpetleash?: string; // 애완동물 동반 여부
  chkpetsize?: string; // 애완동물 크기
  chkpetplace?: string; // 입장 가능 장소 (실내/실외)
  chkpetfee?: string; // 추가 요금
  petinfo?: string; // 기타 반려동물 정보
  parking?: string; // 주차장 정보
}

/**
 * 지역 코드 정보 (areaCode2 응답)
 */
export interface AreaCode {
  code: string; // 지역코드
  name: string; // 지역명
  rnum?: string; // 순번
}

/**
 * API 응답 래퍼 타입
 * 한국관광공사 API는 모든 응답을 다음과 같은 구조로 반환합니다:
 * {
 *   response: {
 *     body: {
 *       items: {
 *         item: T | T[]
 *       },
 *       totalCount?: number,
 *       numOfRows?: number,
 *       pageNo?: number
 *     }
 *   }
 * }
 */
export interface ApiResponse<T> {
  response: {
    body: {
      items: {
        item: T | T[];
      };
      totalCount?: number;
      numOfRows?: number;
      pageNo?: number;
    };
  };
}

/**
 * 목록 조회 응답 타입 (items가 배열인 경우)
 */
export interface ListResponse<T> {
  items: T[];
  totalCount: number;
  pageNo?: number;
  numOfRows?: number;
}



