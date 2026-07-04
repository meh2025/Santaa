const fs = require('node:fs');
const path = require('node:path');

class QLearningBoss {
  constructor({ bossId, storagePath = path.join(__dirname, 'boss_q_data.json'), epsilon = 0.2, alpha = 0.3, gamma = 0.9 } = {}) {
    this.bossId = bossId;
    this.storagePath = storagePath;
    this.epsilon = epsilon;
    this.alpha = alpha;
    this.gamma = gamma;
    this.qTable = this.load();
  }

  load() {
    try {
      const raw = fs.readFileSync(this.storagePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.training_data && parsed.training_data.qTable) {
        return parsed.training_data.qTable;
      }
    } catch (error) {
      console.error(`Error loading Q-Table for ${this.bossId}:`, error);
    }
    return {};
  }

  save() {
    try {
      let data = {};
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, 'utf8');
        data = JSON.parse(raw);
      }
      
      if (!data.training_data) {
        data.training_data = { total_matches: 0, win_rate: 0, qTable: {}, learned_lessons: [] };
      }
      
      data.training_data.qTable = this.qTable;
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error saving Q-Table for ${this.bossId}:`, error);
    }
  }

  getStateKey(state) {
    return String(state);
  }

  getStateStats(state) {
    const key = this.getStateKey(state);
    if (!this.qTable[key]) {
      this.qTable[key] = {};
    }
    return this.qTable[key];
  }

  getQValue(state, action) {
    const stats = this.getStateStats(state);
    if (stats[action] === undefined) {
      stats[action] = 0;
    }
    return stats[action];
  }

  chooseAction(state, actions) {
    const normalizedActions = Array.isArray(actions) && actions.length > 0 ? actions : ['attack', 'defend', 'recover'];
    const stateKey = this.getStateKey(state);
    const stateStats = this.getStateStats(stateKey);

    if (Math.random() < this.epsilon) {
      return normalizedActions[Math.floor(Math.random() * normalizedActions.length)];
    }

    const scoredActions = normalizedActions.map(action => ({
      action,
      value: this.getQValue(stateKey, action)
    }));

    scoredActions.sort((a, b) => b.value - a.value);
    return scoredActions[0].action;
  }

  update(state, action, reward, nextState) {
    const currentValue = this.getQValue(state, action);
    const nextMax = this.getBestQValue(nextState);
    const updated = currentValue + this.alpha * (reward + this.gamma * nextMax - currentValue);

    const stateStats = this.getStateStats(state);
    stateStats[action] = updated;
    stateStats.visits = (stateStats.visits || 0) + 1;
    this.save();
    return updated;
  }

  getBestQValue(state) {
    const stateStats = this.getStateStats(state);
    const actions = Object.keys(stateStats).filter(key => key !== 'visits');
    if (actions.length === 0) {
      return 0;
    }

    return Math.max(...actions.map(action => stateStats[action]));
  }

  analyzeMatch(combatLog) {
    // Basic heuristics to learn player behavior without LLM
    if (!combatLog || combatLog.length === 0) return;
    
    let defends = 0;
    let attacks = 0;
    let heavyAttacks = 0;
    let recovers = 0;
    for (let action of combatLog) {
      if (action === 'defend') defends++;
      if (action === 'attack') attacks++;
      if (action === 'heavy_attack') heavyAttacks++;
      if (action === 'recover') recovers++;
    }
    
    let lesson = "";
    if (heavyAttacks >= 3) {
      lesson = `The opponent really likes using heavy attacks. You should defend more to drain their stamina.`;
    } else if (recovers >= 2) {
      lesson = `The opponent heals a lot. Keep attacking aggressively with heavy attacks to overwhelm their healing.`;
    } else if (defends > attacks * 2) {
      lesson = `The opponent likes defending (${defends} times). Prioritize constant pressure or break their guard with heavy attacks.`;
    } else if (attacks > defends * 2) {
      lesson = `The opponent is very aggressive (${attacks} times). Increase defense to wear them down.`;
    } else {
      lesson = "The opponent has an unpredictable playstyle; use the Q-table to find openings.";
    }

    try {
      let data = {};
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, 'utf8');
        data = JSON.parse(raw);
      }
      if (!data.training_data) data.training_data = { total_matches: 0, win_rate: 0, qTable: {}, learned_lessons: [] };
      
      // Update match stats
      data.training_data.total_matches = (data.training_data.total_matches || 0) + 1;
      
      // Keep only last 5 lessons
      let lessons = data.training_data.learned_lessons || [];
      if (!lessons.includes(lesson)) {
        lessons.unshift(lesson); // Add new lesson at start
        if (lessons.length > 5) lessons.pop();
        data.training_data.learned_lessons = lessons;
      }
      
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`Error saving lessons for ${this.bossId}:`, e);
    }
  }
}

module.exports = { QLearningBoss };
