export const GAME_CONSTANTS = {
  BOUNDS: {
    X_MIN: -20,
    X_MAX: 10000,
    Y_MIN: 2,
    Y_MAX: 15,
  },
  PLAYER: {
    SPEED: 15,
    SCROLL_SPEED: 8,
    ROLL_AMOUNT: 0.1,
    PITCH_AMOUNT: 0.1,
  },
  BULLET: {
    SPEED: 40,
    FIRE_RATE: 0.15,
    LIFETIME: 2.0,
  },
  ENEMY: {
    SPEED: 6,
    SPAWN_RATE: 1.8,
    HEALTH: 80,
    GROUND_Y_OFFSETS: {
      tank: 0.6,
      armored_car: 0.7,
      missile_truck: 0.5,
      jeep: 0.4,
    }
  }
};

export const HELICOPTER_TEMPLATES = {
  ka50: {
    name: 'KA-50 BLACK SHARK',
    sub: 'Contra-Rotating Coaxial Attack Helicopter',
    stats: { armor: 75, speed: 85, firepower: 75, agility: 95 },
    desc: 'Uniquely structured attack gunship utilizing two coaxial contra-rotating rotors. Extreme combat agility, sharp control profiles, and tactical black stealth frames.'
  },
  mi28: {
    name: 'MI-28 HAVOC',
    sub: 'Heavy Armored Air Combat Gunship',
    stats: { armor: 95, speed: 55, firepower: 95, agility: 45 },
    desc: 'Heavily protected tactical tank-buster carrying an enormous under-nose cannon. Incredible battlefield structural resistance and immense forward destructive payloads.'
  },
  ah64: {
    name: 'AH-64 APACHE',
    sub: 'Advanced Tactical Strike Support',
    stats: { armor: 85, speed: 70, firepower: 90, agility: 55 },
    desc: 'Standard multi-role tactical support fighter fitted with APG-78 radar dome systems. Exceptional weapon spread control and reliable structural stability.'
  }
};

