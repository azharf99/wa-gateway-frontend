import React, { useEffect, useId, useMemo, useState } from 'react';
import { Search } from 'lucide-react';

const normalizeValue = (value = '') => value.split('@')[0];

const TargetSelectWithSearch = ({
    value,
    onChange,
    contacts = [],
    loading = false,
    label = 'Tujuan (Nomor/JID)',
    placeholder = 'Ketik nomor/JID atau cari nama kontak...'
}) => {
    const [search, setSearch] = useState('');
    const datalistId = `contact-target-options-${useId().replace(/:/g, '')}`;

    const selectedBaseValue = normalizeValue(value);
    const keyword = search.trim().toLowerCase();

    useEffect(() => {
        setSearch(selectedBaseValue);
    }, [selectedBaseValue]);

    const filteredContacts = useMemo(() => {
        if (!keyword) return contacts.slice(0, 10);
        return contacts
            .filter((contact) => {
                const name = (contact.name || '').toLowerCase();
                const phone = (contact.phone || '').toLowerCase();
                return name.includes(keyword) || phone.includes(keyword);
            })
            .slice(0, 20);
    }, [contacts, keyword]);

    const handleSearchChange = (event) => {
        const nextValue = event.target.value;
        setSearch(nextValue);
        onChange(nextValue);
    };

    const handlePickContact = (phone) => {
        setSearch(phone);
        onChange(phone);
    };

    return (
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    required
                    list={datalistId}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={search}
                    onChange={handleSearchChange}
                />
                <datalist id={datalistId}>
                    {filteredContacts.map((contact) => (
                        <option key={contact.id || contact.phone} value={contact.phone}>
                            {contact.name
                                ? `${contact.name} - ${contact.phone}${contact.category ? ` (${contact.category})` : ''}`
                                : contact.phone}
                        </option>
                    ))}
                </datalist>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
                {filteredContacts.slice(0, 6).map((contact) => (
                    <button
                        key={`quick-${contact.id || contact.phone}`}
                        type="button"
                        onClick={() => handlePickContact(contact.phone)}
                        className="px-2 py-1 text-xs rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                        {contact.name || 'Kontak'} ({contact.phone})
                        {contact.category ? ` - ${contact.category}` : ''}
                    </button>
                ))}
            </div>

            {loading && <p className="mt-2 text-xs text-slate-400">Memuat kontak...</p>}
            {!loading && contacts.length === 0 && (
                <p className="mt-2 text-xs text-slate-400">Kontak belum tersedia. Anda tetap bisa ketik manual.</p>
            )}
        </div>
    );
};

export default TargetSelectWithSearch;
