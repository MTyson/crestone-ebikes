import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marketplace } from './components/Marketplace';
import { MeetWadeSection } from './components/MeetWadeSection';
import { ListingDetailModal } from './components/ListingDetailModal';
import { PostListingModal } from './components/PostListingModal';
import { AuthModal } from './components/AuthModal';
import { DonateModal } from './components/DonateModal';
import { Footer } from './components/Footer';
import { AppUser, Listing, NewListingInput } from './types/listing';
import {
  createListing,
  fetchListings,
  getCurrentUser,
  signOutUser,
  toggleListingSoldStatus,
} from './services/listingsService';

export function App() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  useEffect(() => {
    fetchListings().then(setListings);
    getCurrentUser().then(setCurrentUser);
  }, []);

  const handleCreateListing = async (input: NewListingInput) => {
    const created = await createListing(input, currentUser);
    setListings((prev) => [created, ...prev]);
    setSelectedListing(created);
  };

  const handleToggleSold = async (id: string) => {
    const updated = await toggleListingSoldStatus(id);
    setListings(updated);
    const refreshed = updated.find((item) => item.id === id) || null;
    setSelectedListing(refreshed);
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  const totalActiveCount = listings.filter((l) => l.status === 'active').length;
  const wadeInspectedCount = listings.filter((l) => l.wade_inspected).length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar
        currentUser={currentUser}
        onOpenPostModal={() => setIsPostModalOpen(true)}
        onOpenDonateModal={() => setIsDonateModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      <main className="flex-1">
        <Hero
          totalActiveCount={totalActiveCount}
          wadeInspectedCount={wadeInspectedCount}
          onOpenPostModal={() => setIsPostModalOpen(true)}
          onOpenDonateModal={() => setIsDonateModalOpen(true)}
        />

        <Marketplace
          listings={listings}
          onSelectListing={(listing) => setSelectedListing(listing)}
          onOpenPostModal={() => setIsPostModalOpen(true)}
        />

        <MeetWadeSection />
      </main>

      <Footer
        onOpenPostModal={() => setIsPostModalOpen(true)}
        onOpenDonateModal={() => setIsDonateModalOpen(true)}
      />

      {/* Modals */}
      <ListingDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onToggleSold={handleToggleSold}
      />

      <PostListingModal
        isOpen={isPostModalOpen}
        currentUser={currentUser}
        onClose={() => setIsPostModalOpen(false)}
        onSubmitListing={handleCreateListing}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenDonateModal={() => setIsDonateModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSignedIn={(user) => setCurrentUser(user)}
      />

      <DonateModal isOpen={isDonateModalOpen} onClose={() => setIsDonateModalOpen(false)} />
    </div>
  );
}

export default App;

