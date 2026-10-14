# THE MANLY 맞춤정장 — 손님 화면

Next.js 16 정적 내보내기 · Tailwind 4. 레오네페리토 FE 와 같은 틀이고, 메인은 **풀스크린 장면이 이어지는 스크롤 필름**이다.

```bash
cp .env.example .env.local     # API 주소 (로컬 API 는 8081)
npm install
npm run dev                    # http://localhost:3001
npm run build                  # out/ 에 정적 파일
```

## 구조

- `src/app/page.tsx` — 메인. 장면 다섯 개(히어로 · 약속 · 과정 · 원단 · 예약). 연출은 `components/home/Scene` + `globals.css`.
- `src/app/booking/` — 상담 · 가봉 예약 (빈 시간은 로그인 없이, 신청은 로그인).
- `src/app/fabrics/` · `src/app/process/` — 원단 목록(빌드 때 API), 제작 과정(`data/process.ts`).
- `src/app/login/` · `signup/` · `mypage/` — 회원. 세션 쿠키(TMSESSION) · CSRF 는 `lib/api.ts`.
- `src/styles/tokens/` — 잉크 · 아이보리 · 브라스 색 토큰. 값을 바꾸면 화면 전체가 따라온다.

아직 없는 것: 약관 · 개인정보처리방침 페이지(레오네페리토 것을 옮겨 맞춘다), 관리자 화면, 치수 · 주문 진행(2단계), 촬영 사진(장면 배경은 그라데이션 자리).
