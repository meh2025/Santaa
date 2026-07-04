const jobs = [
  {
    id: 'farmer',
    name: 'Farmer',
    icon: '👨‍🌾',
    description: 'Plant crops and harvest the field.',
    requiredWorkCount: 0,
    salary: 70,
    welcomeText: ['A steady hand and a sunny field.']
  },
  {
    id: 'fisher',
    name: 'Fisher',
    icon: '🎣',
    description: 'Cast a line and wait for luck to bite.',
    requiredWorkCount: 3,
    salary: 95,
    welcomeText: ['The river never gives up its secrets easily.']
  },
  {
    id: 'miner',
    name: 'Miner',
    icon: '⛏️',
    description: 'Dig deeper for unique treasures.',
    requiredWorkCount: 6,
    salary: 120,
    welcomeText: ['Every chip of stone could lead to gold.']
  },
  {
    id: 'cook',
    name: 'Cook',
    icon: '👨‍🍳',
    description: 'Serve hot meals and quick energy.',
    requiredWorkCount: 9,
    salary: 140,
    welcomeText: ['The kitchen is full of pressure and flavor.']
  }
];

function getJobById(id) {
  return jobs.find(job => job.id === id) || null;
}

function getJobByIdentifier(identifier) {
  if (!identifier) return null;
  const normalized = String(identifier).trim().toLowerCase();
  return jobs.find(job => job.id === normalized || job.name.toLowerCase() === normalized) || null;
}

function getAvailableJobs(workCount = Number.POSITIVE_INFINITY) {
  return jobs.filter(job => job.requiredWorkCount <= workCount);
}

module.exports = {
  jobs,
  getJobById,
  getJobByIdentifier,
  getAvailableJobs
};
