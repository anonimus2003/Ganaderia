export function generarRutaLineaLeche(datos: any[], anchoSVG = 700, altoSVG = 220) {
  if (!datos || datos.length === 0) return { path: '', area: '', puntos: [], maxVal: 0 }
  const valores = datos.map(d => Number(d.litros) || 0)
  const maxVal = Math.max(...valores, 10)
  const minVal = Math.min(...valores, 0)
  const rango = maxVal - minVal || 1

  const margenX = 40
  const margenY = 25
  const wUtil = anchoSVG - margenX * 2
  const hUtil = altoSVG - margenY * 2

  const puntos = datos.map((item, index) => {
    const x = margenX + (index / (datos.length === 1 ? 1 : datos.length - 1)) * wUtil
    const y = altoSVG - margenY - ((Number(item.litros) - minVal) / rango) * hUtil
    return { x, y, val: item.litros, fecha: item.fecha, jornada: item.jornada }
  })

  let pathD = `M ${puntos[0].x} ${puntos[0].y}`
  for (let i = 0; i < puntos.length - 1; i++) {
    const p1 = puntos[i]
    const p2 = puntos[i + 1]
    const xc = (p1.x + p2.x) / 2
    pathD += ` Q ${xc} ${p1.y}, ${p2.x} ${p2.y}`
  }

  const areaD = `${pathD} L ${puntos[puntos.length - 1].x} ${altoSVG - margenY} L ${puntos[0].x} ${altoSVG - margenY} Z`
  return { path: pathD, area: areaD, puntos, maxVal }
}