import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
    // Vite requires VITE_ prefix for environment variables to be exposed to the client
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    // Log for debugging (will show in browser console)
    console.log("Environment Status:", {
        google: googleClientId ? "Configured" : "MISSING",
        recaptcha: recaptchaSiteKey ? "Configured" : "MISSING"
    });

    if (!googleClientId) {
        console.warn("CRITICAL: VITE_GOOGLE_CLIENT_ID is not defined in .env file!");
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId || ""}>
            <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey || ""}>
                <AuthProvider>
                    <Router>
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route 
                                path="/dashboard/:tab?" 
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