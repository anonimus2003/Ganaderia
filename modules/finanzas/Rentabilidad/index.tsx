import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RentabilidadView from "@/modules/finanzas/Rentabilidad/components/RentabilidadView";

export default async function Page() {
  const supabase = await createClient();

  // Verificar sesión activa
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <RentabilidadView />;
}