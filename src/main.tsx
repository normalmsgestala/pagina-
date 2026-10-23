import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import BlogPage from './BlogPage.tsx';
import PanelPage from './PanelPage.tsx';
import './index.css';

import PodcastPage from './PodcastPage.tsx';

const params = new URLSearchParams(window.location.search);
const path = window.location.pathname.replace(/\/$/, '');
const isPanel = path.endsWith('/panel') || params.get('panel') === '1';
const isArticles = path.endsWith('/blog') || params.get('articles') === '1' || params.get('blog') === '1';
const isPodcast = path.endsWith('/podcast') || params.get('podcast') === '1';
createRoot(document.getElementById('root')!).render(isPanel ? <PanelPage /> : isPodcast ? <PodcastPage /> : isArticles ? <BlogPage /> : <App />);
