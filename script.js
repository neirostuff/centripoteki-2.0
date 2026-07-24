/* ==========================================================================
   ЦЕНТР ИПОТЕКИ НЕ ДВИЖИМОСТЬ 2.0 - INTERACTIVE SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. THEME TOGGLE (DARK / LIGHT MODE)
     -------------------------------------------------------------------------- */
  const themeToggleBtn = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;

  // Saved theme or default light
  const savedTheme = localStorage.getItem('cp_theme') || 'light';
  htmlEl.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', newTheme);
      localStorage.setItem('cp_theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    if (theme === 'dark') {
      themeToggleBtn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    } else {
      themeToggleBtn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
    }
  }

  /* --------------------------------------------------------------------------
     2. HEADER SCROLL & MOBILE MENU
     -------------------------------------------------------------------------- */
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  const burgerBtn = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavClose = document.getElementById('mobileNavClose');

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => mobileNav.classList.add('active'));
  }
  if (mobileNavClose && mobileNav) {
    mobileNavClose.addEventListener('click', () => mobileNav.classList.remove('active'));
  }

  /* --------------------------------------------------------------------------
     3. MORTGAGE MULTI-CALCULATOR & SAVINGS ENGINE
     -------------------------------------------------------------------------- */
  const propValueSlider = document.getElementById('propValue');
  const initialDepositSlider = document.getElementById('initialDeposit');
  const loanTermSlider = document.getElementById('loanTerm');

  const propValDisplay = document.getElementById('propValDisplay');
  const depositValDisplay = document.getElementById('depositValDisplay');
  const termValDisplay = document.getElementById('termValDisplay');

  const monthlyPayDisplay = document.getElementById('monthlyPayDisplay');
  const rateDisplay = document.getElementById('rateDisplay');
  const totalLoanDisplay = document.getElementById('totalLoanDisplay');
  const totalSavingsDisplay = document.getElementById('totalSavingsDisplay');
  const monthlySavingsDisplay = document.getElementById('monthlySavingsDisplay');

  let currentProgramRate = 6.0; // Default Family Mortgage

  const calcTabs = document.querySelectorAll('.calc-tab');
  calcTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      calcTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentProgramRate = parseFloat(tab.dataset.rate || 6.0);
      calculateMortgage();
    });
  });

  if (propValueSlider && initialDepositSlider && loanTermSlider) {
    propValueSlider.addEventListener('input', calculateMortgage);
    initialDepositSlider.addEventListener('input', calculateMortgage);
    loanTermSlider.addEventListener('input', calculateMortgage);
    calculateMortgage();
  }

  function formatMoney(num) {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(num) + ' ₽';
  }

  function calculateMortgage() {
    const propValue = parseFloat(propValueSlider.value);
    const depositPercent = parseFloat(initialDepositSlider.value);
    const years = parseFloat(loanTermSlider.value);

    const depositAmount = propValue * (depositPercent / 100);
    const loanAmount = Math.max(0, propValue - depositAmount);
    const months = years * 12;

    // Display inputs
    propValDisplay.innerText = formatMoney(propValue);
    depositValDisplay.innerText = `${depositPercent}% (${formatMoney(depositAmount)})`;
    termValDisplay.innerText = `${years} лет (${months} мес)`;
    rateDisplay.innerText = `${currentProgramRate.toFixed(1)}%`;

    if (loanAmount <= 0) {
      monthlyPayDisplay.innerText = '0 ₽';
      totalLoanDisplay.innerText = '0 ₽';
      totalSavingsDisplay.innerText = '0 ₽';
      return;
    }

    // Annuity Payment Formula with Center Ipoteki Rate
    const monthlyRate = (currentProgramRate / 100) / 12;
    const annuityFactor = (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const monthlyPayment = loanAmount * annuityFactor;

    // Standard Bank Rate (0.8% higher rate + standard bank insurance)
    const stdBankRate = currentProgramRate + 0.8;
    const stdMonthlyRate = (stdBankRate / 100) / 12;
    const stdAnnuityFactor = (stdMonthlyRate * Math.pow(1 + stdMonthlyRate, months)) / (Math.pow(1 + stdMonthlyRate, months) - 1);
    const stdMonthlyPayment = loanAmount * stdAnnuityFactor;

    // Insurance Savings: Bank standard 0.8%/year vs Center Ipoteki 0.35%/year
    const stdInsuranceTotal = (loanAmount * 0.008) * years;
    const cpInsuranceTotal = (loanAmount * 0.0035) * years;
    const insuranceSavings = stdInsuranceTotal - cpInsuranceTotal;

    // Rate Savings over total term
    const totalPaymentCP = monthlyPayment * months;
    const totalPaymentStd = stdMonthlyPayment * months;
    const rateSavings = totalPaymentStd - totalPaymentCP;

    const grandSavings = rateSavings + insuranceSavings;
    const monthlySavings = (stdMonthlyPayment - monthlyPayment) + (insuranceSavings / months);

    monthlyPayDisplay.innerText = formatMoney(monthlyPayment);
    totalLoanDisplay.innerText = formatMoney(totalPaymentCP);
    totalSavingsDisplay.innerText = formatMoney(grandSavings);
    if (monthlySavingsDisplay) {
      monthlySavingsDisplay.innerText = formatMoney(monthlySavings);
    }
  }

  /* --------------------------------------------------------------------------
     4. GENERATE & DOWNLOAD PDF ESTIMATE
     -------------------------------------------------------------------------- */
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
      const propVal = propValDisplay.innerText;
      const depositVal = depositValDisplay.innerText;
      const termVal = termValDisplay.innerText;
      const rateVal = rateDisplay.innerText;
      const monthlyPay = monthlyPayDisplay.innerText;
      const totalSavings = totalSavingsDisplay.innerText;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <title>Расчет ипотеки - Центр Ипотеки Недвижимость</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #1E293B; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px solid #D97706; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #D97706; text-transform: uppercase; }
            .sub { font-size: 14px; color: #64748B; }
            .box { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 25px; border-radius: 12px; margin-bottom: 25px; }
            .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #E2E8F0; }
            .row:last-child { border-bottom: none; }
            .val { font-weight: bold; color: #0F172A; }
            .highlight { background: #FEF3C7; border: 1px solid #D97706; padding: 18px; border-radius: 8px; text-align: center; margin-top: 20px; }
            .highlight h3 { margin: 0; color: #B45309; font-size: 20px; }
            .footer { margin-top: 40px; font-size: 12px; color: #94A3B8; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Центр Ипотеки Недвижимость</div>
            <div class="sub">Официальный расчёт выгоды по ипотечной программе | г. Челябинск</div>
          </div>
          
          <div class="box">
            <h2>Параметры ипотеки</h2>
            <div class="row"><span>Стоимость недвижимости:</span><span class="val">${propVal}</span></div>
            <div class="row"><span>Первоначальный взнос:</span><span class="val">${depositVal}</span></div>
            <div class="row"><span>Срок кредитования:</span><span class="val">${termVal}</span></div>
            <div class="row"><span>Процентная ставка (Центр Ипотеки):</span><span class="val">${rateVal}</span></div>
          </div>

          <div class="box">
            <h2>Результаты расчета</h2>
            <div class="row"><span>Ежемесячный платеж:</span><span class="val">${monthlyPay}</span></div>
          </div>

          <div class="highlight">
            <h3>Ваша итоговая экономия: ${totalSavings}</h3>
            <p>Включая скидку на процентную ставку и партнерскую страховку</p>
          </div>

          <div class="footer">
            Документ сгенерирован автоматически | Эксперт: Пушкарев Егор | Консультация: +7 (900) 077-70-22
          </div>
          <script>window.print();</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    });
  }

  /* --------------------------------------------------------------------------
     5. AI SCORING QUIZ ENGINE
     -------------------------------------------------------------------------- */
  let currentQuizStep = 1;
  const totalQuizSteps = 4;
  const quizSteps = document.querySelectorAll('.quiz-step');
  const quizProgressFill = document.getElementById('quizProgressFill');
  const nextQuizBtn = document.getElementById('nextQuizBtn');
  const prevQuizBtn = document.getElementById('prevQuizBtn');

  // Option select handler
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      const parentGrid = opt.parentElement;
      parentGrid.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  if (nextQuizBtn) {
    nextQuizBtn.addEventListener('click', () => {
      if (currentQuizStep < totalQuizSteps) {
        currentQuizStep++;
        updateQuizView();
      } else {
        // Show result modal
        openModal('leadModal');
      }
    });
  }

  if (prevQuizBtn) {
    prevQuizBtn.addEventListener('click', () => {
      if (currentQuizStep > 1) {
        currentQuizStep--;
        updateQuizView();
      }
    });
  }

  function updateQuizView() {
    quizSteps.forEach(step => {
      step.classList.remove('active');
      if (parseInt(step.dataset.step) === currentQuizStep) {
        step.classList.add('active');
      }
    });

    const progressPercent = (currentQuizStep / totalQuizSteps) * 100;
    if (quizProgressFill) quizProgressFill.style.width = `${progressPercent}%`;

    if (prevQuizBtn) prevQuizBtn.style.display = currentQuizStep === 1 ? 'none' : 'inline-flex';
    if (nextQuizBtn) {
      nextQuizBtn.innerText = currentQuizStep === totalQuizSteps ? 'Узнать результат' : 'Далее';
    }
  }

  /* --------------------------------------------------------------------------
     6. FAQ ACCORDION
     -------------------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  /* --------------------------------------------------------------------------
     7. MODAL WINDOW HANDLERS
     -------------------------------------------------------------------------- */
  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  };

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });

  // Lead Form submission
  const leadForm = document.getElementById('leadForm');
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Спасибо! Ваша заявка успешно отправлена. Егор Пушкарев свяжется с вами в течение 15 минут.');
      closeModal('leadModal');
    });
  }

});
