/* Concept support chat for Bright Harbor Studio.
   Preferred embed (also works with this site's Content-Security-Policy):

     <link rel="stylesheet" href="/css/support-widget.css">
     <script src="/js/support-widget.js" defer></script>

   If the stylesheet tag is omitted, the script adds it when the CSS file
   sits at the matching /css/ or sibling path.

   Demo mode is the default: replies are chosen in the browser from `defaults`
   below. Nothing is sent unless `endpoint` is set.

   Do not put an API key in this file. On a public site, point `endpoint` at
   your own proxy and leave `apiKey` empty. See the README.
*/
(function () {
  "use strict";

  var defaults = {
    brand: "Bright Harbor Studio",
    title: "Bright Harbor questions",
    launcher: "Ask a question",
    welcome:
      "This is a concept demo, not a live assistant. Ask about visits, services, or contact for Bright Harbor Studio. Nothing you type is sent or stored.",
    greeting:
      "Hello. This is a scripted demo for Bright Harbor Studio, not a live person. You can ask about visits, services, or contact.",
    disclaimer:
      "Concept demo widget. Scripted replies for a fictional studio, not a live client install.",
    fallback:
      "I only have scripted answers for this demo: visits and hours, services, quotes, and contact. Try one of those. Nothing you type is stored.",
    suggestions: [
      { label: "Hours", text: "What are your hours?" },
      { label: "Services", text: "What services do you offer?" },
      { label: "Contact", text: "How do I contact you?" }
    ],
    faqs: [
      {
        id: "hours",
        keywords: [
          "hour",
          "hours",
          "opening",
          "open",
          "closed",
          "appointment",
          "appointments",
          "book a visit",
          "booking",
          "schedule",
          "what time",
          "saturday",
          "sunday",
          "weekend",
          "weekday",
          "visit",
          "visits"
        ],
        answer:
          "Visits are by appointment. This concept page does not list opening hours, because Bright Harbor Studio is fictional and a real business would set its own. The contact form on this page only previews a message in your browser. It is not sent."
      },
      {
        id: "services",
        keywords: [
          "service",
          "services",
          "styling",
          "home styling",
          "living room",
          "guest suite",
          "color",
          "colour",
          "paint",
          "materials",
          "shopfront",
          "shop front",
          "seasonal",
          "what do you offer",
          "what do you do"
        ],
        answer:
          "The demo offer has four starting points, each for a single space: a home styling session, color and materials, a shopfront refresh, and a seasonal reset. Fees are not listed. A working business would send its own written quote, and nothing is booked until that quote exists."
      },
      {
        id: "contact",
        keywords: [
          "contact",
          "email",
          "e-mail",
          "phone",
          "call you",
          "address",
          "located",
          "location",
          "where are you",
          "coastal",
          "inbox",
          "get in touch",
          "reach you"
        ],
        answer:
          "The placeholder email is hello@bright-harbor.example. That address is reserved for examples and is not a real inbox. There is no phone number and no street address. The place line is a fictional coastal town. The contact form on this page only previews a message. Please don’t enter real personal details."
      },
      {
        id: "quote",
        keywords: [
          "price",
          "prices",
          "pricing",
          "how much",
          "cost",
          "costs",
          "fee",
          "fees",
          "quote",
          "quotes",
          "expensive",
          "charge",
          "charges"
        ],
        answer:
          "This concept page does not publish prices. The described process is a consult, then a written plan and quote, then the styling day if you choose to go ahead. The same person stays with the work from the first visit through the styling day."
      },
      {
        id: "about",
        keywords: [
          "real person",
          "are you real",
          "is this real",
          "live chat",
          "live person",
          "live agent",
          "chatbot",
          "are you a bot",
          "are you human",
          "are you an ai",
          "who are you",
          "fictional",
          "concept demo",
          "not a person"
        ],
        answer:
          "Bright Harbor Studio is a fictional demo brand for this template. This chat is a concept widget with scripted replies. It is not a live client install, and nobody is waiting on the other end."
      }
    ],
    /* Leave empty for the offline demo. A public page should point this at
       a proxy you control. Never commit a bearer token. */
    endpoint: "",
    model: "gpt-4o-mini",
    apiKey: "",
    systemPrompt:
      "You are a concept-demo assistant on a portfolio page for Bright Harbor Studio, a fictional local styling business. " +
      "If asked who you are, say that the business and this chat are a concept demo, not a live client install. " +
      "Visits are by appointment. Do not invent opening hours. " +
      "Services are a home styling session, color and materials, a shopfront refresh, and a seasonal reset. Do not invent prices. " +
      "The only contact email is hello@bright-harbor.example, which is not a real inbox. The location is a fictional coastal town with no street address. " +
      "Do not invent client names, reviews, ratings, or project counts. Keep answers to a few sentences."
  };

  var GREETING = /^(hi|hello|hey|hiya|good morning|good afternoon|good evening|thanks|thank you)( there)?[!.?\s]*$/;

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function includesTerm(haystack, term) {
    if (!term) return false;
    var pattern = new RegExp("(^|[^a-z0-9])" + escapeRegExp(term) + "([^a-z0-9]|$)", "i");
    return pattern.test(haystack);
  }

  function matchReply(text, config) {
    var source = config || defaults;
    var q = normalize(text);
    if (!q) return null;
    if (GREETING.test(q)) {
      return { id: "greeting", answer: source.greeting || source.welcome || "" };
    }

    var best = null;
    var bestScore = 0;
    var faqs = Array.isArray(source.faqs) ? source.faqs : [];
    for (var i = 0; i < faqs.length; i += 1) {
      var faq = faqs[i];
      if (!faq || typeof faq.answer !== "string" || !Array.isArray(faq.keywords)) continue;
      var score = 0;
      for (var k = 0; k < faq.keywords.length; k += 1) {
        var term = String(faq.keywords[k] || "").toLowerCase().trim();
        if (!term || !includesTerm(q, term)) continue;
        score += term.length + (term.indexOf(" ") === -1 ? 0 : 4);
      }
      if (score > bestScore) {
        bestScore = score;
        best = faq;
      }
    }

    if (!best || bestScore < 3) return null;
    return { id: best.id || "faq", answer: best.answer };
  }

  function replyFor(text, config) {
    var source = config || defaults;
    var hit = matchReply(text, source);
    if (hit && hit.answer) return hit;
    return { id: "fallback", answer: source.fallback || "" };
  }

  function isSafeEndpoint(url) {
    if (typeof url !== "string") return false;
    var value = url.trim();
    if (!value || value.length > 2000 || /\s/.test(value)) return false;
    if (value.charAt(0) === "/" && value.charAt(1) !== "/") return true;

    var parsed;
    try {
      parsed = new URL(value);
    } catch (err) {
      return false;
    }
    if (parsed.username || parsed.password) return false;
    if (/[?&](api_?key|access_token|token|secret)=/i.test(parsed.search)) return false;
    if (parsed.protocol === "https:") return true;
    var host = parsed.hostname;
    if (parsed.protocol === "http:" && (host === "localhost" || host === "127.0.0.1")) return true;
    return false;
  }

  function readAssistantText(data) {
    if (!data || typeof data !== "object") return "";
    var choice = Array.isArray(data.choices) ? data.choices[0] : null;
    var fromChoice = choice && choice.message && choice.message.content;
    if (typeof fromChoice === "string" && fromChoice.trim()) return fromChoice.trim();
    if (typeof data.reply === "string" && data.reply.trim()) return data.reply.trim();
    if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
    return "";
  }

  function cssHrefFor(scriptSrc) {
    if (typeof scriptSrc !== "string" || !scriptSrc) return "";
    var url;
    try {
      url = new URL(scriptSrc);
    } catch (err) {
      return "";
    }
    var path = url.pathname;
    if (/\/js\/support-widget\.js$/.test(path)) {
      url.pathname = path.replace(/\/js\/support-widget\.js$/, "/css/support-widget.css");
    } else if (/\/support-widget\.js$/.test(path)) {
      url.pathname = path.replace(/\/support-widget\.js$/, "/support-widget.css");
    } else {
      return "";
    }
    url.search = "";
    url.hash = "";
    return url.href;
  }

  function resolveConfig(overrides) {
    var incoming = overrides;
    if (!incoming && typeof window !== "undefined") incoming = window.HarborSupport;
    incoming = incoming && typeof incoming === "object" ? incoming : {};

    var config = {};
    var keys = Object.keys(defaults);
    for (var i = 0; i < keys.length; i += 1) {
      config[keys[i]] = defaults[keys[i]];
    }

    var incomingKeys = Object.keys(incoming);
    for (var n = 0; n < incomingKeys.length; n += 1) {
      var key = incomingKeys[n];
      if (!Object.prototype.hasOwnProperty.call(incoming, key)) continue;
      var value = incoming[key];
      if (value == null) continue;
      if (key === "endpoint" || key === "apiKey") {
        config[key] = typeof value === "string" ? value.trim() : "";
        continue;
      }
      if (typeof value === "string" && value.trim() === "") continue;
      config[key] = value;
    }

    if (!Array.isArray(config.faqs)) config.faqs = defaults.faqs;
    if (!Array.isArray(config.suggestions)) config.suggestions = defaults.suggestions;
    config.endpoint = typeof config.endpoint === "string" ? config.endpoint.trim() : "";
    config.apiKey = typeof config.apiKey === "string" ? config.apiKey.trim() : "";
    return config;
  }

  var api = {
    defaults: defaults,
    matchReply: matchReply,
    replyFor: replyFor,
    isSafeEndpoint: isSafeEndpoint,
    readAssistantText: readAssistantText,
    cssHrefFor: cssHrefFor,
    resolveConfig: resolveConfig
  };

  if (typeof module !== "undefined" && module.exports && typeof document === "undefined") {
    module.exports = api;
    return;
  }

  var scriptSrc = document.currentScript && document.currentScript.src;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function chatIcon() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "22");
    svg.setAttribute("height", "22");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 19 16.5H9l-4 3v-3H5A1.5 1.5 0 0 1 3.5 15V8A1.5 1.5 0 0 1 5 6.5Z"
    );
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.6");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
    return svg;
  }

  function ensureStylesheet() {
    var links = document.querySelectorAll("link[rel='stylesheet']");
    for (var i = 0; i < links.length; i += 1) {
      if (links[i].href && links[i].href.indexOf("support-widget.css") !== -1) return;
    }
    var href = cssHrefFor(scriptSrc || "");
    if (!href || !document.head) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function mount(config) {
    if (document.getElementById("bhs-support")) return;

    ensureStylesheet();

    var useEndpoint = isSafeEndpoint(config.endpoint);
    var history = [];
    var pending = false;
    var opened = false;
    var chipButtons = [];

    var root = el("div", "bhs-root");
    root.id = "bhs-support";
    root.lang = "en";

    var panel = el("div", "bhs-panel");
    panel.id = "bhs-panel";
    panel.hidden = true;
    panel.tabIndex = -1;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-labelledby", "bhs-title");
    panel.setAttribute("aria-describedby", "bhs-disclaimer");

    var header = el("div", "bhs-header");
    var headingWrap = el("div", "bhs-heading");
    headingWrap.appendChild(el("p", "bhs-kicker", "Concept demo"));
    var title = el("p", "bhs-title", config.title || config.brand || "Questions");
    title.id = "bhs-title";
    headingWrap.appendChild(title);
    var disclaimer = el("p", "bhs-disclaimer", config.disclaimer || defaults.disclaimer);
    disclaimer.id = "bhs-disclaimer";
    headingWrap.appendChild(disclaimer);
    header.appendChild(headingWrap);

    var closeBtn = el("button", "bhs-close", "Close");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close chat");
    header.appendChild(closeBtn);
    panel.appendChild(header);

    var log = el("div", "bhs-log");
    log.id = "bhs-log";
    log.tabIndex = 0;
    log.setAttribute("role", "region");
    log.setAttribute("aria-label", "Conversation");
    panel.appendChild(log);

    var suggestions = el("div", "bhs-suggestions");
    var suggestionItems = Array.isArray(config.suggestions) ? config.suggestions.slice(0, 6) : [];
    if (suggestionItems.length) {
      suggestions.setAttribute("role", "group");
      suggestions.setAttribute("aria-label", "Suggested questions");
      suggestionItems.forEach(function (item) {
        if (!item) return;
        var label = typeof item === "string" ? item : item.label || item.text;
        var text = typeof item === "string" ? item : item.text || item.label;
        if (!label || !text) return;
        var chip = el("button", "bhs-chip", String(label));
        chip.type = "button";
        chip.setAttribute("data-text", String(text));
        chipButtons.push(chip);
        suggestions.appendChild(chip);
      });
      panel.appendChild(suggestions);
    }

    var form = el("form", "bhs-form");
    form.setAttribute("novalidate", "");
    form.autocomplete = "off";
    var label = el("label", "bhs-sr", "Your question");
    label.htmlFor = "bhs-input";
    var input = el("textarea", "bhs-input");
    input.id = "bhs-input";
    input.rows = 2;
    input.maxLength = 500;
    input.placeholder = "Type a question";
    input.setAttribute("aria-describedby", "bhs-footnote");
    input.autocomplete = "off";
    var sendBtn = el("button", "bhs-send", "Send");
    sendBtn.type = "submit";
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(sendBtn);
    panel.appendChild(form);

    var footnote = el(
      "p",
      "bhs-footnote",
      useEndpoint
        ? "Concept demo, not a live client install. Enter sends. Shift+Enter adds a line. Questions are sent to the configured assistant endpoint. Do not type secrets or personal details."
        : "Concept demo, not a live client install. Enter sends. Shift+Enter adds a line. Nothing is sent or stored."
    );
    footnote.id = "bhs-footnote";
    panel.appendChild(footnote);

    var live = el("p", "bhs-sr");
    live.id = "bhs-live";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");

    var launcher = el("button", "bhs-launcher");
    launcher.type = "button";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "bhs-panel");
    launcher.setAttribute(
      "aria-label",
      "Ask a question. Concept demo chat for " + (config.brand || "this studio") + ". Not a live install."
    );
    launcher.appendChild(chatIcon());
    launcher.appendChild(el("span", "bhs-launcher-label", config.launcher || defaults.launcher));
    launcher.appendChild(el("span", "bhs-launcher-demo", "Demo"));

    root.appendChild(panel);
    root.appendChild(launcher);
    root.appendChild(live);
    document.body.appendChild(root);

    function announce(author, text) {
      live.textContent = author + ": " + text;
    }

    function addMessage(author, text, kind) {
      var item = el("article", "bhs-msg " + (kind === "user" ? "bhs-msg-user" : "bhs-msg-bot"));
      item.appendChild(el("p", "bhs-author", author));
      item.appendChild(el("p", "bhs-bubble", text));
      log.appendChild(item);
      log.scrollTop = log.scrollHeight;
      announce(author, text);
    }

    function setPending(value) {
      pending = value;
      sendBtn.disabled = value;
      chipButtons.forEach(function (chip) {
        chip.disabled = value;
      });
      if (value) live.textContent = "Sending to the configured assistant endpoint.";
    }

    function pushHistory(role, content) {
      history.push({ role: role, content: content });
      if (history.length > 8) history = history.slice(history.length - 8);
    }

    function askEndpoint() {
      return new Promise(function (resolve, reject) {
        if (typeof fetch !== "function") {
          reject(new Error("unavailable"));
          return;
        }
        var controller = typeof AbortController === "function" ? new AbortController() : null;
        var timer = setTimeout(function () {
          if (controller) controller.abort();
        }, 12000);
        var headers = {
          "Content-Type": "application/json",
          Accept: "application/json"
        };
        if (config.apiKey) headers.Authorization = "Bearer " + config.apiKey;
        var messages = [];
        if (config.systemPrompt) {
          messages.push({ role: "system", content: String(config.systemPrompt) });
        }
        history.forEach(function (item) {
          messages.push({ role: item.role, content: item.content });
        });
        var payload = { messages: messages };
        if (config.model) payload.model = String(config.model);
        var finished = false;
        function settle(fn, value) {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          fn(value);
        }
        fetch(config.endpoint, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(payload),
          referrerPolicy: "no-referrer",
          credentials: "omit",
          signal: controller ? controller.signal : undefined
        })
          .then(function (response) {
            return response.text().then(function (raw) {
              if (!response.ok || raw.length > 100000) throw new Error("bad response");
              var answer = readAssistantText(JSON.parse(raw));
              if (!answer) throw new Error("empty");
              if (answer.length > 1200) answer = answer.slice(0, 1200).trim() + "…";
              return answer;
            });
          })
          .then(function (answer) {
            settle(resolve, answer);
          })
          .catch(function (err) {
            settle(reject, err);
          });
      });
    }

    function scriptedReply(raw) {
      var scripted = replyFor(raw, config);
      addMessage("Demo script", scripted.answer, "bot");
    }

    function sendUserText(value) {
      if (pending) return;
      var raw = String(value || "").replace(/\r\n/g, "\n").trim();
      if (!raw) return;
      if (raw.length > 500) raw = raw.slice(0, 500);
      input.value = "";
      addMessage("You", raw, "user");

      if (!useEndpoint) {
        scriptedReply(raw);
        return;
      }

      pushHistory("user", raw);
      setPending(true);
      askEndpoint()
        .then(function (answer) {
          setPending(false);
          addMessage("Assistant", answer, "bot");
          pushHistory("assistant", answer);
        })
        .catch(function () {
          setPending(false);
          var scripted = replyFor(raw, config);
          var note = "The assistant endpoint did not respond. " + scripted.answer;
          addMessage("Demo script", note, "bot");
          pushHistory("assistant", note);
        });
    }

    function openPanel() {
      panel.hidden = false;
      launcher.setAttribute("aria-expanded", "true");
      if (!opened) {
        opened = true;
        if (config.welcome) addMessage("Demo script", String(config.welcome), "bot");
      }
      panel.focus();
      /* Hide the launcher so it cannot cover the composer on a short screen. */
      launcher.hidden = true;
    }

    function closePanel() {
      panel.hidden = true;
      launcher.hidden = false;
      launcher.setAttribute("aria-expanded", "false");
      launcher.focus();
    }

    function focusables() {
      var nodes = panel.querySelectorAll("button, textarea, a[href], [tabindex]");
      var list = [];
      for (var i = 0; i < nodes.length; i += 1) {
        var node = nodes[i];
        if (node.disabled || node.getAttribute("tabindex") === "-1") continue;
        list.push(node);
      }
      return list;
    }

    launcher.addEventListener("click", function () {
      if (panel.hidden) openPanel();
      else closePanel();
    });

    closeBtn.addEventListener("click", closePanel);

    chipButtons.forEach(function (chip) {
      chip.addEventListener("click", function () {
        sendUserText(chip.getAttribute("data-text") || chip.textContent);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      sendUserText(input.value);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendUserText(input.value);
      }
    });

    panel.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
        return;
      }
      if (event.key !== "Tab") return;
      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      var active = document.activeElement;
      if (event.shiftKey) {
        if (active === first || active === panel) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    });

    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      var trigger = target.closest("[data-harbor-support]");
      if (!trigger || trigger === launcher || panel.contains(trigger)) return;
      event.preventDefault();
      openPanel();
    });
  }

  function boot() {
    if (!document.body || document.getElementById("bhs-support")) return;
    mount(resolveConfig());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
