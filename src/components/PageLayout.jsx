import React, { useState, useEffect } from 'react';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Sidebar from './layout/Sidebar';
import { Toaster } from 'sonner';

export default function PageLayout({ children, activePage }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
        }
    }, [sidebarOpen]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster position="bottom-right" />
{/* Header hidden */}
            
            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    isOpen={sidebarOpen} 
                    activePage={activePage} 
                    onClose={() => setSidebarOpen(false)} 
                />
                
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
            
            <Footer />
        </div>
    );
}