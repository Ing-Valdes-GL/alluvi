import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Us | Vertex Biolabs",
  description: "Learn more about Vertex Biolabs, our mission, and our commitment to medical innovation.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}