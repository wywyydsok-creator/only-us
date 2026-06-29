 /**
  * ============================================
  * Only Us - 主脚本
  * 所有交互逻辑、动画控制、功能模块
  * ============================================
  */
 
 document.addEventListener('DOMContentLoaded', function () {
   'use strict';
 
   // ============================================================
   //  DOM 快捷查询
   // ============================================================
   var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
   var $$ = function (sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); };
 
   // ============================================================
   //  状态管理
   // ============================================================
   var state = {
     heroBgIndex: 0,
     heroBgTimer: null,
     quoteIndex: 0,
     quoteTimer: null,
     lbIndex: 0,
     easterClicks: 0,
     easterTimer: null,
     longPressTimer: null,
     isPlaying: false,
     isMuted: true,
     audioCtx: null,
     audioElement: null,
     countdownTimer: null,
   };
 
   // ============================================================
   //  工具函数
   // ============================================================
   function formatNum(n) { return n < 10 ? '0' + n : String(n); }
 
   function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }
 
   function random(min, max) { return Math.random() * (max - min) + min; }
 
   function randomInt(min, max) { return Math.floor(random(min, max + 1)); }
 
   function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
 
   // ============================================================
   //  页面加载完成，隐藏 loading
   // ============================================================
   (function initLoading() {
     var loader = $('#loading-screen');
     if (loader) {
       setTimeout(function () {
         loader.classList.add('hidden');
       }, 800);
     }
   })();
 
   // ============================================================
   //  ① 首页：背景轮播
   // ============================================================
   (function initHeroBg() {
     var container = $('#hero-bg');
     if (!container || !CONFIG.heroImages.length) return;
 
     // 创建背景幻灯片
     CONFIG.heroImages.forEach(function (img, i) {
       var div = document.createElement('div');
       div.className = 'bg-slide' + (i === 0 ? ' active' : '');
       div.style.backgroundImage = 'url(' + img.src + ')';
       container.appendChild(div);
     });
 
     var slides = $$('.bg-slide', container);
     if (slides.length < 2) return;
 
     // 自动轮播
     state.heroBgTimer = setInterval(function () {
       slides[state.heroBgIndex].classList.remove('active');
       state.heroBgIndex = (state.heroBgIndex + 1) % slides.length;
       slides[state.heroBgIndex].classList.add('active');
     }, 4000);
   })();
 
   // ============================================================
   //  ② 首页：打字机效果副标题 + 视差
   // ============================================================
   (function initHeroText() {
     var subEl = $('#hero-subtitle');
     if (!subEl) return;
 
     var text = CONFIG.basic.subtitle;
     var i = 0;
     subEl.textContent = '';
 
     function typeChar() {
       if (i < text.length) {
         subEl.textContent += text.charAt(i);
         i++;
         setTimeout(typeChar, 60);
       }
     }
     setTimeout(typeChar, 600);
 
     // 首页视差（监听滚动）
     var hero = $('#hero');
     var main = $('#main');
     if (hero && main) {
       main.addEventListener('scroll', function () {
         var scrollY = main.scrollTop;
         var heroH = hero.offsetHeight;
         if (scrollY <= heroH) {
           var progress = scrollY / heroH;
           var content = $('.hero-content');
           if (content) {
             content.style.transform = 'translateY(' + (progress * 60) + 'px)';
             content.style.opacity = 1 - progress;
           }
         }
       }, { passive: true });
     }
   })();
 
   // ============================================================
   //  ③ 首页：tsParticles 粒子
   // ============================================================
   (function initHeroParticles() {
     if (typeof tsParticles === 'undefined') return;
     var container = $('#hero-particles');
     if (!container) return;
 
     tsParticles.load({
       id: 'hero-particles',
       options: {
         fpsLimit: 30,
         fullScreen: { enable: false },
         particles: {
           number: { value: 20, density: { enable: true } },
           color: { value: ['#FF6B81', '#FFD6DF', '#FF8A9E'] },
           shape: { type: 'circle' },
           opacity: { value: 0.4, random: true },
           size: { value: { min: 2, max: 6 }, random: true },
           move: {
             enable: true,
             speed: 1.2,
             direction: 'top',
             outModes: { default: 'out' },
           },
           wobble: { enable: true, distance: 10, speed: 2 },
         },
         interactivity: {
           events: { onHover: { enable: true, mode: 'bubble' } },
           modes: { bubble: { distance: 120, size: 8, opacity: 0.6 } },
         },
       },
     });
   })();
 
   // ============================================================
   //  ④ 开始回忆按钮 → 平滑滚动
   // ============================================================
   (function initHeroBtn() {
     var btn = $('#hero-btn');
     if (!btn) return;
     btn.addEventListener('click', function () {
       var album = $('#album');
       if (album) album.scrollIntoView({ behavior: 'smooth' });
     });
   })();
 
   // ============================================================
   //  ⑤ 相册 · 瀑布流渲染
   // ============================================================
   (function initAlbum() {
     var masonry = $('#masonry');
     if (!masonry || !CONFIG.albumImages.length) return;
 
     CONFIG.albumImages.forEach(function (item, index) {
       var div = document.createElement('div');
       div.className = 'masonry-item';
       div.dataset.index = index;
 
       var img = document.createElement('img');
       img.loading = 'lazy';
       img.src = item.src;
       img.alt = item.title || '';
       // 图片加载失败时保留渐变背景
       img.onerror = function () { this.style.display = 'none'; };
 
       var overlay = document.createElement('div');
       overlay.className = 'masonry-overlay';
       overlay.innerHTML = '<div class="masonry-date">' + (item.date || '') +
         '</div><div class="masonry-title">' + (item.title || '') +
         '</div><div class="masonry-desc">' + (item.description || '') + '</div>';
 
       div.appendChild(img);
       div.appendChild(overlay);
 
       // 点击打开 Lightbox
       div.addEventListener('click', function () {
         openLightbox(index);
       });
 
       masonry.appendChild(div);
     });
   })();
 
   // ============================================================
   //  ⑥ Lightbox 灯光箱
   // ============================================================
   var lbTouchStartX = 0;
 
   function openLightbox(index) {
     var lb = $('#lightbox');
     var items = CONFIG.albumImages;
     if (!lb || !items.length) return;
     state.lbIndex = clamp(index, 0, items.length - 1);
     renderLightbox();
     lb.classList.add('show');
     document.body.style.overflow = 'hidden';
   }
 
   function closeLightbox() {
     var lb = $('#lightbox');
     if (!lb) return;
     lb.classList.remove('show');
     document.body.style.overflow = '';
   }
 
   function renderLightbox() {
     var items = CONFIG.albumImages;
     var img = $('#lightbox-img');
     var dateEl = $('#lightbox-date');
     var titleEl = $('#lightbox-title');
     var descEl = $('#lightbox-desc');
     var counter = $('#lightbox-counter');
 
     if (!img || !items.length) return;
     var item = items[state.lbIndex];
     img.src = item.src;
     img.alt = item.title || '';
     if (dateEl) dateEl.textContent = item.date || '';
     if (titleEl) titleEl.textContent = item.title || '';
     if (descEl) descEl.textContent = item.description || '';
     if (counter) counter.textContent = (state.lbIndex + 1) + ' / ' + items.length;
   }
 
   function lightboxPrev() {
     if (CONFIG.albumImages.length === 0) return;
     state.lbIndex = (state.lbIndex - 1 + CONFIG.albumImages.length) % CONFIG.albumImages.length;
     renderLightbox();
   }
 
   function lightboxNext() {
     if (CONFIG.albumImages.length === 0) return;
     state.lbIndex = (state.lbIndex + 1) % CONFIG.albumImages.length;
     renderLightbox();
   }
 
   // Lightbox 事件绑定
   (function initLightboxEvents() {
     var lb = $('#lightbox');
     if (!lb) return;
 
     $('#lightbox-close').addEventListener('click', closeLightbox);
     $('#lightbox-prev').addEventListener('click', lightboxPrev);
     $('#lightbox-next').addEventListener('click', lightboxNext);
 
     // 点击背景关闭
     lb.addEventListener('click', function (e) {
       if (e.target === lb) closeLightbox();
     });
 
     // 键盘导航
     document.addEventListener('keydown', function (e) {
       if (!lb.classList.contains('show')) return;
       if (e.key === 'Escape') closeLightbox();
       if (e.key === 'ArrowLeft') lightboxPrev();
       if (e.key === 'ArrowRight') lightboxNext();
     });
 
     // 触屏滑动
     lb.addEventListener('touchstart', function (e) {
       lbTouchStartX = e.touches[0].clientX;
     }, { passive: true });
     lb.addEventListener('touchend', function (e) {
       var diff = lbTouchStartX - e.changedTouches[0].clientX;
       if (Math.abs(diff) > 50) {
         if (diff > 0) lightboxNext(); else lightboxPrev();
       }
     }, { passive: true });
   })();
 
   // ============================================================
   //  ⑦ 故事时间轴
   // ============================================================
   (function initStory() {
     var timeline = $('#timeline');
     if (!timeline || !CONFIG.stories.length) return;
 
     CONFIG.stories.forEach(function (story) {
       var item = document.createElement('div');
       item.className = 'timeline-item';
 
       var card = document.createElement('div');
       card.className = 'timeline-card';
 
       card.innerHTML =
         '<div class="timeline-date">' + (story.date || '') + '</div>' +
         '<div class="timeline-card-title">' + (story.title || '') + '</div>' +
         '<div class="timeline-summary">' + (story.summary || '') + '</div>' +
         '<div class="timeline-expand">' +
         '  <div class="timeline-content">' + (story.content || '') + '</div>' +
         '  <div class="timeline-images"></div>' +
         '</div>' +
         '<div class="timeline-expand-icon"><i class="fas fa-chevron-down"></i></div>';
 
       // 添加故事图片
       var imgContainer = card.querySelector('.timeline-images');
       if (imgContainer && story.images) {
         story.images.forEach(function (src) {
           var img = document.createElement('img');
           img.loading = 'lazy';
           img.src = src;
           img.onerror = function () { this.style.display = 'none'; };
           imgContainer.appendChild(img);
         });
       }
 
       // 点击展开/收起
       card.addEventListener('click', function () {
         item.classList.toggle('expanded');
       });
 
       item.appendChild(card);
       timeline.appendChild(item);
     });
   })();
 
   // ============================================================
   //  ⑧ 情话轮播
   // ============================================================
   function renderQuote(index) {
     var el = $('#quote-text');
     if (!el || !CONFIG.quotes.length) return;
     el.textContent = CONFIG.quotes[index] || '';
     // 更新圆点
     $$('.quote-dot').forEach(function (dot, i) {
       dot.classList.toggle('active', i === index);
     });
   }
 
   (function initQuotes() {
     var dotsContainer = $('#quote-dots');
     if (!dotsContainer || !CONFIG.quotes.length) return;
 
     // 生成圆点
     CONFIG.quotes.forEach(function (_, i) {
       var dot = document.createElement('span');
       dot.className = 'quote-dot' + (i === 0 ? ' active' : '');
       dot.dataset.index = i;
       dot.addEventListener('click', function () {
         state.quoteIndex = parseInt(this.dataset.index);
         renderQuote(state.quoteIndex);
         resetQuoteTimer();
       });
       dotsContainer.appendChild(dot);
     });
 
     renderQuote(0);
 
     // 自动轮播
     function autoAdvance() {
       state.quoteIndex = (state.quoteIndex + 1) % CONFIG.quotes.length;
       renderQuote(state.quoteIndex);
     }
 
     function resetQuoteTimer() {
       if (state.quoteTimer) clearInterval(state.quoteTimer);
       state.quoteTimer = setInterval(autoAdvance, 4000);
     }
     resetQuoteTimer();
 
     // 按钮事件
     $('#quote-prev').addEventListener('click', function () {
       state.quoteIndex = (state.quoteIndex - 1 + CONFIG.quotes.length) % CONFIG.quotes.length;
       renderQuote(state.quoteIndex);
       resetQuoteTimer();
     });
 
     $('#quote-next').addEventListener('click', function () {
       state.quoteIndex = (state.quoteIndex + 1) % CONFIG.quotes.length;
       renderQuote(state.quoteIndex);
       resetQuoteTimer();
     });
 
     $('#quote-random').addEventListener('click', function () {
       state.quoteIndex = Math.floor(Math.random() * CONFIG.quotes.length);
       renderQuote(state.quoteIndex);
       resetQuoteTimer();
     });
   })();
 
   // ============================================================
   //  ⑨ 互动区：点击 / 双击 / 长按
   // ============================================================
   (function initInteractive() {
     var area = $('#interactive-area');
     var canvas = $('#interactive-canvas');
     if (!area || !canvas) return;
 
     var ctx = canvas.getContext('2d');
     var W, H;
 
     function resize() {
       W = area.offsetWidth;
       H = area.offsetHeight;
       canvas.width = W;
       canvas.height = H;
     }
     resize();
     window.addEventListener('resize', resize);
 
     // ---- Canvas 背景装饰（漂浮小球） ----
     var bgParticles = [];
     for (var i = 0; i < 20; i++) {
       bgParticles.push({
         x: random(0, W), y: random(0, H),
         r: random(2, 5), vx: random(-0.3, 0.3), vy: random(-0.5, -0.1),
         color: pickRandom(['#FFD6DF', '#FF6B81', '#FF8A9E']),
         alpha: random(0.2, 0.5),
       });
     }
 
     function animateBg() {
       ctx.clearRect(0, 0, W, H);
       bgParticles.forEach(function (p) {
         p.x += p.vx;
         p.y += p.vy;
         if (p.y < -10) { p.y = H + 10; p.x = random(0, W); }
         if (p.x < -10 || p.x > W + 10) p.x = random(0, W);
         ctx.globalAlpha = p.alpha;
         ctx.fillStyle = p.color;
         ctx.beginPath();
         ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
         ctx.fill();
       });
       ctx.globalAlpha = 1;
       requestAnimationFrame(animateBg);
     }
     animateBg();
 
     // ---- 点击产生粒子 ----
     var symbols = ['❤️', '⭐', '💕', '✨', '💖', '🌟', '💗'];
 
     function spawnParticle(x, y) {
       var el = document.createElement('div');
       el.className = 'interactive-particle';
       el.textContent = pickRandom(symbols);
       el.style.left = x + 'px';
       el.style.top = y + 'px';
       el.style.fontSize = random(20, 36) + 'px';
       area.appendChild(el);
       setTimeout(function () { el.remove(); }, 1500);
     }
 
     var clickTimer = null;
     var clickCount = 0;
 
     function handleClick(e) {
       var rect = area.getBoundingClientRect();
       var x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
       var y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
 
       clickCount++;
       if (clickCount === 1) {
         clickTimer = setTimeout(function () {
           clickCount = 0;
           // 单击：生成 3-5 个粒子
           for (var i = 0; i < randomInt(3, 5); i++) {
             spawnParticle(x + random(-20, 20), y + random(-20, 20));
           }
         }, 250);
       } else if (clickCount >= 2) {
         clearTimeout(clickTimer);
         clickCount = 0;
         // 双击：爱心雨
         triggerLoveRain();
       }
     }
 
     area.addEventListener('click', handleClick);
     area.addEventListener('touchstart', function (e) {
       // 触屏使用相同的处理逻辑（通过 touch 事件模拟）
       var touch = e.touches[0];
       var fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
       handleClick(fakeEvent);
     });
     // 阻止移动端 click 事件重复触发
     area.addEventListener('touchstart', function (e) {
       e.preventDefault();
     }, { passive: false });
     area.addEventListener('touchend', function (e) {
       e.preventDefault();
     }, { passive: false });
 
     // ---- 双击：爱心雨 ----
     function triggerLoveRain() {
       for (var i = 0; i < 30; i++) {
         (function () {
           var el = document.createElement('div');
           el.className = 'love-rain';
           el.textContent = pickRandom(['❤️', '💕', '💖', '💗', '💘']);
           el.style.left = random(0, W - 30) + 'px';
           el.style.top = '-40px';
           el.style.animationDuration = random(1.5, 3) + 's';
           el.style.animationDelay = random(0, 1.5) + 's';
           el.style.fontSize = random(18, 30) + 'px';
           area.appendChild(el);
           setTimeout(function () { el.remove(); }, 4000);
         })();
       }
     }
 
     // ---- 长按：告白模式 ----
     var longPressDuration = CONFIG.confession.longPressDuration || 2000;
     var longPressTimer = null;
 
     function startLongPress(e) {
       longPressTimer = setTimeout(function () {
         triggerConfession();
       }, longPressDuration);
     }
 
     function cancelLongPress() {
       if (longPressTimer) {
         clearTimeout(longPressTimer);
         longPressTimer = null;
       }
     }
 
     area.addEventListener('mousedown', startLongPress);
     area.addEventListener('mouseup', cancelLongPress);
     area.addEventListener('mouseleave', cancelLongPress);
     area.addEventListener('touchstart', startLongPress);
     area.addEventListener('touchend', cancelLongPress);
     area.addEventListener('touchcancel', cancelLongPress);
   })();
 
   // ============================================================
   //  ⑩ 告白模式
   // ============================================================
   function triggerConfession() {
     var overlay = $('#confession-overlay');
     var textEl = $('#confession-text');
     if (!overlay || !textEl) return;
 
     textEl.textContent = CONFIG.confession.message || '以后也一起走吧 💕';
     overlay.classList.add('show');
     document.body.style.overflow = 'hidden';
 
     // 爱心扩散
     var heartsContainer = $('#confession-hearts');
     if (heartsContainer) {
       for (var i = 0; i < 12; i++) {
         (function () {
           var el = document.createElement('div');
           el.className = 'confession-heart';
           el.textContent = '❤️';
           el.style.left = random(20, 80) + '%';
           el.style.top = random(20, 80) + '%';
           el.style.fontSize = random(16, 40) + 'px';
           el.style.animationDuration = random(1.5, 3) + 's';
           el.style.animationDelay = random(0, 1) + 's';
           heartsContainer.appendChild(el);
           setTimeout(function () { el.remove(); }, 3500);
         })();
       }
     }
 
     // 烟花效果
     triggerFireworks();
 
     // 播放音乐高潮 (如果正在播放则跳转到高潮部分)
     // 简化实现：直接播放/重播音乐
     if (state.audioElement && state.audioElement.paused) {
       state.audioElement.play().catch(function () {});
     }
   }
 
   function triggerFireworks() {
     var container = $('#confession-fireworks');
     if (!container) return;
     var colors = ['#FF6B81', '#FFD6DF', '#FF8A9E', '#FFB6C1', '#FFE4E1', '#FF69B4'];
 
     function burst(cx, cy) {
       for (var i = 0; i < 30; i++) {
         (function () {
           var angle = random(0, Math.PI * 2);
           var dist = random(40, 160);
           var el = document.createElement('div');
           el.className = 'firework-particle';
           el.style.left = cx + 'px';
           el.style.top = cy + 'px';
           el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
           el.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
           el.style.background = pickRandom(colors);
           el.style.width = random(4, 8) + 'px';
           el.style.height = el.style.width;
           el.style.animationDuration = random(0.8, 1.2) + 's';
           el.style.animationDelay = random(0, 0.2) + 's';
           container.appendChild(el);
           setTimeout(function () { el.remove(); }, 1500);
         })();
       }
     }
 
     // 3 波烟花
     var vw = window.innerWidth;
     var vh = window.innerHeight;
     burst(vw * 0.3, vh * 0.3);
     setTimeout(function () { burst(vw * 0.7, vh * 0.25); }, 400);
     setTimeout(function () { burst(vw * 0.5, vh * 0.4); }, 800);
     setTimeout(function () { burst(vw * 0.2, vh * 0.5); }, 1200);
     setTimeout(function () { burst(vw * 0.8, vh * 0.45); }, 1600);
   }
 
   // 告白模式返回按钮
   $('#confession-back').addEventListener('click', function () {
     var overlay = $('#confession-overlay');
     overlay.classList.remove('show');
     document.body.style.overflow = '';
   });
 
   // ============================================================
   //  ⑪ 纪念日倒计时 · 翻牌
   // ============================================================
   (function initCountdown() {
     var daysEl = $('#flip-days .flip-front');
     var hoursEl = $('#flip-hours .flip-front');
     var minsEl = $('#flip-minutes .flip-front');
     if (!daysEl || !hoursEl || !minsEl) return;
 
     var startDate = new Date(CONFIG.anniversary.startDate);
 
     function updateCountdown() {
       var now = new Date();
       var diff = now - startDate;
       if (diff < 0) { diff = 0; }
 
       var totalMinutes = Math.floor(diff / 60000);
       var days = Math.floor(totalMinutes / 1440);
       var hours = Math.floor((totalMinutes % 1440) / 60);
       var minutes = totalMinutes % 60;
 
       daysEl.textContent = formatNum(days);
       hoursEl.textContent = formatNum(hours);
       minsEl.textContent = formatNum(minutes);
 
       // 更新背面（用于背景占位，视觉统一）
       var db = $('#flip-days .flip-back');
       var hb = $('#flip-hours .flip-back');
       var mb = $('#flip-minutes .flip-back');
       if (db) db.textContent = formatNum(days);
       if (hb) hb.textContent = formatNum(hours);
       if (mb) mb.textContent = formatNum(minutes);
     }
 
     updateCountdown();
     state.countdownTimer = setInterval(updateCountdown, 10000);
   })();
 
   // ============================================================
   //  ⑫ 流星（纪念日页 + 页尾）
   // ============================================================
   (function initShootingStars() {
     var containers = [document.getElementById('countdown-bg'), document.getElementById('footer-stars')];
 
     function createStar(container) {
       var star = document.createElement('div');
       star.className = 'shooting-star';
       star.style.left = random(10, 90) + '%';
       star.style.top = random(5, 40) + '%';
       star.style.animationDuration = random(0.6, 1.2) + 's';
       star.style.animationDelay = random(0, 3) + 's';
       container.appendChild(star);
       setTimeout(function () { star.remove(); }, 4000);
     }
 
     containers.forEach(function (c) {
       if (!c) return;
       setInterval(function () { createStar(c); }, random(2000, 5000));
       // 初始生成几颗
       for (var i = 0; i < 3; i++) {
         setTimeout(function () { createStar(c); }, i * 800);
       }
     });
   })();
 
   // ============================================================
   //  ⑬ 背景音乐
   // ============================================================
   (function initMusic() {
     if (!CONFIG.music.enabled) {
       var btn = $('#music-btn');
       if (btn) btn.style.display = 'none';
       return;
     }
 
     var audio = new Audio(CONFIG.music.src);
     audio.loop = true;
     audio.volume = CONFIG.music.volume || 0.5;
     state.audioElement = audio;
 
     var btn = $('#music-btn');
     var info = $('#music-info');
     var titleEl = $('#music-title');
     var volumeSlider = $('#volume-slider');
     if (titleEl) titleEl.textContent = CONFIG.music.title || 'Love Story';
 
     // 点击播放/暂停
     btn.addEventListener('click', function (e) {
       e.stopPropagation();
       // 展开信息面板
       btn.classList.toggle('active');
     });
 
     // 点击图标播放/暂停
     var iconWrapper = $('.music-icon-wrapper', btn);
     iconWrapper.addEventListener('click', function (e) {
       e.stopPropagation();
       if (audio.paused) {
         audio.play().then(function () {
           btn.classList.add('playing');
           state.isPlaying = true;
         }).catch(function () {});
       } else {
         audio.pause();
         btn.classList.remove('playing');
         state.isPlaying = false;
       }
     });
 
     // 音量调节
     volumeSlider.addEventListener('input', function () {
       audio.volume = parseFloat(this.value);
     });
 
     // 微信兼容：用户点击任意位置后尝试播放
     document.addEventListener('touchstart', function () {
       if (audio.paused && !state.isPlaying) {
         // 只做一次，不自动播放
       }
     }, { once: true });
   })();
 
   // ============================================================
   //  ⑭ 隐藏彩蛋（连续点击 Logo 7 次）
   // ============================================================
   (function initEasterEgg() {
     var logo = $('#hero-title');
     if (!logo) return;
 
     logo.addEventListener('click', function () {
       state.easterClicks++;
       if (state.easterTimer) clearTimeout(state.easterTimer);
 
       if (state.easterClicks >= CONFIG.easterEgg.triggerClicks) {
         state.easterClicks = 0;
         showEasterEgg();
         return;
       }
 
       // 2 秒无点击则重置
       state.easterTimer = setTimeout(function () {
         state.easterClicks = 0;
       }, 2000);
     });
 
     function showEasterEgg() {
       var overlay = $('#easter-egg');
       var textEl = $('#easter-text');
       if (!overlay) return;
 
       if (textEl) textEl.textContent = CONFIG.easterEgg.message || '谢谢你出现在我的生命里 💫';
       overlay.classList.add('show');
       document.body.style.overflow = 'hidden';
 
       // 星空背景
       var starsContainer = $('#easter-stars');
       if (starsContainer) {
         for (var i = 0; i < 100; i++) {
           var star = document.createElement('div');
           star.className = 'star-particle';
           star.style.left = random(0, 100) + '%';
           star.style.top = random(0, 100) + '%';
           star.style.setProperty('--duration', random(1, 4) + 's');
           star.style.animationDelay = random(0, 3) + 's';
           star.style.width = random(1, 3) + 'px';
           star.style.height = star.style.width;
           starsContainer.appendChild(star);
         }
       }
 
       // 飘浮爱心
       var heartsContainer = $('#easter-hearts');
       if (heartsContainer) {
         for (var i = 0; i < 8; i++) {
           (function () {
             var el = document.createElement('span');
             el.textContent = '💫';
             el.style.display = 'inline-block';
             el.style.margin = '0 8px';
             el.style.fontSize = random(24, 40) + 'px';
             el.style.animation = 'float-up ' + random(2, 4) + 's ease-in-out infinite';
             el.style.animationDelay = random(0, 2) + 's';
             heartsContainer.appendChild(el);
           })();
         }
       }
     }
 
     // 返回按钮
     $('#easter-back').addEventListener('click', function () {
       $('#easter-egg').classList.remove('show');
       document.body.style.overflow = '';
     });
   })();
 
   // ============================================================
   //  ⑮ 漂流瓶
   // ============================================================
   (function initBottle() {
     var STORAGE_KEY = 'onlyus_messages';
     var input = $('#bottle-input');
     var sendBtn = $('#bottle-send');
     var container = $('#bottle-messages');
     if (!input || !sendBtn || !container) return;
 
     // 加载消息
     function loadMessages() {
       try {
         var data = localStorage.getItem(STORAGE_KEY);
         return data ? JSON.parse(data) : [];
       } catch (e) { return []; }
     }
 
     // 保存消息
     function saveMessages(msgs) {
       localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
     }
 
     // 渲染消息列表
     function renderMessages() {
       var msgs = loadMessages();
       if (msgs.length === 0) {
         container.innerHTML = '<div class="bottle-empty">还没有留言，写一条吧 💌</div>';
         return;
       }
       container.innerHTML = '';
       msgs.slice().reverse().forEach(function (msg, idx) {
         var revIdx = msgs.length - 1 - idx;
         var div = document.createElement('div');
         div.className = 'bottle-msg';
         div.innerHTML =
           '<div class="bottle-msg-text">' + escapeHtml(msg.text) + '</div>' +
           '<div class="bottle-msg-time">' + (msg.time || '') + '</div>' +
           '<button class="bottle-msg-del" data-index="' + revIdx + '"><i class="fas fa-times"></i></button>';
         container.appendChild(div);
       });
 
       // 删除事件
       container.querySelectorAll('.bottle-msg-del').forEach(function (btn) {
         btn.addEventListener('click', function () {
           var idx = parseInt(this.dataset.index);
           if (confirm(CONFIG.messageBottle.confirmDelete || '确定删除这条留言吗？')) {
             var msgs = loadMessages();
             msgs.splice(idx, 1);
             saveMessages(msgs);
             renderMessages();
           }
         });
       });
     }
 
     function escapeHtml(str) {
       var d = document.createElement('div');
       d.textContent = str;
       return d.innerHTML;
     }
 
     // 发送消息
     sendBtn.addEventListener('click', function () {
       var text = input.value.trim();
       if (!text) return;
 
       var now = new Date();
       var timeStr = now.getFullYear() + '-' +
         formatNum(now.getMonth() + 1) + '-' +
         formatNum(now.getDate()) + ' ' +
         formatNum(now.getHours()) + ':' +
         formatNum(now.getMinutes());
 
       var msgs = loadMessages();
       msgs.push({ text: text, time: timeStr });
       saveMessages(msgs);
       input.value = '';
       renderMessages();
     });
 
     // 初始渲染
     renderMessages();
   })();
 
   // ============================================================
   //  ⑯ 页尾
   // ============================================================
   // 页尾的流星在 initShootingStars 中已处理
   // 页尾文字由 CONFIG.basic.footer 驱动
   (function initFooter() {
     var footerText = $('.footer-text');
     if (footerText) {
       footerText.textContent = CONFIG.basic.footer || '💕 永远热恋中 💕';
     }
   })();
 
   // ============================================================
   //  ⑰ GSAP 入场动画（增强）
   // ============================================================
   (function initGSAP() {
     if (typeof gsap === 'undefined') return;
 
     // 首页入场
     gsap.from('.hero-title', { opacity: 0, y: 40, duration: 1.2, ease: 'power3.out', delay: 0.3 });
     gsap.from('.hero-btn', { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out', delay: 0.8 });
     gsap.from('.scroll-indicator', { opacity: 0, duration: 0.6, delay: 1.5 });
 
     // 各 section 进入视口动画
     if (typeof ScrollTrigger !== 'undefined') {
       gsap.utils.toArray('.section-header').forEach(function (header) {
         gsap.from(header, {
           opacity: 0,
           y: 30,
           duration: 0.8,
           ease: 'power2.out',
           scrollTrigger: {
             trigger: header,
             start: 'top 80%',
             toggleActions: 'play none none reverse',
           },
         });
       });
     }
   })();
 
   // ============================================================
   //  ⑱ GSAP 初始动画：标题光晕光圈
   // ============================================================
   (function initGlow() {
     var title = $('#hero-title');
     if (!title) return;
     // 添加一个简单的光晕动画 using CSS animation
     // 已经在 hero-title 的 text-shadow 中实现
   })();
 
   console.log('✨ Only Us 已加载完成');
   console.log('💡 提示：连续点击 Logo 7 次有彩蛋！');
 });
