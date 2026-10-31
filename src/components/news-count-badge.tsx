export function NewsCountBadge({ total }: { total: number }) {
  return (
    <p
      role="status"
      className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
    >
      총 {total.toLocaleString("ko-KR")}개의 뉴스
    </p>
  );
}
