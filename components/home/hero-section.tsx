/**
 * @file hero-section.tsx
 * @description 홈페이지 Hero Section 컴포넌트
 *
 * 환영 메시지와 간단한 설명을 표시하는 Hero Section입니다.
 * 검색 유도를 위한 대형 헤딩과 설명 텍스트를 포함합니다.
 */

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            한국의 아름다운 관광지를 탐험하세요
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            전국 관광지 정보를 검색하고 지도에서 위치를 확인하며, 상세 정보를 알아보세요
          </p>
        </div>
      </div>
    </section>
  );
}

