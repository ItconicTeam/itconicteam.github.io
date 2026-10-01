(function () {
  "use strict";

  var SITE = window.SITE;
  var ICONS = window.ICONS;
  var root = document.documentElement;

  var linksEl = document.getElementById("links");
  var bioEl = document.getElementById("bio");
  var langBtn = document.getElementById("langToggle");
  var shareBtn = document.getElementById("shareBtn");
  var copyBtn = document.getElementById("copyBtn");
  var toastEl = document.getElementById("toast");

  function t(key) { return SITE.i18n[root.lang][key]; }

  function icon(id) {
    var path = ICONS[id] || "";
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + path + '"/></svg>';
  }

  function renderLinks() {
    var lang = root.lang;
    linksEl.innerHTML = SITE.links.map(function (l, i) {
      return (
        '<li style="--i:' + i + '">' +
          '<a class="link link--' + l.id + '" href="' + l.url + '" target="_blank" rel="noopener noreferrer"' +
          ' aria-label="' + l.label[lang] + ' — ' + l.handle + ' (' + t("opensIn") + ')">' +
            '<span class="link__icon">' + icon(l.id) + '</span>' +
            '<span class="link__text">' +
              '<span class="link__label">' + l.label[lang] + '</span>' +
              '<span class="link__handle" dir="ltr">' + l.handle + '</span>' +
            '</span>' +
          '</a>' +
        '</li>'
      );
    }).join("");
  }

  function renderText() {
    var dict = SITE.i18n[root.lang];
    document.title = dict.pageTitle;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", dict.metaDescription);

    bioEl.innerHTML = dict.bio.map(function (line) { return "<p>" + line + "</p>"; }).join("");

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = dict[el.getAttribute("data-i18n")];
    });

    langBtn.textContent = dict.switchTo;
    langBtn.setAttribute("aria-label", dict.switchLabel);
    langBtn.setAttribute("lang", root.lang === "ar" ? "en" : "ar");
  }

  function setLang(lang) {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem("itconic-lang", lang); } catch (e) {}
    renderText();
    renderLinks();
  }

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-visible"); }, 2200);
  }

  function pageUrl() {
    var base = /^https?:/.test(SITE.url) ? SITE.url : location.href.split("?")[0];
    return base + (root.lang === "en" ? "?lang=en" : "");
  }

  function copyLink() {
    var url = pageUrl();
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(function () { toast(t("copied")); });
    } else {
      var ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); toast(t("copied")); } catch (e) {}
      document.body.removeChild(ta);
    }
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title: "ITCONIC", text: SITE.i18n[root.lang].bio[0], url: pageUrl() })
        .catch(function (e) { if (e && e.name !== "AbortError") copyLink(); });
    } else {
      copyLink();
    }
  }

  langBtn.addEventListener("click", function () { setLang(root.lang === "ar" ? "en" : "ar"); });
  shareBtn.addEventListener("click", share);
  copyBtn.addEventListener("click", copyLink);
  document.getElementById("year").textContent = new Date().getFullYear();

  setLang(root.lang === "en" ? "en" : "ar");
  // حركة الدخول تعمل مرة واحدة فقط عند فتح الصفحة
  setTimeout(function () { document.body.classList.add("is-settled"); }, 1800);
})();
