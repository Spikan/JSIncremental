// Authentic Soda Drinker Pro Features
// Focuses on the true spirit of SDP: mundane, minimalist, oddly compelling

/**
 * SDP-style environmental observations that appear randomly
 */
export function showEnvironmentalObservation(): void {
  const observations = [
    'A spider sits motionless in the corner.',
    'The waterslide remains empty.',
    'Your bedroom is exactly as you left it.',
    'The parking lot stretches endlessly.',
    'A single bird perches on the bus stop sign.',
    'The DMV line has not moved.',
    'The kitchen faucet drips once.',
    'The laundromat is eerily quiet.',
    'An elevator opens. Nobody exits.',
    'The gas station fluorescents buzz softly.',
    'A shopping cart sits abandoned.',
    'The hotel ice machine hums.',
    'Static plays on an unused radio.',
    'The office is empty at 5:47 PM.',
    'A moth circles the porch light.',
    'The vending machine displays "EXACT CHANGE ONLY".',
    'Your phone remains silent.',
    'The ceiling fan turns lazily.',
    'A cat crosses the roof without looking down.',
    'The refrigerator cycles on.',
  ];

  const observation =
    observations[Math.floor(Math.random() * observations.length)] ?? 'Something happened.';

  // Create a simple, unobtrusive notification
  const notification = document.createElement('div');
  notification.textContent = observation;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: #ccc;
    padding: 8px 12px;
    font-family: monospace;
    font-size: 11px;
    border: 1px solid #444;
    z-index: 1000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s ease;
  `;

  document.body.appendChild(notification);

  // Fade in
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 100);

  // Fade out and remove
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  }, 4000);
}

/**
 * Add subtle environmental sound effects (text-based for now)
 */
export function addEnvironmentalSound(): void {
  const sounds = [
    '*drip*',
    '*hum*',
    '*click*',
    '*buzz*',
    '*tap tap*',
    '*whirr*',
    '*beep*',
    '*tick*',
  ];

  const sound = sounds[Math.floor(Math.random() * sounds.length)] ?? '*silence*';

  // Show sound as subtle text in corner
  const soundElement = document.createElement('div');
  soundElement.textContent = sound;
  soundElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    color: #666;
    font-family: monospace;
    font-size: 10px;
    z-index: 999;
    pointer-events: none;
    opacity: 0.7;
  `;

  document.body.appendChild(soundElement);

  // Remove after brief display
  setTimeout(() => {
    if (soundElement.parentNode) {
      soundElement.parentNode.removeChild(soundElement);
    }
  }, 1500);
}

/**
 * SDP-style clickable easter eggs
 */
