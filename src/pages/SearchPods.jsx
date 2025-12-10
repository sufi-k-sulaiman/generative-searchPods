import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { 
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music,
    Sparkles, Radio, Loader2, TrendingUp, Users, Mic, ChevronDown,
    ChevronRight, X, Clock, Plus, AlertTriangle, RotateCcw, RotateCw,
    ListMusic, Sliders, Eye, MessageSquarePlus, Heart, Shield, Zap,
    Target, Sprout, Mountain, Award, Flame, Gift, Sun, Focus,
    BookOpen, Brain, Compass, Scale, Lightbulb, Rocket, Star
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ERROR_CODES, getErrorCode } from '@/components/ErrorDisplay';
import { LOGO_URL } from '@/components/NavigationConfig';

const CATEGORIES = [
    { id: 'hope', name: 'Hope', color: '#10B981', episodes: 8, icon: Heart },
    { id: 'courage', name: 'Courage', color: '#EF4444', episodes: 10, icon: Shield },
    { id: 'confidence', name: 'Confidence', color: '#F59E0B', episodes: 9, icon: Zap },
    { id: 'success', name: 'Success', color: '#8B5CF6', episodes: 12, icon: Award },
    { id: 'growth', name: 'Growth', color: '#22C55E', episodes: 11, icon: Sprout },
    { id: 'resilience', name: 'Resilience', color: '#3B82F6', episodes: 8, icon: Mountain },
    { id: 'determination', name: 'Determination', color: '#DC2626', episodes: 9, icon: Target },
    { id: 'passion', name: 'Passion', color: '#EC4899', episodes: 7, icon: Flame },
    { id: 'gratitude', name: 'Gratitude', color: '#F97316', episodes: 10, icon: Gift },
    { id: 'optimism', name: 'Optimism', color: '#FBBF24', episodes: 8, icon: Sun },
    { id: 'focus', name: 'Focus', color: '#6366F1', episodes: 9, icon: Focus },
    { id: 'discipline', name: 'Discipline', color: '#64748B', episodes: 11, icon: BookOpen },
    { id: 'mindfulness', name: 'Mindfulness', color: '#14B8A6', episodes: 10, icon: Brain },
    { id: 'vision', name: 'Vision', color: '#A855F7', episodes: 7, icon: Eye },
    { id: 'purpose', name: 'Purpose', color: '#0EA5E9', episodes: 9, icon: Compass },
    { id: 'balance', name: 'Balance', color: '#84CC16', episodes: 8, icon: Scale },
    { id: 'clarity', name: 'Clarity', color: '#06B6D4', episodes: 7, icon: Lightbulb },
    { id: 'drive', name: 'Drive', color: '#E11D48', episodes: 10, icon: Rocket },
    { id: 'ambition', name: 'Ambition', color: '#7C3AED', episodes: 9, icon: Star },
    { id: 'persistence', name: 'Persistence', color: '#059669', episodes: 8, icon: TrendingUp },
    { id: 'momentum', name: 'Momentum', color: '#2563EB', episodes: 7, icon: Zap },
    { id: 'progress', name: 'Progress', color: '#16A34A', episodes: 11, icon: TrendingUp },
    { id: 'breakthrough', name: 'Breakthrough', color: '#D946EF', episodes: 6, icon: Sparkles },
    { id: 'achievement', name: 'Achievement', color: '#CA8A04', episodes: 10, icon: Award },
    { id: 'triumph', name: 'Triumph', color: '#B91C1C', episodes: 7, icon: Award },
    { id: 'empowerment', name: 'Empowerment', color: '#9333EA', episodes: 9, icon: Zap },
    { id: 'leadership', name: 'Leadership', color: '#1D4ED8', episodes: 12, icon: Users },
    { id: 'creativity', name: 'Creativity', color: '#DB2777', episodes: 8, icon: Sparkles },
    { id: 'innovation', name: 'Innovation', color: '#0891B2', episodes: 10, icon: Lightbulb },
    { id: 'excellence', name: 'Excellence', color: '#7E22CE', episodes: 9, icon: Star },
];

const QUICK_TOPICS = ['AI trends', 'Morning motivation', 'Sleep story', 'Health tips', 'World news', 'Book summary'];

