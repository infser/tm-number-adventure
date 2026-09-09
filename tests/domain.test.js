/** Node test runner for domain calculations (no browser). */
var assert = require('assert');
var path = require('path');
// Load domain.js which attaches to global
global.window = undefined;
require(path.join(__dirname, '..', 'domain.js'));
var D = global.TenDomain;

var passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('PASS:', name);
  } catch (e) {
    console.error('FAIL:', name, e.message);
    process.exitCode = 1;
  }
}

test('ten-frame always 10 slots', function () {
  var f = D.createFrame(7);
  assert.strictEqual(f.length, 10);
  assert.strictEqual(D.countFilled(f), 7);
});

test('cannot conceptually exceed 10 via createFrame', function () {
  assert.strictEqual(D.countFilled(D.createFrame(99)), 10);
  assert.strictEqual(D.countFilled(D.createFrame(-3)), 0);
});

test('slots do not duplicate fill count when setting same slot', function () {
  var f = D.clearFrame();
  f = D.setSlot(f, 0, true);
  f = D.setSlot(f, 0, true);
  assert.strictEqual(D.countFilled(f), 1);
});

test('addOne fills first empty; removeOne clears last filled', function () {
  var f = D.createFrame(0);
  f = D.addOne(f);
  f = D.addOne(f);
  assert.strictEqual(D.countFilled(f), 2);
  f = D.removeOne(f);
  assert.strictEqual(D.countFilled(f), 1);
});

test('zero represented deliberately', function () {
  assert.ok(D.matchesTarget(D.createFrame(0), 0));
  assert.strictEqual(D.numeralWord(0), 'zero');
});

test('starting from seven, adding three completes ten → 7+3=10', function () {
  assert.ok(D.completesTen(7, 3));
  assert.strictEqual(D.complementToTen(7), 3);
  assert.strictEqual(D.storyAnswer('add', 7, 3), 10);
});

test('removing four from nine produces five; no negatives', function () {
  assert.strictEqual(D.storyAnswer('sub', 9, 4), 5);
  assert.strictEqual(D.storyAnswer('sub', 3, 9), 0);
});

test('bonds include 0+10 and 5+5', function () {
  assert.ok(D.completesTen(0, 10));
  assert.ok(D.completesTen(5, 5));
});

test('retries: clear does not corrupt', function () {
  var f = D.createFrame(8);
  f = D.clearFrame();
  assert.strictEqual(D.countFilled(f), 0);
  f = D.addOne(f);
  assert.strictEqual(D.countFilled(f), 1);
});

test('checkStory matches expected', function () {
  assert.ok(D.checkStory('add', 4, 3, 7));
  assert.ok(D.checkStory('sub', 9, 4, 5));
  assert.ok(!D.checkStory('add', 4, 3, 6));
});

console.log('Passed', passed, 'tests');
