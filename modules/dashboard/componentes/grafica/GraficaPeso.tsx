'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

interface RegistroPeso {
  id?: string
  peso_kgs: number | string
  fecha?: string
  created_at?: string
}

interface GraficaPesoProps {
  registros: RegistroPeso[]
}

export default function GraficaPeso({
  registros,
}: GraficaPesoProps) {

  // =========================================================
  // PREPARAR DATOS
  // =========================================================

  const datos = registros
    .map((registro) => {

      const fecha =
        registro.fecha ||
        registro.created_at

      return {
        fecha: fecha
          ? new Date(fecha).toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'short',
            })
          : 'Sin fecha',

        peso: Number(registro.peso_kgs) || 0,
      }
    })
    .filter((registro) => registro.peso > 0)


  // =========================================================
  // ESTADO SIN DATOS
  // =========================================================

  if (datos.length === 0) {

    return (
      <div className="flex h-[280px] items-center justify-center">

        <div className="text-center">

          <p className="font-medium text-zinc-600">
            No hay registros de peso
          </p>

          <p className="mt-1 text-sm text-zinc-400">
            Cuando registres un pesaje aparecerá aquí.
          </p>

        </div>

      </div>
    )
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="h-[280px] w-full">

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <LineChart
          data={datos}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 5,
          }}
        >

          {/* CUADRÍCULA */}

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />


          {/* EJE X */}

          <XAxis
            dataKey="fecha"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 12,
            }}
          />


          {/* EJE Y */}

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 12,
            }}
            tickFormatter={(valor) => `${valor} kg`}
            domain={['dataMin - 20', 'dataMax + 20']}
          />


          {/* TOOLTIP */}

          <Tooltip
            formatter={(valor) => [
              `${valor} kg`,
              'Peso',
            ]}
            labelFormatter={(fecha) =>
              `Fecha: ${fecha}`
            }
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e4e4e7',
              boxShadow:
                '0 10px 30px rgba(0,0,0,0.08)',
            }}
          />


          {/* LÍNEA */}

          <Line
            type="monotone"
            dataKey="peso"
            name="Peso"
            strokeWidth={3}
            dot={{
              r: 4,
            }}
            activeDot={{
              r: 6,
            }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  )
}