import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Our Products | Vertex Biolabs",
  description: "Explore the full range of high-quality pharmaceutical products and medical solutions offered by Vertex Biolabs.",
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}