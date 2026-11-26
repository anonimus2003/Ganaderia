import { SectionCards } from "@/modulos/finanzas/reportes/components/section-cards"
import { ChartIngresosDonut } from "@/modulos/finanzas/reportes/components/ChartIngresosDonut"
import { ChartEgresosDonut } from "@/modulos/finanzas/reportes/components/ChartEgresosDonut"

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 md:gap-6">
        <SectionCards />

        <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-2 lg:px-6">
          <div>
            <ChartIngresosDonut />
          </div>
          <div>
            <ChartEgresosDonut />
          </div>
        </div>
      </div>
    </div>
  )
}