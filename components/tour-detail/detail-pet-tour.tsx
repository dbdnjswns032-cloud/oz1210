/**
 * @file detail-pet-tour.tsx
 * @description 반려동물 동반 정보 섹션
 */

"use client";

import { PawPrint, Info, AlertTriangle, MapPin, Dog } from "lucide-react";
import type { PetTourInfo } from "@/lib/types/tour";

interface DetailPetTourProps {
  data: PetTourInfo;
}

const rows = [
  {
    key: "chkpetleash",
    label: "동반 가능 여부",
    icon: <PawPrint className="h-4 w-4" />,
  },
  {
    key: "chkpetsize",
    label: "크기 제한",
    icon: <Dog className="h-4 w-4" />,
  },
  {
    key: "chkpetplace",
    label: "입장 가능 장소 (실내/실외)",
    icon: <MapPin className="h-4 w-4" />,
  },
  {
    key: "chkpetfee",
    label: "추가 요금",
    icon: <Info className="h-4 w-4" />,
  },
  {
    key: "petinfo",
    label: "기타 정보 / 주의사항",
    icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  },
  {
    key: "parking",
    label: "주차 정보",
    icon: <MapPin className="h-4 w-4" />,
  },
] as const;

export function DetailPetTour({ data }: DetailPetTourProps) {
  const hasAny = rows.some((r) => data[r.key]);
  if (!hasAny) return null;

  return (
    <section className="border rounded-lg p-4 sm:p-6 bg-card space-y-4" aria-labelledby="detail-pet-heading">
      <div className="flex items-center gap-2">
        <PawPrint className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
        <h2 id="detail-pet-heading" className="text-lg sm:text-xl font-semibold">반려동물 동반 정보</h2>
      </div>

      <div className="space-y-3">
        {rows.map((row) => {
          const value = data[row.key];
          if (!value) return null;
          return (
            <div key={row.key} className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span aria-hidden="true">{row.icon}</span>
                <span>{row.label}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

