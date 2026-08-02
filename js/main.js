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

/* ===== PRODUTOS (scroll pinned + rotação 3D + saída do último produto) ===== */
const produtosSection = document.querySelector('.produtos');
const produtosSlides = document.querySelectorAll('.produtos__slide');
const produtosDots = document.querySelectorAll('.produtos__dot');
const produtosNextSection = document.querySelector('#sobre');

if (produtosSection && produtosSlides.length) {
    let produtosCurrentIndex = 0;
    const lastIndex = produtosSlides.length - 1;
    const totalUnits = produtosSlides.length; // (length-1) transições + 1 unidade de saída final

    function setActiveIndex(index) {
        if (index === produtosCurrentIndex) return;
        produtosSlides[produtosCurrentIndex].classList.remove('is-active');
        produtosSlides[index].classList.add('is-active');
        produtosDots[produtosCurrentIndex].classList.remove('is-active');
        produtosDots[index].classList.add('is-active');
        produtosCurrentIndex = index;
    }

    ScrollTrigger.matchMedia({
        '(min-width: 992px)': function () {
            produtosCurrentIndex = 0;
            gsap.set(produtosSlides, { opacity: 0, rotateY: 90, scale: 1 });
            gsap.set(produtosSlides[0], { opacity: 1, rotateY: 0 });
            produtosSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === 0));
            produtosDots.forEach((dot, i) => dot.classList.toggle('is-active', i === 0));

            if (produtosNextSection) {
                gsap.set(produtosNextSection, { y: 60, opacity: 0 });
            }

            // Timeline única, dona de TODAS as trocas de slide (nenhum tween discreto
            // separado disputa propriedades com ela). Isso garante reversibilidade
            // correta: GSAP sabe reverter uma timeline scrubada com precisão, mas não
            // sabe reverter dois sistemas de animação independentes brigando pela
            // mesma propriedade.
            const produtosExitTl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

            for (let i = 0; i < lastIndex; i++) {
                const oldSlide = produtosSlides[i];
                const newSlide = produtosSlides[i + 1];
                const oldText = oldSlide.querySelector('.produtos__text');
                const newText = newSlide.querySelector('.produtos__text');

                produtosExitTl
                    .to(oldSlide, { rotateY: 90, opacity: 0, duration: 1 }, i)
                    .fromTo(newSlide, { rotateY: -90, opacity: 0 }, { rotateY: 0, opacity: 1, duration: 1 }, i)
                    .to(oldText, { opacity: 0, x: -20, duration: 0.4 }, i)
                    .fromTo(newText, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6 }, i + 0.3);
            }

            // saída final da última slide
            produtosExitTl.to(produtosSlides[lastIndex], { rotateY: 20, scale: 0.8, opacity: 0, duration: 1 }, lastIndex);

            // scrub: true (sem inércia) garante que o pin só solta exatamente quando
            // essa timeline termina (progress da animação == progress do scroll).
            const produtosTrigger = ScrollTrigger.create({
                trigger: produtosSection,
                start: 'top top',
                end: () => '+=' + (window.innerHeight * totalUnits),
                pin: true,
                scrub: true,
                animation: produtosExitTl,
                onUpdate: (self) => {
                    const idx = Math.min(lastIndex, Math.max(0, Math.round(self.progress * totalUnits)));
                    setActiveIndex(idx);
                }
            });

            // Trigger independente (sem pin) só para o parallax de entrada da #sobre,
            // com sua própria suavização (scrub: 1.5) sem afetar a liberação do pin.
            let sobreTrigger = null;
            if (produtosNextSection) {
                const sobreTl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
                    .to({}, { duration: lastIndex })
                    .fromTo(produtosNextSection, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, lastIndex);

                sobreTrigger = ScrollTrigger.create({
                    trigger: produtosSection,
                    start: 'top top',
                    end: () => '+=' + (window.innerHeight * totalUnits),
                    scrub: 1.5,
                    animation: sobreTl
                });
            }

            return () => {
                produtosTrigger.kill();
                produtosExitTl.kill();
                if (sobreTrigger) sobreTrigger.kill();
                gsap.set(produtosSlides, { clearProps: 'all' });
                if (produtosNextSection) {
                    gsap.set(produtosNextSection, { clearProps: 'all' });
                }
                produtosCurrentIndex = 0;
                produtosSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === 0));
                produtosDots.forEach((dot, i) => dot.classList.toggle('is-active', i === 0));
            };
        }
    });
}
