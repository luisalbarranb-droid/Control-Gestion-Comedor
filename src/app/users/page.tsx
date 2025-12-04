
// src/app/users/page.tsx
export default function UsersPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e40af' }}>
        ✅ ¡GESTIÓN DE USUARIOS FUNCIONANDO!
      </h1>
      
      <div style={{ 
        background: '#d1fae5', 
        border: '2px solid #10b981',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#065f46', marginBottom: '0.5rem' }}>
          ¡Éxito! El menú ahora está visible
        </h2>
        <p style={{ color: '#065f46' }}>
          Has resuelto el problema. El módulo de Gestión de Usuarios ya aparece en el menú lateral.
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontWeight: 'semibold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Usuarios Totales</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>5</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Usuarios registrados</p>
        </div>
        
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontWeight: 'semibold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Activos</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>4</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Usuarios activos</p>
        </div>
        
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontWeight: 'semibold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Roles</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>3</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Diferentes roles</p>
        </div>
      </div>
    </div>
  );
}
