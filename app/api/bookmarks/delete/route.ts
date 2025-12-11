/**
 * @file route.ts
 * @description 북마크 일괄 삭제 API Route
 *
 * 여러 북마크를 한 번에 삭제하는 API 엔드포인트입니다.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Clerk userId로 users.id 조회 (없으면 생성)
 */
async function getUserIdByClerkId(clerkUserId: string): Promise<string> {
  const supabase = getServiceRoleClient();

  const { data: userRow, error: selectError } = await supabase
    .from("users")
    .select("id, name")
    .eq("clerk_id", clerkUserId)
    .limit(1)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Failed to fetch user: ${selectError.message}`);
  }

  if (userRow) {
    return userRow.id;
  }

  // users.name NOT NULL 이므로 기본값 사용
  const { data: inserted, error: insertError } = await supabase
    .from("users")
    .insert({
      clerk_id: clerkUserId,
      name: "User",
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    throw new Error(`Failed to create user: ${insertError?.message}`);
  }

  return inserted.id;
}

/**
 * POST 핸들러 - 북마크 일괄 삭제
 */
export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  let contentIds: string[] | undefined;
  try {
    const body = await request.json();
    contentIds = Array.isArray(body?.contentIds) ? body.contentIds : undefined;
  } catch {
    // ignore parse error
  }

  if (!contentIds || contentIds.length === 0) {
    return NextResponse.json(
      { success: false, error: "contentIds는 필수이며 배열이어야 합니다." },
      { status: 400 }
    );
  }

  try {
    const supabase = getServiceRoleClient();
    const dbUserId = await getUserIdByClerkId(userId);

    // 사용자의 북마크만 삭제 (보안)
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", dbUserId)
      .in("content_id", contentIds);

    if (error) {
      throw new Error(`Failed to delete bookmarks: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      deletedCount: contentIds.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "북마크 삭제 실패";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