export function addClickableEasterEgg(): void {
  // Only add one at a time
  if (document.querySelector('.sdp-easter-egg')) return;

  const easterEggs = [
    { text: '🕷️', title: 'A spider. It does nothing.' },
    { text: '💡', title: 'A light bulb. It is already on.' },
    { text: '📺', title: 'A TV. It shows static.' },
    { text: '🚗', title: 'A car. It is parked.' },
    { text: '🌱', title: 'A plant. It grows imperceptibly.' },
    { text: '🔌', title: 'An outlet. It has power.' },
    { text: '📱', title: 'A phone. No one is calling.' },
    { text: '🕰️', title: 'A clock. Time passes.' },
  ];

  const egg = easterEggs[Math.floor(Math.random() * easterEggs.length)];
  if (!egg) return;

  const element = document.createElement('div');
  element.className = 'sdp-easter-egg';
  element.textContent = egg.text;
  element.title = egg.title;
  element.style.cssText = `
    position: fixed;
    top: ${Math.random() * (window.innerHeight - 100)}px;
    left: ${Math.random() * (window.innerWidth - 50)}px;
    font-size: 16px;
    cursor: pointer;
    z-index: 998;
    opacity: 0.6;
    transition: opacity 0.2s ease;
  `;

  element.addEventListener('click', () => {
    // SDP-style underwhelming response
    const response = document.createElement('div');
    response.textContent = 'You clicked it.';
    response.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: #ccc;
      padding: 20px;
      font-family: monospace;
      font-size: 12px;
      border: 1px solid #444;
      z-index: 1001;
      text-align: center;
    `;

    document.body.appendChild(response);
    element.remove();

    setTimeout(() => {
      if (response.parentNode) {
        response.parentNode.removeChild(response);
      }
    }, 2000);
  });

  element.addEventListener('mouseenter', () => {
    element.style.opacity = '1';
  });

  element.addEventListener('mouseleave', () => {
    element.style.opacity = '0.6';
  });

  document.body.appendChild(element);

  // Remove after a while if not clicked
  setTimeout(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }, 15000);
}

/**
 * SDP-style achievements for mundane actions
 */
export function checkMundaneAchievements(): void {
  const achievements = [
    {
      id: 'clicked_10',
      trigger: 'clicks',
      count: 10,
      text: 'Clicked 10 Times: You clicked. The number increased.',
    },
    {
      id: 'level_2',
      trigger: 'level',
      count: 2,
      text: 'Reached Level 2: You are now at level 2. This is different from level 1.',
    },
    {
      id: 'waited_30s',
      trigger: 'time',
      count: 30000,
      text: 'Waited 30 Seconds: Time passed. You observed it.',
    },
    {
      id: 'sips_100',
      trigger: 'sips',
      count: 100,
      text: 'Accumulated 100 Sips: The counter displays a larger number now.',
    },
  ];

  // Simple achievement checking (would need to be integrated with game state)
  // For now, just show random achievement occasionally
  if (Math.random() < 0.05) {
    // 5% chance
    const achievement = achievements[Math.floor(Math.random() * achievements.length)];
    if (!achievement) return;

    const achievementElement = document.createElement('div');
    achievementElement.textContent = achievement.text;
    achievementElement.style.cssText = `
      position: fixed;
      top: 50px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 50, 0, 0.9);
      color: #ccc;
      padding: 12px 20px;
      font-family: monospace;
      font-size: 11px;
      border: 1px solid #555;
      z-index: 1000;
      text-align: center;
      max-width: 400px;
    `;

    document.body.appendChild(achievementElement);

    setTimeout(() => {
      if (achievementElement.parentNode) {
        achievementElement.parentNode.removeChild(achievementElement);
      }
    }, 5000);
  }
}

/**
 * Initialize the authentic SDP experience
 */
export function initializeAuthenticSDP(): void {
  console.log('🥤 Initializing authentic Soda Drinker Pro experience...');

  // Environmental observations every 45-90 seconds
  const showObservation = () => {
    showEnvironmentalObservation();
    setTimeout(showObservation, 45000 + Math.random() * 45000);
  };
  setTimeout(showObservation, 10000);

  // Environmental sounds every 20-60 seconds
  const playSound = () => {
    if (Math.random() < 0.3) {
      // 30% chance
      addEnvironmentalSound();
    }
    setTimeout(playSound, 20000 + Math.random() * 40000);
  };
  setTimeout(playSound, 5000);

  // Easter eggs every 2-5 minutes
  const addEgg = () => {
    if (Math.random() < 0.4) {
      // 40% chance
      addClickableEasterEgg();
    }
    setTimeout(addEgg, 120000 + Math.random() * 180000);
  };
  setTimeout(addEgg, 30000);

  // Check for mundane achievements every 10 seconds
  setInterval(checkMundaneAchievements, 10000);

  // Make functions globally available for testing
  (window as any).authenticSDP = {
    showObservation: showEnvironmentalObservation,
    addSound: addEnvironmentalSound,
    addEgg: addClickableEasterEgg,
    checkAchievements: checkMundaneAchievements,
  };

  console.log('✅ Authentic SDP experience initialized');
  console.log('🧪 Test functions available as window.authenticSDP');
}
