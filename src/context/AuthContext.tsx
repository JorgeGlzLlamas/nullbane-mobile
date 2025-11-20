import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config';
import { useRouter } from 'expo-router';

interface TokenResponse {
    access_token: string;
    refresh_token?: string;
}

interface AuthContextType {
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    setTokens: (access: string | null, refresh: string | null) => Promise<void>;
    logout: () => Promise<void>;
    apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let refreshSubscribers: ((newAccessToken: string) => void)[] = [];
let isRefreshing = false;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadTokens = async () => {
            const access = await SecureStore.getItemAsync('accessToken');
            const refresh = await SecureStore.getItemAsync('refreshToken');
            setAccessToken(access);
            setRefreshToken(refresh);
            setIsLoading(false);
        };
        loadTokens();
    }, []); 

    const setTokens = useCallback(async (access: string | null, refresh: string | null) => {
        try {
            if (access) {
                await SecureStore.setItemAsync('accessToken', access);
                setAccessToken(access);
            }
            if (refresh) {
                await SecureStore.setItemAsync('refreshToken', refresh);
                setRefreshToken(refresh);
            }
        } catch (e) {
            console.error("AuthContext: Error en setTokens", e);
        }
    }, []); 

    const logout = useCallback(async () => {
        try {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
        } catch (e) {
            console.error("AuthContext: Error en logout", e);
        }
        setAccessToken(null);
        setRefreshToken(null);
        router.replace('/login');
    }, [router]); 

    const apiFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        
        const freshAccessToken = await SecureStore.getItemAsync('accessToken');
        const headers = new Headers(options.headers || {});

        if (freshAccessToken) {
            headers.set('Authorization', `Bearer ${freshAccessToken}`);
        }
        options.headers = headers;
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (response.status !== 401) {
            return response;
        }

        // --- Lógica de Refresh ---
        if (isRefreshing) {
            return new Promise<Response>((resolve) => {
                refreshSubscribers.push(async (newAccessToken) => {
                    headers.set('Authorization', `Bearer ${newAccessToken}`);
                    options.headers = headers;
                    const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, options);
                    resolve(retryResponse);
                });
            });
        }
        isRefreshing = true;

        const currentRefreshToken = await SecureStore.getItemAsync('refreshToken');

        if (!currentRefreshToken) {
            console.error('AuthContext: [apiFetch] No hay refresh token. Cerrando sesión.');
            await logout();
            isRefreshing = false;
            return response;
        }

        try {
            const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: currentRefreshToken }),
            });

            if (!refreshResponse.ok) {
                throw new Error('Falló el refresh token');
            }

            const newTokens = (await refreshResponse.json()) as TokenResponse;
            
            await setTokens(
                newTokens.access_token,
                newTokens.refresh_token ?? currentRefreshToken
            );

            refreshSubscribers.forEach((callback) => callback(newTokens.access_token));
            refreshSubscribers = [];

            headers.set('Authorization', `Bearer ${newTokens.access_token}`);
            options.headers = headers;
            
            return fetch(`${API_BASE_URL}${endpoint}`, options);
        } catch(e) {
            console.error('AuthContext: [apiFetch] El refresh token falló. Cerrando sesión.', e);
            await logout();
            return response;
        } finally {
            isRefreshing = false;
        }
    }, [logout, setTokens]); 

    const value = useMemo(() => ({
        accessToken,
        refreshToken,
        isLoading,
        setTokens,
        logout,
        apiFetch,
    }), [accessToken, refreshToken, isLoading, setTokens, logout, apiFetch]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
