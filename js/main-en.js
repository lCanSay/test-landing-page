/* ===================================================
   KOREANA - Main JavaScript
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    initHeader();
    initMobileMenu();
    initScrollAnimations();
    initCounters();
    initBrandFilter();
    initBrandModals();
    initSmoothScroll();
    initParticles();
    initParallax();
});

/* ---------- Generate Background Particles ---------- */
function initParticles() {
    // Generate particles only once
    if (document.querySelector('.particles-container')) return;

    const container = document.createElement('div');
    container.className = 'particles-container';

    // Ensure the container spans the entire scrollable height of the page
    container.style.height = document.documentElement.scrollHeight + 'px';
    document.body.appendChild(container);

    const numParticles = 50; // Increased a bit for variety
    for (let i = 0; i < numParticles; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'particle-wrapper';
        wrapper.style.left = Math.random() * 95 + 'vw';
        wrapper.style.top = (Math.random() * 95) + '%';
        wrapper.dataset.speed = 0.1 + Math.random() * 0.3; // Parallax speed

        const p = document.createElement('div');

        // Random shapes: circle, square, triangle
        const rand = Math.random();
        if (rand < 0.33) {
            p.className = 'particle particle--circle';
        } else if (rand < 0.66) {
            p.className = 'particle particle--square';
        } else {
            p.className = 'particle particle--triangle';
        }

        const size = 15 + Math.random() * 30;
        p.style.width = size + 'px';
        p.style.height = size + 'px';

        // Random tilt and animation duration
        const baseRot = Math.random() * 360;
        p.style.setProperty('--rot-start', baseRot + 'deg');
        p.style.setProperty('--rot-end', (baseRot + (Math.random() > 0.5 ? 90 : -90)) + 'deg');

        const duration = 15 + Math.random() * 20; // 15s to 35s
        p.style.animation = `drift ${duration}s infinite alternate ease-in-out`;

        wrapper.appendChild(p);
        container.appendChild(wrapper);
    }
}

/* ---------- Parallax effect for Hero & Background Particles ---------- */
function initParallax() {
    const heroContent = document.querySelector('.hero__content');
    let particles = null;

    window.addEventListener('scroll', () => {
        const scroll = window.scrollY;

        // Hero Parallax
        if (heroContent && scroll < window.innerHeight) {
            heroContent.style.transform = `translateY(${scroll * 0.3}px)`;
            heroContent.style.opacity = 1 - (scroll / window.innerHeight) * 1.5;
        }

        // Particles Parallax
        if (!particles) {
            particles = document.querySelectorAll('.particles-container .particle-wrapper');
        }

        if (particles.length > 0) {
            particles.forEach((wrapper) => {
                const speed = parseFloat(wrapper.dataset.speed || 0.2);
                wrapper.style.transform = `translateY(${scroll * -speed}px)`;
            });
        }
    }, { passive: true });
}

/* ---------- Header scroll effect ---------- */
function initHeader() {
    const header = document.getElementById('header');
    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close on link click
    nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
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

    // Pre-calculate widths to prevent layout shift
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count, 10);
        counter.textContent = target.toLocaleString('ru-RU');
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

    if (el.dataset.animId) {
        cancelAnimationFrame(parseInt(el.dataset.animId, 10));
    }

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.round(eased * target);

        el.textContent = current.toLocaleString('ru-RU');

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

