// Robison sites: mobile menu + estimate request form.
// Form submissions are delivered by FormSubmit (formsubmit.co) to the address in the form's data-to attribute.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var form = document.querySelector('form.quote');
  if (!form) return;
  var status = form.querySelector('.form-status');
  var button = form.querySelector('button[type="submit"]');
  var preview = document.body.hasAttribute('data-preview');

  function show(kind, text) {
    status.className = 'form-status ' + kind;
    status.textContent = text;
    status.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (form.querySelector('[name="_honey"]').value) return; // spam bot filled the hidden field

    if (preview) {
      show('info', 'This is a preview, so nothing was sent. On the live site this request goes straight to ' + form.dataset.to + '.');
      return;
    }

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    button.disabled = true;
    var label = button.textContent;
    button.textContent = 'Sending…';

    fetch('https://formsubmit.co/ajax/' + form.dataset.to, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && String(res.j.success) === 'true') {
          form.reset();
          show('ok', 'Thanks — your request is in. We’ll be in touch soon to set up your free estimate.');
        } else {
          throw new Error(res.j && res.j.message ? res.j.message : 'send failed');
        }
      })
      .catch(function () {
        show('err', 'Your request didn’t go through. Please call us at 970-260-0444 and we’ll get you scheduled.');
      })
      .finally(function () { button.disabled = false; button.textContent = label; });
  });
})();
