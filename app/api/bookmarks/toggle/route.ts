import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { toggleBookmark } from "@/lib/api/supabase-bookmark";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  let contentId: string | undefined;
  try {
    const body = await request.json();
    contentId = typeof body?.contentId === "string" ? body.contentId : undefined;
  } catch {
    // ignore parse error
  }

  if (!contentId) {
    return NextResponse.json(
      { success: false, error: "contentId는 필수입니다." },
      { status: 400 }
    );
  }

  try {
    const result = await toggleBookmark(userId, contentId);
    return NextResponse.json({ success: true, isBookmarked: result.isBookmarked });
  } catch (error) {
    const message = error instanceof Error ? error.message : "북마크 처리 실패";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

