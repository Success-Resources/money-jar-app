import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

// Initialize Supabase
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-900 to-green-950">
        <div className="text-gold text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-green-900 to-green-950 min-h-screen">
      {user ? (
        <Dashboard user={user} supabase={supabase} />
      ) : (
        <AuthPage supabase={supabase} />
      )}
    </div>
  );
}

export { supabase };
