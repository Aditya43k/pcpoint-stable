'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { RevenueWidget } from "@/components/admin/RevenueWidget";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';

export default function RevenuePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // This check only runs on the client-side
    if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
      router.push('/login');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    router.push('/login');
  };

  if (isChecking) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 space-y-8">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Revenue Overview</h1>
                <p className="text-muted-foreground">Track your total revenue from completed services.</p>
            </div>
            <div className="flex gap-2">
                <Button asChild variant="outline">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
                <Button onClick={handleLogout} variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
        <RevenueWidget />
      </main>
      <Footer />
    </div>
  );
}
