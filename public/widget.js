(function () {
  "use strict";

  var script = document.currentScript;
  var BASE = script.getAttribute("data-host") || script.src.replace(/\/widget\.js.*$/, "");
  var PROJECT = script.getAttribute("data-project") || "";
  var ACCENT = script.getAttribute("data-accent") || "#D97706";
  var POSITION = script.getAttribute("data-position") || "right";

  if (document.getElementById("__fb-widget-root")) return;

  var style = document.createElement("style");
  style.textContent = [
    "#__fb-widget-root * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }",
    "#__fb-btn { position: fixed; bottom: 24px; " + POSITION + ": 24px; z-index: 99999; width: 56px; height: 56px; border-radius: 50%; background: " + ACCENT + "; border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; }",
    "#__fb-btn:hover { transform: scale(1.05); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }",
    "#__fb-btn svg { width: 24px; height: 24px; fill: white; }",
    "#__fb-panel { position: fixed; bottom: 92px; " + POSITION + ": 24px; z-index: 99999; width: 360px; max-width: calc(100vw - 32px); background: #fff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); display: none; flex-direction: column; overflow: hidden; }",
    "#__fb-panel.open { display: flex; }",
    "#__fb-header { background: #171717; color: white; padding: 16px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }",
    "#__fb-header h3 { font-size: 14px; font-weight: 700; }",
    "#__fb-close { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 20px; line-height: 1; padding: 4px; }",
    "#__fb-close:hover { color: white; }",
    "#__fb-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }",
    "#__fb-body label { font-size: 13px; font-weight: 600; color: #333; }",
    "#__fb-textarea { width: 100%; border: 1px solid #e5e5e5; border-radius: 12px; padding: 12px; font-size: 14px; outline: none; resize: vertical; min-height: 120px; transition: border-color 0.2s; font-family: inherit; }",
    "#__fb-textarea:focus { border-color: " + ACCENT + "; }",
    "#__fb-textarea::placeholder { color: #bbb; }",
    "#__fb-submit { width: 100%; padding: 12px; border: none; border-radius: 12px; background: " + ACCENT + "; color: white; font-size: 14px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }",
    "#__fb-submit:hover { opacity: 0.9; }",
    "#__fb-submit:disabled { opacity: 0.4; cursor: not-allowed; }",
    "#__fb-done { padding: 32px 16px; text-align: center; }",
    "#__fb-done p { font-size: 15px; font-weight: 600; color: #333; }",
    "#__fb-done span { font-size: 13px; color: #999; margin-top: 8px; display: block; }",
  ].join("\n");
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.id = "__fb-widget-root";

  var btn = document.createElement("button");
  btn.id = "__fb-btn";
  btn.title = "フィードバック";
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/></svg>';

  var panel = document.createElement("div");
  panel.id = "__fb-panel";

  function showForm() {
    panel.innerHTML = [
      '<div id="__fb-header"><h3>フィードバック</h3><button id="__fb-close">&times;</button></div>',
      '<div id="__fb-body">',
      '<label>ご意見・改善点をお聞かせください</label>',
      '<textarea id="__fb-textarea" placeholder="気になった点や改善アイデアなど..."></textarea>',
      '<button id="__fb-submit">送信する</button>',
      '</div>',
    ].join("");
    bindEvents();
  }

  function showDone() {
    panel.innerHTML = [
      '<div id="__fb-header"><h3>フィードバック</h3><button id="__fb-close">&times;</button></div>',
      '<div id="__fb-done">',
      '<p>フォーム送信しました</p>',
      '<span>ご協力ありがとうございます</span>',
      '</div>',
    ].join("");
    panel.querySelector("#__fb-close").addEventListener("click", function () {
      panel.classList.remove("open");
    });
  }

  function bindEvents() {
    panel.querySelector("#__fb-close").addEventListener("click", function () {
      panel.classList.remove("open");
    });
    var textarea = panel.querySelector("#__fb-textarea");
    var submitBtn = panel.querySelector("#__fb-submit");

    submitBtn.addEventListener("click", async function () {
      var text = textarea.value.trim();
      if (!text) return;
      submitBtn.disabled = true;
      submitBtn.textContent = "送信中...";

      try {
        await fetch(BASE + "/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: text }],
            project: PROJECT,
            metadata: {
              URL: window.location.href,
            },
          }),
        });
        showDone();
      } catch (e) {
        submitBtn.disabled = false;
        submitBtn.textContent = "送信する";
        alert("送信に失敗しました。もう一度お試しください。");
      }
    });
  }

  showForm();
  root.appendChild(btn);
  root.appendChild(panel);
  document.body.appendChild(root);

  btn.addEventListener("click", function () {
    var isOpen = panel.classList.contains("open");
    if (isOpen) {
      panel.classList.remove("open");
    } else {
      showForm();
      panel.classList.add("open");
    }
  });
})();
