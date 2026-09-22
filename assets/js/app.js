/* ============================================================
   SIYAS — shared interaction layer (all pages)
   vanilla JS + GSAP(ScrollTrigger) + Lenis
============================================================ */
(() => {
    'use strict';

    const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const G = window.gsap ?? null;
    const ST = window.ScrollTrigger ?? null;
    if (G && ST) G.registerPlugin(ST);

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
    const faNum = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    /* ---------- toast ---------- */
    const toastEl = $('#toast'), toastMsg = $('#toastMsg');
    let toastTimer = null;
    function toast(msg) {
        if (!toastEl) return;
        toastMsg.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4200);
    }

    /* ---------- Lenis smooth scroll ---------- */
    let lenis = null;
    if (window.Lenis && !REDUCED) {
        lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        document.documentElement.classList.add('lenis-on');
        if (G && ST) {
            lenis.on('scroll', ScrollTrigger.update);
            G.ticker.add(t => lenis.raf(t * 1000));
            G.ticker.lagSmoothing(0);
        } else {
            const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
            requestAnimationFrame(raf);
        }
    }
    function goToEl(el) {
        if (lenis) lenis.scrollTo(el, { offset: -96, duration: 1.2 });
        else el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    }

    /* ---------- scroll progress + nav state ---------- */
    const progressBar = $('#progressBar'), nav = $('#siteNav');
    const setProgress = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1) : 0})`;
    };
    const setNavState = () => nav && nav.classList.toggle('is-scrolled', scrollY > 30);
    addEventListener('scroll', () => { setProgress(); setNavState(); }, { passive: true });
    addEventListener('resize', setProgress);
    setProgress(); setNavState();

    /* ---------- mobile menu ---------- */
    const menuBtn = $('#menuBtn'), mobileMenu = $('#mobileMenu');
    let menuOpen = false;
    function openMenu() {
        menuOpen = true;
        if (!menuBtn) return;
        menuBtn.setAttribute('aria-expanded', 'true');
        const b = menuBtn.querySelector('.burger'); if (b) b.classList.add('open');
        mobileMenu.classList.add('open');
        document.documentElement.classList.add('locked');
        lenis && lenis.stop();
        if (G && !REDUCED && mobileMenu)
            G.fromTo('#mobileMenu .m-item', { y: 34, opacity: 0 },
                { y: 0, opacity: 1, duration: .55, stagger: .07, ease: 'power3.out', delay: .1, clearProps: 'all' });
    }
    function closeMenu() {
        if (!menuOpen || !mobileMenu) return;
        menuOpen = false;
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', 'false');
            const b = menuBtn.querySelector('.burger'); if (b) b.classList.remove('open');
        }
        mobileMenu.classList.remove('open');
        document.documentElement.classList.remove('locked');
        lenis && lenis.start();
    }
    if (menuBtn) menuBtn.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));

    /* ---------- smooth anchors (same-page only) ---------- */
    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (id.length < 2) return;
            const target = $(id);
            if (!target) return;
            e.preventDefault();
            closeMenu();
            goToEl(target);
            history.replaceState(null, '', id);
        });
    });

    /* ---------- scroll reveals ---------- */
    if (G && ST && !REDUCED) {
        $$('[data-reveal]').forEach(el => {
            G.fromTo(el, { y: 46, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 1.05, ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 86%', once: true }
                });
        });
        $$('[data-reveal-group]').forEach(group => {
            const items = $$('[data-reveal-item]', group);
            if (!items.length) return;
            G.fromTo(items, { y: 42, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: .9, stagger: .1, ease: 'power3.out',
                    scrollTrigger: { trigger: group, start: 'top 84%', once: true }
                });
        });
    }

    /* ---------- hero: word split + intro + scatter (index only) ---------- */
    const heroLines = $$('.hero-line');
    heroLines.forEach(line => {
        const gold = line.classList.contains('hero-gold');
        const words = line.textContent.trim().split(/\s+/);
        line.innerHTML = words.map(w => `<span class="hero-word${gold ? ' gold-word' : ''}">${w}</span>`).join(' ');
    });
    if (heroLines.length && G && !REDUCED) {
        G.timeline({ defaults: { ease: 'power3.out' } })
            .fromTo('.hero-eyebrow', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .8, delay: .3 })
            .fromTo('.hero-word', { y: 52, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .07 }, '-=.4')
            .fromTo('.hero-lead', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, '-=.55')
            .fromTo('.hero-ctas', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, '-=.6')
            .fromTo('.hero-trust', { opacity: 0 }, { opacity: 1, duration: .9 }, '-=.4')
            .fromTo('#siteNav', { y: -26, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, '-=.9')
            .fromTo('.scroll-hint', { opacity: 0 }, { opacity: 1, duration: .8 }, '-=.4');

        $$('.hero-word').forEach((w, i) => {
            G.to(w, {
                yPercent: (i % 2 ? -1 : 1) * (16 + (i * 11) % 26), ease: 'none',
                scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: .5 }
            });
        });
        G.to('.hero-content', {
            opacity: 0, y: -70, ease: 'none',
            scrollTrigger: { trigger: '#hero', start: '20% top', end: 'bottom top', scrub: .5 }
        });
    }

    /* ---------- active nav link (scrollspy, hash links only) ---------- */
    if (G && ST) $$('.nav-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#')) return;
        const sec = $(href);
        if (!sec) return;
        ST.create({
            trigger: sec, start: 'top 45%', end: 'bottom 45%',
            onToggle: self => link.classList.toggle('active', self.isActive)
        });
    });

    /* ---------- counters ---------- */
    $$('[data-count]').forEach(el => {
        const target = parseFloat(el.dataset.count) || 0;
        if (!(G && ST) || REDUCED) { el.textContent = faNum(target); return; }
        const obj = { v: 0 };
        ST.create({
            trigger: el, start: 'top 90%', once: true,
            onEnter: () => G.to(obj, {
                v: target, duration: 2.2, ease: 'power2.out',
                onUpdate: () => el.textContent = faNum(Math.round(obj.v))
            })
        });
    });

    /* ---------- magnetic buttons ---------- */
    if (G && FINE && !REDUCED) $$('[data-magnetic]').forEach(el => {
        const xTo = G.quickTo(el, 'x', { duration: .5, ease: 'power3' });
        const yTo = G.quickTo(el, 'y', { duration: .5, ease: 'power3' });
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * .32);
            yTo((e.clientY - r.top - r.height / 2) * .36);
        });
        el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });

    /* ---------- 3D tilt + light glare ---------- */
    if (G && FINE && !REDUCED) $$('[data-tilt]').forEach(card => {
        G.set(card, { transformPerspective: 900 });
        const rX = G.quickTo(card, 'rotationX', { duration: .6, ease: 'power2' });
        const rY = G.quickTo(card, 'rotationY', { duration: .6, ease: 'power2' });
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - .5;
            const py = (e.clientY - r.top) / r.height - .5;
            rY(px * 7); rX(-py * 7);
            card.style.setProperty('--gx', `${((px + .5) * 100).toFixed(1)}%`);
            card.style.setProperty('--gy', `${((py + .5) * 100).toFixed(1)}%`);
            card.classList.add('is-lit');
        });
        card.addEventListener('mouseleave', () => { rX(0); rY(0); card.classList.remove('is-lit'); });
    });

    /* ---------- floating deco parallax ---------- */
    if (G && FINE && !REDUCED) {
        const floats = $$('[data-float]');
        const fx = floats.map(el => G.quickTo(el, 'x', { duration: 1.2, ease: 'power2' }));
        const fy = floats.map(el => G.quickTo(el, 'y', { duration: 1.2, ease: 'power2' }));
        addEventListener('mousemove', e => {
            const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
            floats.forEach((el, i) => {
                const amp = parseFloat(el.dataset.float || 20);
                fx[i](nx * amp); fy[i](ny * amp);
            });
        });
    }

    /* ---------- portfolio image parallax ---------- */
    if (G && ST && !REDUCED) $$('.pf-item .pf-par').forEach(inner => {
        G.fromTo(inner, { yPercent: -7 }, {
            yPercent: 7, ease: 'none',
            scrollTrigger: { trigger: inner.closest('.pf-item'), start: 'top bottom', end: 'bottom top', scrub: true }
        });
    });

    /* ---------- clients marquee ---------- */
    const mq = $('.marquee-track');
    if (mq) {
        const src = mq.firstElementChild;
        for (let i = 0; i < 2; i++) {
            const c = src.cloneNode(true);
            c.setAttribute('aria-hidden', 'true');
            mq.appendChild(c);
        }
        if (!REDUCED) mq.classList.add('ready');
    }

    /* ---------- portfolio filter (+ ?cat= deep-link from service pages) ---------- */
    const filterWrap = $('#pfFilters');
    if (filterWrap) {
        const buttons = $$('.filter-btn', filterWrap);
        const items = $$('.pf-item');
        const cats = buttons.map(b => b.dataset.cat);
        const apply = cat => {
            buttons.forEach(b => {
                const on = b.dataset.cat === cat;
                b.classList.toggle('active', on);
                b.setAttribute('aria-pressed', String(on));
            });
            const show = [], hide = [];
            items.forEach(it => (cat === 'all' || it.dataset.category === cat ? show : hide).push(it));
            const entering = show.filter(i => i.style.display === 'none');
            if (G && !REDUCED) {
                const tl = G.timeline();
                if (hide.length)
                    tl.to(hide, { opacity: 0, scale: .95, duration: .26, ease: 'power2.in', stagger: .03 });
                tl.add(() => {
                    hide.forEach(i => i.style.display = 'none');
                    show.forEach(i => i.style.display = '');
                    entering.forEach(i => i.style.opacity = '0');
                });
                if (entering.length)
                    tl.fromTo(entering, { opacity: 0, scale: .95, y: 16 },
                        { opacity: 1, scale: 1, y: 0, duration: .55, ease: 'power3.out', stagger: .05, clearProps: 'transform,opacity' });
                tl.add(() => ST && ST.refresh());
            } else {
                hide.forEach(i => i.style.display = 'none');
                show.forEach(i => i.style.display = '');
            }
        };
        buttons.forEach(b => b.addEventListener('click', () => apply(b.dataset.cat)));
        const req = new URLSearchParams(location.search).get('cat');
        if (req && cats.includes(req)) apply(req);
    }

    /* ---------- portfolio modal (index only) ---------- */
    let closeModal = () => { };
    const modal = $('#pfModal');
    if (modal) {
        const modalPanel = $('.modal-panel', modal);
        let lastFocus = null;
        const openModal = item => {
            lastFocus = document.activeElement;
            $('#mImg').src = item.dataset.img || '';
            $('#mImg').alt = item.dataset.title || '';
            $('#mTitle').textContent = item.dataset.title || '';
            $('#mCat').textContent = item.dataset.catLabel || '';
            $('#mClient').textContent = item.dataset.client ? `کارفرما: ${item.dataset.client}` : '';
            $('#mClientWrap').classList.toggle('hidden', !item.dataset.client);
            $('#mDesc').textContent = item.dataset.desc || '';
            modal.classList.add('open');
            document.documentElement.classList.add('locked');
            lenis && lenis.stop();
            $('#modalClose').focus();
            if (G && !REDUCED)
                G.fromTo(modalPanel, { y: 44, opacity: 0, scale: .97 }, { y: 0, opacity: 1, scale: 1, duration: .5, ease: 'power3.out' });
        };
        closeModal = () => {
            if (!modal.classList.contains('open')) return;
            const done = () => {
                modal.classList.remove('open');
                document.documentElement.classList.remove('locked');
                lenis && lenis.start();
                lastFocus && lastFocus.focus();
            };
            if (G && !REDUCED) G.to(modalPanel, { y: 30, opacity: 0, duration: .28, ease: 'power2.in', onComplete: done });
            else done();
        };
        $$('.pf-item').forEach(item => {
            const btn = $('.pf-open', item);
            if (btn) btn.addEventListener('click', () => openModal(item));
        });
        $('#modalClose').addEventListener('click', closeModal);
        $('.modal-backdrop', modal).addEventListener('click', closeModal);
        const cta = $('#mCta');
        if (cta) cta.addEventListener('click', e => { e.preventDefault(); closeModal(); goToEl($('#contact') || document.body); });
    }
    addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeMenu(); } });

    /* ---------- testimonials slider (RTL transform-based, drag + snap) ---------- */
    const track = $('#tsTrack');
    if (track) {
        const cards = $$('.ts-card', track);
        const dotsWrap = $('#tsDots');
        const prevBtn = $('#tsPrev'), nextBtn = $('#tsNext');
        let index = 0, step = 340, maxX = 0, maxIndex = 0;
        let pd = null, dragOn = false, moved = 0;
        const getX = () => G ? parseFloat(G.getProperty(track, 'x')) : 0;
        const setX = (x, animate = true) => {
            if (G && !REDUCED && animate) G.to(track, { x, duration: .65, ease: 'power3.out' });
            else if (G) G.set(track, { x });
            else track.style.transform = `translateX(${x}px)`;
        };
        const updateUI = () => {
            if (prevBtn) prevBtn.disabled = index <= 0;
            if (nextBtn) nextBtn.disabled = index >= maxIndex;
            $$('.ts-dot', dotsWrap).forEach((d, i) => d.classList.toggle('active', i === index));
        };
        const goTo = i => { index = clamp(i, 0, maxIndex); setX(Math.min(index * step, maxX), true); updateUI(); };
        const buildDots = () => {
            if (!dotsWrap) return;
            dotsWrap.innerHTML = '';
            for (let i = 0; i <= maxIndex; i++) {
                const d = document.createElement('button');
                d.className = 'ts-dot';
                d.setAttribute('aria-label', `نظر ${faNum(i + 1)}`);
                d.addEventListener('click', () => goTo(i));
                dotsWrap.appendChild(d);
            }
        };
        const measure = () => {
            const gap = parseFloat(getComputedStyle(track).gap) || 24;
            step = (cards[0] ? cards[0].offsetWidth : 0) + gap;
            maxX = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
            maxIndex = Math.max(0, Math.round(maxX / step));
            index = clamp(index, 0, maxIndex);
            buildDots(); setX(Math.min(index * step, maxX), false); updateUI();
        };
        if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));
        /* drag — in RTL, dragging right (dx > 0) advances to the next card */
        track.addEventListener('pointerdown', e => {
            if (!e.isPrimary) return;
            pd = { x: e.clientX, base: getX(), id: e.pointerId };
            dragOn = false; moved = 0;
        });
        track.addEventListener('pointermove', e => {
            if (!pd) return;
            const dx = e.clientX - pd.x;
            if (!dragOn && Math.abs(dx) > 8) {
                dragOn = true;
                G && G.killTweensOf(track);
                track.classList.add('dragging');
                try { track.setPointerCapture(pd.id); } catch (_) { }
            }
            if (!dragOn) return;
            moved = dx;
            let x = pd.base + dx;
            if (x < 0) x *= .25;
            else if (x > maxX) x = maxX + (x - maxX) * .25;
            if (G) G.set(track, { x }); else track.style.transform = `translateX(${x}px)`;
        });
        const release = () => {
            if (!pd) return;
            if (dragOn) (Math.abs(moved) > 55) ? goTo(index + (moved > 0 ? 1 : -1)) : setX(Math.min(index * step, maxX), true);
            track.classList.remove('dragging');
            pd = null; dragOn = false;
        };
        track.addEventListener('pointerup', release);
        track.addEventListener('pointercancel', release);
        track.addEventListener('click', e => {
            if (Math.abs(moved) > 8) { e.preventDefault(); e.stopPropagation(); }
        }, true);
        addEventListener('resize', measure);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
        measure();
    }

    /* ---------- media: time format + players ---------- */
    const fmtTime = s => {
        if (!isFinite(s) || s < 0) s = 0;
        const m = Math.floor(s / 60), sec = Math.floor(s % 60);
        return `${faNum(m)}:${faNum(String(sec).padStart(2, '0'))}`;
    };
    $$('.ts-video').forEach(card => {
        const video = $('video', card);
        if (!video) return;
        const fill = $('.v-fill', card), cur = $('.v-cur', card), dur = $('.v-dur', card), bar = $('.v-track', card);
        const toggle = () => video.paused ? video.play().catch(() => { }) : video.pause();
        $('.v-overlay', card).addEventListener('click', toggle);
        video.addEventListener('click', toggle);
        ['play', 'playing'].forEach(ev => video.addEventListener(ev, () => card.classList.add('playing')));
        ['pause', 'ended', 'waiting'].forEach(ev => video.addEventListener(ev, () => card.classList.remove('playing')));
        video.addEventListener('loadedmetadata', () => dur.textContent = fmtTime(video.duration));
        video.addEventListener('timeupdate', () => {
            fill.style.width = (video.duration ? (video.currentTime / video.duration) * 100 : 0) + '%';
            cur.textContent = fmtTime(video.currentTime);
        });
        bar.addEventListener('click', e => {           /* RTL: progress fills right → left */
            const r = bar.getBoundingClientRect();
            const ratio = clamp((r.right - e.clientX) / r.width, 0, 1);
            if (video.duration) video.currentTime = ratio * video.duration;
        });
    });
    $$('.ts-audio').forEach(card => {
        const audio = $('audio', card), wave = $('.wave', card);
        const cur = $('.a-cur', card), dur = $('.a-dur', card);
        if (!audio || !wave) return;
        const BARS = 44;
        for (let i = 0; i < BARS; i++) {
            const b = document.createElement('span');
            b.className = 'w-bar';
            b.style.height = clamp(Math.round(4 + 26 * Math.abs(Math.sin(i * .55) * .7 + .3 * Math.sin(i * 1.9))), 5, 30) + 'px';
            wave.appendChild(b);
        }
        const bars = $$('.w-bar', wave);
        $('.a-btn', card).addEventListener('click', () => {
            if (audio.paused) audio.play().catch(() => toast('فایل صوتی نمونه در حال حاضر در دسترس نیست.'));
            else audio.pause();
        });
        ['play', 'playing'].forEach(ev => audio.addEventListener(ev, () => card.classList.add('playing')));
        ['pause', 'ended', 'waiting'].forEach(ev => audio.addEventListener(ev, () => card.classList.remove('playing')));
        audio.addEventListener('loadedmetadata', () => dur.textContent = fmtTime(audio.duration));
        audio.addEventListener('error', () => dur.textContent = '--:--');
        audio.addEventListener('timeupdate', () => {
            const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
            bars.forEach((b, i) => b.classList.toggle('on', (i / BARS) < ratio));
            cur.textContent = fmtTime(audio.currentTime);
        });
        wave.addEventListener('click', e => {           /* RTL seek, right → left */
            const r = wave.getBoundingClientRect();
            const ratio = clamp((r.right - e.clientX) / r.width, 0, 1);
            if (audio.duration) audio.currentTime = ratio * audio.duration;
        });
    });

    /* ---------- FAQ accordion ---------- */
    $$('.faq-item').forEach(item => {
        const q = $('.faq-q', item);
        if (!q) return;
        q.addEventListener('click', () => {
            const open = item.classList.contains('open');
            $$('.faq-item.open').forEach(o => {
                o.classList.remove('open');
                const b = $('.faq-q', o); if (b) b.setAttribute('aria-expanded', 'false');
            });
            if (!open) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
        });
    });

    /* ---------- contact form ---------- */
    const form = $('#contactForm');
    if (form) {
        const inputs = $$('.float-field input, .float-field textarea', form);
        inputs.forEach(el => el.addEventListener('input', () => {
            el.classList.toggle('filled', !!el.value);
            el.closest('.float-field').classList.remove('has-error');
        }));
        const valid = el => {
            const v = el.value.trim();
            if (el.dataset.optional === 'true' && !v) return true;
            if (el.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            if (el.type === 'tel') return /^[0-9+\-\s()]{8,}$/.test(v);
            return el.tagName === 'TEXTAREA' ? v.length > 3 : v.length > 1;
        };
        form.addEventListener('submit', e => {
            e.preventDefault();
            let ok = true;
            inputs.forEach(el => {
                const good = valid(el);
                el.closest('.float-field').classList.toggle('has-error', !good);
                if (!good) ok = false;
            });
            if (!ok) { toast('لطفاً فیلدهای مشخص‌شده را کامل کنید.'); return; }
            /* TODO: replace with a real endpoint, e.g. fetch('/api/contact', {method:'POST', body:new FormData(form)}) */
            const btn = $('#submitBtn');
            if (btn) { btn.classList.add('is-sent'); btn.disabled = true; }
            toast('پیام شما ثبت شد؛ کارشناسان سی‌یاس در اولین فرصت با شما تماس می‌گیرند.');
            form.reset();
            inputs.forEach(el => el.classList.remove('filled'));
            setTimeout(() => { if (btn) { btn.classList.remove('is-sent'); btn.disabled = false; } }, 4000);
        });
    }

    /* ---------- custom cursor (fine pointers only) ---------- */
    if (G && FINE && !REDUCED) {
        document.body.classList.add('has-cursor');
        const dot = $('#cDot'), ring = $('#cRing');
        if (dot && ring) {
            G.set([dot, ring], { xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight / 2 });
            const dX = G.quickTo(dot, 'x', { duration: .08 }), dY = G.quickTo(dot, 'y', { duration: .08 });
            const rX = G.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), rY = G.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
            addEventListener('mousemove', e => { dX(e.clientX); dY(e.clientY); rX(e.clientX); rY(e.clientY); });
            $$('a, button, [data-tilt]').forEach(el => {
                el.addEventListener('mouseenter', () => ring.classList.add('big'));
                el.addEventListener('mouseleave', () => ring.classList.remove('big'));
            });
            $$('input, textarea, select').forEach(el => {
                el.addEventListener('mouseenter', () => document.body.classList.add('cursor-off'));
                el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-off'));
            });
        }
    }

    /* ---------- Persian year ---------- */
    const yEl = $('#year');
    if (yEl) { try { yEl.textContent = new Date().toLocaleDateString('fa-IR', { year: 'numeric' }); } catch (_) { } }
})();