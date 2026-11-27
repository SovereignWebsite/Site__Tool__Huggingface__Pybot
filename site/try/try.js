// The try-it page: starts the worker only when the visitor presses the button, then runs a plain chat.
(function () {
  var start = document.getElementById('start'), status = document.getElementById('status'), form = document.getElementById('f'),
      input = document.getElementById('t'), log = document.getElementById('log'), reset = document.getElementById('reset'),
      send = document.getElementById('send'), examples = document.querySelectorAll('.examples button'), w = null;
  function enable(on) { input.disabled = !on; send.disabled = !on; reset.disabled = !on; examples.forEach(function (b) { b.disabled = !on; }); }
  function add(cls, text, meta) {
    var li = document.createElement('li'); li.className = cls; li.appendChild(document.createTextNode(text));
    if (meta) { var s = document.createElement('span'); s.className = 'meta'; s.textContent = meta; li.appendChild(s); }
    log.appendChild(li); log.scrollTop = log.scrollHeight;
  }
  function ask(text) { if (!w || !text.trim()) return; add('you', 'You: ' + text); w.postMessage({ type: 'say', text: text }); }
  start.addEventListener('click', function () {
    start.disabled = true; w = new Worker('worker.js');
    w.onmessage = function (e) {
      var m = e.data;
      if (m.type === 'status') status.textContent = m.text;
      else if (m.type === 'ready') { status.textContent = 'PyBot is ready (started in ' + (m.ms / 1000).toFixed(1) + ' seconds). Ask it something.'; enable(true); input.focus(); }
      else if (m.type === 'reply') add('bot', 'PyBot: ' + m.reply, 'answered by the "' + m.module + '" module in ' + m.ms + ' ms');
      else if (m.type === 'error') { status.textContent = 'Something went wrong: ' + m.error; }
    };
  });
  form.addEventListener('submit', function (ev) { ev.preventDefault(); var v = input.value; input.value = ''; ask(v); });
  examples.forEach(function (b) { b.addEventListener('click', function () { ask(b.getAttribute('data-q')); }); });
  reset.addEventListener('click', function () { if (w) { w.postMessage({ type: 'reset' }); log.textContent = ''; status.textContent = 'New conversation: PyBot has forgotten what was said.'; } });
})();
