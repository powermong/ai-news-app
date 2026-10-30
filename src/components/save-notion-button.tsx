"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SaveNotionButton({
  articleId,
  saved,
}: {
  articleId: number;
  saved: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (saved) {
    return (
      <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
        ✓ 저장됨
      </span>
    );
  }

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/${articleId}/notion`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "저장하지 못했어요");
        return;
      }
      startRefresh(() => router.refresh());
    } catch {
      setError("네트워크 오류가 발생했어요");
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || refreshing;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-700 transition-colors hover:border-indigo-500 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
      >
        {busy ? "저장 중…" : "NOTION 저장"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
