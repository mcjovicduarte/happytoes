import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, LogOut, Shield } from 'lucide-react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getCurrentUser();
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchProfile();
        }
    }, [currentUser]);

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Failed to log out: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                <p className="text-gray-600">Manage your account information</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <User size={40} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{profile?.full_name || 'User'}</h2>
                            <p className="text-orange-100">{currentUser?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Mail className="text-orange-500" size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email Address</p>
                                <p className="font-medium text-gray-900">{currentUser?.email}</p>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <User className="text-orange-500" size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Full Name</p>
                                <p className="font-medium text-gray-900">{profile?.full_name || 'Not set'}</p>
                            </div>
                        </div>

                        {/* Role */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Shield className="text-orange-500" size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Account Type</p>
                                <p className="font-medium text-gray-900 capitalize">{profile?.role || 'User'}</p>
                            </div>
                        </div>

                        {/* Member Since */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Calendar className="text-orange-500" size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Member Since</p>
                                <p className="font-medium text-gray-900">
                                    {currentUser?.created_at
                                        ? new Date(currentUser.created_at).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Account Actions */}
                    <div className="border-t border-gray-200 pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={handleLogout}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-500/30"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info Card */}
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="font-semibold text-orange-900 mb-2">Account Information</h3>
                <p className="text-sm text-orange-800">
                    Your account is secure and all your data is protected. If you need to update your information
                    or have any questions, please contact our support team.
                </p>
            </div>
        </div>
    );
};

export default Profile;
