export const cn = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(' ');

export const getTripStatus = (startDate?: string, endDate?: string) => {
  if (!startDate) return 'upcoming';
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  if (now < start) return 'upcoming';
  if (end && now > end) return 'completed';
  return 'ongoing';
};

export const getDaysUntil = (date?: string) => {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
};

export const formatDate = (date?: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getCategoryColor = (category: string) => {
  const map: Record<string, string> = {
    sightseeing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    food: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    adventure: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    culture: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    nightlife: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    shopping: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    wellness: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    transport: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    stay: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  };
  return map[category] || 'bg-gray-100 text-gray-700';
};

export const CATEGORY_ICONS: Record<string, string> = {
  sightseeing: '🏛️', food: '🍜', adventure: '🧗', culture: '🎭',
  nightlife: '🎉', shopping: '🛍️', wellness: '🧘', transport: '✈️',
  stay: '🏨', activity: '🎯', other: '📌',
};
