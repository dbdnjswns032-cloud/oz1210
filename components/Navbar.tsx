"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 max-w-7xl mx-auto px-4">
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
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="관광지 검색..."
              className="pl-9 w-full"
              aria-label="관광지 검색"
            />
          </div>

          {/* 검색 아이콘 (모바일) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="검색"
          >
            <Search className="h-5 w-5" />
          </Button>

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
