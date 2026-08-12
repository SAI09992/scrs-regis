import CyberNavbar from '@/components/landing/CyberNavbar';
import HeroSection from '@/components/landing/HeroSection';
import LiveSlotTracker from '@/components/landing/LiveSlotTracker';
import EventOverviewSection from '@/components/landing/EventOverviewSection';
import EventSpecsSection from '@/components/landing/EventSpecsSection';
import CreditTypeSection from '@/components/landing/CreditTypeSection';
import WhatYouLearnSection from '@/components/landing/WhatYouLearnSection';
import HighlightsSection from '@/components/landing/HighlightsSection';
import SchedulePreview from '@/components/landing/SchedulePreview';
import RegistrationCountdown from '@/components/landing/RegistrationCountdown';
import RegistrationCtaSection from '@/components/landing/RegistrationCtaSection';
import ImportantInfoSection from '@/components/landing/ImportantInfoSection';
import FaqSection from '@/components/landing/FaqSection';
import CoordinatorsSection from '@/components/landing/CoordinatorsSection';
import OrganizerBrandingSection from '@/components/landing/OrganizerBrandingSection';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen text-cyber-text overflow-x-hidden selection:bg-cyber-primary selection:text-cyber-bg">
      {/* Structured Landing Page Flow */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Section 1: Navbar with BrandLogo & Login */}
        <CyberNavbar />

        {/* Section 2: Hero with Visual & SCRS Branding */}
        <HeroSection />

        {/* Section 2.5 / Between 2 & 3: Live Seat Registration Count Bar */}
        <LiveSlotTracker />

        {/* Section 3: Event Overview */}
        <EventOverviewSection />

        {/* Section 4: Event Specifications */}
        <EventSpecsSection />

        {/* Section 5: Credit / Department Information */}
        <CreditTypeSection />

        {/* Section 6: What You'll Learn */}
        <WhatYouLearnSection />

        {/* Section 7: Workshop Highlights */}
        <HighlightsSection />

        {/* Section 8: Two-Day Schedule Preview */}
        <SchedulePreview />

        {/* Section 10: Registration Countdown */}
        <RegistrationCountdown />

        {/* Section 11: Registration CTA */}
        <RegistrationCtaSection />

        {/* Section 12: Important Information */}
        <ImportantInfoSection />

        {/* Section 13: FAQ */}
        <FaqSection />

        {/* Section 14: Student Event Coordinators */}
        <CoordinatorsSection />

        {/* Section 15: Organizer / Club Branding */}
        <OrganizerBrandingSection />

        {/* Section 16: Footer */}
        <Footer />
      </div>
    </main>
  );
}
