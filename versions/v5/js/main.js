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
    initPartnerForm();
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
        category: 'Уход за волосами',
        description: 'Бренд KERASYS создан для того, чтобы сделать профессиональный уход за волосами доступным и удобным. Продукция разработана на основе передовых корейских технологий ухода за волосами.',
        series: [
            '<strong>HAIR CLINIC</strong> - клиническая серия с 17 видами аминокислот и протеинами для интенсивного восстановления повреждённых волос',
            '<strong>PERFUME</strong> - парфюмированная серия с уникальными ароматами для каждого образа',
            '<strong>ADVANCED</strong> - ампульная серия со специальной формулой для комплексного ухода',
            '<strong>PRO ACTIVE MAN</strong> - мужская линейка шампуней'
        ]
    },
    '2080': {
        name: '2080',
        category: 'Гигиена полости рта',
        description: 'Эксперты компании AEKYUNG на протяжении 25 лет разрабатывают уникальные формулы зубных паст, направленные на решение различных проблем полости рта.',
        series: [
            '<strong>TOTAL</strong> - базовая серия для ежедневного ухода',
            '<strong>PRO</strong> - профилактическая серия',
            '<strong>DR.CLINIC</strong> - лечебно-профилактическая серия',
            'Снижает риск образования зубного камня в 4 раза',
            'Снижает чувствительность зубов на 96% за 2 недели',
            'Осветляет эмаль на 88% за 8 недель'
        ]
    },
    showermate: {
        name: 'SHOWERMATE',
        category: 'Уход за телом',
        description: 'Гели для душа SHOWERMATE с натуральными компонентами оказывают мягкий уход за кожей. Каждая серия создана для особых потребностей кожи.',
        series: [
            '<strong>NATURAL</strong> - серия с натуральными экстрактами для ежедневного ухода',
            '<strong>BOTANIC</strong> - серия с травами и цветами для чувствительной кожи',
            '<strong>FLOWER PERFUME</strong> - парфюмированная серия с цветочными экстрактами'
        ]
    },
    farmstay: {
        name: 'FARMSTAY',
        category: 'Косметика',
        description: 'Продукция FarmStay создана для тех, кому важна натуральная уходовая и декоративная косметика. Поэтапная система ухода за кожей по корейской технологии.',
        series: [
            'Пенки для умывания и пилинги',
            'Тканевые и гидрогелевые маски',
            'Патчи для области вокруг глаз',
            'Тонеры и эмульсии',
            'Увлажняющие и питательные кремы',
            'Сыворотки и ампулы'
        ]
    },
    secretday: {
        name: 'SECRETDAY',
        category: 'Женская гигиена',
        description: 'Гигиенические прокладки SECRETDAY разработаны с заботой о здоровье и комфорте женщин. Продукция соответствует высочайшим стандартам безопасности.',
        series: [
            '<strong>LOVE</strong> - нежная поверхность для максимального комфорта',
            '<strong>COTTON</strong> - 100% натуральный хлопок',
            '<strong>FRESH</strong> - органическая веганская линейка'
        ]
    },
    perfect: {
        name: 'PERFECT',
        category: 'Бытовая химия',
        description: 'Концентрированный стиральный порошок PERFECT эффективно удаляет все виды загрязнений. Достаточно всего 50 граммов на стирку - 1 кг хватает на месяц ежедневного использования.',
        series: [
            'Устраняет 99,9% бактерий из волокон ткани',
            'Не содержит фосфатов - абсолютно безопасен',
            'Гипоаллергенный состав',
            'Экономичный расход - 50 г на стирку'
        ]
    },
    wool: {
        name: 'WOOL SHAMPOO',
        category: 'Бытовая химия',
        description: 'WOOL SHAMPOO - инновационное средство для бережной стирки деликатных тканей с официальной сертификацией WoolMark.',
        series: [
            'Сертифицировано WoolMark в Корее',
            'Гипоаллергенные чистящие компоненты',
            'Рекомендуется для стирки детского белья',
            'Бережный уход за шерстью, шёлком и деликатными тканями'
        ]
    },
    trio: {
        name: 'TRIO',
        category: 'Бытовая химия',
        description: 'TRIO - универсальное средство для мытья посуды, фруктов и овощей. Справляется даже с застывшим жиром, при этом бережно воздействует на кожу рук.',
        series: [
            'Подходит для мытья посуды, фруктов и овощей',
            'Уничтожает 99,9% бактерий и грибков',
            'Удаляет неприятные запахи',
            'Не вызывает сухости и раздражения кожи'
        ]
    },
    mukunghwa: {
        name: 'MUKUNGHWA',
        category: 'Бытовая химия',
        description: 'Продукция MUKUNGHWA - воплощение натуральной чистоты и заботы о природе. Составы на основе растительных компонентов.',
        series: [
            '<strong>O\'CLEAN</strong> - средства на основе плодов мыльного дерева',
            '<strong>VIU</strong> - антибактериальный суперконцентрированный ополаскиватель',
            'Натуральное мыло на растительной основе',
            'Экологичные чистящие средства'
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
                    <h4>Ключевые продукты и серии:</h4>
                    <ul>${data.series.map(s => `<li>${s}</li>`).join('')}</ul>
                `;
            }

            modalBody.innerHTML = `
                <h3>${data.name}</h3>
                <span class="modal__category">${data.category}</span>
                <p>${data.description}</p>
                ${seriesHtml}
            `;

            modal.classList.add('active');
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

/* ---------- Partner form ---------- */
function initPartnerForm() {
    const form = document.getElementById('partnerForm');
    if (!form) return;

    // Tab switcher (B2B / Retail)
    form.querySelectorAll('.form-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            form.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        btn.textContent = 'Отправлено!';
        btn.dataset.success = 'true';
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = originalText;
            delete btn.dataset.success;
            btn.disabled = false;
            form.reset();
            form.querySelectorAll('.form-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
        }, 3000);
    });
}
