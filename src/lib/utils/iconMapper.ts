// Map SF Symbol names to emoji for web display
const sfSymbolToEmoji: Record<string, string> = {
  // Food & Dining
  'fork.knife': '🍽️',
  'fork.knife.circle': '🍽️',
  'fork.knife.circle.fill': '🍽️',

  // Transportation
  'car': '🚗',
  'car.fill': '🚗',
  'car.circle': '🚗',
  'car.circle.fill': '🚗',
  'airplane': '✈️',
  'airplane.departure': '✈️',
  'airplane.arrival': '🛬',
  'bus': '🚌',
  'bus.fill': '🚌',
  'train': '🚆',
  'bicycle': '🚲',

  // Shopping
  'cart': '🛒',
  'cart.fill': '🛒',
  'cart.circle': '🛒',
  'bag': '🛍️',
  'bag.fill': '🛍️',
  'basket': '🧺',
  'basket.fill': '🧺',

  // Money & Finance
  'dollarsign.circle': '💰',
  'dollarsign.circle.fill': '💰',
  'creditcard': '💳',
  'creditcard.fill': '💳',
  'banknote': '💵',
  'wallet.pass': '👛',
  'wallet.pass.fill': '👛',

  // Home & Living
  'house': '🏠',
  'house.fill': '🏠',
  'house.circle': '🏠',
  'bed.double': '🛏️',
  'bed.double.fill': '🛏️',
  'lightbulb': '💡',
  'lightbulb.fill': '💡',
  'bolt': '⚡',
  'bolt.fill': '⚡',
  'drop': '💧',
  'drop.fill': '💧',
  'wifi': '📶',

  // Entertainment
  'ticket': '🎫',
  'ticket.fill': '🎫',
  'film': '🎬',
  'film.fill': '🎬',
  'tv': '📺',
  'tv.fill': '📺',
  'gamecontroller': '🎮',
  'gamecontroller.fill': '🎮',
  'music.note': '🎵',
  'headphones': '🎧',

  // Health & Fitness
  'heart': '❤️',
  'heart.fill': '❤️',
  'heart.text.square': '❤️',
  'heart.text.square.fill': '❤️',
  'heart.pulse': '💓',
  'cross.case': '🏥',
  'cross.case.fill': '🏥',
  'pills': '💊',
  'pills.fill': '💊',
  'dumbbell': '🏋️',
  'dumbbell.fill': '🏋️',

  // Education
  'book': '📚',
  'book.fill': '📚',
  'book.closed': '📕',
  'graduationcap': '🎓',
  'graduationcap.fill': '🎓',
  'pencil': '✏️',
  'school': '🏫',

  // Work & Business
  'briefcase': '💼',
  'briefcase.fill': '💼',
  'laptopcomputer': '💻',
  'desktopcomputer': '🖥️',
  'phone': '📱',
  'phone.fill': '📱',
  'envelope': '✉️',
  'envelope.fill': '✉️',
  'folder': '📁',
  'folder.fill': '📁',

  // Gifts & Celebrations
  'gift': '🎁',
  'gift.fill': '🎁',
  'gift.circle': '🎁',
  'balloon': '🎈',
  'balloon.fill': '🎈',
  'party.popper': '🎉',
  'party.popper.fill': '🎉',

  // Charts & Analytics
  'chart.line.uptrend.xyaxis': '📈',
  'chart.bar': '📊',
  'chart.bar.fill': '📊',
  'chart.pie': '📊',
  'chart.pie.fill': '📊',

  // Calendar & Time
  'calendar': '📅',
  'calendar.circle': '📅',
  'calendar.badge.clock': '📅',
  'calendar.badge.exclamationmark': '📅',
  'clock': '🕐',
  'clock.fill': '🕐',

  // Miscellaneous
  'star': '⭐',
  'star.fill': '⭐',
  'flag': '🚩',
  'flag.fill': '🚩',
  'tag': '🏷️',
  'tag.fill': '🏷️',
  'scissors': '✂️',
  'paintbrush': '🖌️',
  'paintbrush.fill': '🖌️',
  'wrench': '🔧',
  'wrench.fill': '🔧',
  'hammer': '🔨',
  'hammer.fill': '🔨',
  'leaf': '🍃',
  'leaf.fill': '🍃',
  'pawprint': '🐾',
  'pawprint.fill': '🐾',
  'tshirt': '👕',
  'tshirt.fill': '👕',
  'cup.and.saucer': '☕',
  'cup.and.saucer.fill': '☕',
  'building.2': '🏢',
  'building.2.fill': '🏢',
  'phone.connection': '📞',
  'trash': '🗑️',
  'trash.fill': '🗑️',
};

// Legacy icon mappings (from React Native MaterialCommunityIcons)
const legacyIconMap: Record<string, string> = {
  'gift-outline': '🎁',
  'wallet-outline': '👛',
  'book-open-outline': '📖',
  'airplane-takeoff': '✈️',
  'food': '🍽️',
  'silverware-fork-knife': '🍽️',
  'flash': '⚡',
  'heart-pulse': '💓',
  'laptop': '💻',
  'chart-line': '📈',
};

/**
 * Maps icon names (SF Symbols or legacy) to emoji for web display
 */
export function mapIconToEmoji(iconName: string): string {
  // Check if it's already an emoji (single character with emoji property)
  if (iconName && /\p{Emoji}/u.test(iconName)) {
    return iconName;
  }

  // Try SF Symbol mapping first
  if (sfSymbolToEmoji[iconName]) {
    return sfSymbolToEmoji[iconName];
  }

  // Try legacy mapping
  if (legacyIconMap[iconName]) {
    return legacyIconMap[iconName];
  }

  // Default fallback
  return '📝';
}

/**
 * Validate if a string is a valid emoji
 */
export function isEmoji(str: string): boolean {
  return /\p{Emoji}/u.test(str);
}
