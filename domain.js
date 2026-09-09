/**
 * Domain model for Treasure Ten Island.
 * Pure functions for ten-frame state, number bonds, and story results.
 * Correctness depends on mathematical result, not slot placement order.
 */
(function (global) {
  'use strict';

  var WORD = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];

  function clampCount(n) {
    n = Number(n);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(10, Math.trunc(n)));
  }

  /** Create a ten-frame occupancy array (length 10). true = filled. */
  function createFrame(filledCount) {
    var n = clampCount(filledCount);
    var slots = [];
    for (var i = 0; i < 10; i++) slots.push(i < n);
    return slots;
  }

  function countFilled(slots) {
    if (!Array.isArray(slots) || slots.length !== 10) throw new Error('ten-frame must have 10 slots');
    var c = 0;
    for (var i = 0; i < 10; i++) if (slots[i]) c++;
    return c;
  }

  /** Toggle or set a slot; enforces no duplicate fill beyond capacity rules via count. */
  function setSlot(slots, index, filled) {
    if (!Array.isArray(slots) || slots.length !== 10) throw new Error('ten-frame must have 10 slots');
    if (index < 0 || index > 9) throw new Error('slot index out of range');
    var next = slots.slice();
    next[index] = !!filled;
    return next;
  }

  /** Add one shell into the first empty slot (left-to-right, top-then-bottom). */
  function addOne(slots) {
    var next = slots.slice();
    for (var i = 0; i < 10; i++) {
      if (!next[i]) { next[i] = true; return next; }
    }
    return next;
  }

  /** Remove one shell from the last filled slot. */
  function removeOne(slots) {
    var next = slots.slice();
    for (var i = 9; i >= 0; i--) {
      if (next[i]) { next[i] = false; return next; }
    }
    return next;
  }

  function clearFrame() {
    return createFrame(0);
  }

  function matchesTarget(slots, target) {
    return countFilled(slots) === clampCount(target);
  }

  /** Number bond: partA + partB === 10? */
  function completesTen(partA, partB) {
    return clampCount(partA) + clampCount(partB) === 10;
  }

  function complementToTen(partA) {
    return 10 - clampCount(partA);
  }

  /**
   * Story problem result check.
   * op: 'add' | 'sub'
   * start, change, answer are integers 0..10; subtraction never yields negative.
   */
  function storyAnswer(op, start, change) {
    start = clampCount(start);
    change = clampCount(change);
    if (op === 'add') return clampCount(start + change);
    if (op === 'sub') {
      if (change > start) return 0; // never negative quantities
      return start - change;
    }
    throw new Error('unknown op');
  }

  function checkStory(op, start, change, learnerCount) {
    return clampCount(learnerCount) === storyAnswer(op, start, change);
  }

  function numeralWord(n) {
    n = clampCount(n);
    return WORD[n];
  }

  function emptySpaces(slots) {
    return 10 - countFilled(slots);
  }

  /** Hint text strategies (do not reveal full answer immediately). */
  function quantityHint(slots, target) {
    var have = countFilled(slots);
    var t = clampCount(target);
    if (have === t) return 'Count the shells. Does the number match?';
    if (have < t) return 'You have ' + have + '. Count the empty spaces you still need.';
    return 'Too many shells. Try removing some and count again.';
  }

  function makeTenHint(partA, learnerB) {
    var need = complementToTen(partA);
    var have = clampCount(learnerB);
    if (have === need) return 'Count both parts together. Do they make ten?';
    if (have < need) return 'Starting side has ' + partA + '. Count empty spaces on a full ten to see how many more.';
    return 'You added more than needed. Remove some and count the empty spaces.';
  }

  function storyHint(op, start, change, have) {
    var ans = storyAnswer(op, start, change);
    have = clampCount(have);
    if (have === ans) return 'Check your counters against the story once more.';
    if (op === 'add') {
      if (have < ans) return 'Start with ' + start + ', then add. Count on from ' + start + '.';
      return 'That looks like more than the story. Remove some and recount.';
    }
    if (have > ans) return 'Take away carefully. Count what is left.';
    return 'You may have removed too many. Put some back and recount.';
  }

  global.TenDomain = {
    WORD: WORD,
    clampCount: clampCount,
    createFrame: createFrame,
    countFilled: countFilled,
    setSlot: setSlot,
    addOne: addOne,
    removeOne: removeOne,
    clearFrame: clearFrame,
    matchesTarget: matchesTarget,
    completesTen: completesTen,
    complementToTen: complementToTen,
    storyAnswer: storyAnswer,
    checkStory: checkStory,
    numeralWord: numeralWord,
    emptySpaces: emptySpaces,
    quantityHint: quantityHint,
    makeTenHint: makeTenHint,
    storyHint: storyHint
  };
})(typeof window !== 'undefined' ? window : global);
