/** 내용 페이지의 제목 띠. 헤더가 고정(fixed)이라 위쪽에 헤더 높이만큼 여백을 둔다. */
export function PageBand({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="bg-band border-subtle border-b pt-16 md:pt-20">
      <div className="mx-auto max-w-[1320px] px-5 py-14 md:px-15 md:py-20">
        <p className="text-accent tracking-label text-2xs">{eyebrow}</p>
        <h1 className="font-display text-primary leading-display mt-3 text-3xl md:text-4xl">{title}</h1>
        {description && <p className="text-secondary mt-4 max-w-[52ch] text-sm leading-relaxed">{description}</p>}
      </div>
    </div>
  );
}
