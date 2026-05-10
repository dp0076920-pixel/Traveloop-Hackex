export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  language: string;
  isAdmin: boolean;
  createdAt: string;
};

export type City = {
  id: string;
  name: string;
  country: string;
  continent: string;
  lat: number;
  lng: number;
  costIndex: string;
  popularityScore: number;
  imageUrl?: string;
  flagEmoji?: string;
  avgDailyCost?: number;
  weatherCategory?: string;
};

export type Activity = {
  id: string;
  cityId: string;
  name: string;
  category: string;
  description?: string;
  costEstimate?: number;
  durationHours?: number;
  imageUrl?: string;
  rating?: number;
  city?: City;
};

export type StopActivity = {
  id: string;
  stopId: string;
  activityId: string;
  scheduledDate?: string;
  scheduledTime?: string;
  customCost?: number;
  isBooked: boolean;
  activity: Activity;
};

export type Stop = {
  id: string;
  tripId: string;
  cityId: string;
  orderIndex: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  city: City;
  stopActivities: StopActivity[];
  tripNotes?: TripNote[];
};

export type TripExpense = {
  id: string;
  tripId: string;
  category: string;
  amount: number;
  label: string;
  date: string;
};

export type PackingItem = {
  id: string;
  tripId: string;
  label: string;
  category: string;
  isPacked: boolean;
};

export type TripNote = {
  id: string;
  tripId: string;
  stopId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type Trip = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  isPublic: boolean;
  shareToken?: string;
  totalBudget?: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  stops: Stop[];
  expenses?: TripExpense[];
  packingItems?: PackingItem[];
  notes?: TripNote[];
  user?: { name: string; avatarUrl?: string };
};

export type TripStatus = string;
