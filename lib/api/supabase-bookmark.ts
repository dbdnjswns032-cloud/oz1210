/**
 * @file supabase-bookmark.ts
 * @description Supabase 북마크 조회/토글 헬퍼 (서버 전용)
 */

import { getServiceRoleClient } from "@/lib/supabase/service-role";

interface BookmarkRow {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

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

export async function getBookmarkStatus(
  clerkUserId: string,
  contentId: string
): Promise<boolean> {
  const supabase = getServiceRoleClient();
  const userId = await getUserIdByClerkId(clerkUserId);

  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to check bookmark: ${error.message}`);
  }

  return !!data;
}

export async function toggleBookmark(
  clerkUserId: string,
  contentId: string
): Promise<{ isBookmarked: boolean; row?: BookmarkRow | null }> {
  const supabase = getServiceRoleClient();
  const userId = await getUserIdByClerkId(clerkUserId);

  // 현재 상태 확인
  const { data: existing, error: selectError } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .limit(1)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Failed to fetch bookmark: ${selectError.message}`);
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      throw new Error(`Failed to remove bookmark: ${deleteError.message}`);
    }

    return { isBookmarked: false, row: null };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("bookmarks")
    .insert({
      user_id: userId,
      content_id: contentId,
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(`Failed to add bookmark: ${insertError.message}`);
  }

  return { isBookmarked: true, row: inserted as BookmarkRow };
}

