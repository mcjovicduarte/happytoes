import React from 'react';
import { Home, Package, User } from 'lucide-react';

const NavBar = ({ activeTab, onTabChange }) => {

    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'order', label: 'Order', icon: Package },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    const handleNavClick = (tabId) => {
        onTabChange(tabId);
    };

    return (
        <>
            {/* Bottom Navigation - visible on all screen sizes */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-lg">
                <div className="flex items-center justify-around px-2 py-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg flex-1 transition-all duration-200 ${isActive
                                        ? 'text-orange-500'
                                        : 'text-gray-600 hover:text-orange-500'
                                    }`}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-orange-500 rounded-t-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default NavBar;
