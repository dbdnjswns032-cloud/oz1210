/**
 * @file back-button.tsx
 * @description 뒤로가기 버튼 컴포넌트
 *
 * 상세페이지에서 이전 페이지로 돌아가기 위한 버튼입니다.
 * Link 컴포넌트를 사용하여 클라이언트 사이드 네비게이션을 제공합니다.
 */

"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /**
   * 뒤로가기 버튼이 이동할 경로
   * @default "/"
   */
  href?: string;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 뒤로가기 버튼 컴포넌트
 */
export function BackButton({ href = "/", className }: BackButtonProps) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-2 text-muted-foreground hover:text-foreground",
          className
        )}
        aria-label="이전 페이지로 돌아가기"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">뒤로</span>
      </Button>
    </Link>
  );
}

