# Phase 3: 추천 관광지 섹션

## 목표
상세페이지 하단에 같은 지역 또는 타입의 다른 관광지를 추천하는 섹션을 구현합니다. 사용자가 현재 관광지와 유사한 다른 관광지를 쉽게 발견할 수 있도록 합니다.

## 현재 구현 상태
- `components/tour-detail/recommendations.tsx` 컴포넌트 존재
- `app/places/[contentId]/page.tsx`에서 동일 contentTypeId 기준으로 추천 관광지 조회 (최대 6개)
- 기본적인 카드 레이아웃으로 표시

## 개선 방향
현재는 타입만 고려하고 있으나, 지역 기반 추천도 추가하여 더 정확한 추천을 제공합니다.

## 구현 계획

### 1. 추천 로직 개선
- **현재**: 동일 contentTypeId만 고려
- **개선**: 
  - 동일 지역(areaCode) + 동일 타입(contentTypeId) 우선 추천
  - 동일 타입만 있는 경우 대체 추천
  - 최대 6개 표시 (현재 유지)

### 2. 데이터 페칭 로직
- **우선순위 1**: 동일 지역 + 동일 타입
  - `getAreaBasedList({ areaCode, contentTypeId, numOfRows: 10 })`
  - 현재 관광지 제외 필터링
  - 최대 6개 선택
- **우선순위 2**: 동일 타입만 (지역 무관)
  - `getAreaBasedList({ contentTypeId, numOfRows: 10 })`
  - 현재 관광지 제외 필터링
  - 우선순위 1에서 부족한 경우 보충
- **에러 처리**: 
  - API 호출 실패 시 빈 배열 반환 (섹션 숨김)
  - 콘솔 로그만 출력 (사용자 경험 저해 방지)

### 3. Recommendations 컴포넌트 개선
- **파일**: `components/tour-detail/recommendations.tsx`
- **현재 구조**: 기본적인 카드 그리드 레이아웃
- **개선 사항**:
  - 섹션 제목 개선 ("이런 곳은 어떠세요?" → "이런 곳은 어떠세요?" 또는 "비슷한 관광지")
  - 빈 상태 처리 (이미 구현됨: `if (!items.length) return null`)
  - 로딩 상태 (선택 사항, Suspense로 처리 가능)
  - 반응형 디자인 확인 및 개선
  - 접근성 개선 (섹션 헤딩 레벨, aria-label)

### 4. 상세페이지 통합
- **파일**: `app/places/[contentId]/page.tsx`
- **현재 구현**: 142-156줄에 추천 관광지 페칭 로직 존재
- **개선 사항**:
  - 추천 로직 개선 (지역 + 타입 우선)
  - 에러 처리 개선
  - 로딩 상태는 Suspense로 처리 (현재 구조 유지)

### 5. UI/UX 개선
- **카드 레이아웃**:
  - 현재: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (적절함)
  - 모바일: 1열
  - 태블릿: 2열
  - 데스크톱: 3열
- **섹션 스타일**:
  - 현재: `border rounded-lg p-6 bg-card` (적절함)
  - 제목 스타일 확인 및 개선
- **호버 효과**: TourCard 컴포넌트에 이미 구현됨

### 6. 성능 최적화
- **병렬 처리**: 
  - 동일 지역+타입과 동일 타입만 조회를 병렬로 처리 가능
  - `Promise.all()` 사용 고려
- **캐싱**: 
  - 추천 관광지는 자주 변경되지 않으므로 캐싱 고려
  - Next.js revalidate 옵션 활용 (선택 사항)

### 7. 접근성 (ARIA)
- **섹션 헤딩**: 
  - 현재: `<h2>` 태그 사용 (적절함)
  - 섹션 제목 명확성 확인
- **카드 접근성**: 
  - TourCard 컴포넌트에 이미 `aria-label` 구현됨
- **키보드 네비게이션**: 
  - TourCard의 Link 컴포넌트로 자동 지원

