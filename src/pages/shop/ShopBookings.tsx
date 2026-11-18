import { useState } from "react";
import { Link } from "react-router-dom";

import { AppHeader } from "@/components/AppHeader";
import { useAuthUser } from "@/components/RequireAuth";
import { ServicesEditor } from "@/components/shop/ServicesEditor";
import { SlotsEditor } from "@/components/shop/SlotsEditor";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";
import { useMyBarbers, usePlatformSettings } from "@/hooks/use-profile";
import { DEFAULT_CURRENCY } from "@/lib/money";

/** /shop/bookings — per-barber services & price editor + bookable slot publisher. */
export default function ShopBookings() {
  usePageTitle("Services & slots — Barberly");
  const user = useAuthUser();
  const { data: barbers = [], isLoading } = useMyBarbers(user.id);
  const { data: settings } = usePlatformSettings();
  const [selected, setSelected] = useState<string | null>(null);
  const barber = barbers.find((b) => b.id === selected) ?? barbers[0];
  const currency = settings ?? DEFAULT_CURRENCY;
  const slotMinutes = settings?.slot_minutes ?? 30;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-5 py-10 md:px-8">
        <div className="animate-fade-up">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            理髮店後台 / Shop dashboard
          </p>
          <h1 className="mt-2 text-4xl font-medium">Services &amp; bookable slots</h1>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !barber ? (
          <div className="cloud-panel rounded-[2rem] p-8 text-center">
            <p>Add a barber first, then come back to set services and publish slots.</p>
            <Button asChild variant="pill" className="mt-4 px-6">
              <Link to="/shop">Go to shop setup</Link>
            </Button>
          </div>
        ) : (
          <>
            <div role="tablist" aria-label="Barber" className="flex flex-wrap gap-2">
              {barbers.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  role="tab"
                  aria-selected={b.id === barber.id}
                  onClick={() => setSelected(b.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    b.id === barber.id
                      ? "glossy bg-primary text-primary-foreground"
                      : "bg-white/70 hover:bg-white"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
            <ServicesEditor
              key={`svc-${barber.id}`}
              barberId={barber.id}
              currency={currency}
              slotMinutes={slotMinutes}
            />
            <SlotsEditor key={`slot-${barber.id}`} barberId={barber.id} slotMinutes={slotMinutes} />
          </>
        )}
      </main>
    </div>
  );
}
