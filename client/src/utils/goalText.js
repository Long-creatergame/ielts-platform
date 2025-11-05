export const getGoalText = (t, goal) => {
  if (goal === undefined || goal === null || goal === '' || isNaN(Number(goal))) {
    return t('auth.goalOptions.undefined');
  }
  const formatted = Number(goal).toFixed(1);
  const key = `auth.goalOptions.band${formatted}`;
  return t(key, { goal: formatted });
};


