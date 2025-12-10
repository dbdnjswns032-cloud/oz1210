/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 정보를 카드 형태로 표시하는 컴포넌트입니다.
 * 썸네일 이미지, 관광지명, 주소, 타입 뱃지를 포함하며,
 * 클릭 시 상세페이지로 이동합니다.
 *
 * @see {@link docs/PRD.md} 2.1장 - 관광지 목록 + 지역/타입 필터
 */

"use client";

import Link from "next/link";
import type { TourItem } from "@/lib/types/tour";
import { getContentTypeName } from "@/lib/types/stats";

interface TourCardProps {
  item: TourItem;
}

/**
 * 기본 이미지 placeholder (이미지 로드 실패 시 사용)
 */
const DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E이미지 없음%3C/text%3E%3C/svg%3E";

export function TourCard({ item }: TourCardProps) {
  const contentTypeName = getContentTypeName(item.contenttypeid);
  const fullAddress = item.addr2 ? `${item.addr1} ${item.addr2}` : item.addr1;

  return (
    <Link
      href={`/places/${item.contentid}`}
      className="group block border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label={`${item.title} 상세보기`}
    >
      {/* 썸네일 이미지 */}
      <div className="relative w-full h-48 bg-muted overflow-hidden">
        {item.firstimage ? (
          <img
            src={item.firstimage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              // 이미지 로드 실패 시 기본 이미지로 대체
              const target = e.currentTarget;
              target.src = DEFAULT_IMAGE;
              target.alt = `${item.title} (이미지 없음)`;
            }}
          />
        ) : (
          <img
            src={DEFAULT_IMAGE}
            alt={`${item.title} (이미지 없음)`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* 카드 내용 */}
      <div className="p-4 space-y-2">
        {/* 관광 타입 뱃지 */}
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary">
            {contentTypeName}
          </span>
        </div>

        {/* 관광지명 */}
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        {/* 주소 */}
        <p className="text-sm text-muted-foreground line-clamp-1" title={fullAddress}>
          {fullAddress}
        </p>
      </div>
    </Link>
  );
}

