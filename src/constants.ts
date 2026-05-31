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
