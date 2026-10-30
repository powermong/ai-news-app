import Anthropic from "@anthropic-ai/sdk";

// 서버 전용. ANTHROPIC_API_KEY 환경변수를 SDK가 직접 읽는다.
export const claude = new Anthropic();

export const CLAUDE_MODEL = "claude-haiku-5-5";
