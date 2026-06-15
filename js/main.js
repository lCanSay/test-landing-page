/* ===================================================
   KOREANA - Main JavaScript (Optimized & Unified)
   =================================================== */

const currentLang = document.documentElement.lang || 'ru';

let scrollPosition = 0;
function lockScroll() {
    scrollPosition = window.pageYOffset;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
}
function unlockScroll() {
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('width');
    
    window.scrollTo(0, scrollPosition);
    
    // Wait for the next tick to re-enable smooth scrolling
    setTimeout(() => {
        document.documentElement.style.scrollBehavior = originalScrollBehavior;
    }, 0);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    initLazyLoading();
    initHeader();
    initMobileMenu();
    initScrollAnimations();
    initCounters();
    initBrandFilter();
    initBrandModals();
    initBentoModals();
    initSmoothScroll();
    initParticles();
    initParallax();
    initVideoAutoplay();
});

/* ---------- Lazy Loading (IntersectionObserver) ---------- */
function initLazyLoading() {
    // Larger margin on mobile to preload images earlier (mobile networks are slower)
    const isMobile = window.innerWidth <= 768;
    const rootMarginValue = isMobile ? '300px 0px' : '400px 0px';

    // --- 1. Lazy load <img data-src> ---
    const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const realSrc = img.dataset.src;
                if (realSrc) {
                    img.src = realSrc;
                    img.onload = () => {
                        img.classList.add('lazy-loaded');
                        img.removeAttribute('data-src');
                        // Remove shimmer from parent if applicable
                        const shimmerParent = img.closest('.lazy-shimmer');
                        if (shimmerParent) {
                            shimmerParent.classList.add('shimmer-done');
                        }
                    };
                    img.onerror = () => {
                        // Still show something on error
                        img.classList.add('lazy-loaded');
                        img.removeAttribute('data-src');
                    };
                }
                imgObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: rootMarginValue,
        threshold: 0
    });

    // Observe all images with data-src (excluding those inside hidden modals)
    document.querySelectorAll('img[data-src]').forEach(img => {
        // Skip images inside detail-modal (they'll be loaded when modal opens)
        const inModal = img.closest('.detail-modal');
        if (inModal) return;

        // Add shimmer to parent containers
        const mediaParent = img.closest('.brand-card__media, .timeline__photo, .bento-item');
        if (mediaParent) {
            mediaParent.classList.add('lazy-shimmer');
        }

        imgObserver.observe(img);
    });

    // --- 2. Lazy load background images (data-bg) ---
    const bgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const bgUrl = el.dataset.bg;
                if (bgUrl) {
                    // Preload the image before setting as background
                    const preloadImg = new Image();
                    preloadImg.onload = () => {
                        el.style.backgroundImage = `url('${bgUrl}')`;
                        el.removeAttribute('data-bg');
                    };
                    preloadImg.src = bgUrl;
                }
                bgObserver.unobserve(el);
            }
        });
    }, {
        rootMargin: rootMarginValue,
        threshold: 0
    });

    document.querySelectorAll('[data-bg]').forEach(el => {
        bgObserver.observe(el);
    });

    // --- 3. Lazy load modal images when modal opens ---
    // Store observer reference globally so modals can trigger it
    window._lazyImgObserver = imgObserver;
}

/**
 * Load all lazy images inside a given container (used when modals open).
 */
function loadLazyImagesIn(container) {
    if (!container) return;
    container.querySelectorAll('img[data-src]').forEach(img => {
        const realSrc = img.dataset.src;
        if (realSrc) {
            img.src = realSrc;
            img.onload = () => {
                img.classList.add('lazy-loaded');
                img.removeAttribute('data-src');
            };
            img.onerror = () => {
                img.classList.add('lazy-loaded');
                img.removeAttribute('data-src');
            };
        }
    });
}

/* ---------- Handle Low Power Mode video autoplay ---------- */
function initVideoAutoplay() {
    const video = document.querySelector('.hero__video');
    if (!video) return;

    // On mobile: remove video entirely and keep poster image for performance
    // The 2.4MB video is too heavy for mobile networks
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        // Use Connection API to check if we're on a slow connection
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlowConnection = conn && (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.effectiveType === '3g');

        if (isSlowConnection) {
            video.removeAttribute('autoplay');
            video.preload = 'none';
            // Remove the source to prevent downloading
            const source = video.querySelector('source');
            if (source) source.remove();
            return;
        }
    }

    const promise = video.play();
    if (promise !== undefined) {
        promise.catch(() => {
            // Autoplay prevented (e.g., Low Power Mode on iOS)
            // Remove the video to prevent the unclickable play button from showing
            video.remove();
        });
    }
}

