/**
 * @file page.tsx
 * @description 관광지 상세페이지
 *
 * 관광지의 상세 정보를 표시하는 페이지입니다.
 * Next.js 15 App Router의 동적 라우팅을 사용하여 `/places/[contentId]` 경로로 접근합니다.
 *
 * 현재는 기본 구조만 구현되어 있으며, 실제 데이터 표시는 Phase 3.2 이후에 구현됩니다.
 *
 * @see {@link docs/PRD.md} 2.4장 - 상세페이지
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Loading } from "@/components/ui/loading";
import { Error as ErrorDisplay } from "@/components/ui/error";
import { BackButton } from "@/components/tour-detail/back-button";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { DetailIntro } from "@/components/tour-detail/detail-intro";
import { DetailGallery } from "@/components/tour-detail/detail-gallery";
import { DetailMap } from "@/components/tour-detail/detail-map";
import { ShareButton } from "@/components/tour-detail/share-button";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { DetailPetTour } from "@/components/tour-detail/detail-pet-tour";
import { Recommendations } from "@/components/tour-detail/recommendations";
import {
  getDetailCommon,
  getDetailImage,
  getDetailIntro,
  getDetailPetTour,
  getAreaBasedList,
  TourApiError,
} from "@/lib/api/tour-api";
import { getBookmarkStatus } from "@/lib/api/supabase-bookmark";
import { auth } from "@clerk/nextjs/server";
import type { TourDetail, TourImage, TourIntro, PetTourInfo, TourItem } from "@/lib/types/tour";
import type { ContentTypeId } from "@/lib/types/stats";

/**
 * 상세페이지 컨텐츠 컴포넌트 (Suspense 래핑용)
 */
async function PlaceDetailContent({ contentId }: { contentId: string }) {
  let detailData: TourDetail;
  let introData: TourIntro | null = null;
  let images: TourImage[] = [];
  let fullAddress = "";
  let shareUrl = "";
  let isBookmarked = false;
  let petInfo: PetTourInfo | null = null;
  let recommendations: TourItem[] = [];

  try {
    // API 호출하여 기본 정보 데이터 페칭
    detailData = await getDetailCommon({ contentId });
    fullAddress = detailData.addr2
      ? `${detailData.addr1} ${detailData.addr2}`
      : detailData.addr1;
    const origin =
      typeof process.env.NEXT_PUBLIC_SITE_URL === "string"
        ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
        : "";
    shareUrl = origin
      ? `${origin}/places/${contentId}`
      : `/places/${contentId}`;

    // 북마크 상태 조회 (로그인 사용자만)
    const { userId } = await auth();
    if (userId) {
      try {
        isBookmarked = await getBookmarkStatus(userId, contentId);
      } catch (err) {
        console.error("Failed to get bookmark status:", err);
      }
    }
  } catch (err) {
    // TourApiError의 경우 404이면 notFound() 호출
    if (err instanceof TourApiError) {
      if (err.statusCode === 404) {
        notFound();
      }
      // 기타 API 에러는 Error 컴포넌트로 표시
      return (
        <ErrorDisplay
          message={err.message}
          description="잠시 후 다시 시도해주세요"
          showRetry={false}
        />
      );
    }

    // 예상치 못한 에러
    const errorMessage =
      err instanceof Error ? err.message : "관광지 정보를 불러올 수 없습니다";

    return (
      <ErrorDisplay
        message={errorMessage}
        description="잠시 후 다시 시도해주세요"
        showRetry={false}
      />
    );
  }

  // 운영 정보 데이터 페칭 (에러 발생 시에도 기본 정보는 표시)
  try {
    const contentTypeId = detailData.contenttypeid as ContentTypeId;
    introData = await getDetailIntro({
      contentId,
      contentTypeId,
    });
  } catch (err) {
    // 운영 정보는 선택적이므로 에러가 발생해도 기본 정보는 표시
    // 404는 데이터 없음으로 처리, 기타 에러는 콘솔 로그만
    if (err instanceof TourApiError && err.statusCode !== 404) {
      console.error("Failed to fetch detail intro:", err.message);
    }
  }

  // 이미지 데이터 페칭 (없으면 생략)
  try {
    images = await getDetailImage({
      contentId,
      imageYN: "Y",
      subImageYN: "Y",
    });
  } catch (err) {
    if (err instanceof TourApiError && err.statusCode !== 404) {
      console.error("Failed to fetch detail images:", err.message);
    }
  }

  // 반려동물 정보 페칭 (없으면 섹션 미표시)
  try {
    petInfo = await getDetailPetTour({ contentId });
  } catch (err) {
    if (err instanceof TourApiError && err.statusCode !== 404) {
      console.error("Failed to fetch pet tour info:", err.message);
    }
  }

  // 추천 관광지 (동일 contentType 기준, 최대 6개)
  try {
    const list = await getAreaBasedList({
      contentTypeId: detailData.contenttypeid,
      numOfRows: 10,
      pageNo: 1,
    });
    recommendations = list.items
      .filter((item) => item.contentid !== detailData.contentid)
      .slice(0, 6);
  } catch (err) {
    if (err instanceof TourApiError && err.statusCode !== 404) {
      console.error("Failed to fetch recommendations:", err.message);
    }
  }

  return (
    <div className="space-y-8">
      {/* 기본 정보 섹션 */}
      <div className="flex items-start justify-between gap-3 flex-col sm:flex-row sm:items-center">
        <div className="flex-1 w-full">
          <DetailInfo data={detailData} />
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <BookmarkButton contentId={detailData.contentid} initialIsBookmarked={isBookmarked} />
          <ShareButton url={shareUrl} />
        </div>
      </div>

      {/* 운영 정보 섹션 */}
      {introData && (
        <DetailIntro
          data={introData}
          contentTypeId={detailData.contenttypeid as ContentTypeId}
        />
      )}

      {/* 이미지 갤러리 */}
      {images.length > 0 && (
        <DetailGallery title={detailData.title} images={images} />
      )}

      {/* 반려동물 정보 섹션 */}
      {petInfo && <DetailPetTour data={petInfo} />}

      {/* 지도 섹션 */}
      <DetailMap
        title={detailData.title}
        mapx={detailData.mapx}
        mapy={detailData.mapy}
        address={fullAddress}
      />

      {/* 추천 관광지 섹션 */}
      {recommendations.length > 0 && (
        <Recommendations items={recommendations} title="이런 곳은 어떠세요?" />
      )}
    </div>
  );
}

