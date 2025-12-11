/**
 * @file page.tsx
 * @description 북마크 목록 페이지
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 페이지입니다.
 * 인증된 사용자만 접근 가능하며, 정렬 및 삭제 기능을 제공합니다.
 *
 * @see {@link docs/PRD.md} 2.4.5장 - 북마크 기능
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { getUserBookmarks } from "@/lib/api/supabase-bookmark";
import { getDetailCommon } from "@/lib/api/tour-api";
import type { TourDetail } from "@/lib/types/tour";
import { Loading } from "@/components/ui/loading";
import { Error } from "@/components/ui/error";
import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import { BookmarkListSkeleton } from "@/components/bookmarks/bookmark-list-skeleton";

interface BookmarksPageProps {
  searchParams: Promise<{ sortBy?: string }>;
}

/**
 * 북마크 목록 데이터 페칭
 */
async function fetchBookmarks(userId: string, sortBy: "latest" | "name" | "region" = "latest") {
  try {
    // 1. 북마크 목록 조회 (content_id 배열)
    const bookmarks = await getUserBookmarks(userId, sortBy);

    if (bookmarks.length === 0) {
      return { items: [], totalCount: 0 };
    }

    // 2. 각 북마크의 관광지 상세 정보 조회
    const tourDetails: TourDetail[] = [];
    const errors: string[] = [];

    // 병렬로 모든 관광지 정보 조회
    await Promise.all(
      bookmarks.map(async (bookmark) => {
        try {
          const detail = await getDetailCommon({
            contentId: bookmark.content_id,
          });
          tourDetails.push(detail);
        } catch (error) {
          errors.push(bookmark.content_id);
          console.error(`Failed to fetch detail for ${bookmark.content_id}:`, error);
        }
      })
    );

    // 3. 정렬 옵션에 따라 클라이언트에서 정렬
    let sortedDetails = tourDetails;
    if (sortBy === "name") {
      sortedDetails = [...tourDetails].sort((a, b) => a.title.localeCompare(b.title, "ko"));
    } else if (sortBy === "region") {
      sortedDetails = [...tourDetails].sort((a, b) => {
        const addrA = a.addr1 || "";
        const addrB = b.addr1 || "";
        return addrA.localeCompare(addrB, "ko");
      });
    }

    return {
      items: sortedDetails,
      totalCount: sortedDetails.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * 북마크 목록 컨텐츠 컴포넌트
 */
async function BookmarksContent({ sortBy }: { sortBy: "latest" | "name" | "region" }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    const data = await fetchBookmarks(userId, sortBy);

    return <BookmarkList items={data.items} totalCount={data.totalCount} sortBy={sortBy} />;
  } catch (error) {
    return (
      <Error
        message="북마크 목록을 불러올 수 없습니다"
        description={error instanceof Error ? error.message : "잠시 후 다시 시도해주세요"}
        showRetry={false}
      />
    );
  }
}

/**
 * 동적 메타데이터 생성
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "북마크",
    description: "내가 북마크한 관광지 목록을 확인하세요",
  };
}

/**
 * 북마크 목록 페이지 메인 컴포넌트
 */
export default async function BookmarksPage({ searchParams }: BookmarksPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const sortBy = (params.sortBy === "name" || params.sortBy === "region" ? params.sortBy : "latest") as "latest" | "name" | "region";

  return (
    <div className="min-h-screen">
      {/* 반응형 컨테이너 */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* 헤더 섹션 */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
            내 북마크
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            북마크한 관광지 목록을 확인하고 관리하세요
          </p>
        </header>

        {/* 메인 컨텐츠 */}
        <main>
          <Suspense
            fallback={
              <div className="py-12">
                <BookmarkListSkeleton />
              </div>
            }
          >
            <BookmarksContent sortBy={sortBy} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

