import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}
