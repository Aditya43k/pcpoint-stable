'use client';

import Link from 'next/link';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function Header() {
  const { user, isLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  const activeNavLinks = user
    ? [
        { href: '/', label: 'Home' },
        { href: '/dashboard', label: 'My Dashboard' },
        { href: '/request', label: 'New Request' },
      ]
    : [
        { href: '/', label: 'Home' },
        { href: '/request', label: 'New Request' },
      ];

  const guestLinks = [
    { href: '/customer-login', label: 'Customer Login' },
    { href: '/signup', label: 'Sign Up' },
  ];

  const adminLink = { href: '/login', label: 'Admin Login' };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Logo className="mr-6" />
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            {isClient && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0">
                  <SheetHeader>
                     <SheetTitle className="sr-only">Main Menu</SheetTitle>
                  </SheetHeader>
                  <Logo className="mb-6" />
                  <nav className="flex flex-col space-y-4">
                    {activeNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-foreground/70 transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <hr className="my-2"/>
                    {user ? (
                       <Button variant="ghost" onClick={handleLogout} className="justify-start text-foreground/70">
                          Logout
                       </Button>
                    ) : (
                      <>
                        {guestLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="text-foreground/70 transition-colors hover:text-foreground"
                          >
                            {link.label}
                          </Link>
                        ))}
                         <hr className="my-2"/>
                         <Link
                            key={adminLink.href}
                            href={adminLink.href}
                            className="text-foreground/70 transition-colors hover:text-foreground"
                          >
                            {adminLink.label}
                          </Link>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
          <nav className="hidden md:flex md:items-center md:gap-4 lg:gap-6">
            {activeNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            {!isLoading && user ? (
                <>
                    <span className="text-sm font-medium text-muted-foreground">
                        Hi, {user.displayName || user.email}
                    </span>
                    <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                        <LogOut className="h-5 w-5"/>
                    </Button>
                </>
            ) : !isLoading ? (
                <>
                    <Button asChild variant="ghost">
                        <Link href="/customer-login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                     <div className="h-6 w-px bg-border mx-2"></div>
                     <Button asChild variant="outline">
                        <Link href={adminLink.href}>{adminLink.label}</Link>
                     </Button>
                </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
