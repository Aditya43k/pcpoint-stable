'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { UserRequests } from '@/components/dashboard/UserRequests';
import { Features } from '@/components/landing/Features';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/customer-login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 space-y-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-64 w-full" />
            </main>
            <Footer />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome, {user.displayName}!</h1>
            <p className="text-muted-foreground">Here's an overview of your service requests and our offerings.</p>
          </div>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
            <Link href="/request">Submit a New Request</Link>
          </Button>
        </div>
        
        <div className="space-y-12">
            <UserRequests />
            <Features />
        </div>
      </main>
      <Footer />
    </div>
  );
}
