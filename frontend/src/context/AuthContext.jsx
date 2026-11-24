import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('vanguard_user') || localStorage.getItem('wfx_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Basic mock login
    // In a real app, this would verify credentials against a backend
    const mockUser = {
      id: 'usr_1',
      name: email.split('@')[0],
      email,
      role: 'Administrator',
      password // we store it here just to show it in settings modal as requested
    };
    
    // Check if we have registered users
    const users = JSON.parse(localStorage.getItem('vanguard_users') || '[]');
    const existingUser = users.find(u => u.email === email && u.password === password);
    
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem('vanguard_user', JSON.stringify(existingUser));
      return true;
    } else if (email === 'admin@vanguard.com' && password === 'admin123') {
      // default admin fallback
      const defaultAdmin = { ...mockUser, email: 'admin@vanguard.com', name: 'Gautam' };
      setUser(defaultAdmin);
      localStorage.setItem('vanguard_user', JSON.stringify(defaultAdmin));
      return true;
    }
    
    return false; // Invalid credentials
  };

  const signup = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('vanguard_users') || '[]');
    
    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    
    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      password,
      role: 'Administrator'
    };
    
    users.push(newUser);
    localStorage.setItem('vanguard_users', JSON.stringify(users));
    
    setUser(newUser);
    localStorage.setItem('vanguard_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vanguard_user');
    localStorage.removeItem('wfx_user');
  };
  
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('vanguard_user', JSON.stringify(updatedUser));
    
    // update in users array
    const users = JSON.parse(localStorage.getItem('vanguard_users') || '[]');
    const index = users.findIndex(u => u.email === user.email);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem('vanguard_users', JSON.stringify(users));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
