import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom'; // 1. Tambahkan import Navigate
import { AuthContext } from '../context/AuthContext';
import { MessageSquare } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // 2. Ekstrak 'token' dari AuthContext
    const { login, loading, token } = useContext(AuthContext);
    const navigate = useNavigate();

    // 3. Pengecekan status login: Jika punya token, tendang kembali ke Dashboard
    if (token) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const res = await login(username, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-green-500 p-3 rounded-full mb-4">
                        <MessageSquare className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">WA Gateway</h1>
                    <p className="text-gray-500 text-sm mt-2">Azhar Faturohman Ahidin</p>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <PasswordInput 
                            type="password" 
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {loading ? 'Memproses...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;