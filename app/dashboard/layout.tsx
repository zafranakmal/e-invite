import type { Metadata } from 'next';

// page.tsx is a client component and so can't export metadata itself. This
// server layout exists only to retitle the tab — without it the admin
// dashboard inherits the wedding title from the root layout. Everything else,
// `robots` included, still comes from there.
export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