/* ---------- Generate Background Geo-Shapes (12 fixed, optimised) ---------- */
function initParticles() {
    // Generate shapes only once
    if (document.querySelector('.geo-container')) return;

    const container = document.createElement('div');
    container.className = 'geo-container';

    // Ensure the container spans the entire scrollable height of the page
    const updateHeight = () => {
        container.style.height = document.documentElement.scrollHeight + 'px';
    };
    updateHeight();

    // Update after all images and resources load
    window.addEventListener('load', updateHeight);

    // Update on resize with basic throttling/debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateHeight, 150);
    });

    document.body.appendChild(container);

    // 22 fixed shapes — solid triangles & squares only.
    // Two-element structure is intentional:
    //   wrapper → JS sets translateY for scroll parallax
    //   inner   → CSS animation drives its own transform (drift/rotate)
    // Shapes 13+ reuse anim 1–12 with different durations to avoid visual synchronisation.
    const shapes = [
        // ── Block 1: Avoid Hero (0-12%), start at 14% ────────────────────────
        { type: 'square',   size: 160, top: '14%', left: '12%', speed: 0.08, anim:  1, dur: 32 },
        { type: 'triangle', size: 190, top: '16%', left: '28%', speed: 0.15, anim:  2, dur: 28 },
        { type: 'square',   size: 140, top: '18%', left: '85%', speed: 0.11, anim:  5, dur: 41 },
        { type: 'triangle', size: 180, top: '21%', left: '72%', speed: 0.19, anim:  3, dur: 37 },
        { type: 'square',   size: 200, top: '24%', left: '22%', speed: 0.20, anim:  4, dur: 35 },
        // ── Block 2: Avoid Mission (25-33%), start at 34% ─────────────────────
        { type: 'triangle', size: 150, top: '35%', left: '88%', speed: 0.10, anim:  6, dur: 45 },
        { type: 'triangle', size: 170, top: '38%', left: '68%', speed: 0.23, anim:  8, dur: 31 },
        { type: 'square',   size: 190, top: '40%', left: '15%', speed: 0.16, anim:  7, dur: 44 },
        { type: 'square',   size: 210, top: '44%', left: '32%', speed: 0.13, anim:  9, dur: 29 },
        { type: 'triangle', size: 200, top: '46%', left:  '8%', speed: 0.25, anim: 11, dur: 38 },
        { type: 'triangle', size: 150, top: '49%', left: '75%', speed: 0.09, anim:  2, dur: 48 },
        { type: 'square',   size: 180, top: '53%', left: '92%', speed: 0.08, anim: 10, dur: 42 },
        { type: 'triangle', size: 170, top: '56%', left: '25%', speed: 0.17, anim:  1, dur: 36 },
        { type: 'square',   size: 190, top: '58%', left: '18%', speed: 0.21, anim:  4, dur: 27 },
        { type: 'triangle', size: 180, top: '62%', left: '82%', speed: 0.12, anim:  6, dur: 43 },
        { type: 'square',   size: 150, top: '65%', left: '65%', speed: 0.14, anim:  3, dur: 33 },
        { type: 'triangle', size: 160, top: '68%', left: '10%', speed: 0.18, anim:  9, dur: 39 },
        { type: 'square',   size: 210, top: '72%', left: '80%', speed: 0.10, anim:  7, dur: 46 },
        { type: 'triangle', size: 180, top: '75%', left: '90%', speed: 0.15, anim: 12, dur: 30 },
        { type: 'square',   size: 170, top: '78%', left: '28%', speed: 0.22, anim:  5, dur: 40 },
        // ── Block 3: Avoid Partners Form (80-89%), start at 91% ──────────────
        { type: 'triangle', size: 150, top: '92%', left: '18%', speed: 0.08, anim: 11, dur: 35 },
        { type: 'square',   size: 180, top: '97%', left: '78%', speed: 0.20, anim:  8, dur: 28 },
    ];

    shapes.forEach((s, i) => {
        // Wrapper: positioned absolutely, receives JS parallax translateY
        const wrapper = document.createElement('div');
        wrapper.className = 'geo-wrapper';
        wrapper.dataset.speed = s.speed;
        wrapper.dataset.index = i;   // used by CSS mobile media query
        wrapper.style.top  = s.top;
        wrapper.style.left = s.left;

        // Inner: the visible shape, driven by CSS keyframe animation only
        const inner = document.createElement('div');
        inner.className = `geo-shape geo-shape--${s.type}`;
        inner.style.width  = s.size + 'px';
        inner.style.height = s.size + 'px';
        inner.style.animation = `geo-drift-${s.anim} ${s.dur}s infinite alternate ease-in-out`;

        wrapper.appendChild(inner);
        container.appendChild(wrapper);
    });
}