const ALL_TRENDING = [
    { title: 'The Psychology of Happiness', category: 'Psychology', plays: 3421, image: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=400&h=400&fit=crop' },
    { title: 'The Science of Learning', category: 'Education', plays: 3156, image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=400&fit=crop' },
    { title: 'AI Revolution in Industries', category: 'Technology', plays: 2847, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop' },
    { title: 'Startup Playbook', category: 'Startups', plays: 2789, image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=400&fit=crop' },
    { title: 'Investment Basics', category: 'Finance', plays: 2567, image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop' },
    { title: 'Peak Performance', category: 'Sports', plays: 2567, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop' },
    { title: 'Mindfulness Meditation', category: 'Wellness', plays: 2234, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop' },
    { title: 'Creative Writing Tips', category: 'Arts', plays: 1987, image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop' },
    { title: 'Healthy Eating Habits', category: 'Health', plays: 2654, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop' },
    { title: 'Leadership Skills', category: 'Business', plays: 2345, image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&fit=crop' },
    { title: 'Space Exploration', category: 'Science', plays: 2890, image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=400&fit=crop' },
    { title: 'Music Theory Basics', category: 'Music', plays: 1756, image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop' },
];

const getRandomTrending = () => {
    const shuffled = [...ALL_TRENDING].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
};

// Clean text for speech synthesis
const cleanTextForSpeech = (text) => {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/#+\s*/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

// Animated equalizer bars
const AnimatedBars = ({ isPlaying = false, color = '#10B981' }) => {
    const [heights, setHeights] = useState([4, 8, 6]);
    
    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setHeights([
                4 + Math.random() * 8,
                4 + Math.random() * 8,
                4 + Math.random() * 8
            ]);
        }, 150);
        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className="flex items-end h-3 gap-0.5">
            {heights.map((h, i) => (
                <div
                    key={i}
                    className="w-0.5 rounded-full transition-all duration-150"
                    style={{ height: `${h}px`, backgroundColor: color }}
                />
            ))}
        </div>
    );
};

export default function SearchPods() {
    useEffect(() => {
        document.title = 'Search and Ai generated Audio Podcasts';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'SearchPods delivers AI generated audio podcasts, making discovery simple and productivity smarter.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'Ai Podcasts, SearchPods');
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryData, setCategoryData] = useState({});
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [loadingCategory, setLoadingCategory] = useState(null);
    
    // Player state
    const [showPlayer, setShowPlayer] = useState(false);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState('');
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationError, setGenerationError] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [currentCaption, setCurrentCaption] = useState('');
    const [captionWords, setCaptionWords] = useState([]);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [selectedVoice, setSelectedVoice] = useState('EXAVITQu4vr4xnSDxMaL');
    const [isDownloadingMp3, setIsDownloadingMp3] = useState(false);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [showEqualizer, setShowEqualizer] = useState(false);
    const [isExtending, setIsExtending] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [loadingMoreSubtopics, setLoadingMoreSubtopics] = useState(null);
    
    // Refs for audio playback
    const sentencesRef = useRef([]);
    const audioRef = useRef(null);
    const audioUrlRef = useRef(null);
    const [podImage, setPodImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [trending, setTrending] = useState(getRandomTrending);

    // Auto-refresh trending every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setTrending(getRandomTrending());
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    // ElevenLabs voice IDs
            const elevenLabsVoices = [
                { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Bella' },
                { id: '21m00Tcm4TlvDq8ikWAM', label: 'Rachel' },
                { id: 'AZnzlk1XvdvUeBnXmlld', label: 'Domi' },
                { id: 'MF3mGyEYCl7XYWbV9V6O', label: 'Elli' },
            ];

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
            }
        };
    }, []);

    // Load category episodes
    const loadCategory = async (categoryId) => {
        if (categoryData[categoryId]) {
            setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
            return;
        }
        
        setLoadingCategory(categoryId);
        setExpandedCategory(categoryId);
        
        const category = CATEGORIES.find(c => c.id === categoryId);
        const episodeCount = category?.episodes || 8;
        
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate ${episodeCount} podcast episode ideas for the "${categoryId}" category. Each should have a compelling title and brief description. Also suggest 6 subtopics for filtering.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        episodes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" }
                                }
                            }
                        },
                        subtopics: { type: "array", items: { type: "string" } }
                    }
                }
            });
            
            setCategoryData(prev => ({
                ...prev,
                [categoryId]: {
                    episodes: response?.episodes || [],
                    subtopics: response?.subtopics || [],
                    activeFilter: 'All'
                }
            }));
        } catch (error) {
            console.error('Error loading category:', error);
        } finally {
            setLoadingCategory(null);
        }
    };

    // Load more subtopics
    const loadMoreSubtopics = async (categoryId) => {
        if (!categoryData[categoryId]) return;
        
        setLoadingMoreSubtopics(categoryId);
        
        try {
            const currentSubtopics = categoryData[categoryId].subtopics || [];
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate 6 unique subtopics for the "${categoryId}" category. Make them different from these: ${currentSubtopics.join(', ')}. Return as a JSON array.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        subtopics: { type: "array", items: { type: "string" } }
                    }
                }
            });
            
            setCategoryData(prev => ({
                ...prev,
                [categoryId]: {
                    ...prev[categoryId],
                    subtopics: [...currentSubtopics, ...(response?.subtopics || [])]
                }
            }));
        } catch (error) {
            console.error('Error loading more subtopics:', error);
        } finally {
            setLoadingMoreSubtopics(null);
        }
    };

    // Play episode with ElevenLabs TTS audio
    const playEpisode = async (episode) => {
        // Stop any existing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }

        setCurrentEpisode(episode);
        setShowPlayer(true);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        setIsGenerating(true);
        setGenerationError(null);
        setGenerationStep('Researching topic...');
        setGenerationProgress(10);
        setPodImage(null);
        setImageLoading(true);
        setCurrentCaption('Generating audio...');
        setCaptionWords([]);

        // Generate image with logo watermark
        base44.integrations.Core.GenerateImage({
            prompt: `Beautiful lifestyle photography representing "${episode.title}". Authentic, natural scene with real people or calming environment. Warm lighting, editorial style, professional DSLR quality. No technology devices, no phones, no computers, no headphones, no microphones, no screens. Absolutely no text, no words, no letters, no titles, no captions, no watermarks, no logos, no URLs.`
        }).then(async result => {
            // Create canvas to add watermark
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw image
                ctx.drawImage(img, 0, 0);

                // Add semi-transparent logo watermark
                const logo = new Image();
                logo.crossOrigin = 'anonymous';
                logo.onload = () => {
                    ctx.globalAlpha = 0.15;
                    const logoSize = Math.min(canvas.width, canvas.height) * 0.3;
                    const x = (canvas.width - logoSize) / 2;
                    const y = (canvas.height - logoSize) / 2;
                    ctx.drawImage(logo, x, y, logoSize, logoSize);

                    setPodImage(canvas.toDataURL('image/jpeg', 0.9));
                    setImageLoading(false);
                };
                logo.onerror = () => {
                    setPodImage(result.url);
                    setImageLoading(false);
                };
                logo.src = LOGO_URL;
            };
            img.onerror = () => {
                setPodImage(result.url);
                setImageLoading(false);
            };
            img.src = result.url;
        }).catch(err => {
            console.error('Image generation error:', err);
            setImageLoading(false);
        });

        try {
            // Simulate progressive loading
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => {
                    if (prev < 20) return prev + 2;
                    if (prev < 40) return prev + 1;
                    return prev;
                });
            }, 200);

            setGenerationStep('Writing script...');
            setGenerationProgress(10);

            // Generate longer script using LLM for 8 minute podcast
            let rawText;
            try {
                const scriptResponse = await base44.integrations.Core.InvokeLLM({
                    prompt: `Write a detailed, engaging 8-minute podcast script about "${episode.title}". 

            Include:
            - A warm welcome and introduction
            - Deep exploration of the topic with multiple key points
            - Real examples, stories, or case studies
            - Practical tips or actionable insights
            - Interesting facts or statistics
            - Different perspectives on the topic
            - A thoughtful conclusion with takeaways

            Write in a conversational, friendly tone as if speaking directly to one listener. 
            Do NOT use markdown, bullet points, or special formatting - just natural flowing paragraphs.
            Aim for about 1200-1500 words to fill 8 minutes of audio.`,
                    add_context_from_internet: true
                });
                rawText = scriptResponse || `Welcome to this episode about ${episode.title}. Today we explore this fascinating topic together.`;
            } catch (llmError) {
                console.log('LLM fallback:', llmError);
                rawText = `Welcome to this episode about ${episode.title}. 

            Today we're going to explore this fascinating topic together. Let me share some key insights with you.

            First, it's important to understand the fundamentals. This topic has been gaining attention for good reasons and there are several aspects worth considering.

            The implications are quite significant when you think about it. Many experts have shared their perspectives on this subject.

            What makes this particularly interesting is how it connects to our daily lives. Understanding these concepts can help us make better decisions.

            As we wrap up, remember that learning is a continuous journey. Thank you for listening, and I hope you found this helpful. Until next time!`;
            }
            
            clearInterval(progressInterval);
            setGenerationStep('Generating audio...');
            setGenerationProgress(45);
            const cleanText = cleanTextForSpeech(rawText);

            // Split into sentences for captions
            const sentences = cleanText
                .replace(/\n+/g, ' ')
                .split(/(?<=[.!?])\s+/)
                .map(s => s.trim())
                .filter(s => s.length > 3);

            if (sentences.length === 0) {
                sentences.push(`Welcome to ${episode.title}. This is an exciting topic to explore.`);
            }

            sentencesRef.current = sentences;

            // Generate audio using ElevenLabs TTS
            let ttsResponse;
            try {
                ttsResponse = await base44.functions.invoke('ttsWithFallback', {
                    text: cleanText,
                    lang: 'en-gb'
                });
                console.log('TTS response received:', ttsResponse?.data ? 'has data' : 'no data', ttsResponse?.data?.error || 'no error');
            } catch (ttsError) {
                console.error('TTS function error:', ttsError);
                throw new Error(ttsError?.response?.data?.error || ttsError?.message || 'Audio generation failed');
            }

            setGenerationProgress(70);

            // Check if we need to use Web Speech API fallback
            if (ttsResponse?.data?.useWebSpeech) {
                console.log('Using Web Speech API fallback');
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.lang = 'en-GB';
                utterance.rate = 1;
                
                let wordIndex = 0;
                utterance.onboundary = (event) => {
                    if (event.name === 'word') {
                        const words = cleanText.split(/\s+/);
                        wordIndex = Math.min(wordIndex + 1, words.length - 1);
                        const currentSentenceIdx = Math.floor((wordIndex / words.length) * sentences.length);
                        setCurrentCaption(sentences[currentSentenceIdx] || '');
                        setCaptionWords((sentences[currentSentenceIdx] || '').split(/\s+/));
                    }
                };
                
                utterance.onend = () => setIsPlaying(false);
                
                setGenerationProgress(100);
                setIsGenerating(false);
                setCurrentCaption(sentences[0] || 'Ready to play');
                setCaptionWords((sentences[0] || '').split(/\s+/));
                setDuration(cleanText.length / 15);
                
                audioRef.current = {
                    play: () => { speechSynthesis.speak(utterance); setIsPlaying(true); },
                    pause: () => { speechSynthesis.pause(); setIsPlaying(false); },
                    resume: () => { speechSynthesis.resume(); setIsPlaying(true); },
                    currentTime: 0,
                    duration: cleanText.length / 15,
                    volume: 1,
                    playbackRate: 1,
                    isWebSpeech: true
                };
                
                speechSynthesis.speak(utterance);
                setIsPlaying(true);
                return;
            }
            
            if (!ttsResponse?.data?.audio) {
                console.error('TTS response missing audio:', JSON.stringify(ttsResponse?.data || {}));
                throw new Error(ttsResponse?.data?.error || 'No audio data received from TTS service');
            }
            
            console.log('Audio received, length:', ttsResponse.data.audio.length);

            setGenerationProgress(85);

            // Convert base64 to audio blob
            const binaryString = atob(ttsResponse.data.audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(blob);
            audioUrlRef.current = audioUrl;

            // Create audio element
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            // Set up audio events
            audio.onloadedmetadata = () => {
                setDuration(audio.duration);
                // Preload recommendations once audio is loaded
                loadRecommendations();
            };

            audio.ontimeupdate = () => {
                setCurrentTime(audio.currentTime);
                // Update caption based on time
                if (sentences.length > 0 && audio.duration > 0) {
                    const progress = audio.currentTime / audio.duration;
                    const sentenceIndex = Math.min(
                        Math.floor(progress * sentences.length),
                        sentences.length - 1
                    );
                    setCurrentCaption(sentences[sentenceIndex]);
                    setCaptionWords(sentences[sentenceIndex].split(/\s+/));
                }
            };

            audio.onended = () => {
                setIsPlaying(false);
                setCurrentTime(audio.duration);
            };

            audio.onerror = (e) => {
                console.error('Audio error:', e);
                setGenerationError({ code: 'E300', title: 'Audio Error', message: 'Failed to play audio' });
            };

            setGenerationProgress(100);
            setIsGenerating(false);
            setCurrentCaption(sentences[0] || 'Ready to play');
            setCaptionWords((sentences[0] || '').split(/\s+/));

            // Auto-start playback
            audio.play().then(() => {
                setIsPlaying(true);
            }).catch(err => {
                console.log('Autoplay blocked, user can click play');
            });

        } catch (error) {
            clearInterval(progressInterval);
            console.error('Generation error:', error);
            setGenerationError({ 
                code: 'E300', 
                title: 'Generation Failed', 
                message: error.message || 'Could not generate audio. Please try again.' 
            });
            setIsGenerating(false);
        }
    };

    // Toggle play/pause
    const togglePlay = useCallback(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(err => {
                console.error('Play error:', err);
            });
        }
    }, [isPlaying]);

    // Stop playback
    const stopPlayback = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
    }, []);

    // Download Text Script
    const downloadText = () => {
        try {
            const fullScript = sentencesRef.current.join(' ');
            const blob = new Blob([fullScript], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentEpisode.title.replace(/[^a-z0-9]/gi, '_')}_script.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
        }
    };

    // Download the current MP3
    const downloadMp3 = () => {
        if (!audioUrlRef.current || !currentEpisode) return;

        const a = document.createElement('a');
        a.href = audioUrlRef.current;
        a.download = `${currentEpisode.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Close player
    const closePlayer = useCallback(() => {
        stopPlayback();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }
        setShowPlayer(false);
        setCurrentEpisode(null);
    }, [stopPlayback]);

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Update URL for display only (aesthetic)
            const topicSlug = searchQuery.trim().replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            window.history.pushState({}, '', `${window.location.pathname}/${topicSlug}`);
            playEpisode({ title: searchQuery, category: 'Search' });
        }
    };

    // Skip forward/backward
    const skipForward = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 30, duration);
    };

    const skipBackward = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
    };

    // Load recommendations based on current episode
    const loadRecommendations = async () => {
        if (!currentEpisode || recommendations.length > 0) return;

        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Based on someone listening to "${currentEpisode.title}" in the ${currentEpisode.category} category, suggest 5 related podcast topics they might enjoy. Make them diverse but related.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    category: { type: "string" },
                                    reason: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            setRecommendations(response?.recommendations || []);
        } catch (error) {
            console.error('Error loading recommendations:', error);
            setRecommendations([
                { title: `More ${currentEpisode.category}`, category: currentEpisode.category, reason: 'Similar topic' },
                { title: 'Trending Now', category: 'Popular', reason: 'What others are listening to' }
            ]);
        }
    };

    const [extendedCount, setExtendedCount] = useState(0);
    const [isSwappingVoice, setIsSwappingVoice] = useState(false);
    const [swappingToVoice, setSwappingToVoice] = useState(null);
    const currentSentenceIndexRef = useRef(0);

    // Swap voice on the fly
    const swapVoice = async (newVoice) => {
        if (newVoice === selectedVoice || isSwappingVoice) return;
        
        // Remember current position
        const wasPlaying = isPlaying;
        const currentSentenceIdx = sentencesRef.current.findIndex(s => s === currentCaption);
        currentSentenceIndexRef.current = Math.max(0, currentSentenceIdx);
        
        setIsSwappingVoice(true);
        setSwappingToVoice(newVoice);
        
        // Pause current audio
        if (audioRef.current) {
            audioRef.current.pause();
        }
        
        try {
            // Get remaining text from current sentence onwards
            const remainingSentences = sentencesRef.current.slice(currentSentenceIndexRef.current);
            const remainingText = remainingSentences.join(' ');
            
            // Generate new audio with new voice using ElevenLabs
            const ttsResponse = await base44.functions.invoke('ttsWithFallback', {
                text: remainingText,
                lang: 'en-gb'
            });
            
            if (ttsResponse.data?.audio) {
                // Clean up old audio
                if (audioUrlRef.current) {
                    URL.revokeObjectURL(audioUrlRef.current);
                }
                
                // Create new audio
                const binaryString = atob(ttsResponse.data.audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'audio/mpeg' });
                const audioUrl = URL.createObjectURL(blob);
                audioUrlRef.current = audioUrl;
                
                const audio = new Audio(audioUrl);
                audioRef.current = audio;
                
                audio.onloadedmetadata = () => {
                    setDuration(audio.duration);
                };
                
                audio.ontimeupdate = () => {
                    setCurrentTime(audio.currentTime);
                    if (remainingSentences.length > 0 && audio.duration > 0) {
                        const progress = audio.currentTime / audio.duration;
                        const sentenceIndex = Math.min(
                            Math.floor(progress * remainingSentences.length),
                            remainingSentences.length - 1
                        );
                        setCurrentCaption(remainingSentences[sentenceIndex]);
                        setCaptionWords(remainingSentences[sentenceIndex].split(/\s+/));
                    }
                };
                
                audio.onended = () => {
                    setIsPlaying(false);
                };
                
                audio.volume = volume / 100;
                audio.playbackRate = playbackSpeed;
                
                setSelectedVoice(newVoice);
                setCurrentTime(0);
                
                if (wasPlaying) {
                    audio.play().then(() => {
                        setIsPlaying(true);
                    }).catch(err => {
                        console.log('Autoplay blocked');
                    });
                }
            }
        } catch (error) {
            console.error('Error swapping voice:', error);
        } finally {
            setIsSwappingVoice(false);
            setSwappingToVoice(null);
        }
    };

    // Extend the podcast content
    const extendPodcast = async () => {
        if (!currentEpisode || isExtending) return;
        setIsExtending(true);

        try {
            const currentContent = sentencesRef.current.join(' ');

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Continue this podcast about "${currentEpisode.title}". Here's what was covered so far (summary): "${currentContent.substring(0, 500)}..."

    Write 10 more paragraphs (about 4 minutes worth) expanding on the topic with new insights, examples, stories, or related points. Keep the same conversational tone. Do NOT use markdown formatting.`,
                add_context_from_internet: true
            });

            const cleanText = cleanTextForSpeech(response || '');

            // Generate new audio for extended content using ElevenLabs
            const ttsResponse = await base44.functions.invoke('ttsWithFallback', {
                text: cleanText,
                lang: 'en-gb'
            });

            if (ttsResponse.data?.audio) {
                // Add new sentences to the ref
                const newSentences = cleanText
                    .replace(/\n+/g, ' ')
                    .split(/(?<=[.!?])\s+/)
                    .map(s => s.trim())
                    .filter(s => s.length > 3);

                // Append to existing sentences
                sentencesRef.current = [...sentencesRef.current, ...newSentences];

                // Get current audio blob if exists
                let existingBlob = null;
                if (audioUrlRef.current) {
                    try {
                        const existingResponse = await fetch(audioUrlRef.current);
                        existingBlob = await existingResponse.blob();
                    } catch (e) {
                        console.log('Could not fetch existing audio');
                    }
                }

                // Create new audio blob from extended content
                const binaryString = atob(ttsResponse.data.audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const newBlob = new Blob([bytes], { type: 'audio/mpeg' });

                // Combine blobs if we have existing audio
                let combinedBlob;
                if (existingBlob) {
                    combinedBlob = new Blob([existingBlob, newBlob], { type: 'audio/mpeg' });
                } else {
                    combinedBlob = newBlob;
                }

                // Stop current audio
                if (audioRef.current) {
                    audioRef.current.pause();
                }
                if (audioUrlRef.current) {
                    URL.revokeObjectURL(audioUrlRef.current);
                }

                const audioUrl = URL.createObjectURL(combinedBlob);
                audioUrlRef.current = audioUrl;

                const audio = new Audio(audioUrl);
                audioRef.current = audio;

                const allSentences = sentencesRef.current;

                audio.onloadedmetadata = () => {
                    setDuration(audio.duration);
                };

                audio.ontimeupdate = () => {
                    setCurrentTime(audio.currentTime);
                    if (allSentences.length > 0 && audio.duration > 0) {
                        const progress = audio.currentTime / audio.duration;
                        const sentenceIndex = Math.min(
                            Math.floor(progress * allSentences.length),
                            allSentences.length - 1
                        );
                        setCurrentCaption(allSentences[sentenceIndex]);
                        setCaptionWords(allSentences[sentenceIndex].split(/\s+/));
                    }
                };

                audio.onended = () => {
                    setIsPlaying(false);
                };

                audio.volume = volume / 100;
                audio.playbackRate = playbackSpeed;
                
                setExtendedCount(prev => prev + 1);
                
                // Resume from where we left off or continue
                audio.play().then(() => {
                    setIsPlaying(true);
                }).catch(err => {
                    console.log('Autoplay blocked');
                });
            }
        } catch (error) {
            console.error('Error extending podcast:', error);
        } finally {
            setIsExtending(false);
        }
    };

    // Convert text to Braille
    const toBraille = (text) => {
        const brailleMap = {
            'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓',
            'i': '⠊', 'j': '⠚', 'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏',
            'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭',
            'y': '⠽', 'z': '⠵', ' ': ' ', '.': '⠲', ',': '⠂', '!': '⠖', '?': '⠦', "'": '⠄',
            '-': '⠤', '0': '⠴', '1': '⠂', '2': '⠆', '3': '⠒', '4': '⠲', '5': '⠢', '6': '⠖',
            '7': '⠶', '8': '⠦', '9': '⠔'
        };
        return text.toLowerCase().split('').map(c => brailleMap[c] || c).join('');
    };

    return (
        <div className="min-h-screen bg-white pb-8">
            {/* Logo Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-center gap-3">
                    <img src={LOGO_URL} alt="SearchPods" className="h-7 object-contain" />
                    <span className="text-2xl font-bold text-gray-900">SearchPods</span>
                </div>
            </div>
            <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 space-y-8">

                {/* Search & Generate */}
                <div className="space-y-4">
                    <form onSubmit={handleSearch} className="relative">
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search or generate podcasts on any topic..."
                            className="w-full h-14 pl-6 pr-32 rounded-full border-gray-200 bg-white shadow-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-100 text-lg"
                        />
                        <button
                            type="submit"
                            disabled={!searchQuery.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 h-10 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white font-medium transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            Generate
                        </button>
                    </form>
                    
                    {/* Quick topic suggestions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-400 text-sm">Try:</span>
                        {QUICK_TOPICS.map((topic) => (
                            <button
                                key={topic}
                                onClick={() => {
                                    setSearchQuery(topic);
                                    playEpisode({ title: topic, category: 'Quick' });
                                }}
                                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-600 text-sm transition-all"
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CATEGORIES.map((cat) => (
                        <div key={cat.id} className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                            {/* Category Header */}
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                                onClick={() => loadCategory(cat.id)}
                                style={{ borderLeft: `4px solid ${cat.color}` }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${cat.color}20` }}
                                    >
                                        <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-900 font-bold">{cat.name}</h3>
                                        <p className="text-gray-500 text-sm">{cat.episodes} episodes</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 hover:text-purple-600">
                                    {loadingCategory === cat.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-sm">View All</span>
                                            <ChevronRight className={`w-4 h-4 transition-transform ${expandedCategory === cat.id ? 'rotate-90' : ''}`} />
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedCategory === cat.id && categoryData[cat.id] && (
                                <div className="p-4 pt-0 space-y-3">
                                    {/* Subtopic Filters */}
                                    {categoryData[cat.id].subtopics?.length > 0 && (
                                       <div className="flex flex-wrap gap-2 py-2">
                                           <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-600">All</span>
                                           {categoryData[cat.id].subtopics.map((sub, i) => (
                                               <button
                                                   key={i}
                                                   onClick={(e) => { e.stopPropagation(); playEpisode({ title: sub, category: cat.name }); }}
                                                   className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600 transition-all"
                                               >
                                                   {sub}
                                               </button>
                                           ))}
                                           <button 
                                               onClick={(e) => { e.stopPropagation(); loadMoreSubtopics(cat.id); }}
                                               disabled={loadingMoreSubtopics === cat.id}
                                               className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:text-gray-900 disabled:opacity-50 flex items-center gap-1"
                                           >
                                               {loadingMoreSubtopics === cat.id ? (
                                                   <Loader2 className="w-3 h-3 animate-spin" />
                                               ) : (
                                                   <Plus className="w-3 h-3" />
                                               )} More
                                           </button>
                                       </div>
                                    )}

                                    {/* Episodes */}
                                    {categoryData[cat.id].episodes?.map((ep, i) => (
                                        <div
                                            key={i}
                                            onClick={() => playEpisode({ ...ep, category: cat.name })}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-purple-50 cursor-pointer group transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                                <Radio className="w-4 h-4 text-gray-400 group-hover:hidden" />
                                                <Play className="w-4 h-4 text-purple-600 hidden group-hover:block" fill="currentColor" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-gray-900 text-sm font-medium truncate">{ep.title}</h4>
                                                {ep.description && (
                                                    <p className="text-gray-500 text-xs truncate">{ep.description}</p>
                                                )}
                                            </div>
                                            <span className="text-gray-400 text-xs flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> 2m
                                            </span>
                                        </div>
                                    ))}

                                    {/* Generate More */}
                                    <button
                                        onClick={() => playEpisode({ title: `Latest in ${cat.name}`, category: cat.name })}
                                        className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-purple-300 hover:text-purple-600 flex items-center justify-center gap-2 text-sm transition-all"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Generate New Episode
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Trending Section */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <span className="text-gray-900 font-bold text-2xl md:text-3xl">Trending Now</span>
                            <p className="text-xs text-gray-500">Most popular podcasts</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trending.map((item, i) => (
                            <div
                                key={i}
                                onClick={() => playEpisode(item)}
                                className="relative flex items-center gap-3 p-4 rounded-xl cursor-pointer bg-white hover:bg-purple-50 border border-gray-100 hover:border-purple-200 group transition-all shadow-sm"
                            >
                                <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {i + 1}
                                </div>
                                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Play className="w-4 h-4 text-white" fill="white" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-gray-900 text-sm font-medium truncate">{item.title}</h4>
                                    <p className="text-gray-500 text-xs capitalize">{item.category}</p>
                                    <div className="flex items-center gap-2 mt-1 text-purple-600 text-xs">
                                        <Users className="w-3 h-3" />
                                        {item.plays.toLocaleString()} plays
                                    </div>
                                </div>
                                <AnimatedBars isPlaying={true} color="#7c3aed" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Player Modal */}
            <Dialog open={showPlayer} onOpenChange={closePlayer}>
                <DialogContent className="max-w-full md:max-w-lg p-0 bg-white border-gray-200 h-screen md:h-auto md:max-h-[90vh] overflow-y-auto [&>button]:hidden w-full md:w-auto rounded-none md:rounded-lg safe-area-inset" aria-describedby={undefined}>
                    <DialogTitle className="sr-only">Now Playing</DialogTitle>
                    <div className="p-4 md:p-6 pb-safe min-h-screen md:min-h-0 flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <span className="text-gray-500 text-xs md:text-sm uppercase tracking-wider">Now Playing</span>
                            <button onClick={closePlayer} className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 flex items-center justify-center transition-all touch-manipulation">
                                <X className="w-6 h-6 md:w-5 md:h-5 text-white" />
                            </button>
                        </div>

                        {/* Album Art */}
                        <div className="flex justify-center mb-4 md:mb-6 flex-shrink-0">
                            <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-56 md:h-56 rounded-3xl md:rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 overflow-hidden">
                                {/* Extended ribbon */}
                                {extendedCount > 0 && (
                                    <div className="absolute top-3 -right-8 bg-green-500 text-white text-xs font-bold px-8 py-1 rotate-45 z-20 shadow-md">
                                        +{extendedCount} Extended
                                    </div>
                                )}
                                {/* Generated Image Background */}
                                {podImage && (
                                    <img 
                                        src={podImage} 
                                        alt="Podcast cover" 
                                        className={`absolute inset-0 w-full h-full object-cover rounded-2xl transition-all duration-300 ${isExtending ? 'animate-pulse scale-105' : ''}`}
                                    />
                                )}
                                
                                {/* Image Loading Overlay */}
                                {imageLoading && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/90 to-indigo-600/90 flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="w-8 h-8 text-white/80 animate-spin" />
                                        <span className="text-white/70 text-xs">Creating artwork...</span>
                                    </div>
                                )}
                                
                                {generationError ? (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 p-4">
                                        <AlertTriangle className="w-12 h-12 text-white/80" />
                                        <span className="text-white/80 text-xs text-center">{generationError.title}</span>
                                        <Button size="sm" variant="ghost" className="text-white/80 hover:text-white" onClick={() => { setGenerationError(null); playEpisode(currentEpisode); }}>
                                            Retry
                                        </Button>
                                    </div>
                                ) : isGenerating && !imageLoading ? (
                                    <div className={`${podImage ? 'absolute inset-0 bg-black/50' : ''} flex flex-col items-center justify-center gap-3 px-6`}>
                                        <Loader2 className="w-10 h-10 text-white/80 animate-spin" />
                                        <span className="text-white/80 text-sm">{generationStep}</span>
                                        <div className="w-full max-w-[180px]">
                                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-white/80 rounded-full transition-all duration-500"
                                                    style={{ width: `${generationProgress}%` }}
                                                />
                                            </div>
                                            <span className="text-white/60 text-xs mt-1 block text-center">{generationProgress}%</span>
                                        </div>
                                    </div>
                                ) : !isGenerating && !imageLoading ? (
                                    <>
                                        {!podImage && <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />}
                                        {!podImage && <Radio className="w-16 h-16 text-white/80" />}
                                        {isPlaying && (
                                            <div className={`${podImage ? 'absolute inset-0 bg-black/30 flex items-center justify-center' : 'absolute inset-0 flex items-center justify-center'}`}>
                                                <div className="scale-[2.6]">
                                                    <AnimatedBars isPlaying={true} color="#ffffff" />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-3 md:mb-4 px-2 flex-shrink-0">
                            <h2 className="text-gray-900 text-2xl md:text-xl font-bold mb-2 line-clamp-2">{currentEpisode?.title}</h2>
                            <p className="text-purple-600 text-lg md:text-sm font-medium">{currentEpisode?.category}</p>
                        </div>

                        {/* Captions - fixed height for 3 lines */}
                        {!isGenerating && (
                            <div className="mb-4 md:mb-6">
                                <div className="bg-gray-50 rounded-xl p-3 md:p-4 min-h-[84px] md:h-[84px] border border-gray-200 flex items-center justify-center overflow-hidden">
                                    <p className="text-center leading-relaxed text-sm md:text-base text-gray-700 line-clamp-3">
                                        {captionWords.map((word, i) => {
                                            // Calculate word highlight based on time within current sentence
                                            const sentenceIndex = Math.max(0, sentencesRef.current.findIndex(s => s === currentCaption));
                                            const sentenceCount = sentencesRef.current.length || 1;

                                            // Each sentence gets equal time slice
                                            const timePerSentence = duration / sentenceCount;
                                            const sentenceStartTime = sentenceIndex * timePerSentence;
                                            const timeIntoSentence = currentTime - sentenceStartTime;
                                            const sentenceProgress = Math.max(0, Math.min(1, timeIntoSentence / timePerSentence));

                                            // Highlight word based on progress through sentence
                                            const wordCount = captionWords.length || 1;
                                            const highlightIndex = Math.floor(sentenceProgress * wordCount);
                                            const isHighlighted = i === highlightIndex || i === highlightIndex - 1;

                                            return (
                                                <span key={i} className={isHighlighted ? 'text-purple-600 font-semibold' : ''}>
                                                    {word}{' '}
                                                </span>
                                            );
                                        })}
                                    </p>
                                </div>
                                {/* Tell me more button */}
                                <button
                                    onClick={extendPodcast}
                                    disabled={isExtending || isGenerating}
                                    className="mt-2 w-full flex items-center justify-center gap-2 py-3 md:py-2 px-4 rounded-xl md:rounded-lg bg-purple-50 hover:bg-purple-100 active:scale-98 text-purple-600 text-base md:text-sm font-medium transition-all disabled:opacity-50 touch-manipulation"
                                >
                                    {isExtending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Extending podcast...
                                        </>
                                    ) : (
                                        <>
                                            <MessageSquarePlus className="w-4 h-4" />
                                            Tell me more
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Progress - clickable timeline */}
                        <div className="mb-4 md:mb-6">
                            <div 
                                className="relative h-3 md:h-2 bg-gray-200 rounded-full cursor-pointer group touch-manipulation"
                                onClick={(e) => {
                                    if (!audioRef.current || !duration) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const percent = (e.clientX - rect.left) / rect.width;
                                    audioRef.current.currentTime = percent * duration;
                                }}
                            >
                                <div 
                                    className="absolute h-full bg-purple-600 rounded-full transition-all"
                                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                                />
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 md:w-3 md:h-3 bg-purple-600 rounded-full opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity shadow-md"
                                    style={{ left: `calc(${(currentTime / (duration || 1)) * 100}% - ${window.innerWidth < 768 ? 8 : 6}px)` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-8 sm:gap-10 md:gap-6 py-4 md:py-2 flex-shrink-0">
                            <button 
                                onClick={skipBackward}
                                disabled={isGenerating}
                                className="text-gray-400 hover:text-gray-600 active:scale-95 p-3 md:p-2 flex flex-col items-center disabled:opacity-50 transition-transform touch-manipulation"
                            >
                                <RotateCcw className="w-8 h-8 md:w-6 md:h-6" />
                                <span className="text-sm md:text-xs mt-1 font-medium">15s</span>
                            </button>
                            <button
                                onClick={togglePlay}
                                disabled={isGenerating}
                                className="w-24 h-24 sm:w-28 sm:h-28 md:w-16 md:h-16 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 flex items-center justify-center text-white disabled:opacity-50 transition-all shadow-xl shadow-purple-500/40 touch-manipulation"
                            >
                                {isPlaying ? (
                                    <Pause className="w-10 h-10 sm:w-12 sm:h-12 md:w-7 md:h-7" />
                                ) : (
                                    <Play className="w-10 h-10 sm:w-12 sm:h-12 md:w-7 md:h-7 ml-1" fill="currentColor" />
                                )}
                            </button>

                            <button 
                                onClick={skipForward}
                                disabled={isGenerating}
                                className="text-gray-400 hover:text-gray-600 active:scale-95 p-3 md:p-2 flex flex-col items-center disabled:opacity-50 transition-transform touch-manipulation"
                            >
                                <RotateCw className="w-8 h-8 md:w-6 md:h-6" />
                                <span className="text-sm md:text-xs mt-1 font-medium">30s</span>
                            </button>
                        </div>

                        {/* Speed & Volume */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center md:justify-between mt-4 md:mt-6 gap-3 md:gap-4">
                        <div className="flex items-center gap-2 md:gap-2 justify-center md:justify-start">
                            <button onClick={() => setIsMuted(!isMuted)} className="text-gray-500 hover:text-gray-700 active:scale-95 transition-transform p-2 touch-manipulation">
                                {isMuted ? <VolumeX className="w-5 h-5 md:w-4 md:h-4" /> : <Volume2 className="w-5 h-5 md:w-4 md:h-4" />}
                            </button>
                            <Slider
                                value={[isMuted ? 0 : volume]}
                                max={100}
                                onValueChange={([v]) => { 
                                    setVolume(v); 
                                    setIsMuted(v === 0);
                                    if (audioRef.current) {
                                        audioRef.current.volume = v / 100;
                                    }
                                }}
                                className="w-24 md:w-20"
                            />
                            <span className="text-xs text-gray-400 w-10 md:w-8">{volume}%</span>
                        </div>
                        <div className="flex gap-2 md:gap-1 justify-center">
                            {[0.75, 1, 1.25, 1.5].map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => {
                                        setPlaybackSpeed(speed);
                                        if (audioRef.current) {
                                            audioRef.current.playbackRate = speed;
                                        }
                                    }}
                                    className={`px-3 py-2 md:px-2 md:py-1 rounded-lg md:rounded text-sm md:text-xs transition-all active:scale-95 touch-manipulation ${
                                        playbackSpeed === speed
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-500 hover:bg-gray-100 bg-gray-50'
                                    }`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                        </div>

                        {/* Voice Selection - ElevenLabs Voices */}
                        <div className="mt-3 md:mt-4 flex items-center justify-center gap-2 flex-wrap">
                        {elevenLabsVoices.map((voice) => (
                            <button
                                key={voice.id}
                                onClick={() => swapVoice(voice.id)}
                                disabled={isSwappingVoice}
                                className={`px-4 py-2.5 md:px-3 md:py-1.5 rounded-full text-base md:text-sm font-medium transition-all active:scale-95 touch-manipulation ${
                                    selectedVoice === voice.id 
                                        ? 'bg-purple-600 text-white shadow-md' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                                } disabled:opacity-50`}
                            >
                                {isSwappingVoice && selectedVoice !== voice.id && swappingToVoice === voice.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin inline" />
                                ) : voice.label}
                            </button>
                        ))}
                        </div>

                        {/* Recommendations Button - More Prominent */}
                        <div className="mt-3 md:mt-4 pb-2">
                            <button 
                                onClick={loadRecommendations}
                                disabled={isGenerating}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium transition-all active:scale-[0.98] touch-manipulation shadow-sm ${
                                    showRecommendations 
                                        ? 'bg-purple-600 text-white border border-purple-700' 
                                        : 'bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 text-purple-700'
                                } disabled:opacity-50`}
                            >
                                <ListMusic className="w-5 h-5" />
                                <span>Recommended</span>
                            </button>

                            {/* Recommendations List - Below Button */}
                            {showRecommendations && (
                                <div className="mt-3 max-h-96 overflow-y-auto overscroll-contain">
                                    {recommendations.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 text-purple-600 animate-spin mb-2" />
                                            <p className="text-sm text-gray-500">Finding perfect matches...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recommendations.map((rec, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setShowRecommendations(false);
                                                        playEpisode({ title: rec.title, category: rec.category });
                                                    }}
                                                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-white hover:bg-purple-50 active:bg-purple-100 border border-gray-200 hover:border-purple-300 transition-all text-left shadow-sm hover:shadow-md touch-manipulation"
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                                        <Radio className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 mb-1">{rec.title}</p>
                                                        <p className="text-xs text-gray-500">{rec.reason || rec.category}</p>
                                                    </div>
                                                    <Play className="w-5 h-5 text-purple-600 flex-shrink-0" fill="currentColor" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>


                </DialogContent>
            </Dialog>
        </div>
    );
}