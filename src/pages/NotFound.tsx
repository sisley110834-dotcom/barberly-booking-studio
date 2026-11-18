import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";

export default function NotFound() {
  usePageTitle("Page not found — Barberly");
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="cloud-panel max-w-md rounded-[2.5rem] px-10 py-12 text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="glossy inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
