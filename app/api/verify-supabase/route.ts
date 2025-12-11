/**
 * @file route.ts
 * @description Supabase 설정 확인 API Route
 *
 * Phase 5: Supabase 설정 확인을 위한 API 엔드포인트
 * 브라우저에서 접근하여 확인 결과를 JSON으로 반환합니다.
 */

import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

interface VerificationResult {
  success: boolean;
  checks: {
    env: boolean;
    connection: boolean;
    usersTable: boolean;
    bookmarksTable: boolean;
    dataTest: boolean;
    apiTest: boolean;
  };
  details: {
    env?: {
      supabaseUrl: boolean;
      supabaseAnonKey: boolean;
      supabaseServiceRoleKey: boolean;
    };
    usersTable?: {
      exists: boolean;
      error?: string;
    };
    bookmarksTable?: {
      exists: boolean;
      error?: string;
    };
    dataTest?: {
      success: boolean;
      error?: string;
    };
    apiTest?: {
      success: boolean;
      error?: string;
    };
  };
}

/**
 * 환경변수 확인
 */
function checkEnvironmentVariables() {
  const supabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    allPassed: supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey,
    details: {
      supabaseUrl,
      supabaseAnonKey,
      supabaseServiceRoleKey,
    },
  };
}

/**
 * users 테이블 확인
 */
async function checkUsersTable(): Promise<{ exists: boolean; error?: string }> {
  try {
    const supabase = getServiceRoleClient();
    const { error } = await supabase.from("users").select("id").limit(0);

    if (error) {
      if (error.message.includes("does not exist") || error.code === "PGRST116") {
        return { exists: false, error: "테이블이 존재하지 않습니다. 마이그레이션이 필요합니다." };
      }
      return { exists: false, error: error.message };
    }

    return { exists: true };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * bookmarks 테이블 확인
 */
async function checkBookmarksTable(): Promise<{ exists: boolean; error?: string }> {
  try {
    const supabase = getServiceRoleClient();
    const { error } = await supabase.from("bookmarks").select("id").limit(0);

    if (error) {
      if (error.message.includes("does not exist") || error.code === "PGRST116") {
        return { exists: false, error: "테이블이 존재하지 않습니다. 마이그레이션이 필요합니다." };
      }
      return { exists: false, error: error.message };
    }

    return { exists: true };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 테스트 데이터 삽입 테스트
 */
async function testDataInsertion(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceRoleClient();
    const testClerkId = `test_${Date.now()}`;

    // users 테이블에 테스트 데이터 삽입
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        clerk_id: testClerkId,
        name: "Test User",
      })
      .select("id")
      .single();

    if (userError) {
      return { success: false, error: `users 테이블 삽입 실패: ${userError.message}` };
    }

    // bookmarks 테이블에 테스트 데이터 삽입
    const { data: bookmarkData, error: bookmarkError } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userData.id,
        content_id: "test_content_123",
      })
      .select("id")
      .single();

    if (bookmarkError) {
      await supabase.from("users").delete().eq("id", userData.id);
      return { success: false, error: `bookmarks 테이블 삽입 실패: ${bookmarkError.message}` };
    }

    // UNIQUE 제약조건 테스트
    const { error: duplicateError } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userData.id,
        content_id: "test_content_123",
      });

    if (!duplicateError) {
      // 테스트 데이터 정리
      await supabase.from("bookmarks").delete().eq("id", bookmarkData.id);
      await supabase.from("users").delete().eq("id", userData.id);
      return { success: false, error: "UNIQUE 제약조건이 작동하지 않습니다." };
    }

    // 테스트 데이터 정리
    await supabase.from("bookmarks").delete().eq("id", bookmarkData.id);
    await supabase.from("users").delete().eq("id", userData.id);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * API 함수 연동 테스트
 */
async function testApiFunctions(): Promise<{ success: boolean; error?: string }> {
  try {
    const { getBookmarkStatus, toggleBookmark } = await import(
      "@/lib/api/supabase-bookmark"
    );

    const testClerkId = `test_api_${Date.now()}`;
    const testContentId = "test_content_456";

    // getBookmarkStatus 테스트 (북마크 없음)
    const statusBefore = await getBookmarkStatus(testClerkId, testContentId);
    if (statusBefore !== false) {
      return { success: false, error: "getBookmarkStatus가 예상과 다른 값을 반환했습니다." };
    }

    // toggleBookmark 테스트 (북마크 추가)
    const addResult = await toggleBookmark(testClerkId, testContentId);
    if (!addResult.isBookmarked) {
      return { success: false, error: "북마크 추가가 실패했습니다." };
    }

    // getBookmarkStatus 테스트 (북마크 있음)
    const statusAfter = await getBookmarkStatus(testClerkId, testContentId);
    if (statusAfter !== true) {
      return { success: false, error: "북마크 상태 조회가 실패했습니다." };
    }

    // toggleBookmark 테스트 (북마크 제거)
    const removeResult = await toggleBookmark(testClerkId, testContentId);
    if (removeResult.isBookmarked) {
      return { success: false, error: "북마크 제거가 실패했습니다." };
    }

    // 테스트 데이터 정리
    const supabase = getServiceRoleClient();
    await supabase.from("users").delete().eq("clerk_id", testClerkId);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * GET 핸들러 - Supabase 설정 확인
 */
export async function GET() {
  const result: VerificationResult = {
    success: false,
    checks: {
      env: false,
      connection: false,
      usersTable: false,
      bookmarksTable: false,
      dataTest: false,
      apiTest: false,
    },
    details: {},
  };

  // 1. 환경변수 확인
  const envCheck = checkEnvironmentVariables();
  result.checks.env = envCheck.allPassed;
  result.details.env = envCheck.details;

  if (!envCheck.allPassed) {
    return NextResponse.json(result, { status: 400 });
  }

  // 2. 연결 테스트
  try {
    const supabase = getServiceRoleClient();
    // 간단한 쿼리로 연결 테스트
    const { error } = await supabase.from("users").select("id").limit(0);
    if (error && !error.message.includes("does not exist") && error.code !== "PGRST116") {
      throw error;
    }
    result.checks.connection = true;
  } catch (error) {
    result.details.connection = {
      error: error instanceof Error ? error.message : String(error),
    };
    return NextResponse.json(result, { status: 500 });
  }

  // 3. users 테이블 확인
  const usersTableCheck = await checkUsersTable();
  result.checks.usersTable = usersTableCheck.exists;
  result.details.usersTable = usersTableCheck;

  // 4. bookmarks 테이블 확인
  const bookmarksTableCheck = await checkBookmarksTable();
  result.checks.bookmarksTable = bookmarksTableCheck.exists;
  result.details.bookmarksTable = bookmarksTableCheck;

  // 5. 테스트 데이터 삽입 테스트
  if (result.checks.usersTable && result.checks.bookmarksTable) {
    const dataTest = await testDataInsertion();
    result.checks.dataTest = dataTest.success;
    result.details.dataTest = dataTest;
  }

  // 6. API 함수 연동 테스트
  if (result.checks.usersTable && result.checks.bookmarksTable) {
    const apiTest = await testApiFunctions();
    result.checks.apiTest = apiTest.success;
    result.details.apiTest = apiTest;
  }

  // 전체 성공 여부
  result.success = Object.values(result.checks).every((v) => v);

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}

