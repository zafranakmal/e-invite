import type { Metadata } from 'next';

// See app/dashboard/layout.tsx — same reason: page.tsx is a client component,
// so the title has to be set from a server layout wrapping it.
export const metadata: Metadata = {
  title: 'Sign in',
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
