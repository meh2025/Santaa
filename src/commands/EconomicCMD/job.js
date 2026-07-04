const { EmbedBuilder } = require('discord.js');
const { getJobById, getJobByIdentifier, getAvailableJobs } = require('./jobs/jobData');
const runJobMinigame = require('./jobs/minigameRunner');
const buildJobResultEmbed = require('./jobs/buildJobResultEmbed');
const { JobStart, JobSuccess, JobFail } = require('../Utils/misc');

const cooldownConfig = require('../Utils/cooldownConfig');
const TEST_MONTH_WORK_REQUIREMENT = 10;
const TEST_FIRST_BONUS_RANGE = { min: 30, max: 40 };
const TEST_MONTH_PAY = 300;

function formatTimeLeft(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function getRandomText(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  name: 'job',
  description: 'The most feared word in the world... THE JOB!!!! (use `Zjob help` for more info)',
  category: 'eco',
  async execute(message, args = []) {
    const { author } = message;
    const dbManager = message.client.db;

    const state = await dbManager.getJobState(author.id);
    const now = Date.now();

    const action = args[0] && args[0].toLowerCase();
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setTitle('💼 Job usage')
        .setDescription('To know job usage, use `Zjob help`')
        .setColor('#F59E0B');
      return message.channel.send({ embeds: [embed] });
    }

    if (action === 'help') {
      const embed = new EmbedBuilder()
        .setTitle('💼 Job usage')
        .setDescription('Here are the available ways to use the job system:\n\n• `job` - work your current job\n• `job list` - view all available careers\n• `job choose <job_name>` - choose a new job')
        .setColor('#F59E0B');
      return message.channel.send({ embeds: [embed] });
    }

    if (action === 'list') {
      const jobOptions = getAvailableJobs().map(job => `${job.icon} **${job.name}** — ${job.salary}🪙/shift\n${job.description}`).join('\n\n');
      const embed = new EmbedBuilder()
        .setTitle('💼 Available careers')
        .setDescription(jobOptions)
        .setColor('#22C55E');
      return message.channel.send({ embeds: [embed] });
    }

    if (action === 'choose') {
      const targetJob = getJobByIdentifier(args[1]);
      if (!targetJob) {
        return message.reply('That job was not found. Use `Zjob list` to see the available careers.');
      }

      await dbManager.updateJobProgress(author.id, {
        job_id: targetJob.id,
        work_count: 0,
        last_worked_at: 0,
        fired_at: 0,
        fired_until: 0,
        first_bonus_received: 0
      });

      return message.reply(`You chose **${targetJob.name}**! Your new job is ready.`);
    }

    if (action === 'work') {
      // continue with the work flow below
    } else if (action && action !== 'help' && action !== 'list' && action !== 'choose') {
      return message.reply('Unknown job action. Use `Zjob help` to see the available commands.');
    }

    if (state.fired_until > now) {
      const waitTime = state.fired_until - now;
      return message.reply(`You were fired and cannot work again for ${formatTimeLeft(waitTime)}.`);
    }

    const job = getJobById(state.job_id);
    if (!job) {
      return message.reply('Your saved job could not be found. Please try again later.');
    }

    const lastWorkedAt = Number(state.last_worked_at || 0);
    if (lastWorkedAt && now - lastWorkedAt > cooldownConfig.jobWorkCooldown) {
      await dbManager.updateJobProgress(author.id, {
        fired_at: now,
        fired_until: now + cooldownConfig.jobFirePenalty,
        work_count: Math.max(0, Number(state.work_count) - 1)
      });
      return message.reply('You were fired for missing work for too long. Take a short break and try again soon.');
    }

    const pay = job.salary;
    let bonus = 0;

    if (Number(state.work_count) + 1 >= TEST_MONTH_WORK_REQUIREMENT) {
      bonus += TEST_MONTH_PAY;
    }

    if (Number(state.first_bonus_received) === 0) {
      const firstBonus = Math.floor(Math.random() * (TEST_FIRST_BONUS_RANGE.max - TEST_FIRST_BONUS_RANGE.min + 1)) + TEST_FIRST_BONUS_RANGE.min;
      bonus += firstBonus;
    }

    const minigameResult = await runJobMinigame(message, dbManager, author.id);
    const shouldReward = Boolean(minigameResult.success);
    const failurePenalty = Math.floor(Math.random() * 20) + 10;
    const jobOutcomeText = shouldReward ? getRandomText(JobSuccess) : getRandomText(JobFail);
    const amountText = shouldReward ? `${pay + bonus}🪙` : `${failurePenalty}🪙`;

    if (shouldReward) {
      await dbManager.addMoney(author.id, pay + bonus, { trackEarning: true });
    } else {
      await dbManager.removeMoney(author.id, failurePenalty);
    }

    const nextWorkCount = Number(state.work_count) + 1;
    const nextFirstBonusReceived = Number(state.first_bonus_received) === 0 ? 1 : Number(state.first_bonus_received);

    await dbManager.updateJobProgress(author.id, {
      work_count: nextWorkCount,
      last_worked_at: now,
      fired_at: 0,
      fired_until: 0,
      first_bonus_received: nextFirstBonusReceived
    });

    const embed = buildJobResultEmbed({
      job,
      jobOutcomeText,
      amountText,
      shouldReward,
      minigameResult,
      nextWorkCount
    });

    message.channel.send({ embeds: [embed] });
  }
};
