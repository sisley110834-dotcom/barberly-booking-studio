import { Navigate, Outlet } from "react-router-dom";

import { useAuthUser } from "@/components/RequireAuth";
import { useProfile } from "@/hooks/use-profile";
import { CUSTOMER_HOME, isShop } from "@/lib/roles";

/** Gate for shop-only routes: reads `profiles.role`; non-shops go to the customer landing. */
export function RequireShop() {
  const user = useAuthUser();
  const { data: profile, isLoading, error } = useProfile(user.id);

  if (isLoading) return <div className="min-h-screen" />;
  if (error) return <p className="p-8 text-center text-destructive">{error.message}</p>;
  if (!isShop(profile?.role)) return <Navigate to={CUSTOMER_HOME} replace />;
  return <Outlet context={user} />;
}
