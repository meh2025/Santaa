const { Collection } = require('discord.js');
const cooldownConfig = require('./cooldownConfig');

const cooldown = new Collection();

function normalizeCommandName(commandName) {
    return String(commandName || '').toLowerCase();
}

function getCooldownDuration(commandName, fallbackMs) {
    const normalizedName = normalizeCommandName(commandName);
    const knownDurations = {
        parttime: cooldownConfig.parttime,
        work: cooldownConfig.parttime,
        beg: cooldownConfig.beg,
        crime: cooldownConfig.crime,
        steal: cooldownConfig.steal,
        daily: cooldownConfig.daily,
        fish: cooldownConfig.fishExhaustion,
        fish_exhaustion: cooldownConfig.fishExhaustion,
        mine: cooldownConfig.mineExhaustion,
        mine_exhaustion: cooldownConfig.mineExhaustion,
        job: cooldownConfig.jobWorkCooldown,
        jobworkcooldown: cooldownConfig.jobWorkCooldown,
        job_work_cooldown: cooldownConfig.jobWorkCooldown,
        jobfirepenalty: cooldownConfig.jobFirePenalty,
        job_fire_penalty: cooldownConfig.jobFirePenalty,
    };

    if (Object.prototype.hasOwnProperty.call(knownDurations, normalizedName)) {
        return knownDurations[normalizedName];
    }

    return typeof fallbackMs === 'number' ? fallbackMs : null;
}

module.exports = {
    getCooldownDuration,
    /** 
     * @param {string} userID - ID of the user
     * @param {string} cmdName - Command name
     * @param {number} timeInMS - Cooldown time in milliseconds
     * @return {string|null} - return time left in human readable format or null if cooldown expired
     */
    checkCooldown(userID, cmdName, timeInMS) {
        const resolvedTimeInMs = typeof timeInMS === 'number' ? timeInMS : getCooldownDuration(cmdName);
        if (typeof resolvedTimeInMs !== 'number' || resolvedTimeInMs <= 0) {
            return null;
        }

        if (!cooldown.has(cmdName)) {
            cooldown.set(cmdName, new Collection());
        }
        const now = Date.now();
        const timestamps = cooldown.get(cmdName);

        if (timestamps.has(userID)) {
            const expTime = timestamps.get(userID) + resolvedTimeInMs;
            if (now < expTime) {
                const timeLeft = Math.ceil((expTime - now) / 1000);
                const minute = Math.floor(timeLeft / 60);
                const second = timeLeft % 60;

                return minute > 0 ? `${minute}m ${second}s` : `${second}s`;
            }
        }
        timestamps.set(userID, now);
        setTimeout(() => timestamps.delete(userID), resolvedTimeInMs);
        return null;
    }
};