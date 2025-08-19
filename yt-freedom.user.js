// ==UserScript==
// @name               YouTube Freedom – Skip Ads & Bypass Age & Anti-Adblock
// @name:fr            YouTube Freedom – Saute les pubs & contourne le bloquer d'âge & anti-adblock
// @name:es            YouTube Freedom – Salta los anuncios & elude la restricción de edad & anti-adblock
// @name:de            YouTube Freedom – Überspringe Werbung & Umgehe Altersbeschränkung & Anti-Adblock
// @name:it            YouTube Freedom – Salta gli annunci & bypass restrizione età & anti-adblock
// @name:pt-BR         YouTube Freedom – Pule os anúncios & contorne a restrição de idade & anti-adblock
// @name:ru            YouTube Freedom – Пропусти рекламу & обойди возрастное ограничение & анти-Adblock
// @name:ar            YouTube Freedom – تخطى الإعلانات & تجاوز قيود العمر & مضاد Anti-Adblock
// @name:ja            YouTube Freedom – 広告をスキップ & 年齢制限を回避 & アンチAdblock
// @name:zh-CN         YouTube Freedom – 跳过广告 & 绕过年龄限制 & 反Adblock
// @namespace          https://github.com/youssbehh
// @version            1.0.0
// @description        Automatically skips YouTube ads, removes banners, bypasses age restrictions and hides anti-adblock popup. No adblocker required.
// @description:fr     Saute automatiquement les pubs YouTube, supprime les bannières, contourne les restrictions d'âge et cache l'avertissement anti-adblock. Aucun bloqueur requis.
// @description:es     Omite automáticamente anuncios de YouTube, elimina banners, evita restricciones de edad y oculta advertencia anti-adblock. No requiere bloqueador.
// @description:de     Überspringt automatisch YouTube-Werbung, entfernt Banner, umgeht Altersbeschränkungen und versteckt Anti-Adblock-Hinweis. Kein Blocker nötig.
// @description:it     Salta automaticamente gli annunci YouTube, rimuove i banner, bypassa le restrizioni di età e nasconde l'avviso anti-adblock. Nessun adblocker richiesto.
// @description:pt-BR  Pula anúncios do YouTube, remove banners, contorna restrições de idade e oculta aviso anti-adblock. Sem bloqueador externo necessário.
// @description:ru     Автоматически пропускает рекламу, удаляет баннеры, обходит возрастные ограничения и скрывает предупреждение. Блокировщик не нужен.
// @description:ar     يتخطى إعلانات YouTube، يزيل اللافتات، يتجاوز قيود العمر ويخفي تحذير مانع الإعلانات. لا يحتاج إلى مانع خارجي.
// @description:ja     YouTube広告を自動スキップし、バナーを削除、年齢制限を回避し、広告ブロック警告を非表示にします。外部ブロッカー不要。
// @description:zh-CN  自动跳过YouTube广告，移除广告横幅，绕过年龄限制并隐藏广告拦截提示。无需广告拦截器。
// @author             YoussBehh
// @icon               https://cdn-icons-png.flaticon.com/64/2504/2504965.png
// @match              https://www.youtube.com/*
// @match              https://m.youtube.com/*
// @grant              none
// @license            MIT
// @noframes
// @homepage           https://github.com/youssbehh/yt-freedom
// ==/UserScript==


(function() {
    'use strict';

    // --- Supprimer le popup anti-adblock ---
    function removeAntiAdblockPopup() {
        const popup = document.querySelector('tp-yt-paper-dialog #dialog');
        const overlay = document.querySelector('tp-yt-paper-dialog');
        if (popup || overlay) {
            console.log("[Userscript] Popup anti-adblock détecté → suppression.");
            if (overlay) overlay.remove();
            if (popup) popup.remove();
            document.body.style.overflow = "auto";
        }
    }

    // --- Bypass restriction d'âge ---
    function bypassAgeRestriction() {
        const ageDialog = document.querySelector('ytd-enforcement-message-view-model');
        const player = document.querySelector('video');

        if (ageDialog) {
            console.log("[Userscript] Restriction d'âge détectée → suppression.");
            ageDialog.remove();
        }

        // Redirection uniquement si la vidéo est bloquée par YouTube
        if (player && player.paused && player.readyState === 0) {
            const isAgeBlocked = !!document.querySelector('ytd-player .ytd-watch-flexy[ad-blocked]');
            const videoId = new URLSearchParams(window.location.search).get("v");
            if (isAgeBlocked && videoId) {
                console.log("[Userscript] Vidéo bloquée → redirection embed.");
                window.location.href = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
            }
        }
    }

    // --- Skip pubs YouTube ---
    function skipAds() {
        const adVideo = document.querySelector('.ad-showing video');
        if (adVideo && adVideo.duration) {
            adVideo.currentTime = adVideo.duration;
            adVideo.muted = true;
            console.log("[Userscript] Pub vidéo détectée → skip.");
        }
        const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
        if (skipBtn) {
            skipBtn.click();
            console.log("[Userscript] Bouton Skip Ad cliqué.");
        }
    }

    // --- Supprimer bannières publicitaires ---
    function removeAdBanners() {
        const selectors = [
            '#player-ads', '#masthead-ad', '.ytp-ad-overlay-container',
            '.ytp-ad-image-overlay', '.yt-mealbar-promo-renderer',
            '.ytp-featured-product', 'ytd-merch-shelf-renderer'
        ];
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.remove());
        });
    }

    // --- Relance la vidéo après le blocage ---
    function keepVideoPlayingEarly() {
        const video = document.querySelector('video');
        if (!video || video.dataset.keepPlayingEarly) return;

        video.dataset.keepPlayingEarly = "true"; // marque pour ne pas répéter

        const onPause = () => {
            if (video.currentTime <= 5) { // seulement si c'est dans les 5 premières secondes
                video.play().then(() => {
                console.log("[Userscript] Vidéo relancée automatiquement (pause dans les 5 premières secondes).");
            }).catch(err => {
                console.warn("[Userscript] Impossible de play :", err);
            });
        }
        video.removeEventListener('pause', onPause); // une seule fois
    };

    video.addEventListener('pause', onPause);
    }

    // --- MutationObserver ---
    const observer = new MutationObserver(() => {
        removeAntiAdblockPopup();
        bypassAgeRestriction();
        skipAds();
        removeAdBanners();
        keepVideoPlayingEarly();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log("[Userscript] Script actif : détection en temps réel.");
})();
