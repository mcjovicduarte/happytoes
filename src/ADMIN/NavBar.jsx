import React, { useState } from 'react';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    LogOut,
    Menu,
    X
} from 'lucide-react';

const NavBar = ({ activeSection, onNavigate, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'orders', label: 'Customer Order', icon: ShoppingCart },
        { id: 'products', label: 'Products', icon: Package },
    ];

    const handleNavClick = (sectionId) => {
        onNavigate(sectionId);
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        onLogout();
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Mobile Menu Toggle Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-orange-600 text-white rounded-lg shadow-lg hover:bg-white hover:text-orange-600 transition-colors"
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <nav
                className={`
          fixed top-0 left-0 h-screen bg-orange-600 border-r border-orange-700 
          flex flex-col transition-transform duration-300 ease-in-out z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64
        `}
            >
                {/* Logo/Brand */}
                <div className="p-6 border-b border-orange-700">
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        Happy Toes
                    </h1>
                    <p className="text-xs text-white/80 mt-1">Admin Panel</p>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200 group
                  ${isActive
                                        ? 'bg-white text-orange-600 shadow-lg shadow-white/20'
                                        : 'text-white hover:bg-white/20 hover:text-white'
                                    }
                `}
                            >
                                <Icon
                                    size={20}
                                    className={`
                    transition-transform duration-200
                    ${isActive ? '' : 'group-hover:scale-110'}
                  `}
                                />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Logout Button */}
                <div className="p-3 border-t border-orange-700">
                    <button
                        onClick={handleLogout}
                        className="
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              text-white hover:bg-white/20 hover:text-white
              transition-all duration-200 group
            "
                    >
                        <LogOut
                            size={20}
                            className="transition-transform duration-200 group-hover:scale-110"
                        />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Spacer for content (only on desktop) */}
            <div className="hidden lg:block w-64 flex-shrink-0" />
        </>
    );
};

export default NavBar;
