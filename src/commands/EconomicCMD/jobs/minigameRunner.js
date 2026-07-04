const runHelperNPC = require('./minigames/helperNPC');
const runPenaltyKick = require('./minigames/penaltyKick');
const runNumberGuess = require('./minigames/numberGuess');

const minigames = [runHelperNPC, runPenaltyKick, runNumberGuess];

module.exports = async function runJobMinigame(message, dbManager, authorId) {
  const game = minigames[Math.floor(Math.random() * minigames.length)];
  return game(message, dbManager, authorId);
};
