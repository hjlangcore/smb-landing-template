const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const widget = require("../public/js/support-widget.js");

test("hours, services, and contact resolve offline", () => {
  const hours = widget.replyFor("What are your hours?", widget.defaults);
  assert.equal(hours.id, "hours");
  assert.match(hours.answer, /by appointment/i);
  assert.doesNotMatch(hours.answer, /\b\d{1,2}\s*(am|pm)\b/i);
  assert.doesNotMatch(hours.answer, /monday|9\s*to\s*5/i);

  const services = widget.replyFor("What services do you offer?", widget.defaults);
  assert.equal(services.id, "services");
  assert.match(services.answer, /home styling session/i);
  assert.match(services.answer, /color and materials/i);
  assert.match(services.answer, /shopfront refresh/i);
  assert.match(services.answer, /seasonal reset/i);
  assert.match(services.answer, /fees are not listed/i);

  const contact = widget.replyFor("How do I contact you?", widget.defaults);
  assert.equal(contact.id, "contact");
  assert.match(contact.answer, /hello@bright-harbor\.example/);
  assert.match(contact.answer, /not a real inbox/i);
  assert.match(contact.answer, /no phone number/i);
});

test("quotes, identity, greetings, and unknown questions stay honest", () => {
  const quote = widget.replyFor("How much does a room cost?", widget.defaults);
  assert.equal(quote.id, "quote");
  assert.match(quote.answer, /does not publish prices/i);
  assert.doesNotMatch(quote.answer, /\$\d/);

  const about = widget.replyFor("Are you a real person?", widget.defaults);
  assert.equal(about.id, "about");
  assert.match(about.answer, /not a live client install/i);

  assert.equal(widget.replyFor("Hello!", widget.defaults).id, "greeting");
  assert.equal(widget.replyFor("What's the weather in Paris?", widget.defaults).id, "fallback");
  assert.equal(widget.replyFor("I feel unsure about the room", widget.defaults).id, "fallback");
});

test("matching is case-insensitive and prefers the stronger topic", () => {
  assert.equal(widget.matchReply("WHAT ARE YOUR HOURS?", widget.defaults).id, "hours");
  assert.equal(widget.replyFor("Do you do a shopfront refresh?", widget.defaults).id, "services");
  assert.equal(widget.replyFor("How much is a shopfront refresh?", widget.defaults).id, "quote");
});

test("defaults do not call out to an endpoint or carry a key", () => {
  assert.equal(widget.defaults.endpoint, "");
  assert.equal(widget.defaults.apiKey, "");
  assert.equal(widget.isSafeEndpoint(""), false);
  assert.equal(widget.isSafeEndpoint("javascript:alert(1)"), false);
  assert.equal(widget.isSafeEndpoint("http://example.com/chat"), false);
  assert.equal(widget.isSafeEndpoint("https://user:pass@example.com/chat"), false);
  assert.equal(widget.isSafeEndpoint("https://example.com/chat?api_key=secret"), false);
  assert.equal(widget.isSafeEndpoint("https://example.com/v1/chat/completions"), true);
  assert.equal(widget.isSafeEndpoint("http://127.0.0.1:8787/chat"), true);
  assert.equal(widget.isSafeEndpoint("/api/chat"), true);

  const source = fs.readFileSync(path.join(__dirname, "../public/js/support-widget.js"), "utf8");
  assert.match(source, /endpoint:\s*""/);
  assert.match(source, /apiKey:\s*""/);
  assert.doesNotMatch(source, /sk-[A-Za-z0-9]{8,}/);
  assert.doesNotMatch(source, /OPENAI_API_KEY\s*[:=]\s*["'][^"']+["']/);
});

test("OpenAI-compatible and proxy payloads both yield reply text", () => {
  assert.equal(
    widget.readAssistantText({
      choices: [{ message: { role: "assistant", content: "  By appointment.  " } }]
    }),
    "By appointment."
  );
  assert.equal(widget.readAssistantText({ reply: "Scripted." }), "Scripted.");
  assert.equal(widget.readAssistantText({ message: { content: "nope" } }), "");
  assert.equal(widget.readAssistantText(null), "");
});

test("stylesheet href follows the script path", () => {
  assert.equal(
    widget.cssHrefFor("https://example.com/js/support-widget.js"),
    "https://example.com/css/support-widget.css"
  );
  assert.equal(
    widget.cssHrefFor("https://cdn.example/widget/support-widget.js?v=2"),
    "https://cdn.example/widget/support-widget.css"
  );
  assert.equal(widget.cssHrefFor("https://example.com/app.js"), "");
});

test("page config can replace FAQs without writing a key into the defaults", () => {
  const config = widget.resolveConfig({
    brand: "North Room",
    endpoint: "  https://example.com/v1/chat/completions  ",
    apiKey: "local-only",
    faqs: [{ id: "ping", keywords: ["ping"], answer: "Pong." }]
  });
  assert.equal(config.brand, "North Room");
  assert.equal(config.endpoint, "https://example.com/v1/chat/completions");
  assert.equal(config.apiKey, "local-only");
  assert.equal(widget.replyFor("ping", config).answer, "Pong.");
  assert.equal(widget.defaults.apiKey, "");
  assert.equal(widget.defaults.endpoint, "");
  assert.equal(widget.defaults.brand, "Bright Harbor Studio");
});
