(() => {
  'use strict';

  /* ---------- Ano no rodapé ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Auxiliares ---------- */
  const imageReady = (img) =>
    new Promise((resolve) => {
      if (!img || img.complete) return resolve();
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* ---------- Entrada do topo: só começa com as fontes e a foto prontas ----------
     Sem isso, no celular (conexão mais lenta) a animação roda em cima de uma
     caixa vazia e a foto aparece de repente depois. */
  const fontsReady =
    document.fonts && document.fonts.load
      ? Promise.all([
          document.fonts.load('400 1em "Bodoni Moda"'),
          document.fonts.load('italic 400 1em "Bodoni Moda"'),
          document.fonts.load('400 1em "Montserrat"'),
        ]).catch(() => {})
      : Promise.resolve();

  Promise.race([
    Promise.all([fontsReady, imageReady(document.querySelector('.hero__photo img'))]),
    wait(2500),
  ]).then(() => requestAnimationFrame(() => document.documentElement.classList.add('is-ready')));

  /* ---------- Nav: linha embaixo ao rolar ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const setMenu = (open) => {
    navLinks.classList.toggle('is-open', open);
    navToggle.classList.toggle('is-active', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };

  navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
  navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      setMenu(false);
      navToggle.focus();
    }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  /* ---------- Link ativo conforme a seção visível ---------- */
  const linkById = new Map();
  navLinks.querySelectorAll('.nav__link').forEach((link) => {
    linkById.set(link.getAttribute('href').slice(1), link);
  });
  // "Valores" cobre as três seções de preços
  if (linkById.has('planos')) {
    linkById.set('mensal', linkById.get('planos'));
    linkById.set('identidade', linkById.get('planos'));
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const link = linkById.get(entry.target.id);
        linkById.forEach((l) => l.classList.remove('is-active'));
        if (link) link.classList.add('is-active');
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

  /* ---------- Imagens: baixam antes e só se revelam depois de prontas ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const settle = (el) => setTimeout(() => el.removeAttribute('data-reveal'), 2400);

  if ('IntersectionObserver' in window) {
    // 1) a foto começa a baixar uma tela e meia antes de aparecer
    const preloadObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const img = entry.target.querySelector('img');
          if (img) img.loading = 'eager';
          preloadObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px 150% 0px' }
    );

    // 2) a animação só roda com a foto já carregada e decodificada
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          revealObserver.unobserve(el);
          const img = el.querySelector('img');
          if (img) img.loading = 'eager';
          imageReady(img)
            .then(() => (img && img.decode ? img.decode().catch(() => {}) : null))
            .then(() => {
              el.classList.add('is-in');
              settle(el);
            });
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    revealEls.forEach((el) => {
      preloadObserver.observe(el);
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.removeAttribute('data-reveal'));
  }

  /* ---------- Telas de toque: sem hover, o destaque acompanha o item no meio da tela ---------- */
  if ('IntersectionObserver' in window && window.matchMedia('(hover: none)').matches) {
    const litObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => entry.target.classList.toggle('is-lit', entry.isIntersecting));
      },
      { rootMargin: '-48% 0px -48% 0px', threshold: 0 }
    );
    document
      .querySelectorAll('.svc-list li, .tier, .mrow, .steps li, .work, .proof')
      .forEach((el) => litObserver.observe(el));
  }

  /* ---------- Clicar num valor já escolhe o serviço no formulário ---------- */
  const servicoSelect = document.getElementById('servico');

  document.querySelectorAll('[data-plan]').forEach((el) => {
    el.addEventListener('click', () => {
      const value = el.getAttribute('data-plan');
      if (!servicoSelect || !value) return;
      const exists = Array.from(servicoSelect.options).some((opt) => opt.value === value);
      if (exists) servicoSelect.value = value;
    });
  });

  /* ---------- Formulário de orçamento -> WhatsApp ---------- */
  const form = document.getElementById('orcamentoForm');
  const WHATSAPP_NUMBER = '5533998521669';

  /* ---------- Telefone: aceita só números (digitando, colando ou autopreenchendo) ---------- */
  const phoneInput = document.getElementById('whatsapp');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      let digits = phoneInput.value.replace(/\D/g, '');
      // número colado com o código do país (+55): tira o 55 do começo
      if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2);
      digits = digits.slice(0, 11);
      if (phoneInput.value !== digits) phoneInput.value = digits;
    });
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const nome = document.getElementById('nome').value.trim();
      const whatsapp = document.getElementById('whatsapp').value.trim();
      const servico = document.getElementById('servico').value;
      const mensagem = document.getElementById('mensagem').value.trim();

      const linhas = [
        `Olá, Júlia! Meu nome é ${nome}.`,
        `Tenho interesse em: ${servico}.`,
        `Meu WhatsApp para contato: ${whatsapp}.`,
      ];
      if (mensagem) linhas.push(`Mensagem: ${mensagem}`);

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(linhas.join('\n'))}`;
      window.open(url, '_blank', 'noopener');
    });
  }
})();
