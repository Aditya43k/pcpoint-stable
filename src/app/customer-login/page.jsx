import { Suspense } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { CustomerLoginForm } from '@/components/auth/CustomerLoginForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';

function LoginFormSkeleton() {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <Skeleton className="h-7 w-3/5" />
                <Skeleton className="h-4 w-4/5 mt-2" />
            </CardHeader>
            <CardContent className="grid gap-6">
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                 </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                 </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardFooter>
        </Card>
    )
}

export default function CustomerLoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Suspense fallback={<LoginFormSkeleton />}>
          <CustomerLoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
