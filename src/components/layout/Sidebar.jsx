import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { menuItems, LOGO_URL } from '../NavigationConfig';

export default function Sidebar({ isOpen, activePage, onClose }) {
    // Only close on mobile when clicking overlay or a menu item
    const handleMobileClose = () => {
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/50 z-[9998] md:hidden" onClick={onClose} />}
            <aside className={`${isOpen ? 'w-48 md:w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'} transition-all duration-300 overflow-y-auto overflow-x-hidden bg-white border-r border-gray-200 flex-shrink-0 fixed md:relative z-[9999] md:z-auto h-[calc(100vh-72px)] md:h-auto`}>
                {/* Logo - visible only on mobile */}
                <Link to={createPageUrl('SearchPods')} onClick={handleMobileClose} className="md:hidden p-4 border-b border-gray-100 block">
                    <img src={LOGO_URL} alt="Logo" className="h-10 w-auto" />
                </Link>
                <nav className="p-1 md:p-4 space-y-0.5 md:space-y-2">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.href}
                            onClick={handleMobileClose}
                            className={`flex items-center gap-2 md:gap-3 px-2 md:px-4 py-1.5 md:py-3 rounded-lg transition-colors text-sm ${
                                item.label === activePage
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                            }`}
                        >
                            <item.icon className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                            <span className="font-medium" style={{ fontSize: '1rem' }}>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
}