### 8. 에러 처리
- **API 호출 실패**:
  - 빈 배열 반환하여 섹션 숨김
  - 콘솔 로그만 출력
  - 사용자에게 에러 표시하지 않음 (선택적 기능이므로)
- **데이터 없음**:
  - 현재: `if (!items.length) return null` (적절함)

## 파일 구조

```
app/places/[contentId]/
└── page.tsx                    # 추천 로직 개선 (142-156줄)

components/tour-detail/
└── recommendations.tsx         # 컴포넌트 개선 (UI/UX, 접근성)
```

## 구현 세부사항

### 추천 로직 개선 예시

```typescript
// app/places/[contentId]/page.tsx

// 추천 관광지 (동일 지역 + 타입 우선, 최대 6개)
let recommendations: TourItem[] = [];

try {
  // 우선순위 1: 동일 지역 + 동일 타입
  if (detailData.areacode) {
    try {
      const sameAreaAndType = await getAreaBasedList({
        areaCode: detailData.areacode,
        contentTypeId: detailData.contenttypeid,
        numOfRows: 10,
        pageNo: 1,
      });
      
      const filtered = sameAreaAndType.items
        .filter((item) => item.contentid !== detailData.contentid)
        .slice(0, 6);
      
      recommendations = filtered;
    } catch (err) {
      // 지역+타입 조회 실패 시 무시하고 다음 우선순위로
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch same area and type recommendations:", err);
      }
    }
  }
  
  // 우선순위 2: 동일 타입만 (부족한 경우 보충)
  if (recommendations.length < 6) {
    try {
      const sameType = await getAreaBasedList({
        contentTypeId: detailData.contenttypeid,
        numOfRows: 10,
        pageNo: 1,
      });
      
      const filtered = sameType.items
        .filter((item) => 
          item.contentid !== detailData.contentid &&
          !recommendations.some((rec) => rec.contentid === item.contentid)
        )
        .slice(0, 6 - recommendations.length);
      
      recommendations = [...recommendations, ...filtered];
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch same type recommendations:", err);
      }
    }
  }
} catch (err) {
  // 전체 실패 시 빈 배열 유지 (섹션 숨김)
  if (process.env.NODE_ENV === "development") {
    console.error("Failed to fetch recommendations:", err);
  }
}
```

### Recommendations 컴포넌트 개선 예시

```typescript
// components/tour-detail/recommendations.tsx

export function Recommendations({ items, title = "이런 곳은 어떠세요?" }: RecommendationsProps) {
  if (!items.length) return null;

  return (
    <section 
      className="border rounded-lg p-6 bg-card space-y-4"
      aria-labelledby="recommendations-heading"
    >
      <h2 id="recommendations-heading" className="text-xl font-semibold">
        {title}
      </h2>
      <div 
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="추천 관광지 목록"
      >
        {items.map((item) => (
          <div key={item.contentid} role="listitem">
            <TourCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
```

## 테스트 시나리오

1. **동일 지역 + 타입이 있는 경우**
   - 해당 지역의 동일 타입 관광지가 추천되어야 함
   - 최대 6개 표시

2. **동일 지역 + 타입이 없는 경우**
   - 동일 타입만 추천되어야 함
   - 최대 6개 표시

3. **추천 관광지가 없는 경우**
   - 섹션이 숨겨져야 함 (`return null`)

4. **API 호출 실패 시**
   - 섹션이 숨겨져야 함
   - 콘솔에 에러 로그만 출력

5. **반응형 디자인**
   - 모바일: 1열
   - 태블릿: 2열
   - 데스크톱: 3열

## 주의사항

1. **현재 관광지 제외**: 
   - `item.contentid !== detailData.contentid` 필터링 필수

2. **중복 제거**: 
   - 우선순위 2에서 이미 추가된 관광지 제외

3. **에러 처리**: 
   - 추천 기능은 선택적이므로 실패해도 사용자 경험에 큰 영향 없음
   - 에러 표시하지 않고 섹션만 숨김

4. **성능**: 
   - API 호출이 2번 발생할 수 있으나, 선택적 기능이므로 허용
   - 필요시 병렬 처리 고려


