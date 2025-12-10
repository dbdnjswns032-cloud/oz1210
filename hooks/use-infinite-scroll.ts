/**
 * @file use-infinite-scroll.ts
 * @description 무한 스크롤을 위한 커스텀 훅
 *
 * Intersection Observer를 사용하여 스크롤이 하단에 도달했을 때
 * 다음 페이지를 로드할 수 있도록 하는 훅입니다.
 */

import { useEffect, useRef, useState, useCallback } from "react";

interface UseInfiniteScrollOptions {
  /**
   * 다음 페이지 존재 여부
   */
  hasNextPage: boolean;
  /**
   * 다음 페이지 로딩 중 여부
   */
  isFetchingNextPage: boolean;
  /**
   * 다음 페이지를 가져오는 함수
   */
  fetchNextPage: () => void | Promise<void>;
  /**
   * Intersection Observer의 rootMargin (미리 로드할 거리)
   * @default "100px"
   */
  rootMargin?: string;
  /**
   * Intersection Observer의 threshold
   * @default 0.1
   */
  threshold?: number;
  /**
   * 비활성화 여부
   * @default false
   */
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  /**
   * Intersection Observer가 관찰할 요소에 연결할 ref
   */
  ref: React.RefObject<HTMLDivElement>;
}

/**
 * 무한 스크롤 훅
 *
 * @example
 * ```tsx
 * const { ref } = useInfiniteScroll({
 *   hasNextPage: hasMore,
 *   isFetchingNextPage: isLoading,
 *   fetchNextPage: () => loadMore()
 * });
 *
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={ref} />
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  rootMargin = "100px",
  threshold = 0.1,
  enabled = true,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const observerTargetRef = useRef<HTMLDivElement>(null);
  const fetchNextPageRef = useRef(fetchNextPage);
  const hasNextPageRef = useRef(hasNextPage);
  const isFetchingNextPageRef = useRef(isFetchingNextPage);

  // ref 최신화
  useEffect(() => {
    fetchNextPageRef.current = fetchNextPage;
    hasNextPageRef.current = hasNextPage;
    isFetchingNextPageRef.current = isFetchingNextPage;
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Intersection Observer 설정
  useEffect(() => {
    if (!enabled || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const target = observerTargetRef.current;
    if (!target) {
      return;
    }

    // Intersection Observer가 지원되는지 확인
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      console.warn("IntersectionObserver is not supported");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          hasNextPageRef.current &&
          !isFetchingNextPageRef.current
        ) {
          fetchNextPageRef.current();
        }
      },
      {
        root: null, // viewport 기준
        rootMargin,
        threshold,
      }
    );

    observer.observe(target);

    // cleanup
    return () => {
      observer.disconnect();
    };
  }, [enabled, hasNextPage, isFetchingNextPage, rootMargin, threshold]);

  return {
    ref: observerTargetRef,
  };
}

