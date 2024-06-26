import React, { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, Link } from 'react-router-dom';
import { auth } from './firebase-config';
import FileUpload from './components/FileUpload';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Quizzes from './components/Quizzes';
import './styles/App.css';

// Create a context for authentication state
const AuthContext = createContext();

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={user}>
      <Router>
        <AppContent />
      </Router>
    </AuthContext.Provider>
  );
};

const AppContent = () => {
  const user = useContext(AuthContext);
  const location = useLocation();

  const showSidebar = user && !['/login', '/signup'].includes(location.pathname);

  const getLinkClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="app-container">
      {showSidebar && (
        <div className="sidebar">
          <div className="logo">
            <img src="https://github.com/sat-wik/QuizForce/blob/main/frontend/src/assets/QuizForce.png?raw=true" alt="QuizForge Logo" />
          </div>
          <ul>
            <li className={getLinkClass('/quizzes')}><Link to="/quizzes">Quizzes</Link></li>
            <li className={getLinkClass('/lectures')}><Link to="/lectures">Lectures</Link></li>
            <li className={getLinkClass('/tests')}><Link to="/tests">Tests</Link></li>
            <li className={getLinkClass('/file-upload')}><Link to="/file-upload">File Upload</Link></li>
            <li className={getLinkClass('/coding')}><Link to="/coding">Coding</Link></li>
          </ul>
        </div>
      )}
      <div className="content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={user ? <Navigate to="/quizzes" /> : <Navigate to="/login" />} />
          <Route path="/quizzes" element={user ? <Quizzes /> : <Navigate to="/login" />} />
          <Route path="/lectures" element={user ? <div>Lectures Content</div> : <Navigate to="/login" />} />
          <Route path="/tests" element={user ? <div>Tests Content</div> : <Navigate to="/login" />} />
          <Route path="/file-upload" element={user ? <FileUpload /> : <Navigate to="/login" />} />
          <Route path="/coding" element={user ? <div>Coding Content</div> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
