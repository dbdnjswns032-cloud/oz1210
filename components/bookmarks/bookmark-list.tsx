/**
 * @file bookmark-list.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 컴포넌트입니다.
 * 정렬, 일괄 삭제, 개별 삭제 기능을 제공합니다.
 *
 * @see {@link docs/PRD.md} 2.4.5장 - 북마크 기능
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Trash2, CheckSquare, Square } from "lucide-react";
import type { TourDetail } from "@/lib/types/tour";
import { TourCard } from "@/components/tour-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface BookmarkListProps {
  items: TourDetail[];
  totalCount: number;
  sortBy: "latest" | "name" | "region";
}

/**
 * TourDetail을 TourItem으로 변환
 */
function tourDetailToTourItem(detail: TourDetail) {
  return {
    addr1: detail.addr1,
    addr2: detail.addr2,
    areacode: detail.areacode || "",
    contentid: detail.contentid,
    contenttypeid: detail.contenttypeid,
    title: detail.title,
    mapx: detail.mapx,
    mapy: detail.mapy,
    firstimage: detail.firstimage,
    firstimage2: detail.firstimage2,
    tel: detail.tel,
    modifiedtime: new Date().toISOString(), // 북마크는 수정일이 없으므로 현재 시간 사용
  };
}

/**
 * 북마크 목록 컴포넌트
 */
export function BookmarkList({ items, totalCount, sortBy: initialSortBy }: BookmarkListProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<"latest" | "name" | "region">(initialSortBy);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 빈 상태
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <p className="text-lg font-medium text-muted-foreground mb-2">
            북마크한 관광지가 없습니다
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            관광지를 북마크하여 나중에 쉽게 찾아보세요
          </p>
          <Link href="/">
            <Button>관광지 둘러보기</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 정렬 옵션 변경 핸들러
  const handleSortChange = (value: string) => {
    const newSortBy = value as "latest" | "name" | "region";
    setSortBy(newSortBy);
    router.push(`/bookmarks?sortBy=${newSortBy}`);
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.contentid)));
    }
  };

  // 개별 선택/해제
  const handleToggleSelect = (contentId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(contentId)) {
      newSelected.delete(contentId);
    } else {
      newSelected.add(contentId);
    }
    setSelectedIds(newSelected);
  };

  // 일괄 삭제
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) {
      return;
    }
    setDeleteTarget("batch");
    setDeleteDialogOpen(true);
  };

  // 개별 삭제
  const handleDelete = (contentId: string) => {
    setDeleteTarget(contentId);
    setDeleteDialogOpen(true);
  };

  // 삭제 확인
  const confirmDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      try {
        if (deleteTarget === "batch") {
          // 일괄 삭제
          const contentIds = Array.from(selectedIds);
          const res = await fetch("/api/bookmarks/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentIds }),
          });

          if (!res.ok) {
            throw new Error(await res.text());
          }

          toast({
            title: "북마크 삭제 완료",
            description: `${contentIds.length}개의 북마크가 삭제되었습니다.`,
            variant: "success",
          });

          setSelectedIds(new Set());
          router.refresh();
        } else {
          // 개별 삭제
          const res = await fetch("/api/bookmarks/toggle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentId: deleteTarget }),
          });

          if (!res.ok) {
            throw new Error(await res.text());
          }

          toast({
            title: "북마크 삭제 완료",
            description: "북마크가 삭제되었습니다.",
            variant: "success",
          });

          router.refresh();
        }

        setDeleteDialogOpen(false);
        setDeleteTarget(null);
      } catch (error) {
        console.error("Delete error:", error);
        toast({
          title: "삭제 실패",
          description: "잠시 후 다시 시도해주세요.",
          variant: "error",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 컨트롤 섹션 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* 북마크 개수 */}
        <div className="text-sm text-muted-foreground">
          총 {totalCount}개의 북마크
        </div>

        {/* 정렬 및 삭제 컨트롤 */}
        <div className="flex flex-wrap gap-2">
          {/* 정렬 선택 */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="name">이름순</SelectItem>
              <SelectItem value="region">지역별</SelectItem>
            </SelectContent>
          </Select>

          {/* 일괄 삭제 버튼 */}
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
              disabled={isPending}
              className="inline-flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              삭제 ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* 전체 선택 체크박스 */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 pb-2 border-b">
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label={
              selectedIds.size === items.length ? "전체 해제" : "전체 선택"
            }
          >
            {selectedIds.size === items.length ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            <span>전체 선택</span>
          </button>
        </div>
      )}

      {/* 북마크 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isSelected = selectedIds.has(item.contentid);
          return (
            <div
              key={item.contentid}
              className="relative group"
              role="listitem"
            >
              {/* 체크박스 */}
              <button
                type="button"
                onClick={() => handleToggleSelect(item.contentid)}
                className="absolute top-2 left-2 z-10 p-1 bg-background/80 backdrop-blur-sm rounded border hover:bg-background transition-colors"
                aria-label={isSelected ? "선택 해제" : "선택"}
              >
                {isSelected ? (
                  <CheckSquare className="h-5 w-5 text-primary" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>

              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={() => handleDelete(item.contentid)}
                className="absolute top-2 right-2 z-10 p-2 bg-destructive/80 backdrop-blur-sm rounded border hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100"
                aria-label="북마크 삭제"
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive-foreground" />
              </button>

              {/* 카드 */}
              <TourCard item={tourDetailToTourItem(item)} />
            </div>
          );
        })}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>북마크 삭제</DialogTitle>
            <DialogDescription>
              {deleteTarget === "batch"
                ? `선택한 ${selectedIds.size}개의 북마크를 삭제하시겠습니까?`
                : "이 북마크를 삭제하시겠습니까?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteTarget(null);
              }}
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

