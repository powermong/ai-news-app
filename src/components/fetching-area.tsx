"use client";

import { createContext, useContext, useState } from "react";

const FetchingContext = createContext<(fetching: boolean) => void>(() => {});

export function useSetFetching() {
  return useContext(FetchingContext);
}

// 뉴스 가져오기 중에는 카드 영역을 흐리게 하고 펄스 효과를 준다
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
        className={`mx-auto w-full max-w-6xl space-y-6 px-4 py-6 transition-opacity sm:px-6 ${
          fetching ? "pointer-events-none animate-pulse opacity-60" : ""
        }`}
      >
        {children}
      </main>
    </FetchingContext>
  );
}
