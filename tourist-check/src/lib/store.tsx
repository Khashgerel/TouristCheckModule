'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type { Booking, User } from './types';

const MOCK_STAFF: User = { id: 'staff-1', role: 'staff', name: 'Ажилтан' };

interface State {
  user: User | null;
  bookings: Booking[];
  loading: boolean;
}

type Action =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: Booking }
  | { type: 'DELETE_BOOKING'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: MOCK_STAFF };
    case 'LOGOUT':
      return { ...state, user: null, bookings: [] };
    case 'RESTORE_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload, loading: false };
    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.payload.id ? action.payload : b
        ),
      };
    case 'DELETE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.filter((b) => b.id !== action.payload),
      };
    default:
      return state;
  }
}

const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'admin123';

const API = '/api/bookings';

interface StoreContextValue {
  state: State;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  loadBookings: () => Promise<void>;
  addBooking: (data: Omit<Booking, 'id' | 'guideId' | 'guideName' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<{ ok: true; booking: Booking } | { ok: false; error: string }>;
  updateBooking: (booking: Booking) => Promise<{ ok: true; booking: Booking } | { ok: false; error: string }>;
  deleteBooking: (id: string) => Promise<boolean>;
  getBookingById: (id: string) => Booking | undefined;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    bookings: [],
    loading: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        dispatch({ type: 'RESTORE_USER', payload: JSON.parse(stored) });
      } catch { /* ignore invalid JSON */ }
    }
  }, []);

  const login = (username: string, password: string) => {
    if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) return false;
    dispatch({ type: 'LOGIN' });
    localStorage.setItem('user', JSON.stringify(MOCK_STAFF));
    return true;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('user');
  };

  const loadBookings = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      dispatch({ type: 'SET_BOOKINGS', payload: data });
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addBooking = useCallback(async (data: Omit<Booking, 'id' | 'guideId' | 'guideName' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      const body = {
        ...data,
        guideId: state.user?.id ?? 'anonymous',
        guideName: state.user?.name ?? `${data.guide.lastName} ${data.guide.firstName}`,
      };
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const response = await res.json();
      if (!res.ok) return { ok: false as const, error: response.error ?? 'Захиалга үүсгэхэд алдаа гарлаа' };
      dispatch({ type: 'ADD_BOOKING', payload: response });
      return { ok: true as const, booking: response };
    } catch {
      return { ok: false as const, error: 'Серверт холбогдоход алдаа гарлаа' };
    }
  }, [state.user]);

  const updateBooking = useCallback(async (booking: Booking) => {
    try {
      const res = await fetch(`${API}/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      const response = await res.json();
      if (!res.ok) return { ok: false as const, error: response.error ?? 'Захиалга шинэчлэхэд алдаа гарлаа' };
      dispatch({ type: 'UPDATE_BOOKING', payload: response });
      return { ok: true as const, booking: response };
    } catch {
      return { ok: false as const, error: 'Серверт холбогдоход алдаа гарлаа' };
    }
  }, []);

  const deleteBooking = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      dispatch({ type: 'DELETE_BOOKING', payload: id });
      return true;
    } catch {
      return false;
    }
  }, []);

  const getBookingById = (id: string) => state.bookings.find((b) => b.id === id);

  return (
    <StoreContext.Provider value={{
      state, login, logout, loadBookings,
      addBooking, updateBooking, deleteBooking, getBookingById,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function isEditable(booking: Booking): boolean {
  const arrival = new Date(`${booking.arrivalDate}T${booking.arrivalTime}`);
  const now = new Date();
  const diff = now.getTime() - arrival.getTime();
  return diff < 24 * 60 * 60 * 1000;
}

export function canEdit(booking: Booking, currentUser: User | null): boolean {
  if (!currentUser) return false;
  if (currentUser.role === 'staff') return true;
  return currentUser.id === booking.guideId && isEditable(booking);
}
