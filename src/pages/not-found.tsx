import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center p-6 text-center bg-background text-white safe-top safe-bottom">
      <div className="w-24 h-24 mx-auto bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 mb-6">
        <span className="text-5xl font-bold text-zinc-600">?</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Page Not Found</h1>
      <p className="text-zinc-500 mb-8 max-w-[250px] mx-auto text-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button className="h-12 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
          Return to Tracker
        </Button>
      </Link>
    </div>
  );
}
