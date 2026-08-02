gsap.registerPlugin(ScrollTrigger);

/* ===== MENU MOBILE ===== */
const headerToggle = document.getElementById('headerToggle');
const headerNav = document.getElementById('headerNav');

if (headerToggle && headerNav) {
    headerToggle.addEventListener('click', () => {
        const isOpen = headerNav.classList.toggle('is-open');
        headerToggle.setAttribute('aria-expanded', isOpen);
    });

    headerNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            headerNav.classList.remove('is-open');
            headerToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ===== ANIMAÇÃO DE ENTRADA DO HERO ===== */
const heroTag = document.querySelector('.hero__tag');
const heroTitle = document.querySelector('.hero__title');
const heroText = document.querySelector('.hero__text');
const heroBullets = document.querySelector('.hero__bullets');
const heroButtons = document.querySelectorAll('.hero__buttons .btn');
const heroCurtain = document.querySelector('.hero__curtain');
const heroImage = document.querySelector('.hero__image');

gsap.set([heroTag, heroTitle, heroText, heroBullets], { opacity: 0, x: -40 });
gsap.set(heroButtons, { opacity: 0, y: 30 });

const heroTimeline = gsap.timeline({ defaults: { ease: 'power2.out' } });

heroTimeline
    .to(heroCurtain, { yPercent: -100, duration: 0.8, ease: 'power3.inOut' })
    .to(heroImage, { scale: 1, duration: 0.8, ease: 'power3.inOut' }, '<')
    .to([heroTag, heroTitle, heroText, heroBullets], { opacity: 1, x: 0, duration: 0.6, stagger: 0.2 }, '-=0.3')
    .to(heroButtons, { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }, '-=0.2');

/* ===== NÚMEROS (contagem + entrada) ===== */
const numerosSection = document.querySelector('.numeros');
const numerosCards = document.querySelectorAll('.numeros__card');
const numerosNumbers = document.querySelectorAll('.numeros__number');

if (numerosSection) {
    gsap.set(numerosCards, { opacity: 0, y: 30 });

    ScrollTrigger.create({
        trigger: numerosSection,
        start: 'top 80%',
        once: true,
        onEnter: () => {
            gsap.to(numerosCards, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' });

            numerosNumbers.forEach((numberEl) => {
                const target = parseFloat(numberEl.dataset.target);
                const prefix = numberEl.dataset.prefix || '';
                const suffix = numberEl.dataset.suffix || '';
                const counter = { value: 0 };

                gsap.to(counter, {
                    value: target,
                    duration: 2,
                    ease: 'power1.out',
                    onUpdate: () => {
                        numberEl.textContent = prefix + Math.round(counter.value).toLocaleString('pt-BR') + suffix;
                    }
                });
            });
        }
    });
}

/* ===== PRODUTOS (scroll pinned + rotação 3D) ===== */
const produtosSection = document.querySelector('.produtos');
const produtosSlides = document.querySelectorAll('.produtos__slide');
const produtosDots = document.querySelectorAll('.produtos__dot');

if (produtosSection && produtosSlides.length) {
    let produtosCurrentIndex = 0;

    function goToProdutoSlide(index) {
        if (index === produtosCurrentIndex) return;

        const oldSlide = produtosSlides[produtosCurrentIndex];
        const newSlide = produtosSlides[index];
        const oldText = oldSlide.querySelector('.produtos__text');
        const newText = newSlide.querySelector('.produtos__text');

        oldSlide.classList.remove('is-active');
        newSlide.classList.add('is-active');
        produtosDots[produtosCurrentIndex].classList.remove('is-active');
        produtosDots[index].classList.add('is-active');

        gsap.timeline({ defaults: { ease: 'power2.inOut', duration: 0.6 } })
            .to(oldSlide, { rotateY: 90, opacity: 0 }, 0)
            .to(oldText, { opacity: 0, x: -20, duration: 0.3 }, 0)
            .fromTo(newSlide, { rotateY: -90, opacity: 0 }, { rotateY: 0, opacity: 1 }, 0)
            .fromTo(newText, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4 }, 0.2);

        produtosCurrentIndex = index;
    }

    ScrollTrigger.matchMedia({
        '(min-width: 992px)': function () {
            produtosCurrentIndex = 0;
            gsap.set(produtosSlides, { opacity: 0, rotateY: 90 });
            gsap.set(produtosSlides[0], { opacity: 1, rotateY: 0 });
            produtosSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === 0));
            produtosDots.forEach((dot, i) => dot.classList.toggle('is-active', i === 0));

            const produtosTrigger = ScrollTrigger.create({
                trigger: produtosSection,
                start: 'top top',
                end: () => '+=' + (window.innerHeight * (produtosSlides.length - 1)),
                pin: true,
                onUpdate: (self) => {
                    const idx = Math.min(
                        produtosSlides.length - 1,
                        Math.round(self.progress * (produtosSlides.length - 1))
                    );
                    if (idx !== produtosCurrentIndex) {
                        goToProdutoSlide(idx);
                    }
                }
            });

            return () => {
                produtosTrigger.kill();
                gsap.set(produtosSlides, { clearProps: 'all' });
                produtosCurrentIndex = 0;
                produtosSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === 0));
                produtosDots.forEach((dot, i) => dot.classList.toggle('is-active', i === 0));
            };
        }
    });
}
