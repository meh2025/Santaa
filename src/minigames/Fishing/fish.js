// Dont ask why fish.js here cuz im accidentally forgot and when move it into minigame it cause bug so imma leave it here for short time

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getRandomFish, calculateExp } = require('./fishCore');
const rpgmanager = require('../../../database/rpgmanager');
const { checkCooldown } = require('../../commands/Utils/Cooldown');

const fishCounts = new Map(); // userId -> count

module.exports = {
    name: 'fish',
    description: 'Start fishing for rare fish!',
    category: 'mie',
    async execute(message, args) {
        const userId = message.author.id;

        // 1. Check if the user has reached the 5-catch limit
        const count = fishCounts.get(userId) || 0;
        if (count >= 5) {
            // If cooldown already active, inform user. If not, this call will set the cooldown and we should inform the user.
            const cooldownTime = checkCooldown(userId, 'fish_exhaustion', getCooldownDuration('fish_exhaustion', 60 * 60 * 1000));
            if (cooldownTime) {
                return message.reply(`🎣 You're exhausted! Please wait **${cooldownTime}** before fishing again.`);
            } else {
                // checkCooldown set the cooldown now (first time exceeding limit)
                return message.reply(`🎣 You've reached the hourly fishing limit. Please wait 1 hour before fishing again.`);
            }
        }

        let gameState = 'IDLE'; // IDLE, WAITING, BITING

        const embed = new EmbedBuilder()
            .setTitle('🎣 Fishing')
            .setDescription('Cast your line into the water to begin...')
            .setColor('Blue');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('cast_line')
                .setLabel('Cast Line 🎣')
                .setStyle(ButtonStyle.Primary)
        );

        const mainMsg = await message.reply({ embeds: [embed], components: [row] });

        const collector = mainMsg.createMessageComponentCollector({
            filter: i => i.user.id === userId,
            time: 120000
        });

        collector.on('collect', async i => {
            if (i.customId === 'cast_line' && gameState === 'IDLE') {
                gameState = 'WAITING';

                await i.update({
                    content: null,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('🎣 Fishing')
                            .setDescription('Waiting for a bite... 🌊\n*Be ready to reel it in!*')
                            .setColor('Blue')
                    ],
                    components: []
                });

                const waitTime = Math.floor(Math.random() * 5000) + 3000;

                setTimeout(async () => {
                    if (gameState !== 'WAITING') return;

                    gameState = 'BITING';
                    const reelRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('reel_in')
                            .setLabel('REEL IT IN! 🎣')
                            .setStyle(ButtonStyle.Danger)
                    );

                    try {
                        await mainMsg.edit({
                            content: '🚨 **BITE!**',
                            components: [reelRow]
                        });
                    } catch (e) {
                        console.error('Error updating bite message:', e);
                    }

                    // Failure if not reeled in within 5 seconds
                    setTimeout(async () => {
                        if (gameState === 'BITING') {
                            gameState = 'IDLE';
                            await mainMsg.edit({
                                content: 'Too slow! The fish escaped... 🐟💨\n*(You took more than 5 seconds)*',
                                components: [
                                    new ActionRowBuilder().addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('cast_line')
                                            .setLabel('Try Again 🎣')
                                            .setStyle(ButtonStyle.Primary)
                                    )
                                ]
                            }).catch(() => { });
                        }
                    }, 5000);
                }, waitTime);
            }
            else if (i.customId === 'reel_in' && gameState === 'BITING') {
                gameState = 'IDLE';

                // Increment catch count
                const currentCount = fishCounts.get(userId) || 0;
                fishCounts.set(userId, currentCount + 1);

                const fish = getRandomFish();
                if (!fish) {
                    await i.update({ content: 'The fish got away! 💨', components: [] });
                    return;
                }

                // Add fish to inventory
                await rpgmanager.addItem(userId, fish.id, fish.name);

                const expGain = calculateExp(fish);
                const stats = await rpgmanager.getStats(userId);
                let newExp = stats.exp + expGain;
                let newLevel = stats.level;
                const expNeeded = stats.level * 100;
                if (newExp >= expNeeded) {
                    newExp -= expNeeded;
                    newLevel++;
                }
                await rpgmanager.updateProgress(userId, { exp: newExp, level: newLevel });

                const fishEmbed = new EmbedBuilder()
                    .setTitle('🎣 Success!')
                    .setDescription(`You reeled in a **${fish.name}**!\n\n**Rarity:** ${fish.rarity}\n**Value:** 💰${fish.sell}\n**EXP Gained:** ✨${expGain}`)
                    .setColor('Gold')

                await i.update({
                    content: 'Nice catch!',
                    embeds: [fishEmbed],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('cast_line')
                                .setLabel('Fish Again 🎣')
                                .setStyle(ButtonStyle.Primary)
                        )
                    ]
                });
            } else {
                await i.deferUpdate();
            }
        });
    }
};
