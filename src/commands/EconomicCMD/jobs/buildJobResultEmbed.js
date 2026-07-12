const { EmbedBuilder } = require('discord.js');
const { JobSuccess, JobFail } = require('../../Utils/misc');

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildJobResultEmbed({ job, jobOutcomeText, amountText, shouldReward, minigameResult }) {
  const title = jobOutcomeText || (shouldReward ? 'Job Completed!' : 'Job Failed...');
  const flavor = shouldReward ? getRandom(JobSuccess) : getRandom(JobFail);

  // Minigame summary line
  const minigameSummary = minigameResult?.summary
    ? `> *${minigameResult.summary}*`
    : '';

  const salaryLine = shouldReward
    ? `**Salary earned:** ${amountText}`
    : `**Half salary (consolation):** ${amountText}`;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(
      `*"${flavor}"*\n\n` +
      `${salaryLine}\n` +
      (minigameSummary ? `\n${minigameSummary}` : '')
    )
    .setColor(shouldReward ? '#16A34A' : '#DC2626')
    .setFooter({ text: `Working as a ${job.name}` });

  return embed;
}

module.exports = buildJobResultEmbed;
