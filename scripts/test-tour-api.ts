/**
 * @file test-tour-api.ts
 * @description 한국관광공사 API 클라이언트 테스트 스크립트
 *
 * 각 API 함수를 테스트하고 응답을 확인합니다.
 * 실행 방법: pnpm exec tsx scripts/test-tour-api.ts
 */

import {
  getAreaCode,
  getAreaBasedList,
  searchKeyword,
  getDetailCommon,
  getDetailIntro,
  getDetailImage,
  getDetailPetTour,
  TourApiError,
} from "../lib/api/tour-api";

// 테스트용 관광지 contentId (실제 존재하는 값으로 변경 필요)
const TEST_CONTENT_ID = "125266"; // 예시: 경복궁
const TEST_CONTENT_TYPE_ID = "12"; // 관광지

/**
 * 테스트 헬퍼 함수
 */
async function testFunction(
  name: string,
  fn: () => Promise<any>
): Promise<void> {
  console.log(`\n🧪 Testing: ${name}`);
  console.log("─".repeat(50));
  try {
    const result = await fn();
    console.log(`✅ Success: ${name}`);
    console.log(`📊 Result:`, JSON.stringify(result, null, 2).substring(0, 200) + "...");
  } catch (error) {
    console.error(`❌ Error: ${name}`);
    if (error instanceof TourApiError) {
      console.error(`   Status: ${error.statusCode || "N/A"}`);
      console.error(`   Message: ${error.message}`);
    } else {
      console.error(`   Error:`, error);
    }
  }
}

/**
 * 메인 테스트 함수
 */
async function main() {
  console.log("=".repeat(50));
  console.log("🚀 한국관광공사 API 클라이언트 테스트 시작");
  console.log("=".repeat(50));

  // 환경변수 확인
  const apiKey = process.env.TOUR_API_KEY || process.env.NEXT_PUBLIC_TOUR_API_KEY;
  if (!apiKey) {
    console.error("\n❌ API 키가 설정되지 않았습니다!");
    console.error("   .env 파일에 TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY를 설정하세요.");
    process.exit(1);
  }
  console.log("\n✅ API 키 확인 완료");

  // 1. 지역코드 조회 테스트
  await testFunction("getAreaCode() - 지역코드 조회", async () => {
    return await getAreaCode({ numOfRows: 5 });
  });

  // 2. 지역 기반 목록 조회 테스트
  await testFunction("getAreaBasedList() - 서울 관광지 목록", async () => {
    return await getAreaBasedList({
      areaCode: "1", // 서울
      contentTypeId: "12", // 관광지
      numOfRows: 5,
      pageNo: 1,
    });
  });

  // 3. 키워드 검색 테스트
  await testFunction("searchKeyword() - '경복궁' 검색", async () => {
    return await searchKeyword({
      keyword: "경복궁",
      numOfRows: 5,
    });
  });

  // 4. 상세 정보 조회 테스트
  await testFunction("getDetailCommon() - 관광지 상세 정보", async () => {
    return await getDetailCommon({
      contentId: TEST_CONTENT_ID,
    });
  });

  // 5. 운영 정보 조회 테스트
  await testFunction("getDetailIntro() - 관광지 운영 정보", async () => {
    return await getDetailIntro({
      contentId: TEST_CONTENT_ID,
      contentTypeId: TEST_CONTENT_TYPE_ID,
    });
  });

  // 6. 이미지 목록 조회 테스트
  await testFunction("getDetailImage() - 관광지 이미지 목록", async () => {
    return await getDetailImage({
      contentId: TEST_CONTENT_ID,
    });
  });

  // 7. 반려동물 정보 조회 테스트 (선택)
  await testFunction("getDetailPetTour() - 반려동물 정보", async () => {
    const result = await getDetailPetTour({
      contentId: TEST_CONTENT_ID,
    });
    if (result === null) {
      console.log("   ℹ️  반려동물 정보가 없습니다 (null 반환)");
    }
    return result;
  });

  // 8. 에러 케이스 테스트
  await testFunction("에러 처리 - 존재하지 않는 contentId", async () => {
    return await getDetailCommon({
      contentId: "999999999",
    });
  });

  console.log("\n" + "=".repeat(50));
  console.log("✨ 테스트 완료");
  console.log("=".repeat(50));
}

// 스크립트 실행
main().catch((error) => {
  console.error("\n💥 Fatal Error:", error);
  process.exit(1);
});

