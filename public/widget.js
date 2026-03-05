(function () {
  "use strict";

  // 設定を取得
  var script = document.currentScript;
  var BASE = script.getAttribute("data-host") || script.src.replace(/\/widget\.js.*$/, "");
  var PROJECT = script.getAttribute("data-project") || "";
  var ACCENT = script.getAttribute("data-accent") || "#D97706";
  var POSITION = script.getAttribute("data-position") || "right"; // "left" | "right"

  // 二重初期化防止
  if (document.getElementById("__fb-widget-root")) return;

  // スタイル注入
  var style = document.createElement("style");
  style.textContent = [
    "#__fb-widget-root * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }",
    "#__fb-btn { position: fixed; bottom: 24px; " + POSITION + ": 24px; z-index: 99999; width: 56px; height: 56px; border-radius: 50%; background: " + ACCENT + "; border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; }",
    "#__fb-btn:hover { transform: scale(1.05); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }",
    "#__fb-btn svg { width: 24px; height: 24px; fill: white; }",
    "#__fb-panel { position: fixed; bottom: 92px; " + POSITION + ": 24px; z-index: 99999; width: 360px; max-width: calc(100vw - 32px); height: 480px; max-height: calc(100vh - 120px); background: #fff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); display: none; flex-direction: column; overflow: hidden; }",
    "#__fb-panel.open { display: flex; }",
    "#__fb-header { background: #171717; color: white; padding: 16px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }",
    "#__fb-header h3 { font-size: 14px; font-weight: 700; }",
    "#__fb-close { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 20px; line-height: 1; padding: 4px; }",
    "#__fb-close:hover { color: white; }",
    "#__fb-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; background: #f9f9fb; }",
    ".fb-msg { max-width: 85%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; word-break: break-word; }",
    ".fb-msg.ai { align-self: flex-start; background: white; color: #333; border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }",
    ".fb-msg.user { align-self: flex-end; background: " + ACCENT + "; color: white; border-bottom-right-radius: 4px; }",
    ".fb-msg.typing { align-self: flex-start; background: white; color: #999; font-style: italic; border-bottom-left-radius: 4px; }",
    "#__fb-input-area { display: flex; align-items: center; gap: 8px; padding: 12px; background: white; border-top: 1px solid #eee; flex-shrink: 0; }",
    "#__fb-input { flex: 1; border: 1px solid #e5e5e5; border-radius: 24px; padding: 8px 16px; font-size: 14px; outline: none; transition: border-color 0.2s; }",
    "#__fb-input:focus { border-color: " + ACCENT + "; }",
    "#__fb-send { width: 36px; height: 36px; border-radius: 50%; background: " + ACCENT + "; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity 0.2s; }",
    "#__fb-send:disabled { opacity: 0.4; cursor: not-allowed; }",
    "#__fb-send svg { width: 16px; height: 16px; fill: white; }",
  ].join("\n");
  document.head.appendChild(style);

  // ルート
  var root = document.createElement("div");
  root.id = "__fb-widget-root";

  // フローティングボタン
  var btn = document.createElement("button");
  btn.id = "__fb-btn";
  btn.title = "フィードバック";
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/></svg>';

  // パネル
  var panel = document.createElement("div");
  panel.id = "__fb-panel";
  panel.innerHTML = [
    '<div id="__fb-header"><h3>フィードバック</h3><button id="__fb-close">&times;</button></div>',
    '<div id="__fb-messages"></div>',
    '<div id="__fb-input-area">',
    '<input id="__fb-input" type="text" placeholder="メッセージを入力..." />',
    '<button id="__fb-send" disabled><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>',
    '</div>',
  ].join("");

  root.appendChild(btn);
  root.appendChild(panel);
  document.body.appendChild(root);

  // DOM refs
  var messagesEl = panel.querySelector("#__fb-messages");
  var inputEl = panel.querySelector("#__fb-input");
  var sendBtn = panel.querySelector("#__fb-send");
  var closeBtn = panel.querySelector("#__fb-close");

  // State
  var messages = []; // { role, content }
  var isOpen = false;
  var isSending = false;
  var conversationStarted = false;

  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle("open", isOpen);
    if (isOpen && !conversationStarted) {
      conversationStarted = true;
      addMessage("assistant", "こんにちは！プロダクトについてのご意見・ご感想をお聞かせください。気になった点や「こうなったらいいな」など、なんでもお気軽にどうぞ。");
    }
    if (isOpen) inputEl.focus();
  }

  function addMessage(role, content) {
    messages.push({ role: role, content: content });
    var div = document.createElement("div");
    div.className = "fb-msg " + (role === "user" ? "user" : "ai");
    div.textContent = content;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    var div = document.createElement("div");
    div.className = "fb-msg typing";
    div.id = "__fb-typing";
    div.textContent = "...";
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById("__fb-typing");
    if (el) el.remove();
  }

  async function sendMessage() {
    var text = inputEl.value.trim();
    if (!text || isSending) return;

    addMessage("user", text);
    inputEl.value = "";
    sendBtn.disabled = true;
    isSending = true;
    showTyping();

    try {
      var res = await fetch(BASE + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.filter(function (m) { return m.role === "user" || m.role === "assistant"; }),
          project: PROJECT,
        }),
      });
      var data = await res.json();
      hideTyping();
      if (data.reply) {
        addMessage("assistant", data.reply);

        // 会話がまとまったら自動保存（5往復以上 or 「記録しました」が含まれる）
        var userMsgCount = messages.filter(function (m) { return m.role === "user"; }).length;
        if (data.reply.includes("記録しました") || userMsgCount >= 5) {
          saveConversation();
        }
      }
    } catch (e) {
      hideTyping();
      addMessage("assistant", "申し訳ありません、エラーが発生しました。もう一度お試しください。");
    }

    isSending = false;
    sendBtn.disabled = !inputEl.value.trim();
  }

  async function saveConversation() {
    try {
      await fetch(BASE + "/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages,
          project: PROJECT,
          metadata: {
            URL: window.location.href,
            UserAgent: navigator.userAgent,
          },
        }),
      });
    } catch (e) {
      console.error("Feedback save failed:", e);
    }
  }

  // イベント
  btn.addEventListener("click", togglePanel);
  closeBtn.addEventListener("click", function () {
    // 閉じる時に未保存なら保存
    if (messages.filter(function (m) { return m.role === "user"; }).length > 0) {
      saveConversation();
    }
    togglePanel();
  });
  inputEl.addEventListener("input", function () {
    sendBtn.disabled = !inputEl.value.trim() || isSending;
  });
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      sendMessage();
    }
  });
  sendBtn.addEventListener("click", sendMessage);
})();
