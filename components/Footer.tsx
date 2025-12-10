/**
 * @file Footer.tsx
 * @description 사이트 푸터 컴포넌트
 *
 * 저작권 정보, 링크, API 제공 정보를 표시하는 푸터입니다.
 * 반응형 디자인을 지원하며 모바일/데스크톱에서 적절히 표시됩니다.
 */

import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 저작권 및 링크 */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-muted-foreground">
            <span>My Trip © {currentYear}</span>
            <span className="hidden md:inline">|</span>
            <Link
              href="/about"
              className="hover:text-primary transition-colors"
            >
              About
            </Link>
            <span className="hidden md:inline">|</span>
            <Link
              href="/contact"
              className="hover:text-primary transition-colors"
            >
              Contact
            </Link>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline text-xs md:text-sm">
              한국관광공사 API 제공
            </span>
          </div>

          {/* 모바일: API 제공 정보를 별도로 표시 */}
          <div className="md:hidden text-xs text-muted-foreground">
            한국관광공사 API 제공
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

