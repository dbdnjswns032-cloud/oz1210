/**
 * @file bookmark-button.tsx
 * @description 관광지 상세 북마크 토글 버튼
 */

"use client";

import { useState, useTransition } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BookmarkButtonProps {
  contentId: string;
  initialIsBookmarked?: boolean;
}

export function BookmarkButton({
  contentId,
  initialIsBookmarked = false,
}: BookmarkButtonProps) {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (!contentId) {
      toast({
        title: "북마크 실패",
        description: "잘못된 콘텐츠 ID입니다.",
        variant: "error",
      });
      return;
    }

    if (!isSignedIn) {
      toast({
        title: "로그인이 필요합니다",
        description: "북마크를 사용하려면 로그인해주세요.",
        variant: "warning",
      });
      openSignIn?.();
      return;
    }

    startTransition(async () => {
      const next = !isBookmarked;
      setIsBookmarked(next); // optimistic

      try {
        const res = await fetch("/api/bookmarks/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId }),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const json = await res.json();
        setIsBookmarked(!!json.isBookmarked);

        toast({
          title: json.isBookmarked ? "북마크 추가" : "북마크 해제",
          description: json.isBookmarked
            ? "관광지가 북마크에 추가되었습니다."
            : "북마크가 해제되었습니다.",
          variant: "success",
        });
      } catch (error) {
        console.error("bookmark toggle error:", error);
        setIsBookmarked((prev) => !prev); // revert optimistic
        toast({
          title: "북마크 실패",
          description: "잠시 후 다시 시도해주세요.",
          variant: "error",
        });
      }
    });
  };

  return (
    <Button
      variant={isBookmarked ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
      aria-pressed={isBookmarked}
      disabled={isPending}
      className="inline-flex items-center gap-2 min-h-[44px] sm:min-h-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <Bookmark className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{isBookmarked ? "북마크됨" : "북마크"}</span>
      <span className="sm:hidden">{isBookmarked ? "저장됨" : "저장"}</span>
    </Button>
  );
}

