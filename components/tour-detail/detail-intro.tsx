/**
 * @file detail-intro.tsx
 * @description 관광지 상세 운영 정보 섹션 컴포넌트
 *
 * 관광지의 운영 정보(운영시간, 휴무일, 이용요금, 주차, 반려동물 동반 등)를 표시하는 컴포넌트입니다.
 * Client Component로 구현되어 있으며, contentTypeId에 따라 다른 필드를 표시합니다.
 *
 * @see {@link docs/PRD.md} 2.4.2장 - 운영 정보 섹션
 */

"use client";

import { Clock, Calendar, DollarSign, Car, Heart, Info, MapPin, ExternalLink, Users, Baby } from "lucide-react";
import type { TourIntro } from "@/lib/types/tour";
import type { ContentTypeId } from "@/lib/types/stats";

interface DetailIntroProps {
  data: TourIntro;
  contentTypeId: ContentTypeId;
}

/**
 * 관광지 상세 운영 정보 컴포넌트
 */
export function DetailIntro({ data, contentTypeId }: DetailIntroProps) {
  // 공통 필드 체크
  const hasCommonInfo =
    data.usetime ||
    data.restdate ||
    data.parking ||
    data.chkpet ||
    data.infocenter;

  // 타입별 특수 필드 체크
  const hasTypeSpecificInfo = getTypeSpecificFields(data, contentTypeId).length > 0;

  // 데이터가 없으면 섹션 숨김
  if (!hasCommonInfo && !hasTypeSpecificInfo) {
    return null;
  }

  return (
    <section className="border rounded-lg p-6 bg-card space-y-6">
      <h2 className="text-xl font-semibold">운영 정보</h2>

      {/* 공통 정보 */}
      {hasCommonInfo && (
        <div className="space-y-4">
          {data.usetime && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                운영시간
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {data.usetime}
              </p>
            </div>
          )}

          {data.restdate && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                휴무일
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {data.restdate}
              </p>
            </div>
          )}

          {data.parking && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Car className="h-4 w-4" />
                주차
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {data.parking}
              </p>
            </div>
          )}

          {data.chkpet && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Heart className="h-4 w-4" />
                반려동물 동반
              </h3>
              <p className="text-sm leading-relaxed">
                <span className="inline-flex items-center gap-1">
                  🐾 {data.chkpet}
                </span>
              </p>
            </div>
          )}

          {data.infocenter && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4" />
                문의처
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {data.infocenter}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 타입별 특수 정보 */}
      {hasTypeSpecificInfo && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold">추가 정보</h3>
          {getTypeSpecificFields(data, contentTypeId).map((field) => (
            <div key={field.key} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                {field.icon}
                {field.label}
              </h4>
              {field.link ? (
                <a
                  href={field.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1 break-all"
                >
                  <span>{field.value}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {field.value}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * 타입별 특수 필드 정보 추출
 */
function getTypeSpecificFields(
  data: TourIntro,
  contentTypeId: ContentTypeId
): Array<{
  key: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  link?: boolean;
}> {
  const fields: Array<{
    key: string;
    label: string;
    value: string;
    icon: React.ReactNode;
    link?: boolean;
  }> = [];

  switch (contentTypeId) {
    case "12": // 관광지
      if (data.expguide) {
        fields.push({
          key: "expguide",
          label: "체험 안내",
          value: data.expguide,
          icon: <Info className="h-4 w-4" />,
        });
      }
      if (data.expagerange) {
        fields.push({
          key: "expagerange",
          label: "체험 가능 연령",
          value: data.expagerange,
          icon: <Users className="h-4 w-4" />,
        });
      }
      break;

    case "14": // 문화시설
      if (data.usefee) {
        fields.push({
          key: "usefee",
          label: "이용요금",
          value: data.usefee,
          icon: <DollarSign className="h-4 w-4" />,
        });
      }
      if (data.discountinfo) {
        fields.push({
          key: "discountinfo",
          label: "할인 정보",
          value: data.discountinfo,
          icon: <DollarSign className="h-4 w-4" />,
        });
      }
      if (data.spendtime) {
        fields.push({
          key: "spendtime",
          label: "관람 소요시간",
          value: data.spendtime,
          icon: <Clock className="h-4 w-4" />,
        });
      }
      break;

    case "15": // 축제/행사
      if (data.eventstartdate && data.eventenddate) {
        fields.push({
          key: "eventdate",
          label: "행사 기간",
          value: `${data.eventstartdate} ~ ${data.eventenddate}`,
          icon: <Calendar className="h-4 w-4" />,
        });
      } else if (data.eventstartdate) {
        fields.push({
          key: "eventstartdate",
          label: "행사 시작일",
          value: data.eventstartdate,
          icon: <Calendar className="h-4 w-4" />,
        });
      }
      if (data.eventplace) {
        fields.push({
          key: "eventplace",
          label: "행사 장소",
          value: data.eventplace,
          icon: <MapPin className="h-4 w-4" />,
        });
      }
      if (data.eventhomepage) {
        fields.push({
          key: "eventhomepage",
          label: "행사 홈페이지",
          value: data.eventhomepage,
          icon: <ExternalLink className="h-4 w-4" />,
          link: true,
        });
      }
      break;

    case "25": // 여행코스
      if (data.distance) {
        fields.push({
          key: "distance",
          label: "코스 총 거리",
          value: data.distance,
          icon: <MapPin className="h-4 w-4" />,
        });
      }
      if (data.taketime) {
        fields.push({
          key: "taketime",
          label: "코스 총 소요시간",
          value: data.taketime,
          icon: <Clock className="h-4 w-4" />,
        });
      }
      break;

    case "28": // 레포츠
      if (data.openperiod) {
        fields.push({
          key: "openperiod",
          label: "개장 기간",
          value: data.openperiod,
          icon: <Calendar className="h-4 w-4" />,
        });
      }
      if (data.reservation) {
        fields.push({
          key: "reservation",
          label: "예약 안내",
          value: data.reservation,
          icon: <Info className="h-4 w-4" />,
        });
      }
      break;

    case "32": // 숙박
      if (data.checkintime) {
        fields.push({
          key: "checkintime",
          label: "체크인 시간",
          value: data.checkintime,
          icon: <Clock className="h-4 w-4" />,
        });
      }
      if (data.checkouttime) {
        fields.push({
          key: "checkouttime",
          label: "체크아웃 시간",
          value: data.checkouttime,
          icon: <Clock className="h-4 w-4" />,
        });
      }
      if (data.roomcount) {
        fields.push({
          key: "roomcount",
          label: "객실 수",
          value: data.roomcount,
          icon: <Users className="h-4 w-4" />,
        });
      }
      if (data.roomtype) {
        fields.push({
          key: "roomtype",
          label: "객실 유형",
          value: data.roomtype,
          icon: <Info className="h-4 w-4" />,
        });
      }
      break;

    case "38": // 쇼핑
      if (data.opentime) {
        fields.push({
          key: "opentime",
          label: "영업시간",
          value: data.opentime,
          icon: <Clock className="h-4 w-4" />,
        });
      }
      if (data.resttime) {
        fields.push({
          key: "resttime",
          label: "쉬는 시간",
          value: data.resttime,
          icon: <Clock className="h-4 w-4" />,
        });
      }
      break;

    case "39": // 음식점
      if (data.firstmenu) {
        fields.push({
          key: "firstmenu",
          label: "대표 메뉴",
          value: data.firstmenu,
          icon: <Info className="h-4 w-4" />,
        });
      }
      if (data.treatmenu) {
        fields.push({
          key: "treatmenu",
          label: "취급 메뉴",
          value: data.treatmenu,
          icon: <Info className="h-4 w-4" />,
        });
      }
      break;
  }

  return fields;
}

