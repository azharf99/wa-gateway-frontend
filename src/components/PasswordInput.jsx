import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordInput = ({ 
    value, 
    onChange, 
    placeholder = "Masukkan kata sandi...", 
    required = false,
    name = "password",
    id = "password"
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative w-full">
            {/* Ikon Gembok di Kiri (Opsional, agar lebih manis) */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
            </div>

            {/* Input Field */}
            <input
                id={id}
                name={name}
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
            />

            {/* Tombol Mata (Show/Hide) di Kanan */}
            <button
                type="button"
                tabIndex="-1" // Agar tidak ikut ter-fokus saat user menekan tombol Tab di keyboard
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-500 transition-colors focus:outline-none"
                title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
            >
                {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
            </button>
        </div>
    );
};

export default PasswordInput;