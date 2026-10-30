"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

export function SignInGate() {
  const { loaded, openSignIn } = useClerk();

  // 접속하면 로그인 모달을 바로 연다
  useEffect(() => {
    if (loaded) openSignIn();
  }, [loaded, openSignIn]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">AI 뉴스 수집기</h1>
      <p className="text-zinc-500">로그인이 필요합니다.</p>
      <button
        type="button"
        onClick={() => openSignIn()}
        className="rounded-full bg-foreground px-5 py-2 text-background"
      >
        로그인
      </button>
    </main>
  );
}
