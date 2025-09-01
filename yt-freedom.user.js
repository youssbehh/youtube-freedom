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
// @version            1.0.9
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
// @homepage           https://github.com/youssbehh/youtube-freedom
// @downloadURL https://update.greasyfork.org/scripts/546375/YouTube%20Freedom%20%E2%80%93%20Skip%20Ads%20%20Bypass%20Age%20%20Anti-Adblock.user.js
// @updateURL https://update.greasyfork.org/scripts/546375/YouTube%20Freedom%20%E2%80%93%20Skip%20Ads%20%20Bypass%20Age%20%20Anti-Adblock.meta.js
// ==/UserScript==


(function() {
    'use strict';

   function removeAntiAdblockPopup() {
        document.querySelectorAll('tp-yt-paper-dialog').forEach(dlg => {
            const isAdblockWarning =
                dlg.querySelector('a[href*="support.google.com"]') ||
                /adblock|allow\s*ads|blocker/i.test(dlg.innerText);

            if (isAdblockWarning) {
                console.log("[Userscript] Popup anti-adblock détecté → suppression.");
                dlg.remove();
                document.body.style.overflow = "auto";
            }
        });

        const backdrop = document.querySelector('tp-yt-iron-overlay-backdrop.opened');
        if (backdrop) {
            backdrop.remove();
            document.body.style.overflow = "auto";
        }
    }

    function bypassAgeRestriction() {
        const ageDialog = document.querySelector('ytd-enforcement-message-view-model');
        const player = document.querySelector('video');

        if (ageDialog) {
            ageDialog.remove();
        }

        if (player && player.paused && player.readyState === 0) {
            const isAgeBlocked = !!document.querySelector('ytd-player .ytd-watch-flexy[ad-blocked]');
            const videoId = new URLSearchParams(window.location.search).get("v");
            if (isAgeBlocked && videoId) {
                window.location.href = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
            }
        }
    }

    function skipAds() {
        const pipMode = document.querySelector('ytd-pip-container, ytd-miniplayer-player-container');
        const adVideo = document.querySelector('.ad-showing video');
        if (adVideo && adVideo.duration) {
            adVideo.currentTime = adVideo.duration;
            adVideo.muted = true;
        }
        const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
        if (skipBtn) {
            skipBtn.click();
        }

        if (document.querySelector('.ad-showing')) {
            setTimeout(skipAds, 500);
        }
    }

    function removeAdBanners() {
        const selectors = [
            '#player-ads', '#masthead-ad', '.ytp-ad-overlay-container',
            '.ytp-ad-image-overlay', '.yt-mealbar-promo-renderer',
            '.ytp-featured-product', 'ytd-merch-shelf-renderer', 'ytd-in-feed-ad-layout-renderer',
            '.tp-yt-iron-a11y-announcer'
            //'ytd-engagement-panel-section-list-renderer'
        ];
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                // Vérifie si l'élément est vraiment une pub avant de le supprimer
                if (/ad|advertisement|sponsored|promo/i.test(el.innerText) || el.querySelector('[class*="ad"], [class*="sponsor"]')) {
                    el.remove();
                }
            });
        });
    }

    function keepVideoPlayingEarly() {
        const video = document.querySelector('video');
        if (!video || video.dataset.keepPlayingEarly) return;

        video.dataset.keepPlayingEarly = "true";

        const onPause = () => {
            if (video.currentTime <= 3) {
                video.play().then(() => {
            }).catch(err => {
                console.warn("[Userscript] Impossible de play :", err);
            });
        }
        video.removeEventListener('pause', onPause);
    };

    video.addEventListener('pause', onPause);
    }

    let debounceTimeout;
    const observer = new MutationObserver(() => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            removeAntiAdblockPopup();
            bypassAgeRestriction();
            skipAds();
            removeAdBanners();
            keepVideoPlayingEarly();
        }, 100);
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
