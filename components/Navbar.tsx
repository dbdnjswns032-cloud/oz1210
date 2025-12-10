"use client";

import { useState, useEffect } from "react";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // URL의 keyword 파라미터를 읽어와서 검색창에 초기값 설정
  useEffect(() => {
    const keyword = searchParams.get("keyword");
    if (keyword) {
      setSearchKeyword(decodeURIComponent(keyword));
    } else {
      setSearchKeyword("");
    }
  }, [searchParams]);

  /**
   * 검색 실행 함수
   * 키워드를 URL 쿼리 파라미터로 추가하여 홈페이지로 이동
   */
  const handleSearch = (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    // 홈페이지로 이동하면서 검색 키워드를 쿼리 파라미터로 추가
    router.push(`/?keyword=${encodeURIComponent(trimmedKeyword)}`);
    setIsMobileSearchOpen(false);
    setSearchKeyword("");
  };

  /**
   * 엔터 키 이벤트 처리
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchKeyword);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 max-w-7xl mx-auto px-4">
        {/* 모바일 메뉴 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="메뉴 열기"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* 로고 */}
        <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
          My Trip
        </Link>

        {/* 네비게이션 링크 (데스크톱) */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            )}
          >
            홈
          </Link>
          <Link
            href="/stats"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/stats" ? "text-primary" : "text-muted-foreground"
            )}
          >
            통계
          </Link>
          <SignedIn>
            <Link
              href="/bookmarks"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/bookmarks" ? "text-primary" : "text-muted-foreground"
              )}
            >
              북마크
            </Link>
          </SignedIn>
        </nav>

        {/* 검색창 및 인증 */}
        <div className="flex items-center gap-4 flex-1 md:flex-initial justify-end">
          {/* 검색창 (데스크톱) */}
          <div className="hidden md:flex items-center relative w-full max-w-sm">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="관광지 검색..."
              className="pl-9 w-full"
              aria-label="관광지 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* 검색 아이콘 (모바일) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="검색"
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* 모바일 검색 모달 */}
          <Dialog open={isMobileSearchOpen} onOpenChange={setIsMobileSearchOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>관광지 검색</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="관광지명, 주소, 설명 검색..."
                    className="pl-9"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </div>
                <Button
                  onClick={() => handleSearch(searchKeyword)}
                  disabled={!searchKeyword.trim()}
                >
                  검색
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* 모바일 네비게이션 메뉴 */}
          <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>메뉴</DialogTitle>
              </DialogHeader>
              <nav className="flex flex-col gap-4">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-base font-medium transition-colors hover:text-primary py-2",
                    pathname === "/" ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  홈
                </Link>
                <Link
                  href="/stats"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-base font-medium transition-colors hover:text-primary py-2",
                    pathname === "/stats" ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  통계
                </Link>
                <SignedIn>
                  <Link
                    href="/bookmarks"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "text-base font-medium transition-colors hover:text-primary py-2",
                      pathname === "/bookmarks" ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    북마크
                  </Link>
                </SignedIn>
              </nav>
            </DialogContent>
          </Dialog>

          {/* 로그인/사용자 버튼 */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="default" size="sm">
                로그인
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
