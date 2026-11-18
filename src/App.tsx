import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SessionRevokedModal } from './components/common/SessionRevokedModal';
import { AuthModal } from './components/auth/AuthModal';
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
            <div className="py-16 text-center bg-[#fffdf6] rounded-3xl border border-[#ffe9a9] p-8 max-w-lg mx-auto shadow-2xs">
              <h3 className="text-lg font-bold text-[#1e1915] mb-2">Authentication Required</h3>
              <p className="text-xs text-[#645548] mb-5">
                Please sign in to access your personal dashboard, purchased library, and active session settings.
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-[#ea6510] text-white font-bold text-xs hover:bg-[#d45707] transition-all shadow-xs hover:shadow-md active:scale-95"
              >
                Sign In Now
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#111827] selection:bg-[#FEF3C7] selection:text-[#D97706] transition-colors duration-150">
      {/* Main Navigation Top Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenAuth={() => setIsAuthOpen(true)}
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
          setIsAuthOpen(true);
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
      />

      <ProtectedReaderModal
        document={readerDocument}
        isOpen={Boolean(readerDocument)}
        onClose={() => setReaderDocument(null)}
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
