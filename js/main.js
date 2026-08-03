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

            return () => {
                produtosTrigger.kill();
                produtosExitTl.kill();
                gsap.set(produtosSlides, { clearProps: 'all' });
                produtosCurrentIndex = 0;
                produtosSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === 0));
                produtosDots.forEach((dot, i) => dot.classList.toggle('is-active', i === 0));
            };
        },

        // Sem pin nem rotação 3D abaixo de 992px: os slides já ficam
        // empilhados via CSS (position: static), cada um mostrado por
        // completo — aqui só entra um fade + translateY simples por card.
        '(max-width: 991px)': function () {
            gsap.set(produtosSlides, { opacity: 0, y: 30 });

            const produtosBatch = ScrollTrigger.batch(produtosSlides, {
                start: 'top 85%',
                once: true,
                onEnter: (batch) => {
                    gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.15 });
                }
            });

            return () => {
                produtosBatch.forEach((trigger) => trigger.kill());
                gsap.set(produtosSlides, { clearProps: 'all' });
            };
        }
    });
}

/* ===== SOBRE (entrada + pulso do botão) ===== */
const sobreSection = document.querySelector('.sobre');
const sobreImage = document.querySelector('.sobre__image');
const sobreContent = document.querySelector('.sobre__content');
const sobreCardsWrap = document.querySelector('.sobre__cards');
const sobreCards = document.querySelectorAll('.sobre__card');
const sobreCta = document.querySelector('.sobre__cta');

if (sobreSection) {
    gsap.set(sobreImage, { opacity: 0, x: -50 });
    gsap.set(sobreContent, { opacity: 0, x: 50 });

    ScrollTrigger.create({
        trigger: sobreSection,
        start: 'top 75%',
        once: true,
        onEnter: () => {
            gsap.to(sobreImage, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' });
            gsap.to(sobreContent, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' });
        }
    });

    if (sobreCardsWrap && sobreCards.length) {
        gsap.set(sobreCards, { opacity: 0, x: -80 });

        ScrollTrigger.create({
            trigger: sobreCardsWrap,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(sobreCards, { opacity: 1, x: 0, duration: 0.9, stagger: 0.2, ease: 'power2.out' });
            }
        });
    }

    if (sobreCta) {
        gsap.to(sobreCta, {
            scale: 1.03,
            duration: 0.8,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: -1
        });
    }
}

/* ===== GALERIA (carrossel 3D automático) ===== */
const galeriaSection = document.querySelector('.galeria');
const galeriaCarousel = document.getElementById('galeriaCarousel');
const galeriaTrack = document.getElementById('galeriaTrack');

if (galeriaSection && galeriaCarousel && galeriaTrack) {
    // duplica o conjunto de fotos para permitir o loop infinito sem emenda
    galeriaTrack.insertAdjacentHTML('beforeend', galeriaTrack.innerHTML);
    const galeriaCards = galeriaTrack.querySelectorAll('.galeria__card');

    const galeriaTween = gsap.to(galeriaTrack, {
        xPercent: -50,
        duration: (galeriaCards.length / 2) * 4,
        ease: 'none',
        repeat: -1
    });

    galeriaCarousel.addEventListener('mouseenter', () => galeriaTween.pause());
    galeriaCarousel.addEventListener('mouseleave', () => galeriaTween.play());

    // arraste/swipe (mouse e touch unificados via Pointer Events) — a
    // barra de progresso da própria tween é escrubada durante o arraste,
    // então não há dois sistemas (autoplay x arraste) disputando o transform.
    let isDragging = false;
    let dragStartX = 0;
    let dragDistance = 0;
    let progressAtDragStart = 0;

    galeriaCarousel.addEventListener('pointerdown', (e) => {
        isDragging = true;
        dragDistance = 0;
        dragStartX = e.clientX;
        progressAtDragStart = galeriaTween.progress();
        galeriaTween.pause();
        galeriaCarousel.setPointerCapture(e.pointerId);
    });

    galeriaCarousel.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - dragStartX;
        dragDistance = Math.abs(deltaX);
        const trackHalfWidth = galeriaTrack.scrollWidth / 2;
        const deltaProgress = deltaX / trackHalfWidth;
        let newProgress = (progressAtDragStart - deltaProgress) % 1;
        if (newProgress < 0) newProgress += 1;
        galeriaTween.progress(newProgress);
    });

    function endGaleriaDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        galeriaTween.play();

        // toque sem arrasto real = tap: alterna o card tocado (mobile)
        if (dragDistance < 6) {
            const card = e.target.closest('.galeria__card');
            if (card) {
                const wasActive = card.classList.contains('is-active');
                galeriaCards.forEach((c) => c.classList.remove('is-active'));
                if (!wasActive) card.classList.add('is-active');
            }
        }
    }

    galeriaCarousel.addEventListener('pointerup', endGaleriaDrag);
    galeriaCarousel.addEventListener('pointercancel', endGaleriaDrag);

    /* ===== entrada da seção ===== */
    const galeriaTag = galeriaSection.querySelector('.galeria__tag');
    const galeriaTitle = galeriaSection.querySelector('.galeria__title');
    const galeriaSubtitle = galeriaSection.querySelector('.galeria__subtitle');

    gsap.set([galeriaTag, galeriaTitle, galeriaSubtitle], { opacity: 0, y: 40 });
    gsap.set(galeriaCarousel, { opacity: 0, scale: 0.95 });

    ScrollTrigger.create({
        trigger: galeriaSection,
        start: 'top 75%',
        once: true,
        onEnter: () => {
            gsap.to([galeriaTag, galeriaTitle, galeriaSubtitle], {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power2.out',
                stagger: 0.15
            });
            gsap.to(galeriaCarousel, {
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: 'power2.out'
            });
        }
    });
}

