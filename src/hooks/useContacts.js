import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';

const useContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(false);

    useEffect(() => {
        const fetchContacts = async () => {
            setLoadingContacts(true);
            try {
                const res = await axiosInstance.get('/contacts/list');
                setContacts(res.data?.data || []);
            } catch (error) {
                console.error('Gagal memuat kontak untuk pilihan tujuan:', error);
            } finally {
                setLoadingContacts(false);
            }
        };

        fetchContacts();
    }, []);

    return { contacts, loadingContacts };
};

export default useContacts;
