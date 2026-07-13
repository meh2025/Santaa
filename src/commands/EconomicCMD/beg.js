const { EmbedBuilder } = require('discord.js');
const { checkCooldown } = require('../Utils/Cooldown');
const { NPC, BegSuccess, BegFail, BegStolen } = require('../Utils/misc');
const { CURRENCY_EMOJI } = require('../Utils/config');

module.exports = {
    name: 'beg',
    description: 'You so broke that you have to beg money 😭😭',
    category: 'eco',
    async execute(message) {
        const { client, author } = message;
        const dbManager = message.client.db;

        // Cooldown
        const timeLeft = checkCooldown(author.id, this.name);

        if (timeLeft) {
            return message.reply({ content: `Please wait ${timeLeft} before using the \`${this.name}\` command again.`, ephemeral: true });
        }

        const amount = Math.floor(Math.random() * 90) + 1;

        const roll = Math.floor(Math.random() * 100) + 1; // random from 1 to 100
        let chance;

        if (roll <= 20) {
            chance = 1; // 1 - 20: 20% Success
        } else if (roll <= 40) {
            chance = 3; // 21 - 40: 20% Stolen
        } else {
            chance = 2; // 41 - 100: 60% Fail
        }

        const embed = new EmbedBuilder()
        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        try {
            if (chance === 1) {
                await dbManager.addMoney(author.id, amount, { trackEarning: true });
                const randomNPC = getRandom(NPC);

                embed.setTitle('Begged for money!')
                    .setDescription(`${randomSuccess} ${randomNPC} come in and they throw money at your face! You got **${amount.toLocaleString()}${CURRENCY_EMOJI}**!`)

            } else if (chance === 2) {
                const randomFail = getRandom(BegFail);

                embed.setTitle('Begging Failed!')
                    .setDescription(`${randomFail}`)
            } else if (chance === 3) {
                await dbManager.removeMoney(author.id, amount);
                const randomStolen = getRandom(BegStolen);

                embed.setTitle('Oh no! You got robbed!')
                    .setDescription(`${randomStolen}\n\nYou lost **${amount.toLocaleString()}${CURRENCY_EMOJI}**!`)
            }
            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error occurred while begging:', error);
            message.reply('An error occurred while executing the command.');
        }
    }
}