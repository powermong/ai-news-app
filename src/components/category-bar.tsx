import Link from "next/link";
import { AddCategoryButton } from "./add-category-button";

export type CategoryChip = {
  // "all" | "uncategorized" | 카테고리 id
  key: string;
  label: string;
  count: number;
};

const chipBase =
  "rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
const chipIdle =
  "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800";
const chipActive =
  "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-500";

export function CategoryBar({
  chips,
  selected,
}: {
  chips: CategoryChip[];
  selected: string;
}) {
  return (
    <div
      role="group"
      aria-label="카테고리 필터"
      className="flex flex-wrap items-center gap-2"
    >
      {chips.map((chip) => {
        const active = chip.key === selected;
        return (
          <Link
            key={chip.key}
            href={chip.key === "all" ? "/dashboard" : `/dashboard?category=${chip.key}`}
            aria-current={active ? "true" : undefined}
            className={`${chipBase} ${active ? chipActive : chipIdle}`}
          >
            {chip.label}
            <span className="ml-1.5 text-xs opacity-70">{chip.count}</span>
          </Link>
        );
      })}
      <AddCategoryButton />
    </div>
  );
}
