import React from 'react';
import { Link } from 'react-router-dom';
import {
    Smartphone, Send, Megaphone, CalendarClock,
    MessageSquareQuote, Key, ShieldCheck, CheckCircle2,
    ArrowRight, MessageSquare, Zap, Users, BarChart3
} from 'lucide-react';

const Landing = () => {
    const features = [
        {
            title: "Manajemen Multi-Device",
            description: "Hubungkan dan kelola banyak akun WhatsApp dalam satu dashboard terpadu dengan status real-time.",
            icon: <Smartphone className="w-6 h-6 text-emerald-500" />,
        },
        {
            title: "Broadcast & Kampanye",
            description: "Kirim pesan massal ke ribuan kontak sekaligus dengan fitur upload CSV yang cerdas.",
            icon: <Megaphone className="w-6 h-6 text-emerald-500" />,
        },
        {
            title: "Auto Reply Cerdas",
            description: "Atur balasan otomatis untuk pertanyaan yang sering diajukan, hemat waktu tim support Anda.",
            icon: <MessageSquareQuote className="w-6 h-6 text-emerald-500" />,
        },
        {
            title: "API Integrasi Kuat",
            description: "Integrasikan fitur WhatsApp ke sistem Anda sendiri dengan API Key yang aman dan dokumentasi lengkap.",
            icon: <Key className="w-6 h-6 text-emerald-500" />,
        },
        {
            title: "Pesan Terjadwal",
            description: "Jadwalkan pesan untuk dikirim pada waktu yang tepat. Sempurna untuk pengingat atau ucapan.",
            icon: <CalendarClock className="w-6 h-6 text-emerald-500" />,
        },
        {
            title: "Buku Kontak Terpusat",
            description: "Kelola daftar kontak dan grup Anda dengan mudah. Sinkronisasi otomatis antar device.",
            icon: <Users className="w-6 h-6 text-emerald-500" />,
        }
    ];

    const plans = [
        {
            name: "Starter",
            price: "Gratis",
            description: "Sempurna untuk penggunaan pribadi atau testing.",
            features: ["1 Device Aktif", "100 Pesan / Hari", "Auto Reply Dasar", "API Access"],
            cta: "Mulai Gratis",
            popular: false
        },
        {
            name: "Business",
            price: "Rp 199k",
            period: "/ bulan",
            description: "Solusi terbaik untuk bisnis menengah.",
            features: ["5 Device Aktif", "Unlimited Pesan", "Auto Reply Canggih", "Priority API Access", "Broadcast Campaign"],
            cta: "Pilih Business",
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "Untuk skala besar dengan kebutuhan khusus.",
            features: ["Unlimited Device", "Dedicated Server", "Custom Integration", "White-label Support", "24/7 Priority Support"],
            cta: "Hubungi Kami",
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-600 p-2 rounded-xl">
                            <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                            WA Gateway
                        </span>
                        <span className="text-sm font-normal text-slate-500">by azharfa.cloud</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Fitur</a>
                        <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Harga</a>
                        <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Masuk</Link>
                        <Link to="/register" className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                            Daftar Sekarang
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-8 animate-bounce">
                        <Zap className="w-4 h-4" /> Solusi WhatsApp Gateway No. 1
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                        Automasi WhatsApp Anda, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                            Skalakan Bisnis Anda.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Platform WhatsApp Gateway yang kuat, aman, dan mudah digunakan untuk kebutuhan marketing, notifikasi, dan automasi komunikasi bisnis Anda.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2">
                            Mulai Sekarang <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a href="#features" className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                            Lihat Fitur
                        </a>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="mt-20 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10"></div>
                        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-2 overflow-hidden transform hover:-translate-y-2 transition-transform duration-500">
                            <div className="bg-slate-100 rounded-2xl p-4 md:p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="col-span-1 space-y-4">
                                        <div className="h-40 bg-white rounded-2xl shadow-sm border border-slate-200/50 p-4 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div className="bg-emerald-100 p-2 rounded-lg"><Smartphone className="w-5 h-5 text-emerald-600" /></div>
                                                <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">CONNECTED</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-400 uppercase">Device Utama</div>
                                                <div className="text-sm font-black text-slate-800">+62 812 3456 7890</div>
                                            </div>
                                        </div>
                                        <div className="h-40 bg-white rounded-2xl shadow-sm border border-slate-200/50 p-4 flex flex-col justify-between opacity-50">
                                            <div className="flex justify-between items-start">
                                                <div className="bg-slate-100 p-2 rounded-lg"><Smartphone className="w-5 h-5 text-slate-400" /></div>
                                                <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">DISCONNECTED</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-400 uppercase">CS Team 1</div>
                                                <div className="text-sm font-black text-slate-800">Menunggu scan...</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-4">
                                        <div className="h-84 bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                    <BarChart3 className="w-4 h-4 text-emerald-500" /> Statistik Pesan
                                                </h3>
                                                <div className="text-xs font-bold text-slate-400">7 Hari Terakhir</div>
                                            </div>
                                            <div className="flex items-end justify-between h-40 gap-2">
                                                {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-emerald-100 hover:bg-emerald-500 rounded-t-lg transition-all cursor-pointer relative group" style={{ height: `${h}%` }}>
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                            {h * 10} Pesan
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between mt-4">
                                                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => (
                                                    <div key={d} className="text-[10px] font-bold text-slate-400 uppercase">{d}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Kenapa Memilih Kami?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">Kami menyediakan alat yang Anda butuhkan untuk mengelola komunikasi WhatsApp secara profesional dan efisien.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-emerald-600/5 transition-all group">
                                <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-20 bg-emerald-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                        <div>
                            <div className="text-4xl font-black mb-2">10k+</div>
                            <div className="text-emerald-100 text-sm font-bold uppercase tracking-wider">User Aktif</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black mb-2">1M+</div>
                            <div className="text-emerald-100 text-sm font-bold uppercase tracking-wider">Pesan / Hari</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black mb-2">99.9%</div>
                            <div className="text-emerald-100 text-sm font-bold uppercase tracking-wider">Uptime</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black mb-2">24/7</div>
                            <div className="text-emerald-100 text-sm font-bold uppercase tracking-wider">Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Pilih Paket Bisnis Anda</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">Mulai secara gratis dan tingkatkan sesuai kebutuhan pertumbuhan bisnis Anda.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((p, i) => (
                            <div key={i} className={`p-8 rounded-3xl border ${p.popular ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200'} bg-white relative flex flex-col`}>
                                {p.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                        Paling Populer
                                    </div>
                                )}
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">{p.name}</h3>
                                    <p className="text-xs text-slate-500 mb-6">{p.description}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-slate-900">{p.price}</span>
                                        {p.period && <span className="text-slate-500 font-bold">{p.period}</span>}
                                    </div>
                                </div>
                                <div className="space-y-4 mb-10 flex-1">
                                    {p.features.map((f, j) => (
                                        <div key={j} className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                            <span className="text-sm text-slate-600 font-semibold">{f}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    to="/register"
                                    className={`w-full py-4 rounded-2xl text-center font-bold transition-all ${p.popular
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-600/20'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {p.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-600/20 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">Siap Untuk Memulai?</h2>
                    <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto relative z-10 leading-relaxed">
                        Bergabunglah dengan ribuan bisnis yang telah menggunakan WA Gateway untuk meningkatkan produktivitas komunikasi mereka.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                        <Link to="/register" className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-emerald-700 transition-all">
                            Daftar Sekarang - Gratis!
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto text-white border border-slate-700 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-800 transition-all">
                            Sudah punya akun? Masuk
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-600 p-1.5 rounded-lg">
                                <Smartphone className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                                WA Gateway
                            </span>
                        </div>
                        <div className="flex items-center gap-8 text-sm font-bold text-slate-400">
                            <a href="#" className="hover:text-emerald-600">Fitur</a>
                            <a href="#" className="hover:text-emerald-600">Harga</a>
                            <a href="#" className="hover:text-emerald-600">Dokumentasi</a>
                            <a href="#" className="hover:text-emerald-600">Kebijakan Privasi</a>
                        </div>
                        <div className="text-sm font-bold text-slate-400">
                            © 2026 WA Gateway. Dibuat dengan ❤️ oleh <a href="https://azharfa.cloud" className="hover:text-emerald-600">azharfa.cloud</a> untuk kemajuan bisnis.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;