/* ---------- Brand modals ---------- */
const brandData = {
    kerasys: {
        name: 'KERASYS',
        category: 'Hair Care',
        description: 'KERASYS was created to make professional hair care accessible and convenient. The products are formulated using advanced Korean hair care technologies.',
        series: [
            '<strong>HAIR CLINIC</strong> - clinical series with 17 types of amino acids and proteins for intensive repair of damaged hair',
            '<strong>PERFUME</strong> - perfumed series with unique fragrances for every style',
            '<strong>ADVANCED</strong> - ampoule series with a special formula for comprehensive care',
            '<strong>PRO ACTIVE MAN</strong> - men\'s line of shampoos'
        ],
        images: [
            'assets/products/kerasys1.png',
            'assets/products/kerasys2.png',
            'assets/products/kerasys4.jpg',
            'assets/products/kerasys5.jpeg',
            'assets/products/kerasys6.png'
        ]
    },
    '2080': {
        name: '2080',
        category: 'Oral Hygiene',
        description: 'AEKYUNG experts have spent 25 years developing unique toothpaste formulas aimed at solving various oral hygiene issues.',
        series: [
            '<strong>TOTAL</strong> - core series for daily care',
            '<strong>PRO</strong> - preventive series',
            '<strong>DR.CLINIC</strong> - therapeutic and preventive series',
            'Reduces the risk of tartar formation by 4 times',
            'Reduces tooth sensitivity by 96% in 2 weeks',
            'Whitens enamel by 88% in 8 weeks'
        ],
        images: [
            'assets/products/2080-1.jpg',
            'assets/products/2080-2.jpg',
            'assets/products/2080-3.webp'
        ]
    },
    showermate: {
        name: 'SHOWERMATE',
        category: 'Body Care',
        description: 'SHOWERMATE shower gels with natural ingredients provide gentle skin care. Each series is designed for specific skin needs.',
        series: [
            '<strong>NATURAL</strong> - natural extract series for daily care',
            '<strong>BOTANIC</strong> - herbal and floral series for sensitive skin',
            '<strong>FLOWER PERFUME</strong> - perfumed series with floral extracts'
        ],
        images: [
            'assets/products/showermate1.jpg',
            'assets/products/showermate2.webp',
            'assets/products/showermate3.jpg'
        ]
    },
    farmstay: {
        name: 'FARMSTAY',
        category: 'Cosmetics',
        description: 'FarmStay products are for those who value natural skincare and makeup. A step-by-step skincare system following Korean methods.',
        series: [
            'Cleansing foams and peelings',
            'Sheet and hydrogel masks',
            'Eye patches',
            'Toners and emulsions',
            'Moisturizing and nourishing creams',
            'Serums and ampoules'
        ],
        images: [
            'assets/products/farmstay1.png',
            'assets/products/farmstay2.webp',
            'assets/products/farmstay3.jpeg'
        ]
    },
    secretday: {
        name: 'SECRETDAY',
        category: 'Feminine Hygiene',
        description: 'SECRETDAY sanitary pads are developed with women\'s health and comfort in mind. The products meet the highest safety standards.',
        series: [
            '<strong>LOVE</strong> - soft surface for maximum comfort',
            '<strong>COTTON</strong> - 100% natural cotton',
            '<strong>FRESH</strong> - organic vegan line'
        ],
        images: [
            'assets/products/secretday1.png',
            'assets/products/secretday2.png',
            'assets/products/secretday3.png'
        ]
    },
    perfect: {
        name: 'PERFECT',
        category: 'Household Chemicals',
        description: 'PERFECT concentrated laundry powder effectively removes all types of stains. Only 50 grams per wash is needed – 1 kg lasts for a month of daily use.',
        series: [
            'Eliminates 99.9% of bacteria from fabric fibers',
            'Phosphate-free – completely safe',
            'Hypoallergenic composition',
            'Economical use – 50 g per wash'
        ],
        images: [
            'assets/products/perfect1.png',
            'assets/products/perfect2.png',
            'assets/products/perfect3.jpg'
        ]
    },
    wool: {
        name: 'WOOL SHAMPOO',
        category: 'Household Chemicals',
        description: 'WOOL SHAMPOO is an innovative product for the gentle washing of delicate fabrics, officially certified by WoolMark.',
        series: [
            'Certified by WoolMark in Korea',
            'Hypoallergenic cleaning ingredients',
            'Recommended for washing baby clothes',
            'Gentle care for wool, silk, and delicate fabrics'
        ],
        images: [
            'assets/products/wool1.webp',
            'assets/products/wool2.png',
            'assets/products/wool3.jpg'
        ]
    },
    trio: {
        name: 'TRIO',
        category: 'Household Chemicals',
        description: 'TRIO is a universal detergent for washing dishes, fruits, and vegetables. It tackles even hardened grease while being gentle on the hands.',
        series: [
            'Suitable for dishes, fruits, and vegetables',
            'Kills 99.9% of bacteria and fungi',
            'Removes unpleasant odors',
            'Does not cause dryness or skin irritation'
        ],
        images: [
            'assets/products/trio1.webp',
            'assets/products/trio2.webp',
            'assets/products/trio3.jpg'
        ]
    },
    mukunghwa: {
        name: 'MUKUNGHWA',
        category: 'Household Chemicals',
        description: 'MUKUNGHWA products embody natural cleanliness and environmental care, with formulas based on plant components.',
        series: [
            '<strong>O\'CLEAN</strong> - products based on soapberry fruit',
            '<strong>VIU</strong> - antibacterial super-concentrated fabric softener',
            'Natural plant-based soap',
            'Eco-friendly cleaning products'
        ],
        images: [
            'assets/products/muku-viu1.jpg',
            'assets/products/muku-viu2.jpg',
            'assets/products/muku-viu3.jpg'
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
                        <p>Key products and series:</p>
                        <ul class="bm-features">${data.series.map(s => `<li>${s}</li>`).join('')}</ul>
                    </div>
                `;
            }

            // Fallback default Unsplash images (same as in achievements.html option 2)
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
            document.body.style.overflow = 'hidden';
            animateBackdrop(0, 8, 0, 0.5, 400);
        });
    });

    function closeModal() {
        animateBackdrop(8, 0, 0.5, 0, 300, () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            backdrop.style.backdropFilter = '';
            backdrop.style.webkitBackdropFilter = '';
            backdrop.style.background = '';
        });
    }

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
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
                // Принудительно показываем все элементы в целевой секции
                target.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));

                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

