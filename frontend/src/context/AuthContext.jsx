import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authAPI.register(userData);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registrasi gagal';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authAPI.login(credentials);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);

            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login gagal';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setError(null);
    };

    const updateProfile = async (profileData) => {
        try {
            setError(null);
            const response = await authAPI.updateProfile(profileData);
            const updatedUser = response.data.user;

            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Update profil gagal';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const value = {
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth harus digunakan dalam AuthProvider');
    }
    return context;
};
