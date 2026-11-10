import React, { useCallback, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marketplace } from './components/Marketplace';
import { MeetWadeSection } from './components/MeetWadeSection';
import { AskWadeSection } from './components/AskWadeSection';
import { AdminInbox } from './components/AdminInbox';
import { QASection } from './components/QASection';
import { isAdminUser } from './services/questionsService';
import { ListingDetailModal } from './components/ListingDetailModal';
import { PostListingModal } from './components/PostListingModal';
import { AuthModal } from './components/AuthModal';
import { DonateModal } from './components/DonateModal';
import { Footer } from './components/Footer';
import { AppUser, Listing, NewListingForm } from './types/listing';
import { isSupabaseConfigured } from './lib/supabase';
import {
  createListing,
  deleteListing,
  fetchListings,
  getPrototypeUser,
  onAuthChange,
  signOutUser,
  updateListingStatus,
  uploadListingPhotos,
} from './services/listingsService';

export function App() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [pendingPost, setPendingPost] = useState(false);
  const [qaVersion, setQaVersion] = useState(0);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setListings(await fetchListings());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  // Auth: Supabase session (incl. magic-link redirect) or prototype user.
  useEffect(() => {
    if (isSupabaseConfigured) {
      return onAuthChange(setCurrentUser);
    }
    setCurrentUser(getPrototypeUser());
    return undefined;
  }, []);

  // After signing in from the "Post" flow, continue straight into the form.
  useEffect(() => {
    if (currentUser && pendingPost) {
      setPendingPost(false);
      setIsAuthModalOpen(false);
      setIsPostModalOpen(true);
    }
  }, [currentUser, pendingPost]);

  /** Posting requires a signed-in (email-verified) user. */
  const openPostModal = () => {
    if (currentUser) {
      setIsPostModalOpen(true);
    } else {
      setPendingPost(true);
      setIsAuthModalOpen(true);
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingPost(false);
  };

  const handleCreateListing = async (form: NewListingForm, photos: File[]) => {
    if (!currentUser) throw new Error('Please sign in to post a listing.');
    const image_urls = await uploadListingPhotos(photos, currentUser);
    const created = await createListing(
      { ...form, image_url: image_urls[0], image_urls },
      currentUser
    );
    setListings((prev) => [created, ...prev]);
    setSelectedListing(created);
  };

  const handleToggleSold = async (listing: Listing) => {
    const next = listing.status === 'sold' ? 'active' : 'sold';
    await updateListingStatus(listing.id, next);
    const updated: Listing = { ...listing, status: next };
    setListings((prev) => prev.map((l) => (l.id === listing.id ? updated : l)));
    setSelectedListing(updated);
  };

  const handleDeleteListing = async (listing: Listing) => {
    await deleteListing(listing);
    setListings((prev) => prev.filter((l) => l.id !== listing.id));
    setSelectedListing(null);
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  const totalActiveCount = listings.filter((l) => l.status === 'active').length;
  const cebApprovedCount = listings.filter((l) => l.ceb_approved).length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar
        currentUser={currentUser}
        onOpenPostModal={openPostModal}
        onOpenDonateModal={() => setIsDonateModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      <main className="flex-1">
        <Hero
          totalActiveCount={totalActiveCount}
          cebApprovedCount={cebApprovedCount}
          onOpenPostModal={openPostModal}
          onOpenDonateModal={() => setIsDonateModalOpen(true)}
        />

        <Marketplace
          listings={listings}
          loading={loading}
          loadError={loadError}
          currentUserId={currentUser?.id ?? null}
          onRetry={loadListings}
          onSelectListing={(listing) => setSelectedListing(listing)}
          onOpenPostModal={openPostModal}
        />

        <MeetWadeSection />

        <QASection currentUser={currentUser} refreshToken={qaVersion} />

        <AskWadeSection currentUser={currentUser} onSignedIn={(user) => setCurrentUser(user)} />

        {isAdminUser(currentUser) && (
          <AdminInbox key={currentUser?.id} onPublished={() => setQaVersion((v) => v + 1)} />
        )}
      </main>

      <Footer
        onOpenPostModal={openPostModal}
        onOpenDonateModal={() => setIsDonateModalOpen(true)}
      />

      {/* Modals */}
      <ListingDetailModal
        key={selectedListing?.id ?? 'none'}
        listing={selectedListing}
        currentUser={currentUser}
        onClose={() => setSelectedListing(null)}
        onToggleSold={handleToggleSold}
        onDelete={handleDeleteListing}
      />

      <PostListingModal
        isOpen={isPostModalOpen}
        currentUser={currentUser}
        onClose={() => setIsPostModalOpen(false)}
        onSubmitListing={handleCreateListing}
        onOpenDonateModal={() => setIsDonateModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSignedIn={(user) => setCurrentUser(user)}
      />

      <DonateModal isOpen={isDonateModalOpen} onClose={() => setIsDonateModalOpen(false)} />
    </div>
  );
}

export default App;
