/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * 네이버 지도 API v3 (NCP)를 사용하여 관광지 위치를 지도에 표시하는 컴포넌트입니다.
 *
 * @see {@link docs/PRD.md} 2.2장 - 네이버 지도 연동
 */

"use client";

import { useEffect, useRef, useState } from "react";
import type { TourItem } from "@/lib/types/tour";
import { convertKatecToWgs84, calculateCenter } from "@/lib/utils/map";
import { Loading } from "@/components/ui/loading";

// Naver Maps API 타입 선언
declare global {
  interface Window {
    naver?: {
      maps: {
        Map: new (element: HTMLElement | string, options: {
          center: any;
          zoom: number;
          mapTypeControl?: boolean;
          mapTypeControlOptions?: {
            position: number;
          };
        }) => {
          setCenter: (center: any) => void;
          setZoom: (zoom: number) => void;
          getCenter: () => any;
          getZoom: () => number;
        };
        LatLng: new (lat: number, lng: number) => {
          lat: () => number;
          lng: () => number;
        };
        Marker: new (options: {
          position: any;
          map: any;
          title?: string;
          icon?: {
            url: string;
            size?: { width: number; height: number };
            anchor?: { x: number; y: number };
          };
        }) => {
          setPosition: (position: any) => void;
          setMap: (map: any | null) => void;
          getPosition: () => any;
        };
        InfoWindow: new (options: {
          content: string | HTMLElement;
          maxWidth?: number;
          backgroundColor?: string;
          borderColor?: string;
          borderWidth?: number;
          anchorColor?: string;
        }) => {
          open: (map: any, markerOrPosition: any) => void;
          close: () => void;
        };
        Event: {
          addListener: (target: any, event: string, listener: () => void) => void;
          removeListener: (target: any, event: string, listener: () => void) => void;
        };
        EVENT: {
          POSITION_CHANGED: string;
          ZOOM_CHANGED: string;
        };
        MapTypeControlStyle: {
          BUTTON: number;
        };
        Position: {
          TOP_LEFT: number;
          TOP_CENTER: number;
          TOP_RIGHT: number;
          LEFT_TOP: number;
          LEFT_CENTER: number;
          LEFT_BOTTOM: number;
          RIGHT_TOP: number;
          RIGHT_CENTER: number;
          RIGHT_BOTTOM: number;
          BOTTOM_LEFT: number;
          BOTTOM_CENTER: number;
          BOTTOM_RIGHT: number;
        };
      };
    };
  }
}

interface NaverMapProps {
  /**
   * 표시할 관광지 목록
   */
  items?: TourItem[];
  /**
   * 초기 중심 좌표 (지역 선택 시)
   */
  center?: { lat: number; lng: number };
  /**
   * 줌 레벨 (기본값: 12)
   */
  zoom?: number;
  /**
   * 선택된 관광지 ID (강조용)
   */
  selectedContentId?: string;
  /**
   * 마커 클릭 핸들러
   */
  onMarkerClick?: (contentId: string) => void;
  /**
   * 지도 준비 완료 콜백
   */
  onMapReady?: (map: any) => void;
}

/**
 * 네이버 Maps API 로드 확인
 */
function isNaverMapsLoaded(): boolean {
  return typeof window !== "undefined" && !!window.naver?.maps;
}

