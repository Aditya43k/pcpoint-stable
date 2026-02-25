import { SignupForm } from '@/components/auth/SignupForm';
import { Logo } from '@/components/common/Logo';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function SignupPage() {
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
        <SignupForm />
      </main>
    </div>
  );
}
