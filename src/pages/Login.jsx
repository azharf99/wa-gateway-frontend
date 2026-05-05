import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { LogIn, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import PasswordInput from '../components/PasswordInput';

const Login = () => {
    const [identifier, setIdentifier] = useState(''); // Bisa username atau email
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { login, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!executeRecaptcha) {
            setError('reCAPTCHA belum siap. Silakan coba lagi.');
            setLoading(false);
            return;
        }

        try {
            const recaptchaToken = await executeRecaptcha('login');
            const result = await login(identifier, password, recaptchaToken);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message);
                setLoading(false);
            }
        } catch (err) {
            setError('Gagal memverifikasi keamanan (reCAPTCHA)');
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        const result = await googleLogin(credentialResponse.credential);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500">
            <div className="max-w-md w-full">
                {/* Header Area */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Selamat Datang</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Masuk untuk melanjutkan ke dashboard</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-2xl flex items-start gap-3 animate-shake">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Username / Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input 
                                        type="text"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all dark:text-white"
                                        placeholder="johndoe atau john@email.com"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                                    <a href="#" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Lupa password?</a>
                                </div>
                                <PasswordInput 
                                    required
                                    className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all dark:text-white"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-70 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Masuk Sekarang
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="my-6 flex items-center gap-4">
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Atau masuk dengan</span>
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                        </div>

                        <div className="flex justify-center w-full">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Login gagal dimuat')}
                                useOneTap
                                theme="filled_blue"
                                shape="pill"
                                width="320"
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Belum punya akun?{' '}
                            <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                                Daftar Sekarang
                              </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;