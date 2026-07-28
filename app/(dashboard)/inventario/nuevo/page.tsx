import { registrarBovino } from './actions'

export default function NuevoBovinoPage() {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      padding: '24px',
      backgroundColor: '#ffffff',
      border: '1px solid #e4e4e7',
      borderRadius: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700', color: '#09090b' }}>
        Registrar Nuevo Bovino
      </h2>
      <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#71717a' }}>
        Ingresa los datos correspondientes para registrar un nuevo animal en el sistema de trazabilidad.
      </p>

      {/* Formulario conectado directamente al Server Action */}
      <form 
        action={async (formData) => {
          'use server'
          await registrarBovino(formData)
        }} 
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        
        {/* Número de Arete */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>Número de Arete *</label>
          <input 
            type="text" 
            name="arete" 
            required 
            placeholder="Ej. SENA-0024"
            style={{
              padding: '10px 12px',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {/* Nombre o Alias */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>Nombre (Opcional)</label>
          <input 
            type="text" 
            name="nombre" 
            placeholder="Ej. Mariposa"
            style={{
              padding: '10px 12px',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {/* Raza */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>Raza *</label>
          <input 
            type="text" 
            name="raza" 
            required 
            placeholder="Ej. Jersey, Gyr, Holstein"
            style={{
              padding: '10px 12px',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {/* Fila Responsiva: Género y Peso */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>Género *</label>
            <select 
              name="genero" 
              required
              style={{
                padding: '10px 12px',
                border: '1px solid #e4e4e7',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                outline: 'none'
              }}
            >
              <option value="Hembra">Hembra</option>
              <option value="Macho">Macho</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>Peso Inicial (kg) *</label>
            <input 
              type="number" 
              step="0.01"
              name="peso_inicial" 
              required 
              placeholder="Ej. 35.5"
              style={{
                padding: '10px 12px',
                border: '1px solid #e4e4e7',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Fila: Fecha de Nacimiento y Estado Productivo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>Fecha de Nacimiento (Opcional)</label>
            <input 
              type="date" 
              name="fecha_nacimiento" 
              style={{
                padding: '10px 12px',
                border: '1px solid #e4e4e7',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>Estado *</label>
            <select 
              name="estado" 
              required
              defaultValue="En Producción"
              style={{
                padding: '10px 12px',
                border: '1px solid #e4e4e7',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                outline: 'none'
              }}
            >
              <option value="Ternera en lactancia">Ternera en lactancia</option>
              <option value="Ternera en crecimiento">Ternera en crecimiento</option>
              <option value="Novilla en desarrollo">Novilla en desarrollo</option>
              <option value="Novilla de vientre">Novilla de vientre</option>
              <option value="En producción">En producción</option>
              <option value="Seca">Seca</option>
              <option value="Macho">Macho</option>
              <option value="Destete">Destete</option>
              <option value="Levante">Levante</option>
            </select>
          </div>
        </div>

        {/* Campo de Observaciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>Observaciones (Opcional)</label>
          <textarea 
            name="observaciones" 
            rows={3}
            placeholder="Ej. Mansa al ordeño, presenta cicatriz en la oreja derecha o requiere control especial."
            style={{
              padding: '10px 12px',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Botones de Guardar / Cancelar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
          <a href="/" style={{
            padding: '10px 16px',
            border: '1px solid #e4e4e7',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#71717a',
            textDecoration: 'none',
            textAlign: 'center'
          }}>
            Cancelar
          </a>
          <button 
            type="submit" 
            style={{
              padding: '10px 20px',
              backgroundColor: '#09090b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Guardar Bovino
          </button>
        </div>

      </form>
    </div>
  )
}