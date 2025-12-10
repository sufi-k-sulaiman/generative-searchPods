import React, { useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LOGO_URL } from '@/components/NavigationConfig';

export default function Layout({ children, currentPageName }) {
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = LOGO_URL;
    
    // Also set apple-touch-icon
    let appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.getElementsByTagName('head')[0].appendChild(appleLink);
    }
    appleLink.href = LOGO_URL;

    // Create meta tags if they don't exist
    if (!document.querySelector('meta[name="description"]')) {
      const descMeta = document.createElement('meta');
      descMeta.name = 'description';
      descMeta.content = '';
      document.head.appendChild(descMeta);
    }
    if (!document.querySelector('meta[name="keywords"]')) {
      const keyMeta = document.createElement('meta');
      keyMeta.name = 'keywords';
      keyMeta.content = '';
      document.head.appendChild(keyMeta);
    }

    // Apply saved settings on layout mount
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedHideIcons = localStorage.getItem('hideIcons') === 'true';
    const savedBlackWhite = localStorage.getItem('blackWhiteMode') === 'true';
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    const savedUiStyle = localStorage.getItem('uiStyle') || 'rounded';
    const savedCognitiveMode = localStorage.getItem('cognitiveMode') || 'none';

    // Apply theme
    document.documentElement.classList.remove('dark', 'hybrid');
    if (savedTheme === 'hybrid') {
      document.documentElement.classList.add('hybrid');
      document.documentElement.style.setProperty('--bg-color', '#d1d5db');
      document.body.style.backgroundColor = '#d1d5db';
      document.body.style.color = '#1f2937';
    } else {
      document.documentElement.style.setProperty('--bg-color', '#ffffff');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    }

    // Apply hide icons
    if (savedHideIcons) {
      document.documentElement.setAttribute('data-hide-icons', 'true');
    } else {
      document.documentElement.removeAttribute('data-hide-icons');
    }

    // Apply grayscale
    document.documentElement.style.filter = savedBlackWhite ? 'grayscale(100%)' : 'none';

    // Apply font size
    const sizes = { small: '12px', medium: '16px', large: '20px' };
    document.documentElement.style.fontSize = sizes[savedFontSize] || '16px';

    // Apply UI style
    document.documentElement.setAttribute('data-ui-style', savedUiStyle);

    // Apply cognitive mode
    document.documentElement.setAttribute('data-cognitive', savedCognitiveMode);
  }, []);

  const hideLayoutForSearchPods = currentPageName === 'SearchPods';

  if (hideLayoutForSearchPods) {
    return (
      <ErrorBoundary fallbackMessage="There was an error loading this page.">
        <style>{`
          /* Hide Leaflet attribution */
          .leaflet-control-attribution {
            display: none !important;
          }

          /* Classic UI Style - links instead of buttons */
          [data-ui-style="classic"] button:not([data-keep-button]) {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            color: #7c3aed !important;
            text-decoration: underline !important;
            padding: 0.25rem 0.5rem !important;
          }
          [data-ui-style="classic"] button:hover:not([data-keep-button]) {
            color: #5b21b6 !important;
          }
          
          /* Square UI Style */
          [data-ui-style="square"] * {
            border-radius: 0 !important;
          }
          
          /* Reader cognitive mode - minimal styling */
          [data-cognitive="reader"] {
            max-width: 800px;
            margin: 0 auto;
          }
          [data-cognitive="reader"] * {
            background-image: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          [data-cognitive="reader"] .bg-gradient-to-br,
          [data-cognitive="reader"] .bg-gradient-to-r {
            background: #f9fafb !important;
          }

          /* Hide icons mode */
          [data-hide-icons="true"] svg {
            display: none !important;
          }
        `}</style>
        {children}
      </ErrorBoundary>
    );
  }

  return (
    <PageLayout activePage={currentPageName}>
      <ErrorBoundary fallbackMessage="There was an error loading this page.">
        <style>{`
          /* Hide Leaflet attribution */
          .leaflet-control-attribution {
            display: none !important;
          }

          /* Classic UI Style - links instead of buttons */
          [data-ui-style="classic"] button:not([data-keep-button]) {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            color: #7c3aed !important;
            text-decoration: underline !important;
            padding: 0.25rem 0.5rem !important;
          }
          [data-ui-style="classic"] button:hover:not([data-keep-button]) {
            color: #5b21b6 !important;
          }

          /* Square UI Style */
          [data-ui-style="square"] * {
            border-radius: 0 !important;
          }

          /* Reader cognitive mode - minimal styling */
          [data-cognitive="reader"] {
            max-width: 800px;
            margin: 0 auto;
          }
          [data-cognitive="reader"] * {
            background-image: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          [data-cognitive="reader"] .bg-gradient-to-br,
          [data-cognitive="reader"] .bg-gradient-to-r {
            background: #f9fafb !important;
          }

          /* Hide icons mode */
          [data-hide-icons="true"] svg {
            display: none !important;
          }
        `}</style>
        {children}
      </ErrorBoundary>
    </PageLayout>
  );
}
}