interface PlaceDetailPageProps {
  params: Promise<{ contentId: string }>;
}

/**
 * 동적 메타데이터 생성
 * API에서 받은 데이터로 메타데이터를 생성합니다.
 */
export async function generateMetadata({
  params,
}: PlaceDetailPageProps): Promise<Metadata> {
  const { contentId } = await params;

  try {
    // API 호출하여 메타데이터 생성
    const detailData = await getDetailCommon({ contentId });

    const title = detailData.title;
    // HTML 태그 제거 및 첫 100자 추출
    const description = detailData.overview
      ? detailData.overview.replace(/<[^>]*>/g, "").substring(0, 100)
      : "관광지 정보를 확인하세요";
    const image = detailData.firstimage || detailData.firstimage2;
    const origin =
      typeof process.env.NEXT_PUBLIC_SITE_URL === "string"
        ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
        : "";
    const url = origin ? `${origin}/places/${contentId}` : `/places/${contentId}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: image ? [image] : undefined,
        type: "website",
        url,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch (error) {
    // API 호출 실패 시 기본 메타데이터 반환
    return {
      title: "관광지 상세",
      description: "관광지 정보를 확인하세요",
    };
  }
}

/**
 * 관광지 상세페이지 메인 컴포넌트
 */
export default async function PlaceDetailPage({
  params,
}: PlaceDetailPageProps) {
  // Next.js 15: params를 await 처리
  const { contentId } = await params;

  // contentId 유효성 검증
  if (!contentId || contentId.trim() === "") {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* 반응형 컨테이너 */}
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Suspense로 로딩 상태 처리 */}
        <Suspense
          fallback={
            <div className="py-12">
              <Loading size="lg" text="관광지 정보를 불러오는 중..." />
            </div>
          }
        >
          <PlaceDetailContent contentId={contentId} />
        </Suspense>
      </div>
    </div>
  );
}

