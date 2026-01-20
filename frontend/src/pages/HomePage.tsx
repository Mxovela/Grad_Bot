import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { ChatPreview } from '../components/ChatPreview';
import { Features } from '../components/Features';
import { HowItWorks } from '../components/HowItWorks';
import { Footer } from '../components/Footer';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function HomePage() {
  useEffect(() => {
    const msg = sessionStorage.getItem('auth_error');
    if (msg) {
      sessionStorage.removeItem('auth_error');
      toast.error(msg);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <ChatPreview />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
