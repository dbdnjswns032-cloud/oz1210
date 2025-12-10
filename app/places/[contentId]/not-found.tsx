/**
 * @file not-found.tsx
 * @description 상세페이지 404 페이지
 *
 * 존재하지 않는 관광지 상세페이지에 접근했을 때 표시되는 404 페이지입니다.
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function PlaceNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">관광지를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-8">
          요청하신 관광지 정보를 찾을 수 없습니다.
          <br />
          관광지 ID가 올바른지 확인해주세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            이전 페이지로
          </Button>
        </div>
      </div>
    </div>
  );
}

