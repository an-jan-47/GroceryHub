const attemptsByUser: { [userId: string]: number[] } = {};
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

export const rateLimit = (userId: string): boolean => {
  const now = Date.now();
  cleanupOldAttempts();

  if (!attemptsByUser[userId]) {
    attemptsByUser[userId] = [];
  }

  attemptsByUser[userId].push(now);

  const attemptsInWindow = attemptsByUser[userId].filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  ).length;

  return attemptsInWindow > MAX_ATTEMPTS;
};

export const clearAttempts = (userId: string): void => {
  delete attemptsByUser[userId];
};

export const cleanupOldAttempts = () => {
  const now = Date.now();
  Object.keys(attemptsByUser).forEach(userId => {
    attemptsByUser[userId] = attemptsByUser[userId].filter((timestamp: number) => 
      now - timestamp < RATE_LIMIT_WINDOW
    );
    
    if (attemptsByUser[userId].length === 0) {
      delete attemptsByUser[userId];
    }
  });
};
