/**
 * @file detail-map.tsx
 * @description 관광지 상세 지도 섹션 컴포넌트
 *
 * 단일 관광지의 좌표를 네이버 지도에 표시하고 길찾기 링크를 제공합니다.
 * 좌표가 없거나 API 로드 실패 시 사용자 친화적인 메시지를 노출합니다.
 *
 * @see {@link docs/PRD.md} 2.4.4장 - 지도 섹션
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { convertKatecToWgs84 } from "@/lib/utils/map";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    naver?: {
      maps: {
        Map: new (element: HTMLElement | string, options: {
          center: any;
          zoom: number;
          mapTypeControl?: boolean;
        }) => any;
        LatLng: new (lat: number, lng: number) => any;
        Marker: new (options: { position: any; map: any; title?: string }) => any;
      };
    };
  }
}

interface DetailMapProps {
  title: string;
  mapx?: string;
  mapy?: string;
  address?: string;
}

function isNaverMapsLoaded(): boolean {
  return typeof window !== "undefined" && !!window.naver?.maps;
}

export function DetailMap({ title, mapx, mapy, address }: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const coords = useMemo(() => {
    if (!mapx || !mapy) return null;
    const { lng, lat } = convertKatecToWgs84(mapx, mapy);
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat === 0 || lng === 0) return null;
    return { lat, lng };
  }, [mapx, mapy]);

  useEffect(() => {
    if (!coords || !mapRef.current) return;

    const initialize = () => {
      try {
        const center = new window.naver!.maps.LatLng(coords.lat, coords.lng);
        const map = new window.naver!.maps.Map(mapRef.current!, {
          center,
          zoom: 15,
          mapTypeControl: false,
        });

        new window.naver!.maps.Marker({
          position: center,
          map,
          title,
        });

        setIsApiReady(true);
      } catch (error) {
        console.error("네이버 지도 초기화 실패:", error);
        setInitError("지도를 불러오는 중 오류가 발생했습니다.");
      }
    };

    if (isNaverMapsLoaded()) {
      initialize();
      return;
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      if (isNaverMapsLoaded()) {
        clearInterval(interval);
        initialize();
      } else if (attempts >= 100) {
        clearInterval(interval);
        setInitError("네이버 지도 API를 불러오지 못했습니다.");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [coords, title]);

  if (!coords) {
    return (
      <section className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          지도
        </h2>
        <p className="text-sm text-muted-foreground">
          좌표 정보가 없어 지도를 표시할 수 없습니다.
        </p>
      </section>
    );
  }

  const directionUrl = `https://map.naver.com/v5/directions/${coords.lat},${coords.lng}`;

  return (
    <section className="border rounded-lg p-6 bg-card space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">지도</h2>
            {address && <p className="text-sm text-muted-foreground">{address}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild aria-label="네이버 지도에서 길찾기">
            <a href={directionUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-4 w-4 mr-1" />
              길찾기
            </a>
          </Button>
        </div>
      </div>

      <div
        ref={mapRef}
        className={cn(
          "w-full rounded-lg bg-muted",
          "min-h-[400px]",
          !isApiReady && "flex items-center justify-center text-sm text-muted-foreground"
        )}
      >
        {!isApiReady && !initError && "지도를 불러오는 중입니다..."}
        {initError && <span className="text-red-500 text-sm">{initError}</span>}
      </div>
    </section>
  );
}

