import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LOGO_URL, footerLinks } from '../NavigationConfig';

export default function Footer() {
    return (
        <footer className="py-6 bg-white border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <Link to={createPageUrl('SearchPods')}>
                        <img src={LOGO_URL} alt="1cPublishing" className="h-8 w-8 object-contain grayscale hover:grayscale-0 transition-all" />
                    </Link>
                    <nav className="flex flex-wrap justify-center gap-6 text-sm">
                        {footerLinks.map((link, i) => (
                            <a key={i} href={link.href} className="text-gray-600 hover:text-purple-600 transition-colors">{link.label}</a>
                        ))}
                    </nav>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                    <p>Copyright © 2026 <a href="https://1cplatform.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 transition-colors">1cPlatform</a>. Developed by <a href="https://sufikhan.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 transition-colors">Sufi K Sulaiman</a>. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}