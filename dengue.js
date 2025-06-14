// Espera o DOM carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {

  // Adiciona sombra no header ao rolar a página
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ---- Lógica do Dark Mode ----
  const darkModeToggle = document.getElementById('darkModeToggle');
  const icon = darkModeToggle.querySelector('i');

  // Função para aplicar o tema (dark/light)
  function applyTheme(theme, isInitial = false) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      document.body.classList.remove('dark-mode');
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }

    // Se não for a carga inicial, atualiza as cores do gráfico
    if (!isInitial && window.dengueChartInstance) {
        updateChartColors(window.dengueChartInstance, theme === 'dark');
    }
  }
  
  // Verifica preferência do usuário no localStorage ou no sistema
  const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(currentTheme, true);

  // Evento de clique no botão de dark mode
  darkModeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    const newTheme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  });

  // ---- Menu Mobile ----
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const nav = document.querySelector('#main-header nav');
  const mobileIcon = mobileMenuToggle.querySelector('i');

  mobileMenuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    mobileMenuToggle.setAttribute('aria-expanded', nav.classList.contains('active'));
    // Troca o ícone de hamburguer para 'X'
    if (nav.classList.contains('active')) {
      mobileIcon.classList.remove('fa-bars');
      mobileIcon.classList.add('fa-times');
    } else {
      mobileIcon.classList.remove('fa-times');
      mobileIcon.classList.add('fa-bars');
    }
  });

  // Fecha o menu mobile ao clicar num link
  document.querySelectorAll('#main-header nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('active')) {
        nav.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileIcon.classList.remove('fa-times');
        mobileIcon.classList.add('fa-bars');
      }
    });
  });

  // ---- Scroll Suave para links âncora ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ---- Deixa o link de navegação ativo conforme o scroll ----
  const sections = document.querySelectorAll('.content-section, .hero');
  const navLinks = document.querySelectorAll('#main-header nav a');
  const headerHeight = document.getElementById('main-header').offsetHeight;

  function changeNavActiveState() {
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - headerHeight - 70; 
      if (window.pageYOffset >= sectionTop) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href').substring(1);
      if (href === currentSectionId) {
        link.classList.add('active');
      }
    });

    // Casos especiais para o topo da página
    if (!currentSectionId && window.pageYOffset < sections[0].offsetTop - headerHeight - 70) {
        document.querySelector('#main-header nav a[href="#inicio"]').classList.add('active');
    } else if (!document.querySelector('#main-header nav a.active')) {
        document.querySelector('#main-header nav a[href="#inicio"]').classList.add('active');
    }
  }
  window.addEventListener('scroll', changeNavActiveState, { passive: true });
  changeNavActiveState(); // Roda uma vez na carga

  // ---- Animações ao rolar a página (com Intersection Observer) ----
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || '0s';
        entry.target.style.transitionDelay = delay;
        entry.target.classList.add('is-visible');
        scrollObserver.unobserve(entry.target); // Anima só uma vez
      }
    });
  }, { threshold: 0.1 });

  animatedElements.forEach(el => scrollObserver.observe(el));

  // ---- Lógica do Accordion (Mitos e Verdades) ----
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const isActive = header.classList.contains('active');
      
      header.classList.toggle('active');
      header.setAttribute('aria-expanded', !isActive);

      if (!isActive) {
        content.style.maxHeight = content.scrollHeight + "px";
        content.style.paddingTop = "15px";
        content.style.paddingBottom = "22px";
      } else {
        content.style.maxHeight = null;
        content.style.paddingTop = null;
        content.style.paddingBottom = null;
      }
    });
  });

  // ---- Validação e envio do Formulário de Contato ----
  const contactForm = document.getElementById('contactForm');
  const formMessageEl = document.getElementById('formMessage');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o envio padrão do form
    formMessageEl.style.display = 'none';
    formMessageEl.textContent = '';

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const subject = contactForm.subject.value.trim();
    const message = contactForm.message.value.trim();
    let isValid = true;

    if (!name || !email || !subject || !message) {
      isValid = false;
      formMessageEl.textContent = 'Por favor, preencha todos os campos.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      isValid = false;
      formMessageEl.textContent = 'O formato do e-mail parece inválido.';
    }

    if (!isValid) {
      formMessageEl.className = "form-status-message error-message";
    } else {
      formMessageEl.textContent = 'Obrigado! Sua mensagem foi enviada com sucesso.';
      formMessageEl.className = "form-status-message success-message";
      contactForm.reset();
      setTimeout(() => { formMessageEl.style.display = 'none'; }, 6000);
    }
    formMessageEl.style.display = 'block';
  });
  
  // ---- Gráfico de Estatísticas (Chart.js) ----
  const chartCtx = document.getElementById('dengueChart');
  
  // Dados oficiais - Casos Prováveis Brasil (2014-2023)
  // Fonte: Tabela "Série Histórica de casos prováveis de dengue (2000-2023*)", Ministério da Saúde
  const chartLabels = ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];
  const confirmedCasesData = [589107, 1688688, 1483623, 239389, 262594, 1545462, 948533, 531922, 1420259, 1658816];

  // Define as opções do gráfico (cores, legendas, etc)
  function getChartOptions(isDark) {
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    const ticksColor = isDark ? '#b0b0b0' : '#555';
    const titleColor = isDark ? '#e0e0e0' : '#333';
    const legendColor = isDark ? '#c0c0c0' : '#444';

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { // Eixo Y - Casos Confirmados
          beginAtZero: true,
          title: { display: true, text: 'Nº Casos Prováveis', font: { size: 14, family: 'Poppins' }, color: titleColor },
          grid: { drawBorder: false, color: gridColor },
          ticks: { 
            color: ticksColor, 
            font: { family: 'Poppins'},
            // Formata o tick para '1.5M', '1M', '500K'
            callback: function(value) {
              if (value >= 1000000) return (value / 1000000) + 'M';
              if (value >= 1000) return (value / 1000) + 'K';
              return value;
            }
          }
        },
        x: {
          title: { display: true, text: 'Ano', font: { size: 14, family: 'Poppins' }, color: titleColor },
          grid: { display: false },
          ticks: { color: ticksColor, font: { family: 'Poppins'} }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Série Histórica de Casos Prováveis de Dengue no Brasil (2014-2023)',
          font: { size: 18, family: 'Poppins', weight: 'bold' },
          padding: { top: 10, bottom: 25 },
          color: titleColor
        },
        legend: {
          display: true,
          position: 'bottom',
          labels: { font: { size: 12, family: 'Poppins' }, color: legendColor, usePointStyle: true, boxWidth: 8 }
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(20, 25, 30, 0.9)' : 'rgba(255,255,255,0.95)',
          titleColor: isDark ? '#f0f0f0' : '#333',
          bodyColor: isDark ? '#d0d0d0' : '#555',
          borderColor: isDark ? '#30363d' : '#ced4da',
          borderWidth: 1,
          titleFont: { family: 'Poppins', weight: 'bold'},
          bodyFont: { family: 'Poppins'},
          padding: 12,
          cornerRadius: 5,
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y.toLocaleString('pt-BR');
              }
              return label;
            }
          }
        }
      },
      interaction: { mode: 'index', intersect: false },
      hover: { mode: 'nearest', intersect: true }
    };
  }

  // Cria o gráfico se o elemento canvas existir
  if (chartCtx) {
    window.dengueChartInstance = new Chart(chartCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: 'Casos Prováveis',
            data: confirmedCasesData,
            backgroundColor: 'rgba(0, 168, 78, 0.6)',
            borderColor: 'rgba(0, 168, 78, 1)',
            borderWidth: 1.5,
            borderRadius: 6,
            yAxisID: 'y',
          }
        ]
      },
      options: getChartOptions(document.body.classList.contains('dark-mode'))
    });
  }
  
  // Função pra atualizar as cores do gráfico quando muda o tema
  function updateChartColors(chart, isDark) {
    if (!chart) return;
    chart.options = getChartOptions(isDark);
    chart.update();
  }

  // Atualiza os cards de resumo com os dados do gráfico
  function updateStatsSummary() {
    if(confirmedCasesData.length === 0) return;

    // Card 1: Casos em 2023
    const lastYearCases = confirmedCasesData[confirmedCasesData.length - 1];
    document.getElementById('totalCasesStat').textContent = lastYearCases.toLocaleString('pt-BR');

    // Card 2: Pico de Casos (Ano)
    const maxCases = Math.max(...confirmedCasesData);
    const maxCasesYear = chartLabels[confirmedCasesData.indexOf(maxCases)];
    document.getElementById('severeCasesStat').textContent = `${maxCases.toLocaleString('pt-BR')} (${maxCasesYear})`;
    
    // Card 3: Média Anual de Casos
    const averageCases = confirmedCasesData.reduce((a, b) => a + b, 0) / confirmedCasesData.length;
    document.getElementById('deathsStat').textContent = Math.round(averageCases).toLocaleString('pt-BR');
  }
  updateStatsSummary();

  // Atualiza o ano no rodapé
  const currentYearSpan = document.getElementById('currentYear');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
});