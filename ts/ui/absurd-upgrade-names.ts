// Absurd Upgrade Names and Descriptions
// Inspired by Soda Drinker Pro's wonderfully mundane aesthetic

export interface AbsurdUpgrade {
  name: string;
  description: string;
  flavorText: string;
}

/**
 * Get increasingly absurd names for upgrades based on level
 */
export function getAbsurdUpgradeName(baseUpgrade: string, level: number): AbsurdUpgrade {
  const upgradeProgression: Record<string, AbsurdUpgrade[]> = {
    Suction: [
      {
        name: 'Basic Lip Seal',
        description: 'Your lips form a rudimentary vacuum.',
        flavorText: 'The straw knows you mean business.',
      },
      {
        name: 'Enhanced Suction',
        description: 'Your mouth achieves industrial-grade vacuum.',
        flavorText: 'Small objects nearby begin to orbit your lips.',
      },
      {
        name: 'Quantum Suction',
        description: 'You suck at the molecular level.',
        flavorText: 'The soda exists in a superposition until observed.',
      },
      {
        name: 'Dimensional Suction',
        description: 'You draw soda from parallel universes.',
        flavorText: 'Other versions of you are confused by their missing soda.',
      },
      {
        name: 'Cosmic Suction',
        description: 'Black holes are jealous of your technique.',
        flavorText: 'The universe briefly inverts around your mouth.',
      },
    ],
    'Critical Click': [
      {
        name: 'Lucky Click',
        description: 'Sometimes your finger just knows.',
        flavorText: 'The mouse pad whispers encouragement.',
      },
      {
        name: 'Focused Click',
        description: 'You achieve perfect finger-to-click harmony.',
        flavorText: 'Your cursor gains sentience and helps.',
      },
      {
        name: 'Transcendent Click',
        description: 'You click with the force of destiny.',
        flavorText: 'Reality briefly glitches in your favor.',
      },
      {
        name: 'Divine Click',
        description: 'The gods guide your clicking finger.',
        flavorText: 'A choir of angels sings with each click.',
      },
      {
        name: 'Ultimate Click',
        description: 'You have become one with the click.',
        flavorText: 'The concept of clicking bows before you.',
      },
    ],
    'Faster Drinks': [
      {
        name: 'Quick Sip',
        description: 'You drink slightly faster than normal.',
        flavorText: 'Time notices your efficiency.',
      },
      {
        name: 'Speed Drinking',
        description: 'Your throat defies fluid dynamics.',
        flavorText: 'Physics professors are baffled.',
      },
      {
        name: 'Temporal Drinking',
        description: 'You drink outside of linear time.',
        flavorText: 'The past, present, and future sips simultaneously.',
      },
      {
        name: 'Quantum Consumption',
        description: 'You exist in multiple drinking states.',
        flavorText: 'Schrödinger would be proud.',
      },
      {
        name: 'Instantaneous Absorption',
        description: 'The soda becomes you before you drink it.',
        flavorText: 'The concept of "drinking" becomes obsolete.',
      },
    ],
    'Extra Straw': [
      {
        name: 'Second Straw',
        description: 'Two straws are better than one.',
        flavorText: 'Your soda delivery system doubles in efficiency.',
      },
      {
        name: 'Straw Cluster',
        description: 'Multiple straws work in harmony.',
        flavorText: 'The straws form a complex beverage network.',
      },
      {
        name: 'Straw Matrix',
        description: 'Your straws achieve consciousness.',
        flavorText: 'They discuss philosophy while you drink.',
      },
      {
        name: 'Straw Dimension',
        description: 'You exist in a realm of pure straw.',
        flavorText: 'All roads lead to soda.',
      },
      {
        name: 'Straw Singularity',
        description: 'All straws in existence serve you.',
        flavorText: 'The universe is your personal drinking apparatus.',
      },
    ],
    'Bigger Cup': [
      {
        name: 'Large Cup',
        description: 'A cup of respectable size.',
        flavorText: 'Your drink has room to breathe.',
      },
      {
        name: 'Mega Cup',
        description: 'A cup that defies reasonable proportions.',
        flavorText: 'Small children could swim in this cup.',
      },
      {
        name: 'Impossible Cup',
        description: 'This cup contains more than it should.',
        flavorText: 'Geometry weeps at its majesty.',
      },
      {
        name: 'Infinite Cup',
        description: 'A cup with no bottom or boundaries.',
        flavorText: 'The cup contains the concept of containment itself.',
      },
      {
        name: 'Cosmic Cup',
        description: 'The universe is your cup now.',
        flavorText: 'Stars float like ice cubes in your beverage.',
      },
    ],
  };

  const upgrades = upgradeProgression[baseUpgrade] || [
    {
      name: baseUpgrade,
      description: 'It does what it does.',
      flavorText: 'The upgrade upgrades upgradingly.',
    },
  ];

  const index = Math.min(level - 1, upgrades.length - 1);
  const selectedUpgrade = upgrades[index];
  if (selectedUpgrade) return selectedUpgrade;
  
  const fallbackUpgrade = upgrades[upgrades.length - 1];
  if (fallbackUpgrade) return fallbackUpgrade;
  
  // Ultimate fallback
  return {
    name: baseUpgrade,
    description: 'It does what it does.',
    flavorText: 'The upgrade upgrades upgradingly.'
  };
}

