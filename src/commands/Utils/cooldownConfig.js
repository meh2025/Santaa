// CHANGE COOLDOWN TIME IF YOU WANT TEST COMMAND FASTER

const COOLDOWN_MODE = process.env.COOLDOWN_MODE === 'test' ? 'test' : 'prod';

const configs = {
  prod: {
    parttime: 4 * 60 * 1000,
    beg: 100 * 1000,
    crime: 300 * 1000,
    steal: 300 * 1000,
    daily: 24 * 60 * 60 * 1000,
    fishExhaustion: 60 * 60 * 1000,
    mineExhaustion: 60 * 60 * 1000,
    jobWorkCooldown: 5 * 60 * 1000,
    jobFirePenalty: 2.5 * 60 * 1000,
  },
  test: {
    parttime: 5 * 1000,
    beg: 5 * 1000,
    crime: 5 * 1000,
    steal: 5 * 1000,
    daily: 10 * 1000,
    fishExhaustion: 5 * 1000,
    mineExhaustion: 5 * 1000,
    jobWorkCooldown: 5 * 1000,
    jobFirePenalty: 2 * 1000,
  }
};

module.exports = {
  mode: COOLDOWN_MODE,
  ...configs[COOLDOWN_MODE],
};
