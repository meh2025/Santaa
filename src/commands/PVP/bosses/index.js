const { QLearningBoss } = require('./qLearning');
const fs = require('fs');
const path = require('path');

const bossesDir = path.join(__dirname, '../../../../database/bosses');

function loadBossProfiles() {
  const profiles = [];
  if (fs.existsSync(bossesDir)) {
    const files = fs.readdirSync(bossesDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(bossesDir, file), 'utf8');
        const parsed = JSON.parse(raw);
        profiles.push(parsed);
      } catch (err) {
        console.error(`Error loading boss profile ${file}:`, err);
      }
    }
  }
  return profiles.length > 0 ? profiles : [
    {
      id: 'fallback',
      name: 'Fallback Boss',
      title: 'Missing Database',
      hp: 100,
      stamina: 100,
      behavior: 'balanced',
      aggression: 0.5,
      description: 'Loaded because database/bosses is empty.'
    }
  ];
}

let bossProfilesCache = loadBossProfiles();

const bossesMemoryDir = path.join(__dirname, '../../../../database/bosses_memory');

function ensureBossesMemoryDir(targetDir = bossesMemoryDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  return targetDir;
}

function createBossTrainer(bossId, playerId) {
  ensureBossesMemoryDir();

  const memoryFile = path.join(bossesMemoryDir, `${bossId}_${playerId}.json`);
  
  // If player hasn't fought this boss yet, inherit the base training_data from the boss profile
  if (!fs.existsSync(memoryFile)) {
    try {
      const bossProfile = getBossProfile(bossId);
      const baseData = {
        training_data: bossProfile.training_data || { total_matches: 0, win_rate: 0, qTable: {}, learned_lessons: [] }
      };
      fs.writeFileSync(memoryFile, JSON.stringify(baseData, null, 2));
    } catch (err) {
      console.error(`Error initializing memory for ${bossId}_${playerId}:`, err);
    }
  }

  return new QLearningBoss({ bossId, storagePath: memoryFile });
}

function getBossProfiles() {
  // Reload in case they were updated externally
  bossProfilesCache = loadBossProfiles();
  return bossProfilesCache;
}

function getBossProfile(id) {
  const profiles = getBossProfiles();
  const normalized = String(id || '').toLowerCase();
  return profiles.find(profile => profile.id === normalized || profile.name.toLowerCase() === normalized || profile.title.toLowerCase() === normalized) || profiles[0];
}

module.exports = { bossProfiles: bossProfilesCache, getBossProfiles, getBossProfile, createBossTrainer, ensureBossesMemoryDir };
