import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { CaseStudiesPage } from './pages/CaseStudiesPage';
import { CaseStudyDetailPage } from './pages/CaseStudyDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { initialData } from './data/initialData';
import { ContentDatabase } from './types';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [data, setData] = useState<ContentDatabase>(initialData);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch updated content from backend
  useEffect(() => {
    fetch('/api/content')
      .then((res) => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.json();
      })
      .then((serverContent) => {
        if (serverContent && serverContent.services) {
          setData((prev) => ({
            ...prev,
            ...serverContent,
          }));
        }
      })
      .catch((err) => {
        // Silently use bundled initialData if server is compiling or starting
        console.log('[Client] Using verified bundled initialData cache');
      });
  }, [currentPath]);

  const handleNavigate = (path: string) => {
    // Handle hash anchors if navigating within same page
    if (path.includes('#') && path.startsWith(currentPath)) {
      const hash = path.split('#')[1];
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Strip hash for path comparison
    const basePath = path.split('#')[0].split('?')[0];
    setCurrentPath(basePath);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated Route Resolution
  const renderCurrentPage = () => {
    // 1. Admin Dashboard Route
    if (currentPath === '/admin') {
      return <AdminDashboard onNavigateHome={() => handleNavigate('/')} />;
    }

    // 2. Case Study Detail Route: /case-studies/:slug
    if (currentPath.startsWith('/case-studies/')) {
      const slug = currentPath.replace('/case-studies/', '');
      return (
        <CaseStudyDetailPage
          slug={slug}
          data={data}
          onNavigate={handleNavigate}
        />
      );
    }

    // 3. Main Pages
    switch (currentPath) {
      case '/':
        return <HomePage data={data} onNavigate={handleNavigate} />;
      case '/services':
        return <ServicesPage data={data} onNavigate={handleNavigate} />;
      case '/case-studies':
        return <CaseStudiesPage data={data} onNavigate={handleNavigate} />;
      case '/products':
        return <ProductsPage data={data} onNavigate={handleNavigate} />;
      case '/about':
        return <AboutPage data={data} onNavigate={handleNavigate} />;
      case '/contact':
        return <ContactPage data={data} />;
      case '/privacy':
        return <PrivacyPolicyPage onNavigate={handleNavigate} />;
      case '/terms':
        return <TermsPage onNavigate={handleNavigate} />;
      default:
        return <NotFoundPage onNavigate={handleNavigate} />;
    }
  };

  const isAdminRoute = currentPath === '/admin';

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col font-sans selection:bg-[#6A22F2] selection:text-white">
      {/* Hide public header on private admin login/dashboard */}
      {!isAdminRoute && (
        <Header currentPath={currentPath} onNavigate={handleNavigate} />
      )}

      {/* Main Page Area */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Hide public footer on private admin dashboard */}
      {!isAdminRoute && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Floating WhatsApp chat button on all public pages */}
      {!isAdminRoute && (
        <FloatingWhatsApp phoneNumber="+8801674451806" />
      )}
    </div>
  );
}
