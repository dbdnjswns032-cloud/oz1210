/**
 * @file detail-info.tsx
 * @description 관광지 상세 기본 정보 섹션 컴포넌트
 *
 * 관광지의 기본 정보(이름, 이미지, 주소, 전화번호, 홈페이지, 개요 등)를 표시하는 컴포넌트입니다.
 * Client Component로 구현되어 클립보드 복사, 토스트 메시지 등의 인터랙션을 제공합니다.
 *
 * @see {@link docs/PRD.md} 2.4.1장 - 기본 정보 섹션
 */

"use client";

import Image from "next/image";
import { Copy, Phone, ExternalLink } from "lucide-react";
import type { TourDetail } from "@/lib/types/tour";
import { getContentTypeName } from "@/lib/types/stats";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DetailInfoProps {
  data: TourDetail;
}

/**
 * 기본 이미지 placeholder
 */
const DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23e5e7eb' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E이미지 없음%3C/text%3E%3C/svg%3E";

/**
 * 관광지 상세 기본 정보 컴포넌트
 */
export function DetailInfo({ data }: DetailInfoProps) {
  const { toast } = useToast();

  // 주소 조합
  const fullAddress = data.addr2 ? `${data.addr1} ${data.addr2}` : data.addr1;

  // 대표 이미지 선택 (firstimage 우선, 없으면 firstimage2)
  const mainImage = data.firstimage || data.firstimage2;

  // 관광 타입명
  const contentTypeName = getContentTypeName(data.contenttypeid);

  /**
   * 주소 복사 핸들러
   */
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      toast({
        title: "복사 완료",
        description: "주소가 클립보드에 복사되었습니다",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "주소를 복사할 수 없습니다",
        variant: "error",
      });
    }
  };

  return (
    <section className="border rounded-lg p-4 sm:p-6 bg-card space-y-6" aria-labelledby="detail-info-heading">
      {/* 관광지명 및 타입 뱃지 */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
          <h1 id="detail-info-heading" className="text-2xl md:text-3xl lg:text-4xl font-bold flex-1 min-w-0">
            {data.title}
          </h1>
          <span className="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md bg-primary/10 text-primary shrink-0">
            {contentTypeName}
          </span>
        </div>
      </div>

      {/* 대표 이미지 */}
      {mainImage ? (
        <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
          <Image
            src={mainImage}
            alt={`${data.title} 대표 이미지`}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
            priority
            unoptimized={mainImage.startsWith("data:")}
          />
        </div>
      ) : (
        <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          <span className="text-muted-foreground text-sm">이미지 없음</span>
        </div>
      )}

      {/* 주소 */}
      {fullAddress && (
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-semibold">주소</h2>
          <div className="flex items-start gap-2 flex-wrap sm:flex-nowrap">
            <address className="flex-1 text-sm sm:text-base text-muted-foreground not-italic min-w-0 break-words">
              {fullAddress}
              {data.zipcode && ` (${data.zipcode})`}
            </address>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAddress}
              className="shrink-0 min-h-[44px] sm:min-h-0"
              aria-label={`주소 "${fullAddress}" 복사`}
            >
              <Copy className="h-4 w-4 mr-1" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">복사</span>
            </Button>
          </div>
        </div>
      )}

      {/* 전화번호 */}
      {data.tel && (
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-semibold">전화번호</h2>
          <a
            href={`tel:${data.tel.replace(/-/g, "")}`}
            className="flex items-center gap-2 text-sm sm:text-base text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            aria-label={`전화번호 ${data.tel}로 전화하기`}
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{data.tel}</span>
          </a>
        </div>
      )}

      {/* 홈페이지 */}
      {data.homepage && (
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-semibold">홈페이지</h2>
          <a
            href={data.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm sm:text-base text-primary hover:underline break-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            aria-label={`${data.homepage} 홈페이지 새 창에서 열기`}
          >
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="break-all">{data.homepage}</span>
          </a>
        </div>
      )}

      {/* 개요 */}
      {data.overview && (
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-semibold">개요</h2>
          <div
            className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: data.overview }}
            aria-label="관광지 개요"
          />
        </div>
      )}
    </section>
  );
}

