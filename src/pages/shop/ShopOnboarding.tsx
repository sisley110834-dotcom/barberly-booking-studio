import { Link } from "react-router-dom";

import { AppHeader } from "@/components/AppHeader";
import { useAuthUser } from "@/components/RequireAuth";
import { BarbersManager } from "@/components/shop/BarbersManager";
import { PayoutSettings } from "@/components/shop/PayoutSettings";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";
import { useMyBarbers, useProfile } from "@/hooks/use-profile";
import { isOnboarded } from "@/lib/onboarding";

/** /shop — shop onboarding: payout settings (shop level) + barbers + their sample photos. */
export default function ShopOnboarding() {
  usePageTitle("Shop setup — Barberly");
  const user = useAuthUser();
  const { data: profile } = useProfile(user.id);
  const { data: barbers = [] } = useMyBarbers(user.id);
  const payoutDone = isOnboarded(profile);
  const done = payoutDone && barbers.length > 0;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-5 py-10 md:px-8">
        <div className="animate-fade-up">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            理髮店上架 / Shop onboarding
          </p>
          <h1 className="mt-2 text-4xl font-medium">
            {profile?.display_name?.trim() || "Set up your shop"}
          </h1>
          <ol className="mt-4 flex flex-wrap gap-2 text-sm">
            <li
              className={`rounded-full px-3 py-1 ${payoutDone ? "bg-balloon-mint" : "bg-white/70"}`}
            >
              {payoutDone ? "✓" : "1."} Shop name &amp; payout account
            </li>
            <li
              className={`rounded-full px-3 py-1 ${barbers.length ? "bg-balloon-mint" : "bg-white/70"}`}
            >
              {barbers.length ? "✓" : "2."} At least one barber
            </li>
          </ol>
          {done ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-sm">開店完成 / Your shop is set up.</p>
              <Button asChild size="sm" variant="pill" className="px-4">
                <Link to="/shop/bookings">Next: services &amp; bookable slots →</Link>
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Finish both steps to complete shop signup.
            </p>
          )}
        </div>
        {profile && <PayoutSettings profile={profile} />}
        <BarbersManager shopId={user.id} />
      </main>
    </div>
  );
}
