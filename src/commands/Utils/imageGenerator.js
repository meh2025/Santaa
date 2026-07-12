const { createCanvas, loadImage } = require('@napi-rs/canvas');

// Colors
const bgColor = '#1E1E2E';
const cardColor = '#313244';
const textColor = '#CDD6F4';
const subTextColor = '#A6ADC8';
const accentColor = '#89B4FA'; // Blue for EXP bar
const successColor = '#A6E3A1'; // Green for wins/attack
const dangerColor = '#F38BA8'; // Red for losses/defense

/**
 * Draw a rounded rectangle on a canvas context
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

/**
 * Generate a visual Level Card for a user
 * @param {Object} user Discord User object
 * @param {Object} stats Stats object containing level, exp, totalAttack, totalDefense
 * @returns {Buffer} Image Buffer
 */
async function generateLevelCard(user, stats) {
  const canvas = createCanvas(800, 250);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  roundRect(ctx, 0, 0, canvas.width, canvas.height, 20, true, false);

  // User Avatar
  let avatarImage;
  try {
    const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 256 });
    avatarImage = await loadImage(avatarUrl);
  } catch (err) {
    console.error('Failed to load avatar', err);
  }

  // Draw Avatar
  if (avatarImage) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(125, 125, 75, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImage, 50, 50, 150, 150);
    ctx.restore();
    
    // Avatar border
    ctx.beginPath();
    ctx.arc(125, 125, 75, 0, Math.PI * 2, true);
    ctx.lineWidth = 5;
    ctx.strokeStyle = accentColor;
    ctx.stroke();
  } else {
    // Placeholder if no avatar
    ctx.fillStyle = cardColor;
    ctx.beginPath();
    ctx.arc(125, 125, 75, 0, Math.PI * 2, true);
    ctx.fill();
  }

  // User Name
  ctx.fillStyle = textColor;
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(user.username, 230, 90);

  // Level Info
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(`Level ${stats.level}`, 230, 130);

  // Attack & Defense Stats
  ctx.fillStyle = successColor;
  ctx.font = '24px sans-serif';
  ctx.fillText(`ATK: ${stats.totalAttack}`, 380, 130);
  
  ctx.fillStyle = dangerColor;
  ctx.fillText(`DEF: ${stats.totalDefense}`, 500, 130);

  // EXP Bar
  const expRequired = stats.level * 100;
  const currentExp = stats.exp;
  const progress = Math.min(Math.max(currentExp / expRequired, 0), 1);
  
  const barX = 230;
  const barY = 160;
  const barWidth = 520;
  const barHeight = 25;

  // Bar Background
  ctx.fillStyle = cardColor;
  roundRect(ctx, barX, barY, barWidth, barHeight, 12.5, true, false);

  // Bar Fill
  if (progress > 0) {
    ctx.fillStyle = accentColor;
    const fillWidth = Math.max(progress * barWidth, barHeight); // Ensure minimum width for rounded corners
    roundRect(ctx, barX, barY, fillWidth, barHeight, 12.5, true, false);
  }

  // EXP Text
  ctx.fillStyle = textColor;
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${currentExp} / ${expRequired} EXP`, barX + barWidth - 10, barY - 10);
  
  // Reset align
  ctx.textAlign = 'left';

  return canvas.toBuffer('image/png');
}

/**
 * Generate a visual Leaderboard
 * @param {String} title The title of the leaderboard
 * @param {Array} rows The formatted rows data (objects with { rank, name, value })
 * @param {Number} page Current page number (0-indexed)
 * @param {Number} totalPages Total pages available
 * @returns {Buffer} Image Buffer
 */
async function generateLeaderboardImage(title, rows, page, totalPages) {
  const canvasWidth = 800;
  // Dynamic height based on number of rows (title + 5 rows max usually + footer)
  const rowHeight = 70;
  const paddingY = 120;
  const canvasHeight = Math.max(300, (rows.length * rowHeight) + paddingY);
  
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  roundRect(ctx, 0, 0, canvas.width, canvas.height, 20, true, false);

  // Title
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, canvasWidth / 2, 60);

  // Header separator
  ctx.fillStyle = cardColor;
  ctx.fillRect(50, 80, canvasWidth - 100, 3);

  // Reset align
  ctx.textAlign = 'left';

  // Draw Rows
  let startY = 100;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const yPos = startY + (i * rowHeight);

    // Row Background (alternating)
    if (i % 2 === 0) {
      ctx.fillStyle = cardColor;
      roundRect(ctx, 40, yPos, canvasWidth - 80, rowHeight - 10, 10, true, false);
    }

    // Rank Number
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`#${row.rank}`, 60, yPos + 40);

    // Name
    ctx.fillStyle = textColor;
    ctx.font = '24px sans-serif';
    ctx.fillText(row.name, 150, yPos + 38);

    // Value
    ctx.fillStyle = successColor;
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(row.value), canvasWidth - 60, yPos + 40);
    ctx.textAlign = 'left';
  }

  // Footer (Pagination)
  const footerY = canvasHeight - 20;
  ctx.fillStyle = subTextColor;
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Page ${page + 1} of ${totalPages}`, canvasWidth / 2, footerY);

  return canvas.toBuffer('image/png');
}

module.exports = {
  generateLevelCard,
  generateLeaderboardImage
};
