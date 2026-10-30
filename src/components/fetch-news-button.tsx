"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type FetchResult = {
  fetched: number;
  inserted: number;
  skipped: number;
  processed: number;
  failed: number;
  errors: { source: string; message: string }[];
};

type Notice = { kind: "status" | "error"; text: string };

export function FetchNewsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [notice, setNotice] = useState<Notice | null>(null);

  async function handleClick() {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/news/fetch", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setNotice({
          kind: "error",
          text: data.error ?? "뉴스를 가져오지 못했어요",
        });
        return;
      }

      const result = data as FetchResult;
      const failed = result.errors.map((e) => `${e.source} 수집 실패`);
      if (result.failed > 0) {
        failed.push(`번역·요약 ${result.failed}건 실패 (다음에 다시 시도)`);
      }
      setNotice({
        kind: failed.length > 0 ? "error" : "status",
        text: [`새 기사 ${result.inserted}건 추가`, ...failed].join(" · "),
      });
      startRefresh(() => router.refresh());
    } catch {
      setNotice({ kind: "error", text: "네트워크 오류가 발생했어요" });
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || refreshing;

  return (
    <div className="flex items-center gap-3">
      {notice && (
        <p
          role={notice.kind === "error" ? "alert" : "status"}
          className={
            notice.kind === "error"
              ? "hidden text-sm text-red-600 sm:block dark:text-red-400"
              : "hidden text-sm text-slate-500 sm:block dark:text-neutral-500"
          }
        >
          {notice.text}
        </p>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        {busy && (
          <svg
            className="size-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="3"
              className="opacity-25"
            />
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}
        {busy ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
    </div>
  );
}
