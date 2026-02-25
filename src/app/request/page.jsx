'use client'; // Needs to be a client component to use hooks

import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ServiceRequestForm } from '@/components/request/ServiceRequestForm';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function RequestPage() {
  const { user, isLoading } = useUser();
  const bgImage = PlaceHolderImages.find(p => p.id === 'auth-background');

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.replace('/customer-login?redirect=/request');
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 flex justify-center">
                <div className="w-full max-w-3xl space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </main>
            <Footer />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow relative isolate">
        <div className="absolute inset-0 -z-10">
          {bgImage && (
              <Image
                  src={bgImage.imageUrl}
                  alt={bgImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={bgImage.imageHint}
              />
          )}
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="container mx-auto px-4 py-8 sm:py-12 flex justify-center">
            <div className="w-full max-w-3xl">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl sm:text-3xl font-headline">Submit a Service Request</CardTitle>
                  <CardDescription className="text-base sm:text-lg">
                    Please provide as much detail as possible so we can help you faster.
                  </CardDescription>
                </CardHeader>
                <ServiceRequestForm />
              </Card>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