export function NaverMap({
  items = [],
  center,
  zoom = 12,
  selectedContentId,
  onMarkerClick,
  onMapReady,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Naver Maps API 로드 확인
  useEffect(() => {
    if (isNaverMapsLoaded()) {
      setIsApiLoaded(true);
      setIsInitializing(false);
      return;
    }

    // API 로드 대기 (최대 10초)
    let checkCount = 0;
    const maxChecks = 100;
    const checkInterval = setInterval(() => {
      checkCount++;
      if (isNaverMapsLoaded()) {
        setIsApiLoaded(true);
        setIsInitializing(false);
        clearInterval(checkInterval);
      } else if (checkCount >= maxChecks) {
        console.error("Naver Maps API 로드 실패");
        setIsInitializing(false);
        clearInterval(checkInterval);
      }
    }, 100);

    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isApiLoaded || !mapRef.current) {
      return;
    }

    try {
      // 기존 지도 인스턴스가 있으면 제거
      if (mapInstanceRef.current) {
        // 지도 인스턴스는 자동으로 정리됨
        mapInstanceRef.current = null;
      }

      // 중심 좌표 결정
      let mapCenter: { lat: number; lng: number };
      if (center) {
        mapCenter = center;
      } else if (items.length > 0) {
        const calculatedCenter = calculateCenter(items);
        mapCenter = calculatedCenter || { lat: 37.5665, lng: 126.978 }; // 기본값: 서울시청
      } else {
        mapCenter = { lat: 37.5665, lng: 126.978 }; // 기본값: 서울시청
      }

      // 지도 생성
      const map = new window.naver!.maps.Map(mapRef.current, {
        center: new window.naver!.maps.LatLng(mapCenter.lat, mapCenter.lng),
        zoom: zoom,
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: window.naver!.maps.Position.TOP_RIGHT,
        },
      });

      mapInstanceRef.current = map;

      // 지도 준비 완료 콜백 호출
      if (onMapReady) {
        onMapReady(map);
      }
    } catch (error) {
      console.error("지도 초기화 실패:", error);
    }
  }, [isApiLoaded, center, zoom, onMapReady]);

  // 선택된 관광지로 지도 이동
  useEffect(() => {
    if (!isApiLoaded || !mapInstanceRef.current || !selectedContentId || !items.length) {
      return;
    }

    const map = mapInstanceRef.current;
    const selectedItem = items.find((item) => item.contentid === selectedContentId);
    
    if (selectedItem && selectedItem.mapx && selectedItem.mapy) {
      try {
        const { lng, lat } = convertKatecToWgs84(selectedItem.mapx, selectedItem.mapy);
        
        if (!isNaN(lng) && !isNaN(lat) && lng !== 0 && lat !== 0) {
          const position = new window.naver!.maps.LatLng(lat, lng);
          map.setCenter(position);
          map.setZoom(15); // 선택된 항목으로 이동 시 줌 인
        }
      } catch (error) {
        console.error(`지도 이동 실패 (${selectedContentId}):`, error);
      }
    }
  }, [isApiLoaded, selectedContentId, items]);

  // 마커 표시
  useEffect(() => {
    if (!isApiLoaded || !mapInstanceRef.current || !items.length) {
      return;
    }

    const map = mapInstanceRef.current;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // 인포윈도우 제거
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }

    // 새 마커 생성
    items.forEach((item) => {
      if (!item.mapx || !item.mapy) {
        return;
      }

      try {
        const { lng, lat } = convertKatecToWgs84(item.mapx, item.mapy);

        // 좌표 유효성 검사
        if (isNaN(lng) || isNaN(lat) || lng === 0 || lat === 0) {
          return;
        }

        const position = new window.naver!.maps.LatLng(lat, lng);

        // 마커 생성
        const marker = new window.naver!.maps.Marker({
          position: position,
          map: map,
          title: item.title,
        });

        // 선택된 마커 강조 (추후 구현)
        if (selectedContentId === item.contentid) {
          // TODO: 마커 강조 로직 (색상 변경 등)
        }

        // 마커 클릭 이벤트
        const MapsEvent = window.naver!.maps.Event || (window.naver!.maps as any).events;
        if (MapsEvent) {
          MapsEvent.addListener(marker, "click", () => {
          // 인포윈도우 생성
          const infoContent = `
            <div style="padding: 12px; min-width: 200px; font-family: sans-serif;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${item.title}</h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${item.addr1 || ""}</p>
              <a href="/places/${item.contentid}" style="display: inline-block; padding: 6px 12px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">상세보기</a>
            </div>
          `;

          // 기존 인포윈도우 닫기
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }

          const infoWindow = new window.naver!.maps.InfoWindow({
            content: infoContent,
            maxWidth: 300,
            backgroundColor: "#fff",
            borderColor: "#ddd",
            borderWidth: 1,
            anchorColor: "#fff",
          });

          infoWindow.open(map, marker);
          infoWindowRef.current = infoWindow;

          // 마커 클릭 핸들러 호출
          if (onMarkerClick) {
            onMarkerClick(item.contentid);
          }
          });
        }
      } catch (error) {
        console.error(`마커 생성 실패 (${item.contentid}):`, error);
      }
    });

    // 마커가 있으면 지도 범위 조정 (추후 구현)
    // if (markersRef.current.length > 0) {
    //   const bounds = new window.naver!.maps.LatLngBounds();
    //   markersRef.current.forEach((marker) => {
    //     const pos = marker.getPosition();
    //     bounds.extend(new window.naver!.maps.LatLng(pos.lat(), pos.lng()));
    //   });
    //   map.fitBounds(bounds);
    // }

    // cleanup 함수
    return () => {
      markersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      markersRef.current = [];
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
    };
  }, [isApiLoaded, items, selectedContentId, onMarkerClick]);

  // API 로드 실패 시 표시
  if (!isInitializing && !isApiLoaded) {
    return (
      <div className="w-full h-[400px] md:h-[600px] border rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-semibold mb-2">지도를 불러올 수 없습니다</p>
          <p className="text-sm">네이버 지도 API를 확인해주세요</p>
        </div>
      </div>
    );
  }

  // 초기화 중 로딩 표시
  if (isInitializing) {
    return (
      <div className="w-full h-[400px] md:h-[600px] border rounded-lg bg-muted flex items-center justify-center">
        <Loading size="md" text="지도를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] md:h-[600px] border rounded-lg overflow-hidden"
    />
  );
}
