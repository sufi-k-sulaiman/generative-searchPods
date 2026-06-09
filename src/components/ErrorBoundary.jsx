import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '@/utils';

// Error code mapping for common React errors
const getErrorDetails = (error) => {
    const message = error?.message?.toLowerCase() || '';
    
    if (message.includes('chunk') || message.includes('loading')) {
        return { code: 'E103', title: 'Loading Error', description: 'Failed to load page resources. This may be due to a network issue.' };
    }
    if (message.includes('undefined') || message.includes('null')) {
        return { code: 'E203', title: 'Data Error', description: 'Some data failed to load properly.' };
    }
    if (message.includes('network') || message.includes('fetch')) {
        return { code: 'E100', title: 'Network Error', description: 'Unable to connect. Please check your connection.' };
    }
    if (message.includes('timeout')) {
        return { code: 'E101', title: 'Timeout', description: 'The request took too long.' };
    }
    
    return { code: 'E500', title: 'Unexpected Error', description: 'Something went wrong while loading this page.' };
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ errorInfo });
        
        // Could send to error tracking service here
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = createPageUrl('Home');
    };

    render() {
        if (this.state.hasError) {
            const errorDetails = getErrorDetails(this.state.error);
            
            return (
                <div className="min-h-[400px] flex items-center justify-center p-8 bg-gray-50">
                    <div className="text-center max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{errorDetails.title}</h2>
                        <p className="text-gray-600 mb-2">
                            {this.props.fallbackMessage || errorDetails.description}
                        </p>
                        <p className="text-xs text-gray-400 mb-6">
                            Error Code: {errorDetails.code}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button 
                                onClick={this.handleRetry}
                                className="gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={this.handleGoHome}
                                className="gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Go Home
                            </Button>
                        </div>
                        {typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="text-xs text-gray-500 cursor-pointer flex items-center gap-1">
                                    <Bug className="w-3 h-3" /> Technical Details
                                </summary>
                                <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-gray-700 overflow-auto max-h-32">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;