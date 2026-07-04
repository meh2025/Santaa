function generateDialogue(action, state, bossProfile) {
  const { player, boss, turn } = state;
  const hpRatio = boss.hp / bossProfile.hp;
  const playerHpRatio = player.hp / 100;

  let templates = [];

  if (bossProfile.id === 'beggar') {
    if (action === 'attack') {
      templates = [
        "Spare a little change for the homies 🥺",
        "Let me redeem it bro, LET ME REDEEM IT",
        "GIVE ME 100$ OR I'M TELLING MOM",
        "Just $5 bro, I swear I'll pay you back (I won't)",
        "My family has 17 kids and they're all starving...",
        "Even a like would help... but cash is better",
        "I have 0.02$ in my bank account, have mercy"
      ];
    } else if (action === 'heavy_attack') {
      templates = [
        "I'm throwing away my humanity, Player... for $100",
        "The entire Beggar Company stands with me 💀",
        "I'll get you through the next update I SWEAR just send $100",
        "This is my final form... the broke arc",
        "I haven't eaten in 3 days, take this L",
        "For the low low price of $100 I'll stop attacking",
        "Beggar Company CEO approved this violence"
      ];
    } else if (action === 'defend') {
      templates = [
        "Bro I'm used to harder hits than your age",
        "I'M STARVING... don't hit me while I'm eating my 1 rice grain lunch",
        "I've been hit by life harder than this",
        "Pity damage doesn't work on me anymore",
        "I sleep on the street, your attacks feel like massages",
        "Missed me because I'm built different (malnourished)"
      ];
    } else if (action === 'recover') {
      templates = [
        "BEGGAR HEALER ARC ACTIVATED 🙏",
        "Touch grass? Nah, touching my only coin",
        "Eating my 1 rice grain to recover...",
        "Found a half eaten sandwich, we're so back",
        "Regenerating with the power of copium",
        "Please donate to my recovery gofundme"
      ];
    }
  }
  else if (bossProfile.id === 'mafia') {
    if (action === 'attack') {
      templates = [
        "Money can't buy your life... but it can buy your death 💀",
        "SHOOT HIM DOWN",
        "My boss has more money than your bloodline",
        "This is a hostile takeover of your HP",
        "You owe the family protection money",
        "Say goodbye to your kneecaps",
        "Time to pay your debts... with blood"
      ];
    } else if (action === 'heavy_attack') {
      templates = [
        "MONEY RAIN 🤑💵💵💵",
        "Say hello to my little friend (the whole gang)",
        "TOMMY GUN GO BRRRRRRT",
        "We making it rain bullets now",
        "The Don wants you gone, no refunds",
        "This one's for the family business",
        "Luxury violence, only the best for you"
      ];
    } else if (action === 'defend') {
      templates = [
        "My men will take the bullets (they're paid extra)",
        "This is a *premium* bulletproof vest from Wish.com",
        "You can't afford to kill me",
        "Bodyguards on payroll, sorry not sorry",
        "Money shield activated",
        "My suit costs more than your entire build"
      ];
    } else if (action === 'recover') {
      templates = [
        "Smoking a cigarette while your mom calls...",
        "One glass of wine before I end you",
        "Hold on I'm counting my money in peace",
        "Taking a fat stack break",
        "The boss called, gotta answer",
        "Recharging with illegal gains"
      ];
    }
  }
  else if (bossProfile.id === 'evil_meh') {
    if (action === 'attack') {
      templates = [
        "I found your bug... and your IP address",
        "Hacking straight into your mom's basement",
        "You are literal garbage code",
        "Null pointer exception to your face",
        "Your code has more bugs than my patience",
        "Segmentation fault... your life",
        "I've seen your browser history"
      ];
    } else if (action === 'heavy_attack') {
      templates = [
        "DELETE DATABASE 🗑️",
        "DESTROY THE ENTIRE SYSTEM (skill issue)",
        "YOU HAVE BEEN BANNED FROM LIFE",
        "rm -rf / — your existence",
        "Deploying malware called 'your funeral'",
        "Blue screen of death incoming",
        "Your save file just got corrupted"
      ];
    } else if (action === 'defend') {
      templates = [
        "Firewall is active (and your mom)",
        "Military-grade encryption from 2009",
        "You can't hack me, I'm built different",
        "404: Damage not found",
        "Nice try, but I'm running on Linux",
        "Rate limited. Try again never."
      ];
    } else if (action === 'recover') {
      templates = [
        "Restarting the process... (buffering)",
        "Restoring from 2012 backup...",
        "Ctrl+Z on death",
        "Recompiling my life.exe",
        "Updating to version 'not dead yet'",
        "Applying emergency patch"
      ];
    }
  }
  else if (bossProfile.id === 'no_jobs') {
    if (action === 'attack') {
      templates = [
        "We just reinvented how to punch you",
        "The future is here... and it's violent",
        "Create. (your funeral)",
        "Think different... think pain",
        "Overpriced violence just dropped",
        "This is the best punch money can buy",
        "Seamless, flawless, expensive damage"
      ];
    } else if (action === 'heavy_attack') {
      templates = [
        "ONE MORE THING...",
        "Launching a world-destroying masterpiece",
        "Change the world... by removing you from it",
        "This is my ecosystem exclusive attack",
        "Premium violence, $2000 edition",
        "Innovation at its finest (your death)",
        "The future is now, old man"
      ];
    } else if (action === 'defend') {
      templates = [
        "A seamless, flawless, overpriced defense",
        "Stainless steel frame, titanium cope",
        "Sealing the ecosystem (you're not invited)",
        "This defense is 100% recycled copium",
        "Sorry, your attacks aren't premium enough",
        "Designed in California, built to block you"
      ];
    } else if (action === 'recover') {
      templates = [
        "Charging... (overpriced cable required)",
        "Recharging the ecosystem",
        "Battery 100% — ecosystem locked in",
        "Genius Bar just fixed me",
        "Updating my health to 11.4",
        "AppleCare+ activated"
      ];
    }
  }
  else {
    // Default / random_npc
    if (action === 'attack') {
      templates = [
        "You will regret this... ratio + touch grass",
        "Take this L",
        "You can't escape the vibes",
        "Mid attack but it might hit",
        "POV: you just got ratio'd",
        "Skill issue incoming",
        "This one’s for the boys in the chat"
      ];
    } else if (action === 'heavy_attack') {
      templates = [
        "Finishing blow 💀",
        "Ultimate power (trust me bro)",
        "You're finished... skill issue",
        "This is my main character moment",
        "No one can survive this... probably",
        "Final boss music starts playing",
        "Chat is this real?"
      ];
    } else if (action === 'defend') {
      templates = [
        "Absolute defense (mid af)",
        "Try me bro",
        "L + ratio + didn't ask",
        "Built different (built wrong)",
        "Your attacks are literally 0 damage",
        "Defense arc goated with the sauce",
        "I'm simply better"
      ];
    } else if (action === 'recover') {
      templates = [
        "Recovering stamina... send help",
        "Taking a tactical break",
        "It's not over yet (this is the final boss music)",
        "Regenerating with the power of friendship",
        "Touching grass for 3 seconds",
        "One push-up and we're back",
        "Copium levels rising..."
      ];
    }
  }

  // Fallback
  if (!templates.length) {
    templates = [
      "I will show you true power! (totally not coping)",
      "Prepare for your fate, nerd!",
      "Behold my cringe attack!"
    ];
  }

  // Dynamic meme injections
  let selected = templates[Math.floor(Math.random() * templates.length)];
  let playerName = `<@${player.id || 'you'}>`;

  if (hpRatio <= 0.3) {
    selected = `Damn... ${playerName} is actually built different 😭 But ` + selected.toLowerCase();
  } else if (playerHpRatio <= 0.3 && action === 'heavy_attack') {
    selected = `This ends here, ${playerName}! It's joever for you `;
  } else if (playerHpRatio <= 0.3) {
    selected = `You're on your last legs ${playerName}, just give up already 💀 `;
  }

  return selected;
}

module.exports = { generateDialogue };