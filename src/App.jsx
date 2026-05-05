import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
                <AuthProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route 
                                path="/" 
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } 
                            />
                        </Routes>
                    </Router>
                </AuthProvider>
            </GoogleReCaptchaProvider>
        </GoogleOAuthProvider>
    );
}

export default App;