/* ===== CONTATO (formulário de orçamento via WhatsApp) ===== */
const contatoSection = document.querySelector('.contato');
const contatoInfo = document.querySelector('.contato__info');
const contatoFormWrap = document.querySelector('.contato__form-wrap');
const contatoForm = document.getElementById('contatoForm');

if (contatoSection) {
    gsap.set(contatoInfo, { opacity: 0, x: -40 });
    gsap.set(contatoFormWrap, { opacity: 0, x: 40 });

    ScrollTrigger.create({
        trigger: contatoSection,
        start: 'top 75%',
        once: true,
        onEnter: () => {
            gsap.to(contatoInfo, { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out' });
            gsap.to(contatoFormWrap, { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out' });
        }
    });
}

if (contatoForm) {
    contatoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!contatoForm.reportValidity()) return;

        const nome = contatoForm.nome.value.trim();
        const whatsapp = contatoForm.whatsapp.value.trim();
        const negocio = contatoForm.negocio.value;
        const produto = contatoForm.produto.value;
        const mensagem = contatoForm.mensagem.value.trim();

        const linhas = [
            `Olá, David! Meu nome é ${nome}.`,
            `WhatsApp para contato: ${whatsapp}`,
            `Tipo de negócio: ${negocio}`,
            `Produto de interesse: ${produto}`
        ];

        if (mensagem) {
            linhas.push(`Mensagem: ${mensagem}`);
        }

        const texto = encodeURIComponent(linhas.join('\n'));
        window.open(`https://wa.me/5511973426342?text=${texto}`, '_blank', 'noopener');
    });
}

/* ===== FOOTER (entrada das colunas) ===== */
const footerSection = document.querySelector('.footer');
const footerCols = document.querySelectorAll('.footer__col');

if (footerSection && footerCols.length) {
    gsap.set(footerCols, { opacity: 0, y: 30 });

    ScrollTrigger.create({
        trigger: footerSection,
        start: 'top 90%',
        once: true,
        onEnter: () => {
            gsap.to(footerCols, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.2 });
        }
    });
}

/* ===== SCROLL REVEAL GLOBAL =====
   Entrada padrão (fade + translateY) para tags, títulos, parágrafos,
   botões, cards e imagens em qualquer seção — atual ou futura.
   Hero, números, produtos, galeria, contato e footer já têm suas
   próprias animações de entrada (scroll-jack, contagem, timelines
   dedicadas) e o header é fixo, sempre visível: nenhum deles deve
   ganhar um segundo estado "opacity: 0" que nunca seria revertido
   por este sistema. */
(function initScrollReveal() {
    const EXCLUDED_ROOTS = '.header, .hero, .numeros, .produtos, .galeria, .contato, .footer';

    const alreadyAnimated = new Set(
        [sobreImage, sobreContent, sobreCta, ...sobreCards].filter(Boolean)
    );

    const revealTargets = gsap.utils
        .toArray('[class*="__tag"], h1, h2, h3, p, .btn, [class*="__card"], img, [data-reveal]')
        .filter((el) => !alreadyAnimated.has(el) && !el.closest(EXCLUDED_ROOTS));

    if (!revealTargets.length) return;

    gsap.set(revealTargets, { opacity: 0, y: 40 });

    ScrollTrigger.batch(revealTargets, {
        start: 'top 80%',
        once: true,
        interval: 0.1,
        onEnter: (batch) => {
            gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out',
                stagger: 0.15
            });
        }
    });
})();
