"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { CategoryChip } from "./category-bar";

const chipBase =
  "rounded-full border text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
const chipIdle =
  "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800";
const chipActive =
  "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-500";
const iconButton =
  "rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-indigo-500";

export function ManageableCategoryChip({
  chip,
  active,
}: {
  chip: CategoryChip;
  active: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [name, setName] = useState(chip.label);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [refreshing, startRefresh] = useTransition();

  function reset() {
    setMode("view");
    setName(chip.label);
    setError(null);
  }

  async function request(init: RequestInit, fallback: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${chip.key}`, {
        headers: { "Content-Type": "application/json" },
        ...init,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? fallback);
        return false;
      }
      return true;
    } catch {
      setError("네트워크 오류가 발생했어요");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function rename() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === chip.label) {
      reset();
      return;
    }
    const ok = await request(
      { method: "PATCH", body: JSON.stringify({ name: trimmed }) },
      "이름을 바꾸지 못했어요",
    );
    if (ok) {
      setMode("view");
      startRefresh(() => router.refresh());
    } else {
      inputRef.current?.focus();
    }
  }

  async function remove() {
    const ok = await request({ method: "DELETE" }, "삭제하지 못했어요");
    if (ok) {
      setMode("view");
      // 삭제한 카테고리가 선택된 상태였다면 전체 보기로 돌아간다
      if (active) router.replace("/dashboard");
      startRefresh(() => router.refresh());
    }
  }

  if (mode === "edit") {
    return (
      <div className="inline-flex items-center gap-2">
        <input
          ref={inputRef}
          autoFocus
          value={name}
          disabled={busy || refreshing}
          maxLength={30}
          aria-label={`${chip.label} 카테고리 새 이름`}
          aria-invalid={error ? true : undefined}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            // 한글 조합 중 Enter는 글자 확정이므로 저장하지 않는다
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter") {
              e.preventDefault();
              void rename();
            } else if (e.key === "Escape") {
              reset();
            }
          }}
          className="w-40 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm text-slate-900 outline-none focus:border-indigo-500 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        className={`group inline-flex items-center pr-1.5 ${chipBase} ${active ? chipActive : chipIdle}`}
      >
        <Link
          href={`/dashboard?category=${chip.key}`}
          aria-current={active ? "true" : undefined}
          className="py-1.5 pl-3.5 focus-visible:outline-2 focus-visible:outline-indigo-500"
        >
          {chip.label}
          <span className="ml-1.5 text-xs opacity-70">{chip.count}</span>
        </Link>
        <span className="inline-flex w-0 items-center overflow-hidden opacity-0 transition-all group-focus-within:ml-1 group-focus-within:w-12 group-focus-within:opacity-100 group-hover:ml-1 group-hover:w-12 group-hover:opacity-100">
          <button
            type="button"
            aria-label={`${chip.label} 이름 수정`}
            onClick={() => setMode("edit")}
            className={iconButton}
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            aria-label={`${chip.label} 삭제`}
            onClick={() => setMode("delete")}
            className={iconButton}
          >
            <TrashIcon />
          </button>
        </span>
        {/* 아이콘이 접혀 있을 때 오른쪽 여백을 맞춘다 */}
        <span aria-hidden className="w-2 group-focus-within:hidden group-hover:hidden" />
      </div>
      {mode === "delete" && (
        <DeleteDialog
          label={chip.label}
          count={chip.count}
          busy={busy || refreshing}
          error={error}
          onCancel={reset}
          onConfirm={() => void remove()}
        />
      )}
    </>
  );
}

function DeleteDialog({
  label,
  count,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  label: string;
  count: number;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-20 bg-black/40 px-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-category-title"
        onClick={(e) => e.stopPropagation()}
        className="mx-auto mt-[20vh] w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900"
      >
        <h2
          id="delete-category-title"
          className="text-lg font-semibold text-slate-900 dark:text-neutral-100"
        >
          &quot;{label}&quot; 카테고리를 삭제할까요?
        </h2>
        <p className="mt-2 break-keep text-sm leading-relaxed text-slate-600 dark:text-neutral-400">
          {count > 0
            ? `이 카테고리의 기사 ${count}건은 미분류로 이동합니다.`
            : "이 카테고리에는 기사가 없어요."}
        </p>
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            취소
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "삭제 중…" : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="size-3.5">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="size-3.5">
      <path
        fillRule="evenodd"
        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}