/**
 * Get random absurd achievement names
 */
export function getAbsurdAchievementName(baseName: string, value: number): string {
  const achievementTemplates = [
    `${baseName} Enthusiast`,
    `The ${baseName} Whisperer`,
    `Master of ${baseName}`,
    `${baseName} Transcendentalist`,
    `The ${baseName} Sage`,
    `${baseName} Deity`,
    `Supreme ${baseName} Being`,
    `The One Who ${baseName}s`,
    `${baseName} Enlightened`,
    `The ${baseName} Chosen One`,
  ];

  // Use value to determine which template to use
  const index = Math.floor(Math.log10(value + 1)) % achievementTemplates.length;
  return achievementTemplates[index] ?? achievementTemplates[0] ?? `${baseName} Achievement`;
}

/**
 * Generate absurd milestone messages
 */
export function getAbsurdMilestone(type: string, value: number): string {
  const milestones: Record<string, string[]> = {
    sips: [
      'You have consumed ${value} units of liquid satisfaction.',
      'The Soda Council acknowledges your ${value} sips.',
      'A distant vending machine sheds a tear for your ${value} sips.',
      '${value} sips closer to beverage enlightenment.',
      'The carbonation whispers: "${value} sips well done."',
    ],
    clicks: [
      'Your finger has clicked ${value} times into eternity.',
      'The mouse pad bears witness to ${value} clicks.',
      '${value} clicks echo through the digital void.',
      'Reality has been clicked ${value} times.',
      'The click counter weeps at your ${value} achievements.',
    ],
    purchases: [
      'You have made ${value} economically sound decisions.',
      'The marketplace bows to your ${value} purchases.',
      '${value} transactions have altered the fabric of commerce.',
      'Your wallet has spoken ${value} times.',
      'The economy trembles at your ${value} purchases.',
    ],
  };

  const messages = milestones[type] ?? ['You have achieved ${value} of something.'];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)] ?? 'You have achieved ${value} of something.';
  
  return randomMessage.replace('${value}', value.toLocaleString());
}

/**
 * Apply absurd upgrade names to DOM elements
 */
export function applyAbsurdUpgradeNames(): void {
  try {
    // Find upgrade elements and apply absurd names
    const upgradeElements = document.querySelectorAll('.upgrade-name');

    upgradeElements.forEach(element => {
      const upgradeCard = element.closest('.upgrade-card');
      if (!upgradeCard) return;

      const button = upgradeCard.querySelector('.upgrade-btn');
      if (!button) return;

      const action = button.getAttribute('data-action');
      if (!action) return;

      // Extract base upgrade type from action
      let baseUpgrade = '';
      if (action.includes('Suction')) baseUpgrade = 'Suction';
      else if (action.includes('CriticalClick')) baseUpgrade = 'Critical Click';
      else if (action.includes('FasterDrinks')) baseUpgrade = 'Faster Drinks';
      else if (action.includes('Straw')) baseUpgrade = 'Extra Straw';
      else if (action.includes('Cup')) baseUpgrade = 'Bigger Cup';

      if (baseUpgrade) {
        // Get current level/count for this upgrade (simplified)
        const level = 1; // In a real implementation, you'd get this from game state
        const absurdUpgrade = getAbsurdUpgradeName(baseUpgrade, level);

        element.textContent = absurdUpgrade.name;

        // Update description if element exists
        const descriptionElement = upgradeCard.querySelector('.upgrade-description');
        if (descriptionElement) {
          descriptionElement.textContent = absurdUpgrade.description;
        }

        // Add flavor text as title attribute
        element.setAttribute('title', absurdUpgrade.flavorText);
      }
    });
  } catch (error) {
    console.warn('Failed to apply absurd upgrade names:', error);
  }
}
