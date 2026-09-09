(function () {
  'use strict';
  var D = window.TenDomain;
  var C = window.TenContent;
  var STORAGE_KEY = 'treasure-ten-island-v1';

  var state = {
    screen: 'home',
    scaffold: 'light', // light | strong
    readAloud: false,
    unlocked: { home: true, quantity: false, maketen: false, stories: false, summary: false },
    qty: { round: 0, slots: D.createFrame(0), solved: 0, done: false },
    mt: { round: 0, partA: 0, slots: D.createFrame(0), solved: 0, done: false },
    st: { round: 0, slots: D.createFrame(0), solved: 0, done: false },
    completed: false
  };

  function $(id) { return document.getElementById(id); }

  function speak(text) {
    if (!state.readAloud) return;
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch (e) { /* optional audio — visual always available */ }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        screen: state.screen,
        scaffold: state.scaffold,
        unlocked: state.unlocked,
        qtyRound: state.qty.round,
        qtySolved: state.qty.solved,
        qtyDone: state.qty.done,
        mtRound: state.mt.round,
        mtSolved: state.mt.solved,
        mtDone: state.mt.done,
        stRound: state.st.round,
        stSolved: state.st.solved,
        stDone: state.st.done,
        completed: state.completed
      }));
    } catch (e) { /* ignore */ }
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var p = JSON.parse(raw);
      if (p.scaffold) state.scaffold = p.scaffold;
      if (p.unlocked) state.unlocked = Object.assign(state.unlocked, p.unlocked);
      if (typeof p.qtyRound === 'number') state.qty.round = p.qtyRound;
      if (typeof p.qtySolved === 'number') state.qty.solved = p.qtySolved;
      if (p.qtyDone) state.qty.done = true;
      if (typeof p.mtRound === 'number') state.mt.round = p.mtRound;
      if (typeof p.mtSolved === 'number') state.mt.solved = p.mtSolved;
      if (p.mtDone) state.mt.done = true;
      if (typeof p.stRound === 'number') state.st.round = p.stRound;
      if (typeof p.stSolved === 'number') state.st.solved = p.stSolved;
      if (p.stDone) state.st.done = true;
      if (p.completed) state.completed = true;
      if (p.screen) state.screen = p.screen;
    } catch (e) { /* ignore */ }
  }

  function resetAll() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    state = {
      screen: 'home',
      scaffold: state.scaffold,
      readAloud: state.readAloud,
      unlocked: { home: true, quantity: false, maketen: false, stories: false, summary: false },
      qty: { round: 0, slots: D.createFrame(0), solved: 0, done: false },
      mt: { round: 0, partA: 0, slots: D.createFrame(0), solved: 0, done: false },
      st: { round: 0, slots: D.createFrame(0), solved: 0, done: false },
      completed: false
    };
    showScreen('home');
    updateChrome();
  }

  function renderFrame(el, slots, opts) {
    opts = opts || {};
    el.innerHTML = '';
    el.setAttribute('data-filled', String(D.countFilled(slots)));
    for (var i = 0; i < 10; i++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot' + (slots[i] ? ' filled' : '') + (opts.locked ? ' locked' : '');
      btn.setAttribute('aria-label', 'Slot ' + (i + 1) + (slots[i] ? ', filled with a shell' : ', empty'));
      btn.setAttribute('aria-pressed', slots[i] ? 'true' : 'false');
      btn.dataset.index = String(i);
      btn.textContent = slots[i] ? '🐚' : '';
      if (opts.locked) {
        btn.disabled = true;
      } else if (opts.onToggle) {
        btn.addEventListener('click', (function (idx) {
          return function () { opts.onToggle(idx); };
        })(i));
      }
      el.appendChild(btn);
    }
  }

  function renderDemoFrames() {
    document.querySelectorAll('.tenframe.demo').forEach(function (el) {
      var n = parseInt(el.getAttribute('data-filled') || '0', 10);
      renderFrame(el, D.createFrame(n), { locked: true });
    });
  }

  function updateTable(tableId, slots) {
    var tb = $(tableId).querySelector('tbody');
    tb.innerHTML = '';
    for (var i = 0; i < 10; i++) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + (i + 1) + '</td><td>' + (slots[i] ? 'Filled' : 'Empty') + '</td>';
      tb.appendChild(tr);
    }
  }

  function updateChrome() {
    document.querySelectorAll('.step-btn').forEach(function (btn) {
      var s = btn.getAttribute('data-screen');
      btn.disabled = !state.unlocked[s] && s !== 'home';
      if (s === state.screen) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
    var sc = $('btn-scaffold');
    sc.setAttribute('aria-pressed', state.scaffold === 'strong' ? 'true' : 'false');
    sc.textContent = state.scaffold === 'strong' ? 'Help level: Extra' : 'Help level: Light';
    var ra = $('btn-readaloud');
    ra.setAttribute('aria-pressed', state.readAloud ? 'true' : 'false');
    ra.textContent = state.readAloud ? 'Read aloud: On' : 'Read aloud: Off';
  }

  function showScreen(name) {
    state.screen = name;
    document.querySelectorAll('.screen').forEach(function (sec) {
      var match = sec.getAttribute('data-screen') === name;
      sec.classList.toggle('hidden', !match);
      if (match) sec.removeAttribute('hidden');
      else sec.setAttribute('hidden', '');
    });
    updateChrome();
    if (name === 'quantity') initQuantity();
    if (name === 'maketen') initMakeTen();
    if (name === 'stories') initStories();
    if (name === 'summary') initSummary();
    $('main').focus();
    save();
  }

  function scaffoldText(kind) {
    if (state.scaffold !== 'strong') return '';
    if (kind === 'qty') return 'Extra help: Touch empty slots or use Add shell. Count out loud: one, two, three… Match the big number.';
    if (kind === 'mt') return 'Extra help: Look at the locked shells. Count how many empty spaces remain to reach ten.';
    if (kind === 'st') return 'Extra help: Act out the story with counters. For take-away, start with the first number, then remove.';
    return '';
  }

  function setScaffoldEl(id, kind) {
    var el = $(id);
    var t = scaffoldText(kind);
    if (t) { el.textContent = t; el.classList.remove('hidden'); }
    else { el.textContent = ''; el.classList.add('hidden'); }
  }

  /* ===== Activity 1 ===== */
  function initQuantity() {
    if (state.qty.round >= C.QUANTITY_TARGETS.length) state.qty.round = C.QUANTITY_TARGETS.length - 1;
    var target = C.QUANTITY_TARGETS[state.qty.round];
    state.qty.slots = D.createFrame(0);
    $('qty-numeral').textContent = String(target);
    $('qty-words').textContent = D.numeralWord(target);
    $('qty-prompt').textContent = target === 0
      ? 'Show zero shells. Leave every slot empty.'
      : 'Put shells on the ten-frame to match ' + target + '.';
    $('qty-feedback').textContent = '';
    $('qty-feedback').className = 'feedback';
    $('qty-progress').textContent = 'Round ' + (state.qty.round + 1) + ' of ' + C.QUANTITY_TARGETS.length;
    setScaffoldEl('qty-scaffold', 'qty');
    paintQuantity();
    var next = $('qty-next');
    if (state.qty.done) {
      next.classList.remove('hidden');
      next.disabled = false;
    } else {
      next.classList.add('hidden');
      next.disabled = true;
    }
    speak($('qty-prompt').textContent);
  }

  function paintQuantity() {
    renderFrame($('qty-frame'), state.qty.slots, {
      onToggle: function (idx) {
        var filled = state.qty.slots[idx];
        state.qty.slots = D.setSlot(state.qty.slots, idx, !filled);
        paintQuantity();
      }
    });
    $('qty-count').textContent = 'Shells on the frame: ' + D.countFilled(state.qty.slots);
    updateTable('qty-table', state.qty.slots);
  }

  function checkQuantity() {
    var target = C.QUANTITY_TARGETS[state.qty.round];
    var fb = $('qty-feedback');
    if (D.matchesTarget(state.qty.slots, target)) {
      fb.className = 'feedback ok';
      fb.textContent = 'Yes! ' + target + ' is ' + D.numeralWord(target) + '. The numeral and the quantity match.';
      state.qty.solved++;
      speak(fb.textContent);
      if (state.qty.round < C.QUANTITY_TARGETS.length - 1) {
        state.qty.round++;
        setTimeout(initQuantity, 900);
      } else {
        state.qty.done = true;
        state.unlocked.maketen = true;
        $('qty-next').classList.remove('hidden');
        $('qty-next').disabled = false;
        fb.textContent += ' Activity 1 complete — continue when ready.';
        updateChrome();
        save();
      }
    } else {
      fb.className = 'feedback try';
      fb.textContent = D.quantityHint(state.qty.slots, target) +
        (state.scaffold === 'strong' ? ' Empty spaces: ' + D.emptySpaces(state.qty.slots) + '.' : '');
      speak(fb.textContent);
    }
  }

  /* ===== Activity 2 ===== */
  function initMakeTen() {
    if (state.mt.round >= C.MAKE_TEN_STARTS.length) state.mt.round = C.MAKE_TEN_STARTS.length - 1;
    state.mt.partA = C.MAKE_TEN_STARTS[state.mt.round];
    state.mt.slots = D.createFrame(0);
    $('mt-part-a').textContent = String(state.mt.partA);
    $('mt-part-b').textContent = '?';
    $('mt-prompt').textContent = state.mt.partA === 0
      ? 'Start with zero. Add shells until you make ten (0 + 10).'
      : state.mt.partA === 5
        ? 'Start with five. Add shells to make ten (5 + 5).'
        : 'Start with ' + state.mt.partA + '. Add shells so both parts make ten.';
    $('mt-feedback').textContent = '';
    $('mt-feedback').className = 'feedback';
    $('mt-progress').textContent = 'Bond ' + (state.mt.round + 1) + ' of ' + C.MAKE_TEN_STARTS.length;
    setScaffoldEl('mt-scaffold', 'mt');
    paintMakeTen();
    var next = $('mt-next');
    if (state.mt.done) { next.classList.remove('hidden'); next.disabled = false; }
    else { next.classList.add('hidden'); next.disabled = true; }
    speak($('mt-prompt').textContent);
  }

  function paintMakeTen() {
    renderFrame($('mt-frame-a'), D.createFrame(state.mt.partA), { locked: true });
    renderFrame($('mt-frame-b'), state.mt.slots, {
      onToggle: function (idx) {
        var filled = state.mt.slots[idx];
        // Only allow fills within remaining capacity conceptually — still OK to toggle any of 10,
        // correctness judged by count vs complement.
        state.mt.slots = D.setSlot(state.mt.slots, idx, !filled);
        paintMakeTen();
      }
    });
    var b = D.countFilled(state.mt.slots);
    $('mt-part-b').textContent = String(b);
    $('mt-count').textContent = 'Your shells: ' + b + ' · Together: ' + (state.mt.partA + b);
    $('mt-label-a').textContent = 'Starting shells: ' + state.mt.partA + ' (locked)';
    updateTable('mt-table', state.mt.slots);
  }

  function checkMakeTen() {
    var b = D.countFilled(state.mt.slots);
    var fb = $('mt-feedback');
    if (D.completesTen(state.mt.partA, b)) {
      fb.className = 'feedback ok';
      fb.textContent = 'Perfect! ' + state.mt.partA + ' + ' + b + ' = 10. You can see both parts making the whole.';
      speak(fb.textContent);
      state.mt.solved++;
      if (state.mt.round < C.MAKE_TEN_STARTS.length - 1) {
        state.mt.round++;
        setTimeout(initMakeTen, 900);
      } else {
        state.mt.done = true;
        state.unlocked.stories = true;
        $('mt-next').classList.remove('hidden');
        $('mt-next').disabled = false;
        fb.textContent += ' Activity 2 complete.';
        updateChrome();
        save();
      }
    } else {
      fb.className = 'feedback try';
      fb.textContent = D.makeTenHint(state.mt.partA, b) +
        (state.scaffold === 'strong' ? ' You need ' + D.complementToTen(state.mt.partA) + ' in all.' : '');
      // Strong scaffold reveals target count; light does not fully spoil on first try.
      speak(fb.textContent);
    }
  }

  /* ===== Activity 3 ===== */
  function currentStory() {
    return C.STORIES[state.st.round];
  }

  function initStories() {
    if (state.st.round >= C.STORIES.length) state.st.round = C.STORIES.length - 1;
    var s = currentStory();
    state.st.slots = D.createFrame(0);
    $('st-prompt').textContent = s.text;
    $('st-equation').textContent = 'Equation: ' + s.equation;
    $('st-feedback').textContent = '';
    $('st-feedback').className = 'feedback';
    $('st-progress').textContent = 'Story ' + (state.st.round + 1) + ' of ' + C.STORIES.length +
      (s.final ? ' (final quest)' : '');
    setScaffoldEl('st-scaffold', 'st');
    var pic = $('st-picture');
    pic.innerHTML = '';
    var show = s.op === 'sub' ? s.start : Math.min(s.start, 10);
    for (var i = 0; i < show; i++) {
      var span = document.createElement('span');
      span.textContent = s.emoji;
      span.setAttribute('aria-hidden', 'true');
      pic.appendChild(span);
    }
    if (s.op === 'add' && s.start === 0) {
      pic.textContent = '(none yet) ' + s.emoji;
    }
    paintStories();
    var next = $('st-next');
    if (state.st.done) { next.classList.remove('hidden'); next.disabled = false; }
    else { next.classList.add('hidden'); next.disabled = true; }
    speak(s.text);
  }

  function paintStories() {
    renderFrame($('st-frame'), state.st.slots, {
      onToggle: function (idx) {
        state.st.slots = D.setSlot(state.st.slots, idx, !state.st.slots[idx]);
        paintStories();
      }
    });
    $('st-count').textContent = 'Counters: ' + D.countFilled(state.st.slots);
  }

  function expectedStory() {
    var s = currentStory();
    if (s.answerMode === 'whole') return s.expected;
    return D.storyAnswer(s.op, s.start, s.change);
  }

  function checkStories() {
    var s = currentStory();
    var have = D.countFilled(state.st.slots);
    var exp = expectedStory();
    var fb = $('st-feedback');
    if (have === exp) {
      fb.className = 'feedback ok';
      if (s.final) {
        fb.textContent = 'Quest complete! Starting from seven, adding three completes ten: 7 + 3 = 10. Great exploring.';
      } else if (s.op === 'sub') {
        fb.textContent = 'Yes — ' + s.start + ' − ' + s.change + ' = ' + exp + '. No negative amounts.';
      } else {
        fb.textContent = 'Yes — ' + s.start + ' + ' + s.change + ' = ' + exp + '.';
      }
      speak(fb.textContent);
      state.st.solved++;
      if (state.st.round < C.STORIES.length - 1) {
        state.st.round++;
        setTimeout(initStories, 1000);
      } else {
        state.st.done = true;
        state.unlocked.summary = true;
        state.completed = true;
        $('st-next').classList.remove('hidden');
        $('st-next').disabled = false;
        updateChrome();
        save();
      }
    } else {
      fb.className = 'feedback try';
      fb.textContent = D.storyHint(s.op, s.start, s.change, have);
      speak(fb.textContent);
    }
  }

  function initSummary() {
    var ul = $('sum-list');
    ul.innerHTML =
      '<li>Built quantities on a ten-frame (including zero and ten)</li>' +
      '<li>Completed number bonds to 10 (including 0+10 and 5+5)</li>' +
      '<li>Solved addition and subtraction stories within ten</li>' +
      '<li>Rounds cleared — Build: ' + state.qty.solved + ', Make Ten: ' + state.mt.solved + ', Stories: ' + state.st.solved + '</li>';
  }

  /* ===== Wiring ===== */
  function bind() {
    $('btn-start').addEventListener('click', function () {
      state.unlocked.quantity = true;
      showScreen('quantity');
    });
    $('btn-reset-all').addEventListener('click', function () {
      if (confirm('Clear saved progress and restart the lesson?')) resetAll();
    });
    $('btn-scaffold').addEventListener('click', function () {
      state.scaffold = state.scaffold === 'light' ? 'strong' : 'light';
      updateChrome();
      if (state.screen === 'quantity') setScaffoldEl('qty-scaffold', 'qty');
      if (state.screen === 'maketen') setScaffoldEl('mt-scaffold', 'mt');
      if (state.screen === 'stories') setScaffoldEl('st-scaffold', 'st');
      save();
    });
    $('btn-readaloud').addEventListener('click', function () {
      state.readAloud = !state.readAloud;
      if (!state.readAloud && window.speechSynthesis) window.speechSynthesis.cancel();
      updateChrome();
    });
    document.querySelectorAll('.step-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var s = btn.getAttribute('data-screen');
        if (state.unlocked[s] || s === 'home') showScreen(s);
      });
    });

    $('qty-add').addEventListener('click', function () { state.qty.slots = D.addOne(state.qty.slots); paintQuantity(); });
    $('qty-remove').addEventListener('click', function () { state.qty.slots = D.removeOne(state.qty.slots); paintQuantity(); });
    $('qty-clear').addEventListener('click', function () { state.qty.slots = D.clearFrame(); paintQuantity(); });
    $('qty-check').addEventListener('click', checkQuantity);
    $('qty-hint').addEventListener('click', function () {
      var t = C.QUANTITY_TARGETS[state.qty.round];
      $('qty-feedback').className = 'feedback try';
      $('qty-feedback').textContent = D.quantityHint(state.qty.slots, t);
    });
    $('qty-next').addEventListener('click', function () { showScreen('maketen'); });

    $('mt-add').addEventListener('click', function () { state.mt.slots = D.addOne(state.mt.slots); paintMakeTen(); });
    $('mt-remove').addEventListener('click', function () { state.mt.slots = D.removeOne(state.mt.slots); paintMakeTen(); });
    $('mt-clear').addEventListener('click', function () { state.mt.slots = D.clearFrame(); paintMakeTen(); });
    $('mt-check').addEventListener('click', checkMakeTen);
    $('mt-hint').addEventListener('click', function () {
      $('mt-feedback').className = 'feedback try';
      $('mt-feedback').textContent = D.makeTenHint(state.mt.partA, D.countFilled(state.mt.slots));
    });
    $('mt-next').addEventListener('click', function () { showScreen('stories'); });

    $('st-add').addEventListener('click', function () { state.st.slots = D.addOne(state.st.slots); paintStories(); });
    $('st-remove').addEventListener('click', function () { state.st.slots = D.removeOne(state.st.slots); paintStories(); });
    $('st-clear').addEventListener('click', function () { state.st.slots = D.clearFrame(); paintStories(); });
    $('st-check').addEventListener('click', checkStories);
    $('st-hint').addEventListener('click', function () {
      var s = currentStory();
      $('st-feedback').className = 'feedback try';
      $('st-feedback').textContent = D.storyHint(s.op, s.start, s.change, D.countFilled(state.st.slots));
    });
    $('st-next').addEventListener('click', function () { showScreen('summary'); });

    $('btn-replay').addEventListener('click', function () {
      resetAll();
      state.unlocked.quantity = true;
      showScreen('quantity');
    });
    $('btn-home').addEventListener('click', function () { showScreen('home'); });

    // Keyboard: number keys add/remove on activity screens
    document.addEventListener('keydown', function (e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === '+' || e.key === '=') {
        if (state.screen === 'quantity') { state.qty.slots = D.addOne(state.qty.slots); paintQuantity(); }
        if (state.screen === 'maketen') { state.mt.slots = D.addOne(state.mt.slots); paintMakeTen(); }
        if (state.screen === 'stories') { state.st.slots = D.addOne(state.st.slots); paintStories(); }
      }
      if (e.key === '-' || e.key === '_') {
        if (state.screen === 'quantity') { state.qty.slots = D.removeOne(state.qty.slots); paintQuantity(); }
        if (state.screen === 'maketen') { state.mt.slots = D.removeOne(state.mt.slots); paintMakeTen(); }
        if (state.screen === 'stories') { state.st.slots = D.removeOne(state.st.slots); paintStories(); }
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        if (state.screen === 'quantity') checkQuantity();
        if (state.screen === 'maketen') checkMakeTen();
        if (state.screen === 'stories') checkStories();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    load();
    bind();
    renderDemoFrames();
    updateChrome();
    // Resume only if unlocked; otherwise home
    if (state.screen && state.unlocked[state.screen]) showScreen(state.screen);
    else showScreen('home');
  });
})();
