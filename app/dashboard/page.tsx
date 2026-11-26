import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive"
import { DataTableRetiros } from "@/components/dashboard/data-table"
import { SectionCards } from "@/components/dashboard/section-cards"
import { ChartBarLabel } from "@/components/dashboard/chart-bar-label"
import { ChartBarLabelCustom } from "@/components/dashboard/chart-bar-label-custom"
import { ChartPieDonutText } from "@/components/dashboard/chart-pie-donut-text"



export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 md:gap-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-2 lg:px-6">
          <div>
            <ChartBarLabel />
          </div>
          <div>
            <ChartBarLabelCustom />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-2 lg:px-6">
          <div>
            <DataTableRetiros />
          </div>
          <div>
            <ChartPieDonutText />
          </div>
        </div>
      </div>
    </div>
  )
}