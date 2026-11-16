import { Link } from "react-router-dom";
import { useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { BadgeCheck, CalendarCheck, Search, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/Wordmark";
import heroLeft from "@/assets/hero-left.jpg";
import heroRight from "@/assets/hero-right.jpg";
import barber1 from "@/assets/barber-1.jpg";
import barber2 from "@/assets/barber-2.jpg";
import barber3 from "@/assets/barber-3.jpg";
import barber4 from "@/assets/barber-4.jpg";

const SERVICES = ["All", "Cut", "Color", "Perm", "Beard"] as const;

const BRANDS = [
  { name: "Maison Coupe", cls: "font-serif italic text-2xl" },
  { name: "NORTHSIDE", cls: "font-sans font-semibold tracking-[0.3em] text-sm" },
  { name: "The Fade Co.", cls: "font-serif text-2xl" },
  { name: "atelier hair", cls: "font-sans lowercase tracking-wide text-lg" },
  { name: "BLADE & BRUSH", cls: "font-serif tracking-[0.2em] text-base" },
  { name: "Lumière", cls: "font-serif italic text-2xl" },
];

const FEATURES = [
  { icon: BadgeCheck, label: "Verified Barbers" },
  { icon: CalendarCheck, label: "Instant Booking" },
  { icon: ShieldCheck, label: "Secure Payment" },
  { icon: Sparkles, label: "Top-Rated Styles" },
];

const BARBERS = [
  { name: "Marco Rossi", shop: "Rossi Barber Club · Brooklyn", services: ["Cut", "Beard"], rating: 4.9, reviews: 312, from: 35, img: barber1 },
  { name: "Elise Laurent", shop: "Atelier Laurent · SoHo", services: ["Cut", "Color", "Perm"], rating: 4.8, reviews: 268, from: 60, img: barber2 },
  { name: "James Whitaker", shop: "Whitaker & Sons · Harlem", services: ["Cut", "Beard"], rating: 5.0, reviews: 451, from: 30, img: barber3 },
  { name: "Kenji Mori", shop: "Studio Mori · Williamsburg", services: ["Cut", "Color"], rating: 4.9, reviews: 189, from: 55, img: barber4 },
];

function SearchBox({ className = "" }: { className?: string }) {
  return (
    <label className={`flex items-center gap-3 rounded-full border border-border bg-card px-5 ${className}`}>
      <Search className="h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        placeholder="Find your stylist or search a style"
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

export default function Index() {
  usePageTitle("Barberly — Find your stylist, book in a few taps");
  const [active, setActive] = useState<(typeof SERVICES)[number]>("All");
  const visible = active === "All" ? BARBERS : BARBERS.filter((b) => b.services.includes(active));

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-5 md:px-8">
        <Wordmark />
        <SearchBox className="hidden h-10 flex-1 max-w-md md:ml-auto md:flex" />
        <Button asChild variant="pill" className="ml-auto px-6 md:ml-0">
          <Link to="/login">Login</Link>
        </Button>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-5 pt-6 pb-16 md:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-beige px-5 py-14 md:py-20">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_1.4fr_1fr]">
              <img src={heroLeft} alt="Textured quiff haircut" width={768} height={1024}
                className="animate-fade-up mx-auto hidden aspect-[3/4] w-full max-w-[260px] rounded-[1.5rem] object-cover md:block" />
              <div className="animate-fade-up text-center [animation-delay:120ms]">
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">New Look</p>
                <h1 className="mt-4 text-5xl font-medium leading-[1.02] text-foreground md:text-7xl">
                  Style with <em className="font-medium">Confident</em> Hair
                </h1>
                <SearchBox className="mx-auto mt-8 h-14 max-w-lg shadow-soft" />
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {SERVICES.map((s) => (
                    <button key={s} onClick={() => setActive(s)}
                      className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                        active === s ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-secondary"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <img src={heroRight} alt="Wavy bob hairstyle" width={768} height={1024}
                className="animate-fade-up mx-auto hidden aspect-[3/4] w-full max-w-[260px] rounded-[1.5rem] object-cover [animation-delay:240ms] md:block" />
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 border-y border-border py-8 text-muted-foreground">
            {BRANDS.map((b) => <span key={b.name} className={b.cls}>{b.name}</span>)}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <h2 className="text-center text-4xl font-medium md:text-5xl">Best booking experience</h2>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {FEATURES.map(({ icon: Icon, label }, i) => (
              <div key={label} style={{ animationDelay: `${i * 90}ms` }}
                className="animate-fade-up flex flex-col items-center gap-4 rounded-[1.5rem] bg-muted px-4 py-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-soft">
                  <Icon className="h-5 w-5 text-foreground" strokeWidth={1.6} />
                </span>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Popular */}
        <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
          <div className="flex items-end justify-between">
            <h2 className="text-4xl font-medium md:text-5xl">Popular</h2>
            <span className="text-sm text-muted-foreground">{active === "All" ? "All services" : active}</span>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((b) => (
              <a key={b.name} href="#" onClick={(e) => e.preventDefault()}
                className="card-lift group block overflow-hidden rounded-[1.5rem] bg-card">
                <div className="relative">
                  <img src={b.img} alt={b.name} width={768} height={960} loading="lazy"
                    className="aspect-[4/5] w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-medium backdrop-blur">Popular</span>
                </div>
                <div className="p-5">
                  <h3 className="text-2xl font-medium">{b.name}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{b.shop}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {b.services.map((s) => (
                      <span key={s} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{s}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-star text-star" />
                      <span className="font-medium">{b.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({b.reviews})</span>
                    </span>
                    <span>from <span className="font-semibold">${b.from}</span></span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-8 text-sm text-muted-foreground md:px-8">
          <span className="font-serif text-lg text-foreground">Barberly</span>
          <span>© 2026 Barberly</span>
        </div>
      </footer>
    </div>
  );
}
