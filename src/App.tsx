import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { BuildListPage } from './pages/BuildListPage';
import { BuildDetailPage } from './pages/BuildDetailPage';
import { BuilderPage } from './pages/BuilderPage';
import { ComparePage } from './pages/ComparePage';
import { EditPanel } from './components/editor/EditPanel';

interface BackgroundCircleStyle {
  animationDelay?: string;
}

function App(): React.JSX.Element {
  const circleStyle1: BackgroundCircleStyle = {};
  const circleStyle2: BackgroundCircleStyle = { animationDelay: '1s' };
  const circleStyle3: BackgroundCircleStyle = { animationDelay: '2s' };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ background: 'linear-gradient(to bottom right, #f9fafb, #f9fafb, #eef2ff)' }}>
        {/* Decorative background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full blur-3xl animate-float" style={circleStyle1} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-200 rounded-full blur-3xl animate-float" style={circleStyle2} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-200 rounded-full blur-3xl animate-float" style={circleStyle3} />
        </div>

        <Header />

        <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
          <Routes>
            <Route path="/" element={<BuildListPage />} />
            <Route path="/builder/new" element={<BuilderPage />} />
            <Route path="/build/:id" element={<BuildDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
          </Routes>
        </main>

        <Footer />

        {/* Edit Panel - rendered globally */}
        <EditPanel />
      </div>
    </BrowserRouter>
  );
}

export default App;
