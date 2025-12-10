
import { Globe, Sparkles, BarChart3, Gamepad2, Settings, Radio, Brain, FileText, GraduationCap, ListTodo, StickyNote, Lightbulb, ScrollText, Newspaper, Shield } from 'lucide-react';
import { createPageUrl } from '@/utils';

export const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6938e9ce922baf806316c3f8/1790f1d81_searchpods.png';

export const menuItems = [
    { label: 'SearchPods', icon: Radio, href: createPageUrl('SearchPods') },
    { label: 'Qwirey', icon: Sparkles, href: createPageUrl('Qwirey') },
    { label: 'MindMap', icon: Brain, href: createPageUrl('MindMap') },
    { label: 'Markets', icon: BarChart3, href: createPageUrl('Markets') },
    { label: 'News', icon: Newspaper, href: createPageUrl('News') },
    { label: 'Learning', icon: GraduationCap, href: createPageUrl('Learning') },
    { label: 'Geospatial', icon: Globe, href: createPageUrl('Geospatial') },
    { label: 'Intelligence', icon: Lightbulb, href: createPageUrl('Intelligence') },
    { label: 'Games', icon: Gamepad2, href: createPageUrl('Games') },
    { label: 'Tasks', icon: ListTodo, href: createPageUrl('Tasks') },
    { label: 'Notes', icon: StickyNote, href: createPageUrl('Notes') },
    { label: 'ResumePro', icon: FileText, href: createPageUrl('ResumeBuilder') },
    { label: 'Settings', icon: Settings, href: createPageUrl('Settings') },
    { label: 'Terms of Use', icon: ScrollText, href: createPageUrl('TermsOfUse') },
    { label: 'Privacy', icon: Shield, href: createPageUrl('Privacy') },
];

export const NAVIGATION_ITEMS = menuItems.map(item => ({
    name: item.label,
    page: item.label,
}));

export const footerLinks = [
    { label: 'Terms of Use', href: '/TermsOfUse' },
    { label: 'Contact Us', href: '/ContactUs' },
];
