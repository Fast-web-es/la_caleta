
import React, { Suspense } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { Loader2 } from 'lucide-react';
import RestaurantTemplate from './components/RestaurantTemplate';
import SEO from './components/SEO';

// Use HashRouter for safer routing in preview/subdirectory environments
const { HashRouter, Routes, Route } = ReactRouterDOM as any;

const PageLoader = () => (
  <div className="min-h-screen bg-[#F6EEDD] flex items-center justify-center">
    <Loader2 className="w-10 h-10 text-[#B23A2E] animate-spin" />
  </div>
);

function App() {
  return (
    <HashRouter>
      <SEO />
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Main Restaurant App - Matches root hash #/ */}
          <Route path="/" element={<RestaurantTemplate />} />
          
          {/* Fallback for any other path */}
          <Route path="*" element={<RestaurantTemplate />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
