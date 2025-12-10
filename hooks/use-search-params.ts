/**
 * @file use-search-params.ts
 * @description 검색 파라미터 상태 관리 훅
 *
 * URL 쿼리 파라미터를 읽고 업데이트하는 커스텀 훅입니다.
 * Next.js 15 App Router의 useSearchParams와 useRouter를 활용합니다.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { HomePageSearchParams } from "@/lib/types/home";

/**
 * 검색 파라미터 상태 및 업데이트 함수를 제공하는 훅
 */
export function useSearchParamsState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 현재 검색 파라미터 읽기
  const currentParams = useMemo<HomePageSearchParams>(() => {
    return {
      keyword: searchParams.get("keyword") || undefined,
      areaCode: searchParams.get("areaCode") || undefined,
      contentTypeId: searchParams.get("contentTypeId") || undefined,
      pageNo: searchParams.get("pageNo") || undefined,
    };
  }, [searchParams]);

  /**
   * 검색 파라미터 업데이트 함수
   * 새로운 파라미터를 기존 파라미터와 병합하여 URL을 업데이트합니다.
   */
  const updateParams = useCallback(
    (newParams: Partial<HomePageSearchParams>) => {
      const params = new URLSearchParams(searchParams.toString());

      // 새로운 파라미터 적용
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          // 빈 값이면 파라미터 제거
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // pageNo가 없으면 기본값 1 설정 (또는 제거하여 서버에서 처리)
      if (!params.has("pageNo")) {
        params.delete("pageNo");
      }

      // URL 업데이트 (replaceIn: 현재 히스토리 항목 교체)
      const newUrl = params.toString() ? `/?${params.toString()}` : "/";
      router.replace(newUrl);
    },
    [router, searchParams]
  );

  /**
   * 특정 파라미터만 업데이트하는 헬퍼 함수들
   */
  const setKeyword = useCallback(
    (keyword: string | undefined) => {
      updateParams({ keyword, pageNo: undefined }); // 키워드 변경 시 페이지 리셋
    },
    [updateParams]
  );

  const setAreaCode = useCallback(
    (areaCode: string | undefined) => {
      updateParams({ areaCode, pageNo: undefined }); // 필터 변경 시 페이지 리셋
    },
    [updateParams]
  );

  const setContentTypeId = useCallback(
    (contentTypeId: string | undefined) => {
      updateParams({ contentTypeId, pageNo: undefined }); // 필터 변경 시 페이지 리셋
    },
    [updateParams]
  );

  const setPageNo = useCallback(
    (pageNo: number | undefined) => {
      updateParams({ pageNo: pageNo ? String(pageNo) : undefined });
    },
    [updateParams]
  );

  /**
   * 모든 파라미터 초기화
   */
  const resetParams = useCallback(() => {
    router.replace("/");
  }, [router]);

  return {
    // 현재 파라미터 값
    params: currentParams,
    keyword: currentParams.keyword,
    areaCode: currentParams.areaCode,
    contentTypeId: currentParams.contentTypeId,
    pageNo: currentParams.pageNo ? parseInt(currentParams.pageNo, 10) : 1,

    // 업데이트 함수들
    updateParams,
    setKeyword,
    setAreaCode,
    setContentTypeId,
    setPageNo,
    resetParams,
  };
}

