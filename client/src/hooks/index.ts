import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import type { Trip, City, Activity } from '../types';

export const useTripData = (id?: string) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/trips/${id}`);
      setTrip(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);
  return { trip, loading, refetch: fetch, setTrip };
};

export const useTrips = (status?: string) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/trips', { params: { status, limit: 50 } });
      setTrips(data.trips);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetch(); }, [fetch]);
  return { trips, loading, total, refetch: fetch };
};

export const useCities = (params?: Record<string, string>) => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/cities', { params });
      setCities(data.cities);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { cities, loading, total, refetch: fetch };
};

export const useActivities = (params?: Record<string, string>) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/activities', { params });
      setActivities(data.activities);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { activities, loading, refetch: fetch };
};

export const useBudget = (tripId?: string) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/trips/${tripId}/expenses`);
      setExpenses(data);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => { fetch(); }, [fetch]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = expenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  return { expenses, loading, total, byCategory, refetch: fetch };
};

export const useDebounce = <T>(value: T, delay = 300): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};
