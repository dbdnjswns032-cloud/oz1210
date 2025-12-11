/**
 * @file share-button.tsx
 * @description 관광지 상세 공유 버튼 컴포넌트
 *
 * 현재 페이지 URL을 클립보드에 복사하고 토스트로 결과를 안내합니다.
 *
 * @see {@link docs/PRD.md} 2.4.5장 - 공유하기
 */

"use client";

import { useState } from "react";
import { Link as LinkIcon, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  url: string;
}

/**
 * 공유 버튼
 * - HTTPS 환경에서 클립보드 복사를 시도합니다.
 * - 실패 시 안내 토스트를 표시합니다.
 */
export function ShareButton({ url }: ShareButtonProps) {
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    if (!url) {
      toast({
        title: "복사 실패",
        description: "공유할 URL을 찾을 수 없습니다.",
        variant: "error",
      });
      return;
    }

    if (typeof window !== "undefined" && window.location.protocol !== "https:") {
      toast({
        title: "HTTPS 필요",
        description: "보안을 위해 HTTPS 환경에서만 복사가 가능합니다.",
        variant: "warning",
      });
      return;
    }

    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(url);
      toast({
        title: "복사 완료",
        description: "링크가 클립보드에 복사되었습니다.",
        variant: "success",
      });
    } catch (error) {
      console.error("clipboard error:", error);
      toast({
        title: "복사 실패",
        description: "브라우저 설정으로 인해 복사할 수 없습니다.",
        variant: "error",
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      aria-label={`현재 페이지 링크 복사${isCopying ? " 중" : ""}`}
      disabled={isCopying}
      className="min-h-[44px] sm:min-h-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <LinkIcon className="h-4 w-4 mr-2 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">링크 복사</span>
      <span className="sm:hidden">복사</span>
      {isCopying && <Copy className="h-3 w-3 ml-2 animate-pulse shrink-0" aria-hidden="true" />}
    </Button>
  );
}

