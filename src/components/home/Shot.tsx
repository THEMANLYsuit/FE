/**
 * 사진 한 장 — 주소가 있으면 사진, 없으면 자리표시(그라데이션 + 무엇을 찍어 넣을지).
 * 자리표시도 화면 구성의 일부라 장면이 비어 보이지 않게 톤을 맞춘다. 촬영본이 오면 data/story.ts 에 주소만 넣는다.
 */
const TONES = [
  "radial-gradient(ellipse 70% 60% at 30% 30%, #3a2f22 0%, transparent 60%), linear-gradient(160deg, #1b1714 0%, #0f0e0d 100%)",
  "radial-gradient(ellipse 60% 70% at 70% 40%, #2d251b 0%, transparent 65%), linear-gradient(200deg, #171411 0%, #0f0e0d 100%)",
  "radial-gradient(ellipse 80% 50% at 50% 100%, #2a2219 0%, transparent 60%), linear-gradient(180deg, #141210 0%, #1a1612 100%)",
];

export function Shot({
  src,
  alt,
  hint,
  tone = 0,
  className = "",
}: {
  src: string | null;
  alt: string;
  hint: string;
  tone?: number;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- 정적 내보내기라 next/image 최적화가 없다
    return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} loading="lazy" />;
  }
  return (
    <div role="img" aria-label={alt} className={`relative h-full w-full ${className}`} style={{ background: TONES[tone % TONES.length] }}>
      <span aria-hidden="true" className="text-muted/70 tracking-label absolute bottom-4 left-4 right-4 text-[0.6rem] leading-relaxed">
        PHOTO · {hint}
      </span>
    </div>
  );
}
