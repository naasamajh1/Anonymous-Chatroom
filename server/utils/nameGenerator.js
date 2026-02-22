const adjectives = [
  'Shadow', 'Mystic', 'Cosmic', 'Crystal', 'Phantom', 'Neon', 'Stealth', 'Lunar',
  'Frost', 'Storm', 'Velvet', 'Golden', 'Silver', 'Dark', 'Bright', 'Silent',
  'Rapid', 'Wild', 'Crimson', 'Azure', 'Ember', 'Jade', 'Rogue', 'Noble',
  'Cyber', 'Pixel', 'Astral', 'Prism', 'Quantum', 'Zenith', 'Blaze', 'Echo',
  'Iron', 'Void', 'Nova', 'Apex', 'Hyper', 'Ultra', 'Mega', 'Omega'
];

const nouns = [
  'Wolf', 'Phoenix', 'Dragon', 'Hawk', 'Viper', 'Tiger', 'Raven', 'Falcon',
  'Panther', 'Lion', 'Bear', 'Fox', 'Shark', 'Eagle', 'Cobra', 'Lynx',
  'Knight', 'Ninja', 'Pirate', 'Wizard', 'Ghost', 'Cipher', 'Spark', 'Bolt',
  'Blade', 'Arrow', 'Shield', 'Crown', 'Star', 'Comet', 'Pulse', 'Wave',
  'Fury', 'Sage', 'Drifter', 'Hunter', 'Seeker', 'Striker', 'Rider', 'Walker'
];

const generateUsername = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj}${noun}${num}`;
};

module.exports = { generateUsername };
