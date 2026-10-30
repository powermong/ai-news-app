"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

const buttonClass =
  "inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3.5 py-1.5 text-sm text-slate-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-neutral-700 dark:text-neutral-500 dark:hover:border-indigo-400 dark:hover:text-indigo-400";

export function AddCategoryButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, startRefresh] = useTransition();

  function close() {
    setEditing(false);
    setName("");
    setError(null);
  }

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      close();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "카테고리를 추가하지 못했어요");
        inputRef.current?.focus();
        return;
      }
      close();
      startRefresh(() => router.refresh());
    } catch {
      setError("네트워크 오류가 발생했어요");
      inputRef.current?.focus();
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        aria-label="카테고리 추가"
        onClick={() => setEditing(true)}
        className={buttonClass}
      >
        <span aria-hidden>+</span> 카테고리 추가
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <input
        ref={inputRef}
        autoFocus
        value={name}
        disabled={saving || refreshing}
        maxLength={30}
        placeholder="카테고리 이름"
        aria-label="새 카테고리 이름"
        aria-invalid={error ? true : undefined}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          // 한글 조합 중 Enter는 글자 확정이므로 저장하지 않는다
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter") {
            e.preventDefault();
            void save();
          } else if (e.key === "Escape") {
            close();
          }
        }}
        onBlur={() => {
          if (!saving && !name.trim()) close();
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
