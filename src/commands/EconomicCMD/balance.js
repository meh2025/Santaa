const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');

module.exports = {
    name: 'balance',
    description: 'Manage your currently balance and bank account',
    category: 'eco',
    async execute(message) {
        const { author, client } = message;
        const dbManager = client.db;
        const name = message.member?.displayName || author.username;
        const userData = await dbManager.getUser(author.id);
        const netWorth = userData.balance + userData.bank;

        const balanceEmbed = data => {
            return new EmbedBuilder()
                .setTitle(`${name}'s Balance`)
                .addFields(
                    { name: '🪙', value: `${data.balance.toLocaleString()}`, inline: false },
                    { name: '🏦', value: `${data.bank.toLocaleString()}`, inline: false },
                    { name: '📦', value: `${data.inventoryValue.toLocaleString()}`, inline: false },
                    { name: '💰', value: `${data.totalAssets.toLocaleString()}`, inline: false }
                    // { name: '⭐ Lifetime Earned', value: `${data.totalEarned.toLocaleString()}`, inline: false } // Currently disabled due to useless data
                );
        };

        const inventoryValue = await dbManager.getInventoryValue(message.author.id);
        const balanceData = {
            ...userData,
            inventoryValue,
            totalAssets: Number(userData.balance) + Number(userData.bank) + Number(inventoryValue),
            totalEarned: Number(userData.total_earned || 0)
        };

        // Withdraw and deposit buttons
        const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('dep_modal').setLabel('Deposit').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('with_modal').setLabel('Withdraw').setStyle(ButtonStyle.Secondary)
        );

        const response = await message.channel.send({ embeds: [balanceEmbed(balanceData)], components: [row] });

        const collector = response.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, componentType: ComponentType.Button });

        collector.on('collect', async (i) => {
            const IsDep = i.customId === 'dep_modal';
            const modal = new ModalBuilder()
                .setCustomId(IsDep ? 'dep_modal' : 'with_modal')
                .setTitle(IsDep ? 'Deposit Amount' : 'Withdraw Amount');

            const amountInput = new TextInputBuilder()
                .setCustomId('amount_input')
                .setLabel('Amount (All or number):')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(amountInput));
            await i.showModal(modal);
            const submit = await i.awaitModalSubmit({ time: 30000 }).catch(() => null);

            if (submit) {
                let input = submit.fields.getTextInputValue('amount_input').toLowerCase();
                const curData = await dbManager.getUser(message.author.id);
                let amount = 0;

                if (input === 'all') {
                    amount = IsDep ? curData.balance : curData.bank;
                } else {
                    amount = parseInt(input.replace(/k/g, '000'));
                }

                if (isNaN(amount) || amount <= 0) {
                    return submit.reply({ content: 'Please enter a valid amount.', ephemeral: true });
                }

                if (IsDep) {
                    if (amount > curData.balance) return submit.reply({ content: 'You do not have enough balance to deposit that amount.', ephemeral: true });
                    await dbManager.removeMoney(message.author.id, amount);
                    await dbManager.addBank(message.author.id, amount);
                } else {
                    if (amount > curData.bank) return submit.reply({ content: 'You do not have enough money in the bank.', ephemeral: true });
                    await dbManager.removeBank(message.author.id, amount);
                    await dbManager.addMoney(message.author.id, amount);
                }

                const newUserData = await dbManager.getUser(message.author.id);
                const newBalanceData = {
                    ...newUserData,
                    inventoryValue: await dbManager.getInventoryValue(message.author.id),
                    totalAssets: Number(newUserData.balance) + Number(newUserData.bank) + await dbManager.getInventoryValue(message.author.id),
                    totalEarned: Number(newUserData.total_earned || 0)
                };
                await submit.update({ embeds: [balanceEmbed(newBalanceData)] });
            }
        });

        collector.on('end', async () => {
            row.components.forEach(btn => btn.setDisabled(true));
            response.edit({ components: [row] }).catch(() => {});
        });
    }
}