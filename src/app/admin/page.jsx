'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { DashboardClient } from "@/components/admin/DashboardClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LineChart, LogOut, History } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
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
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage incoming service requests.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button asChild size="lg" variant="outline">
              <Link href="/admin/records">
                <History className="mr-2 h-5 w-5" />
                View Records
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/admin/revenue">
                <LineChart className="mr-2 h-5 w-5" />
                View Revenue
              </Link>
            </Button>
            <Button onClick={handleLogout} size="lg" variant="outline">
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
        <div className="space-y-8">
          <DashboardClient />
        </div>
      </main>
      <Footer />
    </div>
  );
}
