(() => {
  'use strict';

  /* ---------- Ano no rodapé ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Barra de progresso de rolagem ---------- */
  const progressBar = document.getElementById('scrollProgress');
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = `${progress}%`;
  };

  /* ---------- Nav: sombra ao rolar ---------- */
  const nav = document.getElementById('nav');
  const backToTop = document.getElementById('backToTop');

  const handleScrollEffects = () => {
    const scrolled = window.scrollY > 40;
    nav.classList.toggle('is-scrolled', scrolled);
    backToTop.classList.toggle('is-visible', window.scrollY > 500);
    updateProgress();
  };

  window.addEventListener('scroll', handleScrollEffects, { passive: true });
  handleScrollEffects();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Menu mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinksWrap = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinksWrap.classList.toggle('is-open');
    navToggle.classList.toggle('is-active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  document.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      navLinksWrap.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ---------- Link ativo conforme a seção visível ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinkMap = new Map();
  document.querySelectorAll('.nav__link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) navLinkMap.set(href.slice(1), link);
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = navLinkMap.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinkMap.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  /* ---------- Animações de entrada (reveal) ---------- */
  const revealItems = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = (Array.from(el.parentElement.children).indexOf(el) % 4) * 90;
          setTimeout(() => el.classList.add('is-visible'), delay);
          revealObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  /* ---------- Preenche o select do formulário a partir dos planos ---------- */
  const servicoSelect = document.getElementById('servico');

  document.querySelectorAll('[data-plan]').forEach((planBtn) => {
    planBtn.addEventListener('click', () => {
      const planValue = planBtn.getAttribute('data-plan');
      if (servicoSelect && planValue) {
        const optionExists = Array.from(servicoSelect.options).some((opt) => opt.value === planValue);
        if (optionExists) servicoSelect.value = planValue;
      }
    });
  });

  /* ---------- Formulário de orçamento -> WhatsApp ---------- */
  const orcamentoForm = document.getElementById('orcamentoForm');
  const WHATSAPP_NUMBER = '5533998521669';

  if (orcamentoForm) {
    orcamentoForm.addEventListener('submit', (event) => {
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

      const texto = encodeURIComponent(linhas.join('\n'));
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`;

      window.open(url, '_blank', 'noopener');
    });
  }
})();
