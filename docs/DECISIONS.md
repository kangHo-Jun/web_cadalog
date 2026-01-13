# DECISIONS: Cafe24 Web Catalog

## 2026-01-09: Next.js 16 & React 19 Adoption
- **Decision**: 최신 Next.js 16 및 React 19 아키텍처 사용.
- **Reason**: 최신 성능 최적화 및 서버 컴포넌트 활용 극대화.
- **Status**: Accepted

## 2026-01-09: API Proxy Pattern
- **Decision**: `src/app/api/products/route.ts`를 통한 보안 프록시 구현.
- **Reason**: 외부 API 키 노출 방지 및 CORS 이슈 해결.
- **Status**: Accepted
