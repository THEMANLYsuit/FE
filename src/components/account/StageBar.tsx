import { ORDER_STAGES, type OrderStage, type OrderStatus } from "@/lib/api";

/**
 * 진행 막대 — 여섯 칸. 지난 단계는 브라스로 차고, 지금 단계는 한 칸이 밝게 빛난다.
 * 목록(작게)과 상세(이름 붙여 크게)가 같이 쓴다. 색만으로 알리지 않도록 화면 읽기 프로그램용 문장을 함께 둔다.
 */
const LABEL: Record<OrderStage, string> = {
  CONSULTATION: "상담",
  MEASUREMENT: "치수",
  FABRIC: "원단 · 스타일",
  FITTING: "가봉",
  ADJUSTMENT: "수정 · 완성",
  DELIVERY: "수령",
};

export function StageBar({ stage, status, labelled = false }: { stage: OrderStage; status: OrderStatus; labelled?: boolean }) {
  const at = ORDER_STAGES.indexOf(stage);
  const summary =
    status === "COMPLETED" ? "모든 단계를 마쳤습니다" : status === "CANCELLED" ? `${LABEL[stage]} 단계에서 취소되었습니다` : `여섯 단계 중 ${at + 1}번째, ${LABEL[stage]} 단계입니다`;
  return (
    <div>
      <p className="sr-only">{summary}</p>
      <ol aria-hidden="true" className={`grid grid-cols-6 ${labelled ? "gap-1.5" : "gap-1"}`}>
        {ORDER_STAGES.map((s, i) => {
          const done = status === "COMPLETED" || i < at;
          const now = status === "IN_PROGRESS" && i === at;
          return (
            <li key={s} className="flex flex-col gap-2">
              <span
                className={`block ${labelled ? "h-1" : "h-0.5"} ${
                  done ? "bg-accent" : now ? "bg-accent-deep" : status === "CANCELLED" && i === at ? "bg-muted" : "bg-strong"
                }`}
              />
              {labelled && (
                <span className={`text-[0.65rem] leading-tight break-keep md:text-2xs ${now ? "text-primary" : done ? "text-secondary" : "text-muted"}`}>
                  {LABEL[s]}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
