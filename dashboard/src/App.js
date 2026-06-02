import { useState, useEffect } from 'react';
import GRCDashboard from './GRCDashboard';
import Login from './components/Login';
import { isLive, getSession, onAuthStateChange } from './lib/supabase';
import './App.css';

// Auth wrapper:
// - Demo mode (isLive = false): renders dashboard directly, no login required
// - Live mode (isLive = true):  renders login until a valid Supabase Auth session exists
function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    if (!isLive) {
      setSession(null); // demo mode — skip auth
      return;
    }

    getSession().then(setSession);

    const { data: { subscription } } = onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Still resolving session
  if (session === undefined) return null;

  // Live mode, not signed in → show login
  if (isLive && !session) {
    return <Login onAuthenticated={() => getSession().then(setSession)} />;
  }

  return (
    <div className="App">
      <GRCDashboard />
    </div>
  );
}

export default App;
