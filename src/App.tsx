import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SessionRevokedModal } from './components/common/SessionRevokedModal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthPage } from './components/auth/AuthPage';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { DocumentDetailModal } from './components/marketplace/DocumentDetailModal';
import { ProtectedReaderModal } from './components/reader/ProtectedReaderModal';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { ContributorDashboard } from './components/dashboard/ContributorDashboard';
import { ProfessorPortal } from './components/dashboard/ProfessorPortal';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { DrmExplanationView } from './components/common/DrmExplanationView';
import { CollegesListingView } from './components/common/CollegesListingView';
import { AdminGatewayModal } from './components/auth/AdminGatewayModal';
import { AcademicDocument } from './types';

function MainApp() {
  const { user, isRevokedModalOpen, revokedReason, closeRevokedModal } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('marketplace');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminGatewayOpen, setIsAdminGatewayOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<AcademicDocument | null>(null);
  const [readerDocument, setReaderDocument] = useState<AcademicDocument | null>(null);

  const handleOpenReader = (doc: AcademicDocument) => {
    setReaderDocument(doc);
  };

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'signin':
      case 'auth':
        return (
          <AuthPage
            onBack={() => setCurrentTab('marketplace')}
            onSuccess={() => setCurrentTab('marketplace')}
            onOpenAdminGateway={() => setIsAdminGatewayOpen(true)}
          />
        );
      case 'colleges':
        return (
          <CollegesListingView
            onSelectCollege={() => setCurrentTab('marketplace')}
          />
        );
      case 'drm-info':
        return <DrmExplanationView />;
      case 'professor-portal':
        return <ProfessorPortal />;
      case 'admin':
        return <AdminDashboard />;
      case 'dashboard':
        if (!user) {
          return (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 p-8 max-w-lg mx-auto shadow-xs">
              <h3 className="text-lg font-bold text-[#111827] mb-2 font-editorial">Authentication Required</h3>
              <p className="text-xs text-gray-500 mb-5">
                Please sign in to access your personal dashboard, purchased library, and active session settings.
              </p>
              <button
                onClick={() => setCurrentTab('signin')}
                className="px-6 py-2.5 rounded-xl bg-[#111827] text-white font-semibold text-xs hover:bg-gray-800 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                Sign In to Vault
              </button>
            </div>
          );
        }
        if (user.role === 'contributor') {
          return <ContributorDashboard />;
        }
        if (user.role === 'admin') {
          return <AdminDashboard />;
        }
        if (user.role === 'professor') {
          return <ProfessorPortal />;
        }
        return <StudentDashboard onOpenReader={handleOpenReader} />;
      case 'marketplace':
      default:
        return (
          <MarketplaceView
            onSelectDocument={(doc) => setSelectedDocument(doc)}
            onReadDocument={handleOpenReader}
          />
        );
    }
  };

  if (currentTab === 'signin' || currentTab === 'auth') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] selection:bg-[#FEF3C7] selection:text-[#C06A28]">
        <AuthPage
          onBack={() => setCurrentTab('marketplace')}
          onSuccess={() => setCurrentTab('marketplace')}
          onOpenAdminGateway={() => setIsAdminGatewayOpen(true)}
        />
        <AdminGatewayModal
          isOpen={isAdminGatewayOpen}
          onClose={() => setIsAdminGatewayOpen(false)}
          onAdminAuthenticated={() => setCurrentTab('admin')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917] selection:bg-[#FEF3C7] selection:text-[#C06A28] transition-colors duration-150">
      {/* Main Navigation Top Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenAuth={() => setCurrentTab('signin')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto">
        <div key={currentTab} className="animate-fade-slide-up">
          {renderCurrentView()}
        </div>
      </main>

      {/* Institutional Footer with Hidden Admin Trigger */}
      <Footer onOpenAdmin={() => setIsAdminGatewayOpen(true)} />

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <AdminGatewayModal
        isOpen={isAdminGatewayOpen}
        onClose={() => setIsAdminGatewayOpen(false)}
        onAdminAuthenticated={() => setCurrentTab('admin')}
      />

      <SessionRevokedModal
        isOpen={isRevokedModalOpen}
        message={revokedReason}
        onClose={closeRevokedModal}
        onReLogin={() => {
          closeRevokedModal();
          setCurrentTab('signin');
        }}
      />

      <DocumentDetailModal
        document={selectedDocument}
        isOpen={Boolean(selectedDocument)}
        onClose={() => setSelectedDocument(null)}
        onOpenReader={(doc) => {
          setSelectedDocument(null);
          setReaderDocument(doc);
        }}
        onPurchaseSuccess={() => {
          // If viewing dashboard or marketplace, state refreshes automatically
        }}
        onOpenAuth={() => {
          setSelectedDocument(null);
          setCurrentTab('signin');
        }}
      />

      <ProtectedReaderModal
        document={readerDocument}
        isOpen={Boolean(readerDocument)}
        onClose={() => setReaderDocument(null)}
        onOpenAuth={() => {
          setReaderDocument(null);
          setCurrentTab('signin');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
