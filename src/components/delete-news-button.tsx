"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function DeleteNewsButton({ articleId }: { articleId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/${articleId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "삭제하지 못했어요");
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
    <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-label="뉴스 삭제"
        title="뉴스 삭제"
        className="flex size-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-red-400"
      >
        {busy ? (
          <span className="text-xs">…</span>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        )}
      </button>
      {error && (
        <p
          role="alert"
          className="rounded bg-white px-1 text-xs text-red-600 dark:bg-neutral-900 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
