import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as auth from '../controllers/auth.controller';
import * as trips from '../controllers/trips.controller';
import * as stops from '../controllers/stops.controller';
import * as cities from '../controllers/cities.controller';
import * as misc from '../controllers/misc.controller';

const r = Router();

// ── AUTH ──────────────────────────────────────────────────
r.post('/auth/register', auth.register);
r.post('/auth/login', auth.login);
r.post('/auth/refresh', auth.refresh);
r.post('/auth/logout', auth.logout);
r.get('/auth/me', authenticate, auth.getMe);
r.patch('/auth/profile', authenticate, auth.updateProfile);
r.patch('/auth/password', authenticate, auth.changePassword);
r.delete('/auth/account', authenticate, auth.deleteAccount);

// ── TRIPS ─────────────────────────────────────────────────
r.get('/trips', authenticate, trips.getTrips);
r.post('/trips', authenticate, trips.createTrip);
r.get('/trips/feed', trips.getPublicFeed);
r.get('/trips/public/:token', trips.getPublicTrip);
r.get('/trips/:id', authenticate, trips.getTripById);
r.patch('/trips/:id', authenticate, trips.updateTrip);
r.delete('/trips/:id', authenticate, trips.deleteTrip);
r.post('/trips/:id/duplicate', authenticate, trips.duplicateTrip);
r.post('/trips/:id/like', trips.likeTrip);

// ── STOPS ─────────────────────────────────────────────────
r.post('/trips/:tripId/stops', authenticate, stops.addStop);
r.patch('/trips/:tripId/stops/reorder', authenticate, stops.reorderStops);
r.patch('/trips/:tripId/stops/:stopId', authenticate, stops.updateStop);
r.delete('/trips/:tripId/stops/:stopId', authenticate, stops.deleteStop);
r.post('/trips/:tripId/stops/:stopId/activities', authenticate, stops.addActivity);
r.patch('/trips/:tripId/stops/:stopId/activities/:saId', authenticate, stops.updateStopActivity);
r.delete('/trips/:tripId/stops/:stopId/activities/:saId', authenticate, stops.removeActivity);

// ── CITIES ────────────────────────────────────────────────
r.get('/cities', cities.getCities);
r.get('/cities/trending', cities.getTrendingCities);
r.get('/cities/:id', cities.getCityById);
r.post('/cities/:cityId/bookmark', authenticate, cities.bookmarkCity);
r.get('/bookmarks', authenticate, cities.getBookmarkedCities);

// ── ACTIVITIES ────────────────────────────────────────────
r.get('/activities', cities.getActivities);
r.post('/activities/suggest', authenticate, cities.suggestActivities);

// ── EXPENSES ──────────────────────────────────────────────
r.get('/trips/:tripId/expenses', authenticate, misc.getExpenses);
r.post('/trips/:tripId/expenses', authenticate, misc.addExpense);
r.delete('/trips/:tripId/expenses/:id', authenticate, misc.deleteExpense);

// ── PACKING ───────────────────────────────────────────────
r.get('/trips/:tripId/packing', authenticate, misc.getPackingItems);
r.post('/trips/:tripId/packing/generate', authenticate, misc.generatePackingList);
r.post('/trips/:tripId/packing', authenticate, misc.addPackingItem);
r.patch('/trips/:tripId/packing/:id/toggle', authenticate, misc.togglePackingItem);
r.delete('/trips/:tripId/packing/:id', authenticate, misc.deletePackingItem);

// ── NOTES ─────────────────────────────────────────────────
r.get('/trips/:tripId/notes', authenticate, misc.getNotes);
r.post('/trips/:tripId/notes', authenticate, misc.addNote);
r.patch('/trips/:tripId/notes/:id', authenticate, misc.updateNote);
r.delete('/trips/:tripId/notes/:id', authenticate, misc.deleteNote);

// ── ADMIN ─────────────────────────────────────────────────
r.get('/admin/stats', authenticate, misc.adminStats);
r.get('/admin/users', authenticate, misc.adminGetUsers);
r.delete('/admin/trips/:id', authenticate, misc.adminDeleteTrip);

export default r;
