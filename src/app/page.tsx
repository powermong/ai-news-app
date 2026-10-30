import { redirect } from "next/navigation";

// 로그인 게이트 뒤에서만 렌더링되므로 instant navigation 검증에서 제외한다
export const instant = false;

export default function Home() {
  redirect("/dashboard");
}
