# Vercel 환경변수 설정 체크리스트

이 문서는 Vercel Dashboard에서 환경변수를 설정할 때 사용하는 빠른 체크리스트입니다.

## 빠른 체크리스트

### 1. Vercel Dashboard 접속

- [ ] [Vercel Dashboard](https://vercel.com/dashboard) 로그인
- [ ] 배포할 프로젝트 선택
- [ ] **Settings** → **Environment Variables** 이동

### 2. 필수 환경변수 설정

#### 한국관광공사 API

- [ ] `TOUR_API_KEY` 또는 `NEXT_PUBLIC_TOUR_API_KEY` 설정
  - [ ] [한국관광공사 공공데이터포털](https://www.data.go.kr/)에서 API 키 발급
  - [ ] Vercel에 추가
  - [ ] Environment: Production 선택

#### 네이버 지도 API

- [ ] `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 설정
  - [ ] [네이버 클라우드 플랫폼](https://www.ncloud.com/)에서 Client ID 발급
  - [ ] Vercel에 추가
  - [ ] Environment: Production 선택

#### Clerk 인증

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 설정
  - [ ] [Clerk Dashboard](https://dashboard.clerk.com/)에서 프로덕션 키 발급 (예: publishable key)
  - [ ] Vercel에 추가
  - [ ] Environment: Production은 프로덕션 키, Preview/Development는 테스트 키
- [ ] `CLERK_SECRET_KEY` 설정
  - [ ] Clerk Dashboard에서 프로덕션 키 발급 (예: secret key)
  - [ ] Vercel에 추가
  - [ ] Environment: Production은 프로덕션 키, Preview/Development는 테스트 키
- [ ] (선택) `NEXT_PUBLIC_CLERK_SIGN_IN_URL` 설정 (기본값: `/sign-in`)
- [ ] (선택) `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` 설정 (기본값: `/`)
- [ ] (선택) `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` 설정 (기본값: `/`)

#### Supabase

- [ ] `NEXT_PUBLIC_SUPABASE_URL` 설정
  - [ ] [Supabase Dashboard](https://app.supabase.com/)에서 Project URL 복사
  - [ ] Vercel에 추가
  - [ ] Environment: 모든 환경
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
  - [ ] Supabase Dashboard에서 anon public key 복사
  - [ ] Vercel에 추가
  - [ ] Environment: 모든 환경
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 설정
  - [ ] Supabase Dashboard에서 service_role secret key 복사
  - [ ] Vercel에 추가 (⚠️ 보안 주의)
  - [ ] Environment: 모든 환경
- [ ] (선택) `NEXT_PUBLIC_STORAGE_BUCKET` 설정 (기본값: `uploads`)

#### 사이트 URL

- [ ] `NEXT_PUBLIC_SITE_URL` 설정
  - [ ] Production: 실제 도메인 (예: `https://your-domain.com`)
  - [ ] Preview: Vercel Preview URL (선택)
  - [ ] Development: 로컬 URL (선택)

### 3. 환경별 설정 확인

#### Production (프로덕션)

- [ ] 모든 필수 환경변수 설정 완료
- [ ] Clerk 프로덕션 키 사용 (Publishable/Secret 키 모두 프로덕션 값)
- [ ] `NEXT_PUBLIC_SITE_URL`이 실제 도메인으로 설정
- [ ] 프로덕션 API 키 사용 확인

#### Preview (프리뷰)

- [ ] 필수 환경변수 설정 완료
- [ ] 테스트 키 사용 가능
- [ ] `NEXT_PUBLIC_SITE_URL` 설정 (선택)

#### Development (개발)

- [ ] 필수 환경변수 설정 완료
- [ ] 테스트 키 사용 가능
- [ ] `NEXT_PUBLIC_SITE_URL` 설정 (선택)

### 4. 검증

- [ ] 환경변수 설정 후 재배포
- [ ] 로컬 환경변수 검증: `pnpm verify:env`
- [ ] Vercel 환경변수 확인: `pnpm check:vercel-env` (선택)
- [ ] 배포 후 주요 기능 테스트

## 환경변수별 발급 링크 모음

각 환경변수의 발급 방법에 대한 빠른 참조 링크입니다.

### 한국관광공사 API 키

- **발급 링크**: [한국관광공사 공공데이터포털](https://www.data.go.kr/)
- **검색 키워드**: "한국관광공사 TourAPI" 또는 "KorService2"
- **발급 위치**: 마이페이지 → 활용신청 내역
- **주의사항**: Decoding 키 사용 (URL 디코딩이 필요 없는 키)

### 네이버 지도 API Client ID

- **발급 링크**: [네이버 클라우드 플랫폼](https://www.ncloud.com/)
- **서비스 경로**: Services → AI·NAVER API → Maps → Web Dynamic Map
- **발급 위치**: Application → Client ID
- **주의사항**: 신용카드 등록 필수 (월 10,000,000건 무료)

### Clerk 인증 키

- **발급 링크**: [Clerk Dashboard](https://dashboard.clerk.com/)
- **발급 위치**: API Keys → Production 탭
- **필요 키**: Publishable Key, Secret Key (실제 키는 대시보드에서 확인)
- **주의사항**: 프로덕션 환경에서는 반드시 Production 탭의 키 사용

### Supabase 키

- **발급 링크**: [Supabase Dashboard](https://app.supabase.com/)
- **발급 위치**: Settings → API
- **필요 키**: Project URL, anon public key, service_role secret key
- **주의사항**: service_role secret key는 절대 공개하지 마세요!

### NEXT_PUBLIC_SITE_URL

- **설정 위치**: Vercel Dashboard → Settings → Domains
- **확인 방법**: 프로젝트 배포 후 기본 도메인 확인 또는 커스텀 도메인 설정
- **주의사항**: 프로덕션에서는 `https://` 사용 필수

## 환경변수별 형식 예시

각 환경변수의 형식 예시입니다. 실제 값은 마스킹되어 있습니다.

### 필수 환경변수 (8개)

```bash
# 한국관광공사 API (하나만 선택) — 예시 값은 모두 마스킹됨
TOUR_API_KEY=YOUR_TOUR_API_KEY
# 또는
NEXT_PUBLIC_TOUR_API_KEY=YOUR_TOUR_API_KEY

# 네이버 지도
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=ncp_your_naver_map_client_id

# Clerk (실제 프로덕션 키를 넣으세요)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase (예시, 실제 키는 대체)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy

# 사이트 URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 선택 환경변수 (4개)

```bash
# Clerk (기본값 사용 가능)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase (기본값 사용 가능)
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

### 형식 검증 팁

- **한국관광공사 API 키**: 일반적으로 40-50자 길이의 영숫자 문자열
- **네이버 지도 Client ID**: `ncp_`로 시작하는 문자열
- **Clerk 키**:
  - Publishable Key: 예) pk_example_publishable_key
  - Secret Key: 예) sk_example_secret_key
- **Supabase 키**: JWT 토큰 형식 (`eyJhbGc...`로 시작)
- **사이트 URL**: `https://`로 시작하는 유효한 URL 형식

## 보안 체크리스트

- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 코드에 포함되지 않았는지 확인
- [ ] `CLERK_SECRET_KEY`가 클라이언트 코드에 포함되지 않았는지 확인
- [ ] 프로덕션 환경에서 프로덕션 키 사용 확인
- [ ] 환경변수가 Git에 커밋되지 않았는지 확인

## TODO.md 연동

이 체크리스트는 `docs/TODO.md`의 Phase 6 환경변수 설정 항목과 연동됩니다.

### TODO.md 업데이트 방법

각 환경변수 설정을 완료한 후 `docs/TODO.md`에서 해당 항목을 체크하세요:

1. `docs/TODO.md` 파일 열기
2. Phase 6 → 배포 준비 → 환경변수 설정 섹션 찾기
3. 설정 완료한 환경변수 항목 체크:
   ```markdown
   - [ ] 환경변수 설정 (Vercel 대시보드)
     - [x] 한국관광공사 API 키 설정 ← 완료 시 [x]로 변경
     - [x] 네이버 지도 API Client ID 설정
     - [x] Clerk 인증 키 설정 (프로덕션 키 사용)
     - [x] Supabase 키 설정
     - [x] `NEXT_PUBLIC_SITE_URL` 설정 (프로덕션 도메인)
   ```

### 설정 완료 확인

모든 필수 환경변수를 설정한 후:

1. **검증 스크립트 실행**:

   ```bash
   # Vercel 환경변수 빠른 확인
   pnpm verify:vercel-env-setup

   # 또는 상세 확인
   pnpm check:vercel-env
   ```

2. **재배포**:

   - Vercel Dashboard → Deployments → "Redeploy" 클릭
   - 또는 Git에 새로운 커밋 푸시

3. **기능 테스트**:

   - 홈페이지에서 관광지 목록 로드 확인
   - 지도 표시 확인
   - 로그인/회원가입 기능 확인
   - 북마크 기능 확인

4. **TODO.md 최종 체크**:
   - 모든 환경변수 설정 항목이 체크되었는지 확인
   - Phase 6 환경변수 설정 섹션이 완료되었는지 확인

### 관련 TODO.md 위치

- **파일**: `docs/TODO.md`
- **섹션**: `## Phase 6 : 최적화 & 배포` → `배포 준비` → `환경변수 설정 (Vercel 대시보드)`
- **라인 번호**: 약 1317-1322줄

## 관련 문서

- [Vercel 환경변수 설정 가이드](VERCEL_ENV_SETUP.md) - 상세 설정 가이드
- [배포 가이드](DEPLOYMENT.md) - 전체 배포 프로세스
- [환경변수 가이드](ENV_VARIABLES.md) - 환경변수 상세 설명 및 사용 위치
- [TODO.md](TODO.md) - 프로젝트 전체 작업 목록
- [README.md](../README.md) - 프로젝트 설정 가이드
