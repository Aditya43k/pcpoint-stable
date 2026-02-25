import { Suspense } from 'react';
import { CustomerLoginForm } from '@/components/auth/CustomerLoginForm';
import { Logo } from '@/components/common/Logo';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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
    const bgImage = PlaceHolderImages.find(p => p.id === "auth-background");
  return (
    <div className="w-full min-h-screen flex flex-col relative isolate">
       <div className="absolute inset-0 -z-10">
        {bgImage && (
          <Image
            src={bgImage.imageUrl}
            alt={bgImage.description}
            fill
            className="object-cover"
            data-ai-hint={bgImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="absolute top-6 left-6">
        <Logo />
      </div>
      <main className="flex-grow flex items-center justify-center p-4">
        <Suspense fallback={<LoginFormSkeleton />}>
          <CustomerLoginForm />
        </Suspense>
      </main>
    </div>
  );
}
