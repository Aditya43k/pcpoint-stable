import { Cpu } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)} prefetch={false}>
      <Cpu className="h-7 w-7 text-primary" />
      <span className="text-xl font-bold tracking-tight text-foreground">
        Pc Point
      </span>
    </Link>
  );
}