/* ---------- Parallax effect for Hero & Background Geo-Shapes ---------- */
function initParallax() {
    const heroContent = document.querySelector('.hero__content');
    let geoWrappers = [];
    let isTicking = false;

    // Cache wrapper elements once to avoid repeated DOM queries on scroll
    const initCache = () => {
        const elements = document.querySelectorAll('.geo-container .geo-wrapper');
        geoWrappers = Array.from(elements).map(el => ({
            el: el,
            speed: parseFloat(el.dataset.speed || 0.15),
            // baseY is the absolute position of the shape relative to the top of the document.
            // By capturing this, we can calculate parallax relative to when the shape is actually on screen.
            baseY: el.offsetTop 
        }));
    };

    const update = () => {
        const scroll = window.scrollY;

        // Hero Parallax (Only run when visible in viewport)
        if (heroContent && scroll < window.innerHeight) {
            // translateZ(0) triggers hardware GPU acceleration for smooth compositing
            heroContent.style.transform = `translateY(${scroll * 0.3}px) translateZ(0)`;
            heroContent.style.opacity = 1 - (scroll / window.innerHeight) * 1.5;
        }

        // Geo-Shapes Parallax — JS only sets translateY on the wrapper.
        // The inner .geo-shape element handles its own CSS animation independently.
        if (geoWrappers.length === 0) {
            initCache();
        }

        const centerOffset = window.innerHeight / 2;

        geoWrappers.forEach(w => {
            // Recalculate based on how far the scroll is from the shape's base position.
            // When the shape is in the middle of the screen (scroll + centerOffset == w.baseY),
            // relativeScroll is 0, so the shape is exactly at its authored CSS position.
            // This prevents shapes from "drifting" completely out of their sections on long pages.
            const relativeScroll = scroll + centerOffset - w.baseY;
            w.el.style.transform = `translateY(${relativeScroll * -w.speed}px) translateZ(0)`;
        });

        isTicking = false;
    };

    window.addEventListener('scroll', () => {
        if (!isTicking) {
            requestAnimationFrame(update);
            isTicking = true;
        }
    }, { passive: true });

    // Run once on load to position shapes correctly
    initCache();
    update();
}


/* ---------- Header scroll effect ---------- */
function initHeader() {
    const header = document.getElementById('header');
    let ticking = false;

    const updateHeader = () => {
        if (document.body.style.position === 'fixed') {
            ticking = false;
            return;
        }
        header.classList.toggle('scrolled', window.scrollY > 60);
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });
    
    updateHeader();
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        const isActive = nav.classList.contains('active');

        burger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        if (currentLang === 'en') {
            burger.setAttribute('aria-label', isActive ? 'Close menu' : 'Open menu');
        } else {
            burger.setAttribute('aria-label', isActive ? 'Закрыть меню' : 'Открыть меню');
        }

        if (isActive) {
            lockScroll();
        } else {
            unlockScroll();
        }
    });

    // Close on link click
    nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('active');
            burger.setAttribute('aria-expanded', 'false');
            if (currentLang === 'en') {
                burger.setAttribute('aria-label', 'Open menu');
            } else {
                burger.setAttribute('aria-label', 'Открыть меню');
            }
            unlockScroll();
        });
    });
}

/* ---------- Scroll animations (fade-in) ---------- */
function initScrollAnimations() {
    const elements = document.querySelectorAll(
        '.feature-card, .stat-card, .why-card, .brand-card, .partner-logo, .vacancy-card, .section-header, .about__grid, .partner-form__wrapper, .mission-card, .timeline__item, .supplier-card, .partner-card, .bento-item'
    );

    elements.forEach(el => el.classList.add('fade-in'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    const locale = currentLang === 'en' ? 'en-US' : 'ru-RU';

    // Pre-calculate widths to prevent layout shift
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count, 10);
        counter.textContent = target.toLocaleString(locale);
        const rect = counter.getBoundingClientRect();
        counter.style.minWidth = rect.width + 'px';
        counter.style.textAlign = 'right';
        counter.textContent = '0';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();
    const locale = currentLang === 'en' ? 'en-US' : 'ru-RU';

    if (el.dataset.animId) {
        cancelAnimationFrame(parseInt(el.dataset.animId, 10));
    }

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.round(eased * target);

        el.textContent = current.toLocaleString(locale);

        if (progress < 1) {
            el.dataset.animId = requestAnimationFrame(step);
        } else {
            delete el.dataset.animId;
        }
    }

    el.dataset.animId = requestAnimationFrame(step);
}

