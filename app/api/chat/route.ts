import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `あなたはプロダクトのフィードバックを収集するAIアシスタントです。
ユーザーが製品やサービスについての意見、改善提案、バグ報告などを気軽に話せるように会話してください。

ルール:
- フレンドリーで親しみやすいトーンで話す
- 最初の挨拶は短く、すぐに本題に入る
- ユーザーの意見を深掘りする質問をする（「具体的にどの部分が？」「どうなったら嬉しい？」など）
- 3-5往復くらいで自然にまとめに入る
- 最後に「ありがとうございます！フィードバックを記録しました」と伝える
- 絵文字は使わない
- 日本語で会話する`;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const { messages, project } = await req.json();

    const systemWithProject = project
      ? `${SYSTEM_PROMPT}\n\nこのフィードバックは「${project}」というプロジェクトに関するものです。`
      : SYSTEM_PROMPT;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemWithProject,
      messages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ reply: text });
  } catch (e) {
    console.error("Chat API error:", e);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
