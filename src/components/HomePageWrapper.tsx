'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function HomePageWrapper() {
  return (
    <main className="w-screen h-screen bg-gray-100 overflow-hidden">
      <Map />
    </main>
  );
}