/* ---------- Brand filter ---------- */
function initBrandFilter() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.brand-card');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            cards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeInCard 0.4s ease forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// Fade-in animation for filtered cards
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInCard {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

/* ---------- Brand data (Bilingual) ---------- */
const brandData = {
    kerasys: {
        name: 'KERASYS',
        category: currentLang === 'en' ? 'Hair Care' : 'Уход за волосами',
        description: currentLang === 'en'
            ? 'KERASYS was created to make professional hair care affordable and convenient. Products are developed based on advanced Korean hair care technologies.'
            : 'Бренд KERASYS создан для того, чтобы сделать профессиональный уход за волосами доступным и удобным. Продукция разработана на основе передовых корейских технологий ухода за волосами.',
        series: currentLang === 'en'
            ? [
                '<strong>HAIR CLINIC</strong> - clinical series with 17 types of amino acids and proteins for intensive restoration of damaged hair',
                '<strong>PERFUME</strong> - perfumed series with unique scents for every look',
                '<strong>ADVANCED</strong> - ampoule series with a special formula for comprehensive care',
                '<strong>PRO ACTIVE MAN</strong> - men\'s line of shampoos'
            ]
            : [
                '<strong>HAIR CLINIC</strong> - клиническая серия с 17 видами аминокислот и протеинами для интенсивного восстановления повреждённых волос',
                '<strong>PERFUME</strong> - парфюмированная серия с уникальными ароматами для каждого образа',
                '<strong>ADVANCED</strong> - ампульная серия со специальной формулой для комплексного ухода',
                '<strong>PRO ACTIVE MAN</strong> - мужская линейка шампуней'
            ],
        images: [
            'assets/products/kerasys1.webp',
            'assets/products/kerasys2.webp',
            'assets/products/kerasys4.webp',
            'assets/products/kerasys5.webp',
            'assets/products/kerasys6.webp'
        ]
    },
    '2080': {
        name: '2080',
        category: currentLang === 'en' ? 'Oral Hygiene' : 'Гигиена полости рта',
        description: currentLang === 'en'
            ? 'AEKYUNG experts have spent 25 years developing unique toothpaste formulas aimed at solving various oral care problems.'
            : 'Эксперты компании AEKYUNG на протяжении 25 лет разрабатывают уникальные формулы зубных паст, направленные на решение различных проблем полости рта.',
        series: currentLang === 'en'
            ? [
                '<strong>TOTAL</strong> - core series for daily care',
                '<strong>PRO</strong> - preventive series',
                '<strong>DR.CLINIC</strong> - therapeutic and preventive series',
                'Reduces the risk of tartar formation by 4 times',
                'Reduces tooth sensitivity by 96% in 2 weeks',
                'Whitens enamel by 88% in 8 weeks'
            ]
            : [
                '<strong>TOTAL</strong> - базовая серия для ежедневного ухода',
                '<strong>PRO</strong> - профилактическая серия',
                '<strong>DR.CLINIC</strong> - лечебно-профилактическая серия',
                'Снижает риск образования зубного камня в 4 раза',
                'Снижает чувствительность зубов на 96% за 2 недели',
                'Осветляет эмаль на 88% за 8 недель'
            ],
        images: [
            'assets/products/2080-1.webp',
            'assets/products/2080-2.webp',
            'assets/products/2080-3.webp'
        ]
    },
    showermate: {
        name: 'SHOWERMATE',
        category: currentLang === 'en' ? 'Body Care' : 'Уход за телом',
        description: currentLang === 'en'
            ? 'SHOWERMATE shower gels with natural ingredients provide gentle skin care. Each series is designed for specific skin needs.'
            : 'Гели для душа SHOWERMATE с натуральными компонентами оказывают мягкий уход за кожей. Каждая серия создана для особых потребностей кожи.',
        series: currentLang === 'en'
            ? [
                '<strong>NATURAL</strong> - natural extract series for daily care',
                '<strong>BOTANIC</strong> - herbal and floral series for sensitive skin',
                '<strong>FLOWER PERFUME</strong> - perfumed series with floral extracts'
            ]
            : [
                '<strong>NATURAL</strong> - серия с натуральными экстрактами для ежедневного ухода',
                '<strong>BOTANIC</strong> - серия с травами и цветами для чувствительной кожи',
                '<strong>FLOWER PERFUME</strong> - парфюмированная серия с цветочными экстрактами'
            ],
        images: [
            'assets/products/showermate1.webp',
            'assets/products/showermate2.webp',
            'assets/products/showermate3.webp'
        ]
    },
    farmstay: {
        name: 'FARMSTAY',
        category: currentLang === 'en' ? 'Cosmetics' : 'Косметика',
        description: currentLang === 'en'
            ? 'FarmStay products are for those who value natural skincare and makeup. A step-by-step skincare system following Korean methods.'
            : 'Продукция FarmStay создана для тех, кому важна натуральная уходовая и декоративная косметика. Поэтапная система ухода за кожей по корейской технологии.',
        series: currentLang === 'en'
            ? [
                'Cleansing foams and peelings',
                'Sheet and hydrogel masks',
                'Eye patches',
                'Toners and emulsions',
                'Moisturizing and nourishing creams',
                'Serums and ampoules'
            ]
            : [
                'Пенки для умывания и пилинги',
                'Тканевые и гидрогелевые маски',
                'Патчи для области вокруг глаз',
                'Тонеры и эмульсии',
                'Увлажняющие и питательные кремы',
                'Сыворотки и ампулы'
            ],
        images: [
            'assets/products/farmstay1.webp',
            'assets/products/farmstay2.webp',
            'assets/products/farmstay3.webp'
        ]
    },
    secretday: {
        name: 'SECRETDAY',
        category: currentLang === 'en' ? 'Feminine Hygiene' : 'Женская гигиена',
        description: currentLang === 'en'
            ? 'SECRETDAY sanitary pads are developed with women\'s health and comfort in mind. The products meet the highest safety standards.'
            : 'Гигиенические прокладки SECRETDAY разработаны с заботой о здоровье и комфорте женщин. Продукция соответствует высочайшим стандартам безопасности.',
        series: currentLang === 'en'
            ? [
                '<strong>LOVE</strong> - soft surface for maximum comfort',
                '<strong>COTTON</strong> - 100% natural cotton',
                '<strong>FRESH</strong> - organic vegan line'
            ]
            : [
                '<strong>LOVE</strong> - нежная поверхность для максимального комфорта',
                '<strong>COTTON</strong> - 100% натуральный хлопок',
                '<strong>FRESH</strong> - органическая веганская линейка'
            ],
        images: [
            'assets/products/secretday1.webp',
            'assets/products/secretday2.webp',
            'assets/products/secretday3.webp'
        ]
    },
    perfect: {
        name: 'PERFECT',
        category: currentLang === 'en' ? 'Household Chemicals' : 'Бытовая химия',
        description: currentLang === 'en'
            ? 'PERFECT concentrated laundry powder effectively removes all types of stains. Only 50 grams per wash is needed – 1 kg lasts for a month of daily use.'
            : 'Концентрированный стиральный порошок PERFECT эффективно удаляет все виды загрязнений. Достаточно всего 50 граммов на стирку - 1 кг хватает на месяц ежедневного использования.',
        series: currentLang === 'en'
            ? [
                'Eliminates 99.9% of bacteria from fabric fibers',
                'Phosphate-free – completely safe',
                'Hypoallergenic composition',
                'Economical use – 50 g per wash'
            ]
            : [
                'Устраняет 99,9% бактерий из волокон ткани',
                'Не содержит фосфатов - абсолютно безопасен',
                'Гипоаллергенный состав',
                'Экономичный расход - 50 г на стирку'
            ],
        images: [
            'assets/products/perfect1.webp',
            'assets/products/perfect2.webp',
            'assets/products/perfect3.webp'
        ]
    },
    wool: {
        name: 'WOOL SHAMPOO',
        category: currentLang === 'en' ? 'Household Chemicals' : 'Бытовая химия',
        description: currentLang === 'en'
            ? 'WOOL SHAMPOO is an innovative product for the gentle washing of delicate fabrics, officially certified by WoolMark.'
            : 'WOOL SHAMPOO - инновационное средство для бережной стирки деликатных тканей с официальной сертификацией WoolMark.',
        series: currentLang === 'en'
            ? [
                'Certified by WoolMark in Korea',
                'Hypoallergenic cleaning ingredients',
                'Recommended for washing baby clothes',
                'Gentle care for wool, silk, and delicate fabrics'
            ]
            : [
                'Сертифицировано WoolMark в Корее',
                'Гипоаллергенные чистящие компоненты',
                'Рекомендуется для стирки детского белья',
                'Бережный уход за шерстью, шёлком и деликатными тканями'
            ],
        images: [
            'assets/products/wool1.webp',
            'assets/products/wool2.webp',
            'assets/products/wool3.webp'
        ]
    },
    trio: {
        name: 'TRIO',
        category: currentLang === 'en' ? 'Household Chemicals' : 'Бытовая химия',
        description: currentLang === 'en'
            ? 'TRIO is a universal detergent for washing dishes, fruits, and vegetables. It tackles even hardened grease while being gentle on the hands.'
            : 'TRIO - универсальное средство для мытья посуды, фруктов и овощей. Справляется даже с застывшим жиром, при этом бережно воздействует на кожу рук.',
        series: currentLang === 'en'
            ? [
                'Suitable for dishes, fruits, and vegetables',
                'Kills 99.9% of bacteria and fungi',
                'Removes unpleasant odors',
                'Does not cause dryness or skin irritation'
            ]
            : [
                'Подходит для мытья посуды, фруктов и овощей',
                'Уничтожает 99,9% бактерий и грибков',
                'Удаляет неприятные запахи',
                'Не вызывает сухости и раздражения кожи'
            ],
        images: [
            'assets/products/trio1.webp',
            'assets/products/trio2.webp',
            'assets/products/trio3.webp'
        ]
    },
    mukunghwa: {
        name: 'MUKUNGHWA',
        category: currentLang === 'en' ? 'Household Chemicals' : 'Бытовая химия',
        description: currentLang === 'en'
            ? 'MUKUNGHWA products embody natural cleanliness and environmental care, with formulas based on plant components.'
            : 'Продукция MUKUNGHWA - воплощение натуральной чистоты и заботы о природе. Составы на основе растительных компонентов.',
        series: currentLang === 'en'
            ? [
                '<strong>O\'CLEAN</strong> - products based on soapberry fruit',
                '<strong>VIU</strong> - antibacterial super-concentrated fabric softener',
                'Natural plant-based soap',
                'Eco-friendly cleaning products'
            ]
            : [
                '<strong>O\'CLEAN</strong> - средства на основе плодов мыльного дерева',
                '<strong>VIU</strong> - антибактериальный суперконцентрированный ополаскиватель',
                'Натуральное мыло на растительной основе',
                'Экологичные чистящие средства'
            ],
        images: [
            'assets/products/muku-viu1.webp',
            'assets/products/muku-viu2.webp',
            'assets/products/muku-viu3.webp'
        ]
    }
};

function initBrandModals() {
    const modal = document.getElementById('brand-modal');
    const modalBody = document.getElementById('modal-body');
    const backdrop = modal.querySelector('.modal__backdrop');
    const closeBtn = modal.querySelector('.modal__close');
    let animFrame = null;

    /* Easing helpers */
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const easeIn = t => Math.pow(t, 2);

    function animateBackdrop(fromBlur, toBlur, fromAlpha, toAlpha, duration, onDone) {
        if (animFrame) cancelAnimationFrame(animFrame);
        const start = performance.now();
        function step(now) {
            const t = Math.min((now - start) / duration, 1);
            const ease = toBlur > fromBlur ? easeOut(t) : easeIn(t);
            const blur = fromBlur + (toBlur - fromBlur) * ease;
            const alpha = fromAlpha + (toAlpha - fromAlpha) * ease;
            backdrop.style.backdropFilter = `blur(${blur.toFixed(2)}px)`;
            backdrop.style.webkitBackdropFilter = `blur(${blur.toFixed(2)}px)`;
            backdrop.style.background = `rgba(0,0,0,${alpha.toFixed(3)})`;
            if (t < 1) {
                animFrame = requestAnimationFrame(step);
            } else {
                animFrame = null;
                if (onDone) onDone();
            }
        }
        animFrame = requestAnimationFrame(step);
    }

    document.querySelectorAll('.brand-card').forEach(card => {
        card.addEventListener('click', () => {
            const brand = card.dataset.brand;
            const data = brandData[brand];
            if (!data) return;

            let seriesHtml = '';
            if (data.series && data.series.length) {
                seriesHtml = `
                    <div class="v2-features">
                        <p>${currentLang === 'en' ? 'Key products and series:' : 'Ключевые продукты и серии:'}</p>
                        <ul class="bm-features">${data.series.map(s => `<li>${s}</li>`).join('')}</ul>
                    </div>
                `;
            }

            // Fallback default Unsplash images
            const defaultImg1 = 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1000&auto=format&fit=crop';
            const defaultImg2 = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop';
            const defaultImg3 = 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1000&auto=format&fit=crop';

            // Get brand images
            let img1, img2, img3;
            let useDirectImg = false;
            if (data.images && data.images.length >= 3) {
                img1 = data.images[0];
                img2 = data.images[1];
                img3 = data.images[2];
                useDirectImg = true;
            } else {
                img1 = `assets/products/${brand}_1.jpg`;
                img2 = `assets/products/${brand}_2.jpg`;
                img3 = `assets/products/${brand}_3.jpg`;
            }

            // Extension chain helper: try jpg -> png -> webp -> fallback
            const makeImgHtml = (srcJpg, srcPng, srcWebp, fallback, altText, extraClass = '') => {
                return `
                    <div class="v2-grid-item ${extraClass}">
                        <img src="${srcJpg}" alt="${altText}" 
                             onerror="this.onerror=null; this.src='${srcPng}'; this.onerror=function(){ this.onerror=null; this.src='${srcWebp}'; this.onerror=function(){ this.onerror=null; this.src='${fallback}'; } }" />
                    </div>
                `;
            };

            let gridHtml = '';
            if (useDirectImg) {
                if (data.images.length === 5) {
                    gridHtml = data.images.map((src, i) => `
                        <div class="v2-grid-item ${i === 0 ? 'wide' : ''}">
                            <img src="${src}" alt="${data.name} ${i + 1}" onerror="this.src='${defaultImg1}'" />
                        </div>
                    `).join('');
                } else {
                    gridHtml = `
                        <div class="v2-grid-item large">
                            <img src="${img1}" alt="${data.name} 1" onerror="this.src='${defaultImg1}'" />
                        </div>
                        <div class="v2-grid-item">
                            <img src="${img2}" alt="${data.name} 2" onerror="this.src='${defaultImg2}'" />
                        </div>
                        <div class="v2-grid-item">
                            <img src="${img3}" alt="${data.name} 3" onerror="this.src='${defaultImg3}'" />
                        </div>
                    `;
                }
            } else {
                gridHtml = `
                    ${makeImgHtml(img1, `assets/products/${brand}_1.png`, `assets/products/${brand}_1.webp`, defaultImg1, `${data.name} 1`, 'large')}
                    ${makeImgHtml(img2, `assets/products/${brand}_2.png`, `assets/products/${brand}_2.webp`, defaultImg2, `${data.name} 2`)}
                    ${makeImgHtml(img3, `assets/products/${brand}_3.png`, `assets/products/${brand}_3.webp`, defaultImg3, `${data.name} 3`)}
                `;
            }

            modalBody.innerHTML = `
                <div class="v2-header">
                    <span class="bm-tag">${data.category}</span>
                    <h2 class="bm-title">${data.name}</h2>
                    <p class="bm-desc">${data.description}</p>
                    ${seriesHtml}
                </div>

                <div class="v2-grid">
                    ${gridHtml}
                </div>
            `;

            modal.classList.add('active');
            modal.querySelector('.modal__content').scrollTop = 0;
            if (modalBody) modalBody.scrollTop = 0;
            lockScroll();
            animateBackdrop(0, 8, 0, 0.5, 400);
        });
    });

    function closeModal() {
        animateBackdrop(8, 0, 0.5, 0, 300, () => {
            modal.classList.remove('active');
            // Only restore scroll if no other active modal is open
            const activeModals = document.querySelectorAll('.detail-modal.active, #brand-modal.active');
            if (activeModals.length === 0) {
                unlockScroll();
            }
            backdrop.style.backdropFilter = '';
            backdrop.style.webkitBackdropFilter = '';
            backdrop.style.background = '';
        });
    }

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
}

/* ---------- Smooth scroll ---------- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                // Force show elements in target section
                target.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));

                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* ---------- Bento Modals & Slider Manager ---------- */
function initBentoModals() {
    const bentoItems = document.querySelectorAll('.bento-item[data-modal]');

    bentoItems.forEach(item => {
        const modalId = item.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const slider = modal.querySelector('.modal-gallery');
        const dotsContainer = modal.querySelector('.modal-gallery-nav');
        const closeBtn = modal.querySelector('.detail-modal__close');

        let dots = [];
        let totalSlides = 0;
        let currentSlide = 0;
        let sliderInterval = null;

        if (slider && dotsContainer) {
            dots = Array.from(dotsContainer.querySelectorAll('.modal-gallery-dot'));
            totalSlides = slider.querySelectorAll('img').length;
        }

        function goToSlide(index) {
            if (!slider || dots.length === 0) return;
            currentSlide = index;
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentSlide].classList.add('active');
        }

        function nextSlide() {
            if (totalSlides > 0) {
                goToSlide((currentSlide + 1) % totalSlides);
            }
        }

        function startAutoSlide() {
            if (!slider) return;
            stopAutoSlide();
            sliderInterval = setInterval(nextSlide, 3000);
        }

        function stopAutoSlide() {
            if (sliderInterval) {
                clearInterval(sliderInterval);
                sliderInterval = null;
            }
        }

        function open() {
            modal.classList.add('active');
            loadLazyImagesIn(modal);
            lockScroll();
            if (slider && dots.length > 0) {
                goToSlide(0);
                startAutoSlide();
            }
        }

        function close() {
            modal.classList.remove('active');
            const activeModals = document.querySelectorAll('.detail-modal.active, #brand-modal.active');
            if (activeModals.length === 0) {
                unlockScroll();
            }
            stopAutoSlide();
        }

        // Click on bento item to open
        item.addEventListener('click', open);

        // Click on close button
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                close();
            });
        }

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                close();
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                close();
            }
        });

        // Dot navigation
        if (dotsContainer && dots.length > 0) {
            dots.forEach((dot, index) => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    goToSlide(index);
                    startAutoSlide();
                });
            });
        }

        // Pause/resume auto slide on hover
        const galleryContainer = modal.querySelector('.modal-gallery-container');
        if (galleryContainer && slider) {
            galleryContainer.addEventListener('mouseenter', stopAutoSlide);
            galleryContainer.addEventListener('mouseleave', () => {
                if (modal.classList.contains('active')) {
                    startAutoSlide();
                }
            });

            // Create arrows dynamically if they don't exist yet
            if (!galleryContainer.querySelector('.modal-gallery-arrow')) {
                const prevBtn = document.createElement('button');
                prevBtn.className = 'modal-gallery-arrow prev';
                prevBtn.setAttribute('aria-label', currentLang === 'en' ? 'Previous slide' : 'Предыдущий слайд');
                prevBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';

                const nextBtn = document.createElement('button');
                nextBtn.className = 'modal-gallery-arrow next';
                nextBtn.setAttribute('aria-label', currentLang === 'en' ? 'Next slide' : 'Следующий слайд');
                nextBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

                galleryContainer.appendChild(prevBtn);
                galleryContainer.appendChild(nextBtn);

                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    let prevIdx = (currentSlide - 1 + totalSlides) % totalSlides;
                    goToSlide(prevIdx);
                    startAutoSlide();
                });

                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    let nextIdx = (currentSlide + 1) % totalSlides;
                    goToSlide(nextIdx);
                    startAutoSlide();
                });
            }

            // Swipe & Drag-to-Slide Logic (Touch and Mouse)
            let startX = 0;
            let isDragging = false;

            // Prevent browser's native image dragging inside slider
            slider.querySelectorAll('img').forEach(img => {
                img.addEventListener('dragstart', e => e.preventDefault());
            });

            const dragStart = (e) => {
                isDragging = true;
                startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
                stopAutoSlide();
            };

            const dragEnd = (e) => {
                if (!isDragging) return;
                isDragging = false;
                const endX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
                const diff = startX - endX;

                if (Math.abs(diff) > 40 && totalSlides > 0) { // minimum swipe distance
                    if (diff > 0) {
                        goToSlide((currentSlide + 1) % totalSlides);
                    } else {
                        goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
                    }
                }
                startAutoSlide();
            };

            // Touch support
            slider.addEventListener('touchstart', dragStart, { passive: true });
            slider.addEventListener('touchend', dragEnd, { passive: true });

            // Mouse support (desktop swiping/dragging)
            slider.addEventListener('mousedown', dragStart);
            slider.addEventListener('mouseup', dragEnd);
            slider.addEventListener('mouseleave', () => {
                if (isDragging) {
                    isDragging = false;
                    startAutoSlide();
                }
            });
        }
    });
}

/* ---------- Preloader ---------- */
function removePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('hidden')) {
        preloader.classList.add('hidden');
    }
}

window.addEventListener('load', removePreloader);
// Fallback in case load takes too long (e.g. 3.5s max)
setTimeout(removePreloader, 3500);
