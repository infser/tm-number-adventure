/**
 * Learning content separated from UI.
 */
(function (global) {
  'use strict';

  var QUANTITY_TARGETS = [0, 3, 7, 10, 5]; // includes zero and ten

  // At least five bonds including 0+10 and 5+5
  var MAKE_TEN_STARTS = [0, 5, 7, 2, 9];

  var STORIES = [
    {
      id: 's1',
      text: 'Four bright fish swim near the dock. Three more fish join them. How many fish are there now?',
      op: 'add', start: 4, change: 3, emoji: '🐟',
      equation: '4 + 3 = ?',
      guided: true
    },
    {
      id: 's2',
      text: 'Maya finds 6 shiny shells. She finds 2 more. How many shells does Maya have?',
      op: 'add', start: 6, change: 2, emoji: '🐚',
      equation: '6 + 2 = ?',
      guided: true
    },
    {
      id: 's3',
      text: 'There are 9 coconuts in a basket. Sam takes 4 away for lunch. How many coconuts are left?',
      op: 'sub', start: 9, change: 4, emoji: '🥥',
      equation: '9 − 4 = ?',
      guided: true
    },
    {
      id: 's4',
      text: 'Zero crabs are on the rock. Then 8 crabs climb up. How many crabs are on the rock?',
      op: 'add', start: 0, change: 8, emoji: '🦀',
      equation: '0 + 8 = ?',
      guided: true
    },
    {
      id: 's5',
      text: 'Ten birds sit on a wire. Five fly away. How many birds stay?',
      op: 'sub', start: 10, change: 5, emoji: '🐦',
      equation: '10 − 5 = ?',
      guided: true
    },
    {
      id: 's6',
      text: 'Leo packs 1 map. He packs 9 more maps. How many maps are packed?',
      op: 'add', start: 1, change: 9, emoji: '🗺️',
      equation: '1 + 9 = ?',
      guided: true
    },
    {
      id: 's7',
      text: 'FINAL QUEST: A chest holds 7 gold coins. Explorers add enough coins to make ten. How many coins did they add? Show the total in the frame as ten.',
      op: 'add', start: 7, change: 3, emoji: '🪙',
      equation: '7 + 3 = 10',
      guided: false,
      final: true,
      // Learner shows the whole (10) after composing
      answerMode: 'whole',
      expected: 10
    }
  ];

  global.TenContent = {
    QUANTITY_TARGETS: QUANTITY_TARGETS,
    MAKE_TEN_STARTS: MAKE_TEN_STARTS,
    STORIES: STORIES,
    TITLE: 'Treasure Ten Island',
    SESSION: '8–12 minutes'
  };
})(typeof window !== 'undefined' ? window : global);
