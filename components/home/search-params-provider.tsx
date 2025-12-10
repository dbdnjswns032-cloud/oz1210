/**
 * @file search-params-provider.tsx
 * @description 검색 파라미터 상태 관리 Provider
 *
 * URL 쿼리 파라미터를 초기 상태로 설정하고, 필터 변경 시 URL을 업데이트하는
 * Context Provider입니다.
 * 
 * 이 컴포넌트는 Server Component에서 전달받은 초기 파라미터를 사용하여
 * Client Component에서 상태를 관리합니다.
 */

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { HomePageSearchParams } from "@/lib/types/home";

interface SearchParamsContextValue {
  params: HomePageSearchParams;
  updateParams: (newParams: Partial<HomePageSearchParams>) => void;
  setKeyword: (keyword: string | undefined) => void;
  setAreaCode: (areaCode: string | undefined) => void;
  setContentTypeId: (contentTypeId: string | undefined) => void;
  setPageNo: (pageNo: number | undefined) => void;
  setSortBy: (sortBy: HomePageSearchParams["sortBy"]) => void;
  setPetFriendly: (enable: boolean | undefined) => void;
  setPetSize: (size: HomePageSearchParams["petSize"]) => void;
  resetParams: () => void;
}

const SearchParamsContext = createContext<SearchParamsContextValue | undefined>(undefined);

/**
 * SearchParamsProvider 컴포넌트
 * URL 쿼리 파라미터를 상태로 관리하고 업데이트하는 Context Provider
 */
export function SearchParamsProvider({
  children,
  initialParams,
}: {
  children: React.ReactNode;
  initialParams?: HomePageSearchParams;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 초기 파라미터를 URL에서 읽어서 상태로 관리
  const [params, setParams] = useState<HomePageSearchParams>(() => {
    if (initialParams) {
      return initialParams;
    }
    return {
      keyword: searchParams.get("keyword") || undefined,
      areaCode: searchParams.get("areaCode") || undefined,
      contentTypeId: searchParams.get("contentTypeId") || undefined,
      pageNo: searchParams.get("pageNo") || undefined,
      sortBy: (searchParams.get("sortBy") as HomePageSearchParams["sortBy"]) || undefined,
      petFriendly: searchParams.get("petFriendly") === "true" ? "true" : undefined,
      petSize: (searchParams.get("petSize") as HomePageSearchParams["petSize"]) || undefined,
    };
  });

  // URL 변경 시 상태 동기화
  useEffect(() => {
    const currentParams: HomePageSearchParams = {
      keyword: searchParams.get("keyword") || undefined,
      areaCode: searchParams.get("areaCode") || undefined,
      contentTypeId: searchParams.get("contentTypeId") || undefined,
      pageNo: searchParams.get("pageNo") || undefined,
      sortBy: (searchParams.get("sortBy") as HomePageSearchParams["sortBy"]) || undefined,
      petFriendly: searchParams.get("petFriendly") === "true" ? "true" : undefined,
      petSize: (searchParams.get("petSize") as HomePageSearchParams["petSize"]) || undefined,
    };
    setParams(currentParams);
  }, [searchParams]);

  /**
   * 검색 파라미터 업데이트 함수
   */
  const updateParams = (newParams: Partial<HomePageSearchParams>) => {
    const paramsObj = new URLSearchParams(searchParams.toString());

    // 새로운 파라미터 적용
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        paramsObj.delete(key);
      } else {
        paramsObj.set(key, String(value));
      }
    });

    // pageNo가 없으면 제거
    if (!paramsObj.has("pageNo")) {
      paramsObj.delete("pageNo");
    }

    // URL 업데이트
    const newUrl = paramsObj.toString() ? `/?${paramsObj.toString()}` : "/";
    router.replace(newUrl);
  };

  const setKeyword = (keyword: string | undefined) => {
    updateParams({ keyword, pageNo: undefined });
  };

  const setAreaCode = (areaCode: string | undefined) => {
    updateParams({ areaCode, pageNo: undefined });
  };

  const setContentTypeId = (contentTypeId: string | undefined) => {
    updateParams({ contentTypeId, pageNo: undefined });
  };

  const setPageNo = (pageNo: number | undefined) => {
    updateParams({ pageNo: pageNo ? String(pageNo) : undefined });
  };

  const setSortBy = (sortBy: HomePageSearchParams["sortBy"]) => {
    updateParams({ sortBy });
  };

  const setPetFriendly = (enable: boolean | undefined) => {
    updateParams({ petFriendly: enable ? "true" : undefined });
  };

  const setPetSize = (size: HomePageSearchParams["petSize"]) => {
    updateParams({ petSize: size });
  };

  const resetParams = () => {
    router.replace("/");
  };

  return (
    <SearchParamsContext.Provider
      value={{
        params,
        updateParams,
        setKeyword,
        setAreaCode,
        setContentTypeId,
        setPageNo,
        setSortBy,
        setPetFriendly,
        setPetSize,
        resetParams,
      }}
    >
      {children}
    </SearchParamsContext.Provider>
  );
}

/**
 * useSearchParamsContext 훅
 */
export function useSearchParamsContext() {
  const context = useContext(SearchParamsContext);
  if (!context) {
    throw new Error("useSearchParamsContext must be used within SearchParamsProvider");
  }
  return context;
}
