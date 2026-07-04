const rpgmanager = require('../../../database/rpgmanager');
const path = require('path');
const fs = require('fs');

/**
 * Loads all item definitions from shopUtils directories.
 */
const loadItems = () => {
    const shopUtilsPath = path.join(__dirname, '..', 'shop', 'shopUtils');
    const allItems = new Map();
    const dirs = ['gepora', 'kimori'];

    for (const d of dirs) {
        const dirPath = path.join(shopUtilsPath, d);
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));
            for (const file of files) {
                const item = require(path.join(dirPath, file));
                allItems.set(item.id, item);
            }
        }
    }
    const targets = [
        path.join(__dirname, '..', '..', 'minigames', 'Mining', 'minerals'),
        path.join(__dirname, '..', '..', 'minigames', 'Fishing', 'fish')
    ]

    for (const targetPath of targets) {
        if (!fs.existsSync(targetPath)) continue;
        const rarityDirs = fs.readdirSync(targetPath).filter(d => fs.lstatSync(path.join(targetPath, d)).isDirectory());
        for (const rd of rarityDirs) {
            const rdPath = path.join(targetPath, rd);
            const files = fs.readdirSync(rdPath).filter(f => f.endsWith('.js'));

            for (const file of files) {
                const item = require(path.join(rdPath, file));
                if (item && item.id) allItems.set(item.id, item);
            }
        }
    }
    return allItems;
};

// Cache items to avoid repeated disk reads
const allItemsCache = loadItems();

/**
 * Calculates the final stats for a user by combining base stats from DB 
 * with bonuses from their equipped item.
 */
async function getTotalStats(userId) {
    const baseStats = await rpgmanager.getStats(userId);

    let maxHealth = 100;
    let maxStamina = 100;
    let totalAttack = baseStats.attack;
    let totalDefense = baseStats.defense || 0;
    let equippedItemName = "None";

    // Support multiple equipped items (stored as JSON array in equipped_items)
    let equippedItemsArr = [];
    if (baseStats.equipped_items) {
        try { equippedItemsArr = JSON.parse(baseStats.equipped_items); } catch (e) { equippedItemsArr = []; }
    }
    // Backwards-compat: include single equipped_item_id if present
    if (baseStats.equipped_item_id) equippedItemsArr.push(baseStats.equipped_item_id);

    const equippedNames = [];
    for (const eqId of equippedItemsArr) {
        const eqItem = allItemsCache.get(eqId);
        if (!eqItem) continue;
        equippedNames.push(eqItem.name);
        if (eqItem.stats) {
            if (eqItem.stats.health) maxHealth += eqItem.stats.health;
            if (eqItem.stats.stamina) maxStamina += eqItem.stats.stamina;
            if (eqItem.stats.attack) totalAttack += eqItem.stats.attack;
            if (eqItem.stats.defense) totalDefense += eqItem.stats.defense;
        }
    }
    if (equippedNames.length > 0) equippedItemName = equippedNames.join(', ');

    return {
        ...baseStats,
        maxHealth,
        maxStamina,
        totalAttack,
        totalDefense,
        equippedItemName,
        equippedItemsArr
    };
}

module.exports = { getTotalStats, allItemsCache };
