'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function HomePageWrapper() {
  return (
    <main className="h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="w-full h-full">
        <Map />
      </div>
    </main>
  );
}
