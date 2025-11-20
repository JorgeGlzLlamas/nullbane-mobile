import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { User, UserSettings } from '../types/api';

interface UserSettingsContextType {
    user: User | null;
    settings: UserSettings | null;
    loading: boolean;
    error: string | null;
    updateSettings: (changes: Partial<UserSettings>) => Promise<boolean>;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const UserSettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const { apiFetch, accessToken } = useAuth();

    const [user, setUser] = useState<User | null>(null);
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!accessToken) {
            setUser(null);
            setSettings(null);
            return;
        }

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                const [userRes, settingsRes] = await Promise.all([
                    apiFetch('/api/v1/users/me'),
                    apiFetch('/api/v1/settings/me'),
                ]);

                if (!userRes.ok || !settingsRes.ok) {
                    throw new Error('Error al cargar datos del usuario');
                }

                const userData = (await userRes.json()) as User;
                const settingsData = (await settingsRes.json()) as UserSettings;

                setUser(userData);
                setSettings(settingsData);

            } catch (err) {
                setError('No se pudieron cargar los datos.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [accessToken]);

    const updateSettings = async (changes: Partial<UserSettings>): Promise<boolean> => {
        if (!settings) return false;

        const oldSettings = settings;
        const newSettings = { ...settings, ...changes };
        setSettings(newSettings);

        try {
            const response = await apiFetch('/api/v1/settings/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(changes),
            });

            if (!response.ok) {
                throw new Error('Error actualizando settings');
            }

            return true;
        } catch (e) {
            setSettings(oldSettings);
            return false;
        }
    };

    return (
        <UserSettingsContext.Provider
            value={{
                user,
                settings,
                loading,
                error,
                updateSettings,
            }}
        >
            {children}
        </UserSettingsContext.Provider>
    );
};

export const useUserSettings = () => {
    const ctx = useContext(UserSettingsContext);
    if (!ctx) {
        throw new Error('useUserSettings debe usarse dentro de UserSettingsProvider');
    }
    return ctx;
};
