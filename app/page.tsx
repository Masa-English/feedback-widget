import Script from "next/script";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center p-8">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Feedback Widget
        </h1>
        <p className="text-neutral-500 mb-8 leading-relaxed">
          どのサイトにも1行で埋め込めるフィードバックウィジェット。<br />
          右下のボタンを押して試してみてください。
        </p>
        <div className="bg-white rounded-xl p-6 text-left shadow-sm">
          <p className="text-sm font-semibold text-neutral-700 mb-2">使い方</p>
          <code className="text-xs bg-neutral-100 text-neutral-600 p-3 rounded-lg block whitespace-pre-wrap break-all">
{`<script
  src="https://YOUR_DOMAIN/widget.js"
  data-project="my-project"
></script>`}
          </code>
          <div className="mt-4 text-xs text-neutral-400 space-y-1">
            <p><strong>data-project</strong> - プロジェクト名（ログのフォルダ分け用）</p>
            <p><strong>data-accent</strong> - アクセントカラー（デフォルト: #D97706）</p>
            <p><strong>data-position</strong> - ボタン位置: left / right（デフォルト: right）</p>
          </div>
        </div>
      </div>

      <Script src="/widget.js" data-project="demo" strategy="afterInteractive" />
    </div>
  );
}
