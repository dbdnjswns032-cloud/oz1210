-- =====================================================
-- Supabase 설정 확인 SQL 쿼리
-- Phase 5: Supabase 설정 확인용
-- =====================================================
-- 
-- 사용 방법:
-- 1. Supabase Dashboard 접속
-- 2. SQL Editor 열기
-- 3. 아래 쿼리들을 하나씩 실행하여 결과 확인
-- =====================================================

-- =====================================================
-- 1. users 테이블 확인
-- =====================================================

-- 테이블 존재 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
) as table_exists;

-- 테이블 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 제약조건 확인
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name = 'users';

-- UNIQUE 제약조건 상세 확인
SELECT
  tc.constraint_name,
  kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'users';

-- RLS 상태 확인
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'users';

-- =====================================================
-- 2. bookmarks 테이블 확인
-- =====================================================

-- 테이블 존재 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'bookmarks'
) as table_exists;

-- 테이블 구조 확인
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
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'bookmarks';

-- UNIQUE 제약조건 확인
SELECT
  tc.constraint_name,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'bookmarks'
GROUP BY tc.constraint_name;

-- 인덱스 확인
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'bookmarks'
ORDER BY indexname;

-- RLS 상태 확인
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'bookmarks';

-- =====================================================
-- 3. 권한 확인
-- =====================================================

-- users 테이블 권한
SELECT
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY grantee, privilege_type;

-- bookmarks 테이블 권한
SELECT
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'bookmarks'
ORDER BY grantee, privilege_type;

-- =====================================================
-- 4. 요약 정보
-- =====================================================

-- 전체 테이블 목록
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'bookmarks')
ORDER BY tablename;

