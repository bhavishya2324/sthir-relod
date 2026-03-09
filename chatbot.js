/**
 * ═══════════════════════════════════════════════════════════════
 *  SATYASAAR — ARYA CONCIERGE CHATBOT v2
 *  Powered by Groq (Llama 3.1) — Free, 14,400 req/day
 *  Get key: https://console.groq.com → API Keys → Create
 *  Usage: <script src="chatbot.js"></script>  before </body>
 * ═══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────────────────── */
  var GROQ_API   = 'https://api.groq.com/openai/v1/chat/completions';
  var GROQ_MODEL = 'llama-3.1-8b-instant';
  var KEY_STORE  = 'ss_groq_key';
  var HIST_STORE = 'ss_arya_hist';
  var MAX_HIST   = 20;

  /* ── SYSTEM PROMPT — fully trained for Satyasaar ─────────────── */
  var SYSTEM = 'You are Sthir, the exclusive personal concierge of SATYASAAR — a premium luxury Indian devotional art brand. You are warm, gracious, and refined. Never casual or over-chatty. Respond in 2-4 sentences of elegant prose. Never use bullet points or markdown.\n\n=== BRAND ===\nSatyasaar creates handcrafted devotional sculptures and spiritual art for discerning collectors. Every piece is made by master artisans using traditional Indian techniques. Founded by Rachit Jain.\nWebsite: satyasaar.com | Contact: care@satyasaar.com\n\n=== PRODUCTS ===\n1. Hanuman Sthir (Meditating Hanuman Sculpture)\n   - SKU: HAN-STHIR-001\n   - Price: 25,800 INR\n   - Limited edition: only 80 pieces available\n   - Material: Premium resin with antique bronze finish\n   - Approximately 12 inches tall\n   - Depicts Lord Hanuman in deep meditation (sthir = stillness)\n   - Individually numbered with certificate of authenticity\n   - Can be consecrated upon request\nMore products coming soon. For custom orders, email care@satyasaar.com.\n\n=== PRICING AND PAYMENT ===\n- All prices in INR, inclusive of GST\n- Payment: Razorpay (card, UPI, net banking, wallets, EMI up to 12 months), Cash on Delivery\n- COD: 50 INR handling fee, available for orders under 50,000 INR\n- Crypto/MATIC payments also available at checkout\n- EMI available on orders above 3,000 INR via Razorpay\n\n=== COUPONS ===\n- ELITE10: 10% off entire order\n- SAVE500: flat 500 INR off\n\n=== SHIPPING ===\n- Standard Delivery: Free, 5-7 business days\n- Express Delivery: 499 INR, 2-3 business days\n- Shipping partner: Delhivery (reliable, tracked)\n- Ships across India. International (UAE, USA, UK): email care@satyasaar.com\n- Orders dispatched within 24 hours of confirmation\n- Tracking available at the website track page\n\n=== RETURNS AND REFUNDS ===\n- 7-day return policy for undamaged, unused items in original packaging\n- Consecrated sculptures are non-returnable\n- Damaged in transit: photograph and email care@satyasaar.com within 48 hours for full replacement\n- Refund processed in 5-7 business days\n\n=== ORDERS ===\n- Order confirmation sent to email immediately after payment\n- COD orders: Pending status until delivered\n- Online payment orders: Confirmed status immediately\n- To track: visit the track page and enter waybill number (sent via email/SMS)\n- To cancel: email care@satyasaar.com within 2 hours of placing order\n\n=== ABOUT THE ART ===\n- Satyasaar means "the essence of truth" in Sanskrit\n- Hanuman Sthir represents stillness in devotion — Hanuman\'s unshakeable focus on Ram\n- Every sculpture carries the spiritual energy of its artistic tradition\n- Mission: museum-quality devotional art for Indian homes and collectors\n\n=== INSTRUCTIONS ===\n- If asked about products not listed, suggest they email care@satyasaar.com\n- For order status without waybill, direct them to the track page or care@satyasaar.com\n- For unrelated topics, gracefully redirect to how you can help with their order\n- Always end with an offer to help further';

  /* ── FONTS ─────────────────────────────────────────────────── */
  if (!document.getElementById('arya-fonts')) {
    var lnk = document.createElement('link');
    lnk.id = 'arya-fonts';
    lnk.rel = 'stylesheet';
    lnk.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Outfit:wght@300;400;500;600&display=swap';
    document.head.appendChild(lnk);
  }

  /* ── STYLES ─────────────────────────────────────────────────── */
  if (!document.getElementById('arya-css')) {
    var css = document.createElement('style');
    css.id = 'arya-css';
    css.textContent = [
      ':root{--ab:#0e0d0c;--as:#181715;--as2:#201f1d;--abr:rgba(255,255,255,0.06);--ag:#c4a265;--agd:rgba(196,162,101,0.12);--aw:#edeae2;--am:rgba(237,234,226,0.35)}',
      '#arya-fab{position:fixed;bottom:26px;right:26px;z-index:99999;width:56px;height:56px;border-radius:50%;background:var(--ab);border:1.5px solid var(--ag);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 30px rgba(0,0,0,.6);transition:transform .25s,box-shadow .25s}',
      '#arya-fab:hover{transform:scale(1.08);box-shadow:0 12px 40px rgba(0,0,0,.7)}',
      '#arya-fab .ico-chat{display:block}#arya-fab .ico-x{display:none}',
      '#arya-fab.open .ico-chat{display:none}#arya-fab.open .ico-x{display:block}',
      '#arya-notif{position:absolute;top:2px;right:2px;width:11px;height:11px;border-radius:50%;background:var(--ag);border:2px solid var(--ab);animation:npulse 1.8s ease infinite}',
      '@keyframes npulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}',
      '#arya-panel{position:fixed;bottom:94px;right:26px;z-index:99998;width:360px;height:550px;max-height:calc(100dvh - 110px);background:var(--ab);border:1px solid var(--abr);display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.75);transform:translateY(16px) scale(.96);opacity:0;pointer-events:none;transition:transform .3s cubic-bezier(.16,1,.3,1),opacity .25s}',
      '#arya-panel.show{transform:none;opacity:1;pointer-events:all}',
      '@media(max-width:420px){#arya-panel{right:0;bottom:0;width:100vw;height:100dvh;max-height:100dvh}#arya-fab{bottom:18px;right:18px}}',
      '#arya-head{padding:16px 18px;border-bottom:1px solid var(--abr);background:linear-gradient(135deg,#1a1816,var(--ab));flex-shrink:0;display:flex;align-items:center;gap:12px;position:relative;overflow:hidden}',
      '#arya-head::after{content:"\\OM";position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:48px;color:rgba(196,162,101,.05);font-family:"Cormorant Garamond",serif;pointer-events:none}',
      '.a-av{width:36px;height:36px;border-radius:50%;flex-shrink:0;background:var(--agd);border:1px solid rgba(196,162,101,.3);display:flex;align-items:center;justify-content:center;position:relative}',
      '.a-av::after{content:"";position:absolute;bottom:0;right:0;width:9px;height:9px;border-radius:50%;background:#4caf84;border:1.5px solid var(--ab)}',
      '.a-info{flex:1;min-width:0}',
      '.a-name{font-family:"Cormorant Garamond",serif;font-size:17px;font-weight:300;letter-spacing:.1em;color:var(--aw);line-height:1.2}',
      '.a-sub{font-family:"Outfit",sans-serif;font-size:8.5px;font-weight:400;letter-spacing:.22em;text-transform:uppercase;color:var(--ag)}',
      '.a-hbtns{display:flex;gap:6px;flex-shrink:0}',
      '.a-hbtn{width:26px;height:26px;border:1px solid var(--abr);background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:2px;transition:border-color .2s,background .2s}',
      '.a-hbtn:hover{border-color:rgba(196,162,101,.35);background:var(--agd)}',
      '#arya-setup{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 22px;gap:0}',
      '.a-setup-ic{width:54px;height:54px;border-radius:50%;background:var(--agd);border:1px solid rgba(196,162,101,.25);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px}',
      '.a-setup-t{font-family:"Cormorant Garamond",serif;font-size:19px;font-weight:300;letter-spacing:.08em;color:var(--aw);margin-bottom:8px;text-align:center}',
      '.a-setup-s{font-family:"Outfit",sans-serif;font-size:11px;font-weight:300;color:var(--am);line-height:1.8;text-align:center;margin-bottom:22px}',
      '.a-setup-s a{color:var(--ag);text-decoration:none}.a-setup-s a:hover{text-decoration:underline}',
      '.a-krow{display:flex;width:100%;margin-bottom:8px}',
      '.a-kinp{flex:1;height:42px;background:var(--as2);border:1px solid var(--abr);border-right:none;color:var(--aw);font-family:"Outfit",sans-serif;font-size:11px;padding:0 12px;outline:none;transition:border-color .2s;letter-spacing:.02em}',
      '.a-kinp:focus{border-color:rgba(196,162,101,.45)}.a-kinp::placeholder{color:var(--am)}',
      '.a-kbtn{height:42px;padding:0 18px;background:var(--ag);color:#111;border:none;cursor:pointer;font-family:"Outfit",sans-serif;font-size:9px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;flex-shrink:0;transition:opacity .2s}',
      '.a-kbtn:hover{opacity:.85}',
      '.a-kerr{font-family:"Outfit",sans-serif;font-size:10px;color:#e05555;display:none;text-align:center;margin-top:4px}',
      '#arya-msgs{flex:1;overflow-y:auto;padding:14px 14px 6px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}',
      '#arya-msgs::-webkit-scrollbar{width:2px}#arya-msgs::-webkit-scrollbar-thumb{background:rgba(196,162,101,.2)}',
      '.a-welcome{text-align:center;padding:10px 6px 4px}',
      '.a-wdiv{display:flex;align-items:center;gap:10px;margin-bottom:14px}',
      '.a-wdiv::before,.a-wdiv::after{content:"";flex:1;height:1px;background:var(--abr)}',
      '.a-wdiv span{font-family:"Outfit",sans-serif;font-size:8px;letter-spacing:.24em;text-transform:uppercase;color:var(--am)}',
      '.a-wmsg{font-family:"Outfit",sans-serif;font-size:11.5px;font-weight:300;color:var(--am);line-height:1.8}',
      '.a-msg{display:flex;gap:8px;animation:amsg .28s ease}',
      '@keyframes amsg{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}',
      '.a-msg.user{flex-direction:row-reverse}',
      '.a-mav{width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:3px}',
      '.a-mav.bot{background:var(--agd);border:1px solid rgba(196,162,101,.2)}',
      '.a-mav.user{background:rgba(255,255,255,.05);border:1px solid var(--abr)}',
      '.a-bub{max-width:82%;font-family:"Outfit",sans-serif;font-size:12.5px;font-weight:300;line-height:1.75;padding:10px 14px;word-break:break-word;border-radius:2px}',
      '.a-msg.bot .a-bub{background:var(--as);border:1px solid var(--abr);color:var(--aw);border-top-left-radius:0}',
      '.a-msg.user .a-bub{background:rgba(196,162,101,.14);border:1px solid rgba(196,162,101,.18);color:var(--aw);border-top-right-radius:0}',
      '.a-time{font-family:"Outfit",sans-serif;font-size:8px;color:var(--am);margin-top:3px;letter-spacing:.06em}',
      '.a-msg.bot .a-time{text-align:left;padding-left:2px}.a-msg.user .a-time{text-align:right;padding-right:2px}',
      '#arya-typing{display:none;gap:8px;align-items:flex-end}',
      '#arya-typing.show{display:flex;animation:amsg .28s ease}',
      '.a-tbub{background:var(--as);border:1px solid var(--abr);padding:12px 15px;border-radius:2px;border-top-left-radius:0;display:flex;gap:4px;align-items:center}',
      '.a-dot{width:5px;height:5px;border-radius:50%;background:var(--ag);animation:adot 1.2s ease infinite}',
      '.a-dot:nth-child(2){animation-delay:.2s}.a-dot:nth-child(3){animation-delay:.4s}',
      '@keyframes adot{0%,60%,100%{opacity:.2;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}',
      '#arya-chips{padding:4px 12px 8px;display:flex;gap:6px;flex-wrap:wrap;flex-shrink:0}',
      '.a-chip{font-family:"Outfit",sans-serif;font-size:9px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border:1px solid rgba(196,162,101,.25);background:var(--agd);color:var(--ag);cursor:pointer;border-radius:20px;transition:background .2s,border-color .2s;white-space:nowrap}',
      '.a-chip:hover{background:rgba(196,162,101,.22);border-color:rgba(196,162,101,.45)}',
      '#arya-bar{border-top:1px solid var(--abr);padding:10px 12px 13px;flex-shrink:0;background:var(--as)}',
      '.a-irow{display:flex;align-items:flex-end}',
      '#arya-inp{flex:1;background:var(--as2);border:1px solid var(--abr);border-right:none;color:var(--aw);font-family:"Outfit",sans-serif;font-size:12px;font-weight:300;padding:10px 13px;outline:none;resize:none;height:42px;max-height:96px;line-height:1.55;transition:border-color .2s;overflow:hidden}',
      '#arya-inp:focus{border-color:rgba(196,162,101,.38)}#arya-inp::placeholder{color:var(--am)}',
      '#arya-send{width:42px;height:42px;background:var(--ag);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .2s}',
      '#arya-send:hover:not(:disabled){opacity:.82}',
      '#arya-send:disabled{background:var(--as2);cursor:not-allowed;opacity:.5}',
      '.a-note{font-family:"Outfit",sans-serif;font-size:8px;color:rgba(237,234,226,.15);text-align:center;margin-top:7px;letter-spacing:.07em}'
    ].join('');
    document.head.appendChild(css);
  }

  /* ── BOT ICON SVG ─────────────────────────────────────────── */
  var BOT_ICO = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z" fill="#c4a265"/></svg>';
  var USR_ICO = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="rgba(237,234,226,.35)"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="rgba(237,234,226,.35)" stroke-width="1.5" stroke-linecap="round"/></svg>';

  /* ── HTML ─────────────────────────────────────────────────── */
  var wrap = document.createElement('div');
  wrap.id = 'arya-root';
  wrap.innerHTML =
    /* FAB */
    '<div id="arya-fab" onclick="aryaToggle()">' +
      '<div id="arya-notif"></div>' +
      '<svg class="ico-chat" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#c4a265" stroke-width="1.5" stroke-linejoin="round"/><circle cx="9" cy="10" r="1.1" fill="#c4a265"/><circle cx="12" cy="10" r="1.1" fill="#c4a265"/><circle cx="15" cy="10" r="1.1" fill="#c4a265"/></svg>' +
      '<svg class="ico-x" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#c4a265" stroke-width="1.8" stroke-linecap="round"/></svg>' +
    '</div>' +

    /* PANEL */
    '<div id="arya-panel">' +

      /* Header */
      '<div id="arya-head">' +
        '<div class="a-av"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z" fill="#c4a265"/></svg></div>' +
        '<div class="a-info"><div class="a-name">STHIR</div><div class="a-sub">Satyasaar Concierge &middot; Online</div></div>' +
        '<div class="a-hbtns">' +
          '<button class="a-hbtn" title="Clear chat" onclick="aryaClear()"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(237,234,226,.35)" stroke-width="1.8"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg></button>' +
          '<button class="a-hbtn" title="API key" onclick="aryaSettings()"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(237,234,226,.35)" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></button>' +
        '</div>' +
      '</div>' +

      /* Setup */
      '<div id="arya-setup">' +
        '<div class="a-setup-ic">&#128273;</div>' +
        '<div class="a-setup-t">Activate Arya</div>' +
        '<div class="a-setup-s">Arya runs on Groq\'s free Llama 3.1.<br>No credit card needed. Get your key at<br><a href="https://console.groq.com" target="_blank">console.groq.com</a> &rarr; API Keys &rarr; Create</div>' +
        '<div class="a-krow"><input class="a-kinp" id="arya-kinp" type="password" placeholder="gsk_xxxxxxxxxxxxxxxx" autocomplete="off"/><button class="a-kbtn" onclick="aryaSaveKey()">Activate</button></div>' +
        '<div class="a-kerr" id="arya-kerr">Key must start with gsk_</div>' +
      '</div>' +

      /* Chat — typing indicator is INSIDE #arya-msgs so insertBefore works */
      '<div id="arya-chat" style="display:none;flex-direction:column;flex:1;overflow:hidden;min-height:0">' +
        '<div id="arya-msgs">' +
          '<div class="a-welcome"><div class="a-wdiv"><span>Satyasaar</span></div><div class="a-wmsg">Namaste. I am Arya, your personal concierge.<br>How may I assist you today?</div></div>' +
          '<div id="arya-typing"><div class="a-mav bot">' + BOT_ICO + '</div><div class="a-tbub"><div class="a-dot"></div><div class="a-dot"></div><div class="a-dot"></div></div></div>' +
        '</div>' +
        '<div id="arya-chips">' +
          '<div class="a-chip" onclick="aryaChip(\'Hanuman Sthir details\')">Hanuman Sthir</div>' +
          '<div class="a-chip" onclick="aryaChip(\'Shipping options and delivery time\')">Shipping</div>' +
          '<div class="a-chip" onclick="aryaChip(\'Return policy\')">Returns</div>' +
          '<div class="a-chip" onclick="aryaChip(\'How do I track my order\')">Track Order</div>' +
          '<div class="a-chip" onclick="aryaChip(\'Available discount coupons\')">Coupons</div>' +
        '</div>' +
        '<div id="arya-bar">' +
          '<div class="a-irow">' +
            '<textarea id="arya-inp" rows="1" placeholder="Ask about products, shipping, orders\u2026" oninput="aryaResize(this)" onkeydown="aryaKey(event)"></textarea>' +
            '<button id="arya-send" onclick="aryaSend()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#111110" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '</div>' +
          '<div class="a-note">Powered by Satyasaar</div>' +
        '</div>' +
      '</div>' +

    '</div>';

  document.body.appendChild(wrap);

  /* ── STATE ───────────────────────────────────────────────── */
  var isOpen    = false;
  var loading   = false;
  var history   = [];
  var GROQ_KEY  = localStorage.getItem(KEY_STORE) || '';
  var notifDot  = document.getElementById('arya-notif');

  /* Restore saved history */
  try {
    var saved = JSON.parse(localStorage.getItem(HIST_STORE) || '[]');
    if (saved.length) {
      history = saved;
      saved.forEach(function(m) {
        if (m.role === 'user' || m.role === 'assistant')
          insertMsg(m.role === 'assistant' ? 'bot' : 'user', m.content);
      });
      var chips = document.getElementById('arya-chips');
      if (chips) chips.style.display = 'none';
    }
  } catch(e) {}

  if (GROQ_KEY) showChat();

  /* ── TOGGLE ─────────────────────────────────────────────── */
  window.aryaToggle = function() {
    isOpen = !isOpen;
    document.getElementById('arya-fab').classList.toggle('open', isOpen);
    document.getElementById('arya-panel').classList.toggle('show', isOpen);
    if (isOpen) {
      if (notifDot) { notifDot.remove(); notifDot = null; }
      if (GROQ_KEY) setTimeout(function(){ var el = document.getElementById('arya-inp'); if (el) el.focus(); }, 320);
    }
  };

  /* ── KEY SETUP ──────────────────────────────────────────── */
  window.aryaSaveKey = function() {
    var val = (document.getElementById('arya-kinp').value || '').trim();
    var err = document.getElementById('arya-kerr');
    if (!val || !val.startsWith('gsk_')) { err.style.display = 'block'; return; }
    err.style.display = 'none';
    localStorage.setItem(KEY_STORE, val);
    GROQ_KEY = val;
    showChat();
  };

  window.aryaSettings = function() {
    document.getElementById('arya-setup').style.display = 'flex';
    document.getElementById('arya-chat').style.display = 'none';
    var kinp = document.getElementById('arya-kinp');
    if (kinp) { kinp.value = GROQ_KEY || ''; setTimeout(function(){ kinp.focus(); }, 100); }
  };

  function showChat() {
    document.getElementById('arya-setup').style.display = 'none';
    document.getElementById('arya-chat').style.display = 'flex';
    scrollDown();
  }

  /* ── SEND ───────────────────────────────────────────────── */
  window.aryaSend = async function() {
    if (loading || !GROQ_KEY) return;
    var inp = document.getElementById('arya-inp');
    var txt = (inp.value || '').trim();
    if (!txt) return;

    inp.value = '';
    inp.style.height = '42px';
    document.getElementById('arya-send').disabled = true;

    var chips = document.getElementById('arya-chips');
    if (chips) chips.style.display = 'none';

    /* User message */
    insertMsg('user', txt);
    history.push({ role: 'user', content: txt });
    trimHist();

    /* Typing dots */
    loading = true;
    document.getElementById('arya-typing').classList.add('show');
    scrollDown();

    try {
      var res = await fetch(GROQ_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_KEY },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: 'system', content: SYSTEM }].concat(history),
          temperature: 0.72,
          max_tokens: 350
        })
      });
      var data = await res.json();
      document.getElementById('arya-typing').classList.remove('show');

      if (!res.ok) {
        var em = 'Something went wrong. Please try again.';
        if (res.status === 401) em = 'Invalid API key. Click the \u2699 icon to update it.';
        if (res.status === 429) em = 'Rate limit reached \u2014 please wait a moment and try again.';
        insertMsg('bot', em);
      } else {
        var reply = ((data.choices || [])[0] || {}).message;
        reply = reply ? (reply.content || '').trim() : 'I did not receive a response. Please try again.';
        insertMsg('bot', reply);
        history.push({ role: 'assistant', content: reply });
        trimHist();
        try { localStorage.setItem(HIST_STORE, JSON.stringify(history)); } catch(e) {}
      }
    } catch(e) {
      document.getElementById('arya-typing').classList.remove('show');
      insertMsg('bot', 'Connection error \u2014 please check your internet and try again.');
    }

    loading = false;
    document.getElementById('arya-send').disabled = false;
    var inp2 = document.getElementById('arya-inp');
    if (inp2) inp2.focus();
  };

  /* ── CHIP ───────────────────────────────────────────────── */
  window.aryaChip = function(text) {
    var inp = document.getElementById('arya-inp');
    if (inp) { inp.value = text; aryaSend(); }
  };

  /* ── CLEAR ──────────────────────────────────────────────── */
  window.aryaClear = function() {
    history = [];
    localStorage.removeItem(HIST_STORE);
    var msgs = document.getElementById('arya-msgs');
    msgs.innerHTML =
      '<div class="a-welcome"><div class="a-wdiv"><span>Satyasaar</span></div><div class="a-wmsg">Namaste. I am Arya, your personal concierge.<br>How may I assist you today?</div></div>' +
      '<div id="arya-typing"><div class="a-mav bot">' + BOT_ICO + '</div><div class="a-tbub"><div class="a-dot"></div><div class="a-dot"></div><div class="a-dot"></div></div></div>';
    var chips = document.getElementById('arya-chips');
    if (chips) chips.style.display = 'flex';
  };

  /* ── CORE: insertMsg ─────────────────────────────────────── */
  /* typing indicator is the LAST child of #arya-msgs         */
  /* we always insert before it so it stays at the bottom     */
  function insertMsg(role, text) {
    var msgs   = document.getElementById('arya-msgs');
    var typing = document.getElementById('arya-typing');
    var time   = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    var div = document.createElement('div');
    div.className = 'a-msg ' + role;
    div.innerHTML =
      '<div class="a-mav ' + role + '">' + (role === 'bot' ? BOT_ICO : USR_ICO) + '</div>' +
      '<div>' +
        '<div class="a-bub">' + esc(text) + '</div>' +
        '<div class="a-time">' + time + '</div>' +
      '</div>';

    /* insertBefore typing — both are children of #arya-msgs, so this works */
    msgs.insertBefore(div, typing);
    scrollDown();
  }

  /* ── UTILS ──────────────────────────────────────────────── */
  function scrollDown() {
    var el = document.getElementById('arya-msgs');
    if (el) setTimeout(function() { el.scrollTop = el.scrollHeight; }, 50);
  }

  function trimHist() {
    if (history.length > MAX_HIST) history = history.slice(history.length - MAX_HIST);
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  window.aryaResize = function(el) {
    el.style.height = '42px';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  };

  window.aryaKey = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); aryaSend(); }
  };

})();