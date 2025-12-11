# Supabase 설정 확인 가이드

Phase 5: Supabase 설정 확인을 위한 가이드입니다.

## 확인 방법

### 방법 1: API Route 사용 (권장)

브라우저에서 다음 URL로 접근:

```
http://localhost:3000/api/verify-supabase
```

JSON 응답으로 확인 결과를 받을 수 있습니다.

### 방법 2: Supabase Dashboard 사용

1. Supabase Dashboard 접속
2. SQL Editor에서 다음 쿼리 실행

```sql
-- users 테이블 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- bookmarks 테이블 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookmarks'
ORDER BY ordinal_position;

-- 외래키 확인
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'bookmarks';

-- 인덱스 확인
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'bookmarks';

-- RLS 상태 확인
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'bookmarks');
```

## 확인 항목

### 1. 환경변수
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. users 테이블
- 테이블 존재
- 컬럼: id, clerk_id, name, created_at
- 제약조건: PRIMARY KEY, UNIQUE(clerk_id)
- RLS 비활성화

### 3. bookmarks 테이블
- 테이블 존재
- 컬럼: id, user_id, content_id, created_at
- 외래키: user_id → users.id (ON DELETE CASCADE)
- 제약조건: PRIMARY KEY, UNIQUE(user_id, content_id)
- 인덱스: user_id, content_id, created_at
- RLS 비활성화

## 문제 해결

### 테이블이 없는 경우

Supabase Dashboard의 SQL Editor에서 `supabase/migrations/db.sql` 파일의 내용을 실행하세요.

### RLS가 활성화된 경우

다음 SQL을 실행하여 비활성화:

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks DISABLE ROW LEVEL SECURITY;
```

### 인덱스가 없는 경우

다음 SQL을 실행하여 생성:

```sql
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_content_id ON public.bookmarks(content_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);
```

