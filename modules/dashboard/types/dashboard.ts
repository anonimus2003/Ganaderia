export interface Bovino {
  id: string
  nombre: string | null
  arete: string | null
}

export interface RegistroOrdeno {
  fecha: string
  litros: number
  jornada: string
}

export interface RegistroPeso {
  fecha: string
  peso_kgs: number
}

export interface AlertaAnimal {
  tipo: 'produccion' | 'salud' | 'retiro'
  mensaje: string
}