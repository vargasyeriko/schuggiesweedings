/* ============================================================
   Schuggies-Ceilidhs — "Ask Schuggie" chatbot
   Works OUT OF THE BOX: answers common FAQ questions from a
   built-in knowledge base (no server, no install needed).
   Optionally upgrades to a local Ollama model for free-form
   questions if one is running.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = {
    title: "Ask Schuggie",
    greeting: "Hi, I'm Schuggie 👋 Fancy a ceilidh but not sure where to start? Ask me anything, or tap a question below.",
    // Optional: local Ollama for anything the FAQ brain can't answer.
    // Off for public/hosted demos (visitors won't have Ollama, and an HTTPS
    // page can't call local http Ollama). Flip to true for on-device use.
    useOllama: false,
    endpoint: "http://localhost:11434/api/chat",
    model: "llama3.2",
    system:
      "You are the friendly booking assistant for Schuggies-Ceilidhs, authentic Scottish ceilidh entertainment (weddings, parties, corporate), Nottingham-based, UK-wide. " +
      "Warm, concise (2-4 sentences), a touch of Scottish charm. Ceilidh DJ from £877, live band from £1,597, Whole of the Moon from £4,927; prices locked to 2028; every dance is called; UK-wide incl. Channel Islands; hosting since 2008, 550+ events, 220+ weddings. Phone 01332 498839, email info@schuggies-ceilidhs.co.uk. Never invent prices or availability; if unsure, suggest booking a chat."
  };

  var CONTACT = "You can call 01332 498839, email info@schuggies-ceilidhs.co.uk, or book a free chat on the Contact page.";

  // ---- Built-in FAQ brain (keyword-matched) ----
  var KB = [
    { keys: ["price","cost","how much","expensive","fee","quote","budget","£","pound"],
      a: "Here's the guide pricing (locked until 2028):\n• Ceilidh DJ set — from £877 (most popular)\n• Live ceilidh band — from £1,597\n• The Whole of the Moon — from £4,927\nGuide prices are for the East Midlands (NG, LE and DE postcodes); a little extra for travel beyond. Want a proper quote? " + CONTACT },
    { keys: ["package","included","what do i get","what's included","offer","options"],
      a: "Three flexible packages, every dance called:\n1) Ceilidh-DJ set (from £877) — recorded music, PA & mic for speeches, optional end-of-night disco.\n2) Ceilidh & Disco live band (from £1,597) — my signature experience with a live band.\n3) The Whole of the Moon (from £4,927) — all the unique extras." },
    { keys: ["first dance"],
      a: "Yes! You can have a ceilidh first dance just the two of you, or get all your guests up to join in — they'll be raving about it afterwards. Happy to talk it through on a chat." },
    { keys: ["beginner","experience","know the dance","teach","learn","never been","hard","difficult","how to dance"],
      a: "No experience needed at all. Every dance is 'called', meaning I guide everyone through the moves as we go. Beginners and seasoned dancers all join in together — and making mistakes is half the fun!\nReady to plan yours? Check availability or book a chat." },
    { keys: ["space","venue","room","hall","fit","big","small","how much room"],
      a: "Any size works — a cosy village hall, a marquee, a garden, an odd-shaped hotel room or a grand castle hall. Don't let venue size put you off; I've enough experience to make them all work." },
    { keys: ["travel","cover","area","distance","come to","where are you","uk","far","location"],
      a: "I cover the whole UK, including the Channel Islands. Travel within the East Midlands (NG, LE and DE postcodes) is included; beyond that it's £0.55/mile plus £20/hour travel time — and I often work with local musicians to keep costs down.\nWant to lock it in? Check availability or book a chat." },
    { keys: ["outdoor","outside","open air","open-air","garden","marquee","field","forest"],
      a: "Yes — all my packages work outdoors (open-air). I've done loads over the years; we just always keep a wet-weather plan in the back pocket." },
    { keys: ["sound limit","decibel","db","noise","volume","loud"],
      a: "No problem — I work with sound limiters all the time. My ceilidhs peak around 85 dB, well within most limits, and the bands can even play fully acoustic for outdoor do's." },
    { keys: ["equipment","pa","gear","insurance","pat","liability","insured"],
      a: "I bring all my own PA and disco lighting (just need two power sockets nearby). All kit is PAT tested, and I carry public liability insurance up to £10m plus £1m indemnity — copies can go straight to your venue." },
    { keys: ["book","booking","deposit","reserve","secure","hold my date","how do i book"],
      a: "We start with a quick friendly chat to make sure I'm the right fit, then I send a booking form, T&Cs and invoice. It's confirmed once the form's back and the deposit (usually £100) is paid; the balance is due three months before. " + CONTACT },
    { keys: ["how long","duration","hours","last","length of time"],
      a: "Usually two sessions of about an hour and a half with a break between, and you can add a wind-down disco at the end. It's flexible and fits almost any running order." },
    { keys: ["scottish","scotland","have to be","kilt","irish"],
      a: "Not at all! You don't need to be Scottish, have Celtic roots or wear a kilt — it's just brilliant, inclusive fun. (I do wear the kilt, mind.)" },
    { keys: ["available","availability","date","free","calendar","my day"],
      a: "I can check your date quickly — pop over to the Contact page or the 'Book a Chat' link and I'll confirm availability. Prices are held to 2028, so there's no rush-cost." },
    { keys: ["contact","phone","email","call you","reach","number","get in touch"],
      a: CONTACT },
    { keys: ["what do you do","caller","calling","host","mc","actually do"],
      a: "I host your ceilidh — 'calling' the dances (guiding everyone through the moves) and MC'ing the evening so you can relax and enjoy your own party. Fun, social and inclusive for all ages and abilities." },
    { keys: ["payment","pay","bank transfer","card","cash","instal"],
      a: "Flexible options: deposit on booking (usually £100), balance three months before. Pay by bank transfer, card (SumUp), a monthly plan, or cash." },
    { keys: ["pronounce","pronunciation","say it","kaylee","kay lee","how do you say"],
      a: "It's pronounced \"Kay-lea\". It just means a social gathering with music and dancing — and every dance is called, so you can't get it wrong." },
    { keys: ["small","intimate","few guests","tiny","numbers","how many people"],
      a: "Absolutely — I host lots of smaller, intimate events. You usually only need enough guests for a longways set, and I can step in to dance and add couple dances as needed." },
    { keys: ["inclusive","gender","pronoun","accessible","wheelchair","lgbt","everyone"],
      a: "Inclusivity is built in. I call gender-free — think lions and penguins rather than ladies and gentlemen — so everyone is comfortable dancing with whoever they like, and it adds to the fun." },
    { keys: ["corporate","business","work event","team","staff"],
      a: "Ceilidhs work a treat for work events — team socials, conference evenings and client entertaining. Everyone ends up talking to someone new, and nobody needs to know the steps. Same fee structure as any other event." }
  ];

  var CHIPS = [
    "What do your packages cost?",
    "Are you free on my date?",
    "Can we have a ceilidh first dance?",
    "Do you travel to my area?",
    "Are ceilidhs good for beginners?"
  ];

  function norm(s){ return (" "+s.toLowerCase().replace(/[^a-z0-9£ ]/g," ")+" ").replace(/\s+/g," "); }

  function faqMatch(q){
    var t = norm(q), best = null, bestScore = 0;
    KB.forEach(function(item){
      var score = 0;
      item.keys.forEach(function(k){
        var kk = k.toLowerCase();
        if (t.indexOf(kk) !== -1) score += (kk.indexOf(" ") !== -1 ? 3 : 1);
      });
      if (score > bestScore){ bestScore = score; best = item; }
    });
    return bestScore >= 1 ? best.a : null;
  }

  var history = [{ role: "system", content: CONFIG.system }];
  var busy = false, ollamaOK = null;

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';

  function el(html){ var d=document.createElement("div"); d.innerHTML=html.trim(); return d.firstChild; }

  function build(){
    var root = el(
      '<div class="cbot">' +
        '<button class="cbot__fab" aria-label="Open chat">' + ICON + '</button>' +
        '<section class="cbot__panel" role="dialog" aria-label="' + CONFIG.title + '" hidden>' +
          '<header class="cbot__head"><span class="cbot__mark">SC</span>' +
            '<div><strong>' + CONFIG.title + '</strong><small>Ceilidh helper</small></div>' +
            '<button class="cbot__close" aria-label="Close chat">✕</button></header>' +
          '<div class="cbot__log" aria-live="polite"></div>' +
          '<form class="cbot__form"><input class="cbot__input" type="text" autocomplete="off" placeholder="Type your question…" aria-label="Message"><button class="cbot__send" aria-label="Send">➤</button></form>' +
        '</section>' +
      '</div>'
    );
    document.body.appendChild(root);

    var fab = root.querySelector(".cbot__fab");
    var panel = root.querySelector(".cbot__panel");
    var log = root.querySelector(".cbot__log");
    var form = root.querySelector(".cbot__form");
    var input = root.querySelector(".cbot__input");
    var opened = false;

    function isOpen(){ return !panel.hidden && panel.classList.contains("is-open"); }
    function open(){
      panel.hidden = false; document.body.classList.add("cbot-open");
      requestAnimationFrame(function(){ panel.classList.add("is-open"); });
      if (!opened){ opened = true; add("bot", CONFIG.greeting); renderChips(); }
      setTimeout(function(){ input.focus(); }, 200);
    }
    function close(){ panel.classList.remove("is-open"); document.body.classList.remove("cbot-open");
      setTimeout(function(){ panel.hidden = true; }, 250); }
    fab.addEventListener("click", function(){ isOpen() ? close() : open(); });
    root.querySelector(".cbot__close").addEventListener("click", close);

    function add(who, text){
      var m = el('<div class="cbot__msg cbot__msg--' + who + '"></div>');
      m.textContent = text; log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
    }
    function renderChips(){
      var wrap = el('<div class="cbot__chips"></div>');
      CHIPS.forEach(function(c){
        var b = el('<button class="cbot__chip"></button>'); b.textContent = c;
        b.addEventListener("click", function(){ wrap.remove(); ask(c); });
        wrap.appendChild(b);
      });
      log.appendChild(wrap); log.scrollTop = log.scrollHeight;
    }

    function ask(q){
      if (!q || busy) return;
      add("user", q);
      history.push({ role:"user", content:q });

      // 1) Built-in FAQ brain — instant, always works
      var hit = faqMatch(q);
      if (hit){ reply(hit); return; }

      // 2) Fall back to a local Ollama model if available
      if (CONFIG.useOllama && ollamaOK !== false){
        busy = true;
        var typing = add("bot", "…"); typing.classList.add("cbot__msg--typing");
        fetch(CONFIG.endpoint, { method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ model: CONFIG.model, messages: history, stream:false }) })
        .then(function(r){ if(!r.ok) throw 0; return r.json(); })
        .then(function(d){ ollamaOK = true; var t=(d&&d.message&&d.message.content||"").trim();
          typing.remove(); reply(t || fallback()); })
        .catch(function(){ ollamaOK = false; typing.remove(); reply(fallback()); })
        .finally(function(){ busy = false; input.focus(); });
        return;
      }
      // 3) No AI available
      reply(fallback());
    }

    function reply(text){
      var m = add("bot", text);
      history.push({ role:"assistant", content:text });
      log.scrollTop = log.scrollHeight; return m;
    }
    function fallback(){
      return "Good question — I'm not certain on that one. " + CONTACT + "\nOr ask me about prices, packages, experience, travel, space, outdoor events or booking.";
    }

    form.addEventListener("submit", function(e){ e.preventDefault(); var q = input.value.trim(); input.value=""; ask(q); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
