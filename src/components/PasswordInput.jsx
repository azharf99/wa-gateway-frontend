import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordInput = ({ 
    value, 
    onChange, 
    placeholder = "Masukkan kata sandi...", 
    required = false,
    name = "password",
    id = "password",
    className = "",
    icon = <Lock className="h-4 w-4" />
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative w-full group">
            {/* Ikon di Kiri */}
            {icon && (
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    {React.cloneElement(icon, { size: icon.props.size || 18 })}
                </div>
            )}

            {/* Input Field */}
            <input
                id={id}
                name={name}
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={className || "w-full pl-11 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"}
            />

            {/* Tombol Mata (Show/Hide) di Kanan */}
            <button
                type="button"
                tabIndex="-1"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors focus:outline-none"
                title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
            >
                {showPassword ? (
                    <EyeOff size={18} />
                ) : (
                    <Eye size={18} />
                )}
            </button>
        </div>
    );
};

export default PasswordInput;