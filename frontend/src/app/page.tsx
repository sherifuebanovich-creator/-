import type { Metadata } from 'next';
import MapAppLoader from '@/components/map/MapAppLoader';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export const metadata: Metadata = {
  title: 'ROVX — AI Navigation',
  description: 'Free AI-powered navigation with real-time traffic, fuel prices, speed cameras, and smart route planning for drivers and truckers.',
  openGraph: {
    title: 'ROVX — AI Navigation',
    description: 'Free AI-powered navigation with real-time traffic, fuel prices, speed cameras, and smart route planning.',
  },
};

const seoContent = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ROVX',
  applicationCategory: 'NavigationApplication',
  operatingSystem: 'Web',
  description: 'AI-powered navigation with real-time traffic, fuel prices, speed cameras, and smart route planning for drivers and truckers.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoContent) }}
      />
      <main className="relative w-full h-dvh overflow-hidden">
        <ErrorBoundary>
          <MapAppLoader />
        </ErrorBoundary>
        <div className="absolute left-0 right-0 bottom-0 z-0 pointer-events-none select-none" style={{ opacity: 0, height: 0, overflow: 'hidden' }}>
          <h1>ROVX — AI навигация для водителей и дальнобойщиков</h1>
          <p>ROVX это бесплатная AI-навигация с информацией о пробках в реальном времени, ценах на топливо, камерах скорости и умной прокладкой маршрутов. Сервис помогает водителям и профессиональным дальнобойщикам экономить время и деньги, предлагая оптимальные маршруты с учётом текущей дорожной обстановки.</p>
          <h2>Возможности ROVX</h2>
          <ul>
            <li>Навигация с искусственным интеллектом</li>
            <li>Цены на топливо в реальном времени</li>
            <li>Камеры скорости и радары на карте</li>
            <li>Пробки и дорожные события</li>
            <li>Умная прокладка маршрутов</li>
            <li>Достижения и рейтинг водителей</li>
          </ul>
        </div>
      </main>
    </>
  );
}
