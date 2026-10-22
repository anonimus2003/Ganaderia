'use client';

import React, { useState, useEffect } from 'react';
import { usePotreros } from './hooks/usePotreros';
import { useGanado } from './hooks/useGanadoMovimiento';
import { MapaPotreros } from './components/mapa/MapaPotreros';
import { HeaderPotreros } from './components/header/HeaderPotreros';
import OcupacionTable from './components/tabla/ocupacion/ocupacionTable';
import AbonosTable from './components/tabla/abonos/abonosTable';
import { BitacoraList } from './components/bitacora/BitacoraList';
import { PotreroDrawerContainer } from './components/drawer/PotreroDrawerContainer';
import { Potrero } from './types/potrero.types';
// Importamos las acciones dedicadas
import { getHistorialOcupacionAction, getHistorialAbonosAction, deleteHistorialOcupacionAction, deleteHistorialAbonoAction} from './actions/potreros.actions';

export default function PotrerosModule() {
  const {
    potreros,
    eventos,
    potreroSeleccionado,
    potreroSeleccionadoId,
    isDrawerOpen,
    modoDrawer,
    loading,
    seleccionarPotrero,
    abrirDrawer,
    cerrarDrawer,
    refetchData,
  } = usePotreros();

  // 1. ESTADO PARA ALTERNAR ENTRE TABLA DE OCUPACIÓN Y ABONOS
  const [vistaActual, setVistaActual] = useState<'ocupacion' | 'abonos'>('ocupacion');

  // Estados de Paginación
  const [pageOcupacion, setPageOcupacion] = useState(1);
  const [totalOcupacion, setTotalOcupacion] = useState(0);
  
  const [pageAbonos, setPageAbonos] = useState(1);
  const [totalAbonos, setTotalAbonos] = useState(0);

  const pageSize = 10;

  // Estados de Datos
  const [ocupacionData, setOcupacionData] = useState<any[]>([]);
  const [abonosData, setAbonosData] = useState<any[]>([]);
  const [loadingTablas, setLoadingTablas] = useState(false);

  // 2. Función para cargar los datos usando las páginas reales de cada tabla
  const cargarDatosTablas = async () => {
    try {
      setLoadingTablas(true);
      const [resOcupacion, resAbonos] = await Promise.all([
        getHistorialOcupacionAction(pageOcupacion, pageSize, potreroSeleccionadoId ?? undefined),
        getHistorialAbonosAction(pageAbonos, pageSize, potreroSeleccionadoId ?? undefined)
      ]);

      setOcupacionData(resOcupacion.data);
      setTotalOcupacion(resOcupacion.total);

      setAbonosData(resAbonos.data);
      setTotalAbonos(resAbonos.total);
    } catch (err) {
      console.error("Error al cargar historiales en la vista:", err);
    } finally {
      setLoadingTablas(false);
    }
  };

  // 3. Recargar cuando cambie el potrero O las páginas de ocupación/abonos
  useEffect(() => {
    cargarDatosTablas();
  }, [potreroSeleccionadoId, pageOcupacion, pageAbonos]);

  // Cada vez que cambie de potrero en el mapa, reiniciamos las páginas a la 1
  useEffect(() => {
    setPageOcupacion(1);
    setPageAbonos(1);
  }, [potreroSeleccionadoId]);

  // Evaluación flexible de ocupación para el potrero seleccionado
  const p = potreroSeleccionado as any;
  const estadoNormalizado = String(p?.estado || p?.estatus || '').toLowerCase();
  const animalesCount = p?.animales_actuales || p?.bovinos_actuales || p?.cantidad_bovinos || 0;
  
  const estaOcupado = estadoNormalizado === 'ocupado' || animalesCount > 0;

  // Consultamos los bovinos entregando la bandera correcta
  const { bovinosDisponibles } = useGanado(potreroSeleccionadoId ?? undefined, estaOcupado);

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-2xl bg-white border border-zinc-200 shadow-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-xs font-semibold text-zinc-500">Cargando mapa y datos de potreros...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-6 text-zinc-900 bg-zinc-50/50 min-h-screen">
      
      {/* 1. Cabecera y Selección de Vista (Ocupación / Abonos) */}
      <div className="flex flex-col gap-4">
        <HeaderPotreros
          total={potreros.length}
          potreroSeleccionado={potreroSeleccionado}
          vistaActual={vistaActual}
          onCambiarVista={setVistaActual}
          onNuevaOcupacion={() => abrirDrawer('REGISTRAR_OCUPACION')}
        />
      </div>

      {/* 2. Área Principal: Mapa Interactivo y Panel Lateral / Bitácora */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Lienzo SVG del Mapa */}
        <div className="lg:col-span-8 w-full">
          <MapaPotreros
            potreros={potreros}
            eventos={eventos}
            potreroSeleccionadoId={potreroSeleccionadoId}
            onSelectPotrero={(potrero: Potrero) => seleccionarPotrero(potrero)}
          />
        </div>

        {/* Historial y Bitácora */}
        <div className="lg:col-span-4 w-full flex flex-col gap-4">
          <BitacoraList
            potrero={potreroSeleccionado}
            eventos={eventos}
          />
        </div>
      </div>

      {/* 3. Panel Lateral Drawer Deslizante */}
      <PotreroDrawerContainer
        isOpen={isDrawerOpen}
        modo={modoDrawer}
        potrero={potreroSeleccionado}
        bovinosDisponibles={bovinosDisponibles || []}
        onClose={cerrarDrawer}
        onSuccess={() => {
          cerrarDrawer();
          refetchData();
          cargarDatosTablas();
        }}
      />

      {/* 📊 4. SECCIÓN INFERIOR: TABLAS DIRECTAS (OCUPACIÓN / ABONOS) */}
      <div className="w-full mt-2">
        {vistaActual === 'ocupacion' ? (
          <OcupacionTable
            data={ocupacionData}
            loading={loadingTablas}
            page={pageOcupacion}
            total={totalOcupacion}
            pageSize={pageSize}
            nextPage={() => setPageOcupacion((prev) => prev + 1)}
            prevPage={() => setPageOcupacion((prev) => Math.max(prev - 1, 1))}
            onFilters={() => {}}
            onAddRecord={() => {
              if (potreroSeleccionado) abrirDrawer('REGISTRAR_OCUPACION');
            }}
            onEdit={(item) => {
              // Lógica de edición si la tienes en drawer
            }}
            onDelete={async (id) => {
              if (confirm("¿Estás seguro de eliminar este registro de ocupación?")) {
                await deleteHistorialOcupacionAction(id);
                cargarDatosTablas(); // Recarga los datos de la tabla
              }
            }}
          />
        ) : (
          <AbonosTable
            data={abonosData}
            loading={loadingTablas}
            page={pageAbonos}
            total={totalAbonos}
            pageSize={pageSize}
            nextPage={() => setPageAbonos((prev) => prev + 1)}
            prevPage={() => setPageAbonos((prev) => Math.max(prev - 1, 1))}
            onFilters={() => {}}
            onAddRecord={() => {
              if (potreroSeleccionado) abrirDrawer('REGISTRAR_ABONO');
            }}
            onEdit={(item) => {
              // Lógica de edición si la tienes en drawer
            }}
            onDelete={async (id) => {
              if (confirm("¿Estás seguro de eliminar este registro de abono?")) {
                await deleteHistorialAbonoAction(id);
                cargarDatosTablas(); // Recarga los datos de la tabla
              }
            }}
          />
        )}
      </div>

    </div>
  );
}