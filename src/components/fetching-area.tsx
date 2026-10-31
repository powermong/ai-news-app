"use client";

import { createContext, useContext, useState } from "react";

// 기본값은 no-op이라 FetchingArea 밖에서 호출해도 아무 동작도 하지 않는다
const FetchingContext = createContext<(fetching: boolean) => void>(() => {});

export function useSetFetching() {
  return useContext(FetchingContext);
}

// 뉴스 가져오기 중에는 카드 영역을 흐리게 하고 펄스 효과를 준다.
// 서버 컴포넌트인 page.tsx의 헤더와 본문을 prop/children으로 받아 한 컨텍스트로 묶는다
export function FetchingArea({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const [fetching, setFetching] = useState(false);

  return (
    <FetchingContext value={setFetching}>
      {header}
      <main
        aria-busy={fetching}
        className={`mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-6 ${
          fetching ? "pointer-events-none animate-pulse opacity-60" : ""
        }`}
      >
        {children}
      </main>
    </FetchingContext>
  );
}
