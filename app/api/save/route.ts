import { NextRequest, NextResponse } from "next/server";

type Message = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  try {
    const { messages, project, metadata } = await req.json() as {
      messages: Message[];
      project?: string;
      metadata?: Record<string, string>;
    };

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    if (!token || !owner || !repo) {
      return NextResponse.json({ error: "GitHub config missing" }, { status: 500 });
    }

    // ファイル名: project/YYYY-MM-DD_HHmmss.md
    const now = new Date();
    const dateStr = now.toISOString().replace(/T/, "_").replace(/[:.]/g, "").slice(0, 15);
    const folder = project || "general";
    const path = `${folder}/${dateStr}.md`;

    // Markdown形式で会話ログを作成
    let content = `# Feedback: ${project || "General"}\n`;
    content += `- Date: ${now.toISOString()}\n`;
    content += `- Project: ${project || "N/A"}\n`;
    if (metadata) {
      Object.entries(metadata).forEach(([k, v]) => {
        content += `- ${k}: ${v}\n`;
      });
    }
    content += `\n---\n\n`;

    for (const msg of messages) {
      if (msg.role === "user") {
        content += `**User:** ${msg.content}\n\n`;
      } else {
        content += `**AI:** ${msg.content}\n\n`;
      }
    }

    // GitHub API でファイルを作成
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: `feedback: ${project || "general"} ${now.toISOString().slice(0, 10)}`,
        content: Buffer.from(content).toString("base64"),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("GitHub API error:", err);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ saved: true, path });
  } catch (e) {
    console.error("Save API error:", e);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
