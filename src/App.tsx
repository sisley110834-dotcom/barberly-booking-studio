import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import { RequireAuth } from "@/components/RequireAuth";
import { RequireShop } from "@/components/RequireShop";
import { SkyBackdrop } from "@/components/SkyBackdrop";
import { supabase } from "@/integrations/supabase/client";
import Barbers from "@/pages/Barbers";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import ShopBookings from "@/pages/shop/ShopBookings";
import ShopOnboarding from "@/pages/shop/ShopOnboarding";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route path="/barbers" element={<Barbers />} />
        <Route element={<RequireShop />}>
          <Route path="/shop" element={<ShopOnboarding />} />
          <Route path="/shop/bookings" element={<ShopBookings />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <SkyBackdrop />
      <AppRoutes />
    </QueryClientProvider>
  );
}
