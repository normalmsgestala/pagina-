import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import BlogPage from './BlogPage.tsx';
import './index.css';

const isBlog = window.location.pathname.replace(/\/$/, '').endsWith('/blog') || new URLSearchParams(window.location.search).get('blog') === '1';
createRoot(document.getElementById('root')!).render(isBlog ? <BlogPage /> : <App />);
