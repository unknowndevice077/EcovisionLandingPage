'use client';

import dynamic from 'next/dynamic';

// The homepage is the interactive 3D explorer. WebGL is browser-only, so it is
// never server-rendered. The previous long-scroll page lives on at /classic.
const Explorer = dynamic(() => import('./explorer/Explorer'), {
  ssr: false,
  loading: () => <div style={{ position: 'fixed', inset: 0, background: '#020502' }} />,
});

export default function Home() {
  return <Explorer />;
}
