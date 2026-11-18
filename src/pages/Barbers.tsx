import { Link } from "react-router-dom";

import { AppHeader } from "@/components/AppHeader";
import { useAuthUser } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";
import { useProfile } from "@/hooks/use-profile";
import { SHOP_HOME, isShop } from "@/lib/roles";

/** Customer landing page. Shops are sent to their dashboard after sign-in, but can still visit. */
export default function BarbersPage() {
  usePageTitle("Your Barberly — Barbers");
  const user = useAuthUser();
  const { data: profile } = useProfile(user.id);
  const shop = isShop(profile?.role);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8">
        <div className="animate-fade-up cloud-panel rounded-[3rem] px-8 py-16">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Coming soon
          </p>
          <h1 className="mt-4 text-3xl font-medium md:text-4xl">
            附近的理髮師即將上線 — 很快就能瀏覽與預約。
          </h1>
          <p className="mt-4 text-muted-foreground">
            Barbers near you are coming soon — browse &amp; booking are on the way.
          </p>
          {shop ? (
            <Button asChild variant="pill" className="mt-8 px-6">
              <Link to={SHOP_HOME}>Go to your shop dashboard</Link>
            </Button>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              Run a barbershop? Use <span className="font-medium">開店 / Become a shop</span> in the
              header to list your barbers.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
