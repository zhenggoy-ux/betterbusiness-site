(function () {
  'use strict';
  const form = document.querySelector('#checkout form');
  const money = amount => 'JPY ' + amount.toLocaleString('en-US');
  function updateTotal() {
    const months = form.elements.months.valueAsNumber;
    const price = Number(form.elements.plan.selectedOptions[0].dataset.price);
    const standard = price * months;
    const total = standard * (months >= 5 ? 90 : months >= 2 ? 95 : 100) / 100;
    const valid = Number.isSafeInteger(months) && months > 0 && Number.isSafeInteger(total);
    document.getElementById('standard-total').value = valid ? money(standard) : '—';
    document.getElementById('discount-total').value = valid ? money(standard - total) : '—';
    document.getElementById('payable-total').value = valid ? money(total) : '—';
    form.querySelector('button').disabled = !valid;
  }
  form.addEventListener('input', updateTotal);
  document.querySelectorAll('[data-plan]').forEach(link => link.addEventListener('click', () => {
    form.elements.plan.value = link.dataset.plan;
    updateTotal();
  }));
  form.addEventListener('submit', () => {
    const lang = document.documentElement.lang;
    form.elements.lang.value = lang === 'zh-CN' ? 'zh' : lang;
    form.querySelector('button').disabled = true;
  });
  const language = document.createElement('input');
  language.type = 'hidden';
  language.name = 'lang';
  form.append(language);
  updateTotal();
})();