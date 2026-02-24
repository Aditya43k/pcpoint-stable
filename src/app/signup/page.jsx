import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <SignupForm />
      </main>
      <Footer />
    </div>
  );
}
