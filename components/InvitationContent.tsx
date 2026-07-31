'use client';

import { CSSProperties, useCallback, useEffect, useState } from 'react';
import styles from './InvitationContent.module.css';
import InvitationCardSection from './sections/InvitationCardSection';
import ItinerarySection from './sections/ItinerarySection';
import CountdownSection from './sections/CountdownSection';
import RsvpSection from './sections/RsvpSection';
import WishesSection, { Wish } from './sections/WishesSection';
import GiftRegistrySection from './sections/GiftRegistrySection';
import SiteFooter from './sections/SiteFooter';

/** Sections the IntersectionObserver watches — must match the ids BottomNav scrolls to. */
const OBSERVED_IDS = ['itinerary', 'rsvp', 'gift', 'wishes'];

function fadeUp(isIn?: boolean): CSSProperties {
  return {
    opacity: isIn ? 1 : 0,
    transform: isIn ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.7s var(--ease), transform 0.7s var(--ease)',
  };
}

interface InvitationContentProps {
  revealed: boolean;
}

export default function InvitationContent({ revealed }: InvitationContentProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [sectionsIn, setSectionsIn] = useState<Record<string, boolean>>({});

  const loadWishes = useCallback(() => {
    fetch('/api/wishes')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setWishes(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadWishes();
  }, [loadWishes]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSectionsIn((s) => ({ ...s, [entry.target.id]: true }));
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    OBSERVED_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div id="invitation" className={`${styles.invitationSection}${revealed ? ' ' + styles.visible : ''}`}>
      <InvitationCardSection revealed={revealed} />
      <ItinerarySection style={fadeUp(sectionsIn.itinerary)} />
      <CountdownSection />
      <RsvpSection style={fadeUp(sectionsIn.rsvp)} onWishPosted={loadWishes} />
      <GiftRegistrySection style={fadeUp(sectionsIn.gift)} />
      <WishesSection wishes={wishes} isIn={sectionsIn.wishes} style={fadeUp(sectionsIn.wishes)} />
      <SiteFooter />
    </div>
  );
}
