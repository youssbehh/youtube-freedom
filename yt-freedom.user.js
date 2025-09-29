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
// @version            1.2.2
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

        let lastAdSkippedTime = 0;
        const SKIP_COOLDOWN = 500;

        function skipVideoAds() {
            const player = document.querySelector('#movie_player, .html5-video-player');
            if (!player) {
                return;
            }

            const isAdPlaying = player.classList.contains('ad-showing') ||
                                player.classList.contains('ad-interrupting') ||
                                document.querySelector('.video-ads, .ytp-ad-module, .ytp-ad-text, .ytp-ad-preview');
            if (!isAdPlaying) {
                return;
            }

            const currentTime = Date.now();
            if (currentTime - lastAdSkippedTime < SKIP_COOLDOWN) {
                return;
            }

            const video = player.querySelector('video');
            if (video && video.duration) {
                const isLikelyAd = video.duration < 60 ||
                                  document.querySelector('.ytp-ad-text, .ytp-ad-skip-button-container, .ytp-ad-preview');
                if (isLikelyAd && !video.ended) {
                    video.currentTime = video.duration;
                    video.muted = true;
                    lastAdSkippedTime = currentTime;
                } else {
                    return;
                }
            }

            const skipButtonSelectors = [
                '.ytp-ad-skip-button',
                '.ytp-ad-skip-button-modern',
                '.ytp-skip-ad-button',
                'button.ytp-ad-skip-button',
                '.ytp-ad-overlay-close-button'
            ];

            skipButtonSelectors.forEach(selector => {
                const buttons = document.querySelectorAll(selector);
                buttons.forEach(button => {
                    if (button.offsetParent !== null) {
                        button.click();
                    }
                });
            });

            if (player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting')) {
                player.classList.remove('ad-showing', 'ad-interrupting');
            }

            if (video && video.paused && isLikelyAd) {
                video.play().catch(() => console.log('Erreur lors de la reprise après publicité'));
            }
        }

        function removeAdBanners() {
            const adSelectors = [
                'ytd-in-feed-ad-layout-renderer',
                'ytd-ad-slot-renderer',
                '#player-ads',
                '#masthead-ad',
                '.ytp-featured-product',
                'ytd-companion-slot-renderer',
                'ytd-player-legacy-desktop-watch-ads-renderer'
            ];

            adSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element && element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                });
            });

            const relatedItems = document.querySelectorAll('#related ytd-rich-item-renderer');
            relatedItems.forEach(item => {
                if (item.querySelector('ytd-ad-slot-renderer, [class*="ad"], [class*="sponsored"]') && item.parentNode) {
                    item.parentNode.removeChild(item);
                }
            });
        }

        function handleAds() {
            try {
                skipVideoAds();
                removeAdBanners();
            } catch (error) {
                console.log('Erreur lors de la gestion des publicités:', error);
            }
        }

        function bypassAgeRestriction() {
                const currentUrl = window.location.href;
                const ageRestrictionMessage = document.querySelector('.ytp-error-content, .ytp-error, [aria-label*="age-restricted"]');
                if (ageRestrictionMessage && currentUrl.includes('watch?v=')) {
                    const videoId = currentUrl.match(/v=([^&]+)/)?.[1];
                    if (videoId) {
                        const newUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
                        window.location.href = newUrl;
                    } else {
                        console.log('ID de la vidéo non trouvé dans l\'URL');
                    }
                } else if (currentUrl.includes('/v/')) {
                    const player = document.querySelector('#movie_player, .html5-video-player');
                    const video = player?.querySelector('video');
                    if (video && video.paused) {
                        video.play().catch(() => console.log('Erreur lors de la tentative de lecture'));
                        }
                }
        }

        function handleAdsAndAgeRestrictions() {
                try {
                    skipVideoAds();
                    removeAdBanners();
                    bypassAgeRestriction();
                } catch (error) {
                    console.log('Erreur lors de la gestion des publicités ou restrictions d\'âge:', error);
                }
        }

        function setupMutationObserver() {
            const observer = new MutationObserver((mutations) => {
                if (mutations.length > 50) {
                    return;
                }
                handleAds();
                handleAdsAndAgeRestrictions();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: false
            });
            console.log('Observateur de mutations activé pour détecter les publicités');
        }

        window.addEventListener('load', () => {
            console.log('Page chargée, démarrage de la gestion des publicités');
            handleAds();
            handleAdsAndAgeRestrictions();
            setupMutationObserver();
        });

        handleAds();
        handleAdsAndAgeRestrictions();

        setInterval(() => {
            handleAds();
            handleAdsAndAgeRestrictions();
        }, 1000);
    })();
