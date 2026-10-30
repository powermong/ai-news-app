"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

export function SignInGate() {
  const { loaded, openSignIn } = useClerk();
  const { isLoaded, isSignedIn } = useAuth();

  // 접속하면 로그인 모달을 바로 연다. 이미 로그인된 세션이면
  // (single-session 모드에서 모달 렌더링이 거부되므로) 열지 않는다.
  useEffect(() => {
    if (loaded && isLoaded && !isSignedIn) openSignIn();
  }, [loaded, isLoaded, isSignedIn, openSignIn]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">AI 뉴스 수집기</h1>
      <p className="text-zinc-500">
        {isSignedIn
          ? "브라우저는 로그인되어 있지만 서버가 세션을 확인하지 못했습니다."
          : "로그인이 필요합니다."}
      </p>
      <button
        type="button"
        onClick={() => (isSignedIn ? window.location.reload() : openSignIn())}
        className="rounded-full bg-foreground px-5 py-2 text-background"
      >
        {isSignedIn ? "새로고침" : "로그인"}
      </button>
    </main>
  );
}
