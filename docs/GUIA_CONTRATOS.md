# 📄 Módulo de Gestión de Contratos - Guía de Uso

## 🎯 Descripción

El módulo de **Gestión de Contratos** permite crear plantillas de contratos personalizables y generar contratos individuales para cada empleado de forma automática, llenando los campos con la información del trabajador.

## 🚀 Características Principales

### ✅ Subir Plantillas de Contratos
- Sube archivos HTML o TXT con tu modelo de contrato
- Detección automática de marcadores (placeholders)
- Soporte para múltiples tipos de contrato (Determinado, Indeterminado, Prueba)
- Vista previa del contenido antes de guardar

### ✅ Generar Contratos Individuales
- Selecciona una plantilla y un empleado
- Generación automática con datos del empleado
- Vista previa antes de guardar
- Descarga en formato HTML
- Historial de contratos generados

### ✅ Gestión de Contratos
- Visualización de todas las plantillas activas
- Historial completo de contratos generados
- Estados de contrato (Borrador, Firmado, Archivado)
- Eliminación de plantillas y contratos

## 📝 Marcadores Disponibles

Usa estos marcadores en tu plantilla HTML. Serán reemplazados automáticamente con los datos del empleado:

### Información Personal
- `{{nombre}}` - Nombre completo del empleado
- `{{nombres}}` - Nombres del empleado
- `{{apellidos}}` - Apellidos del empleado
- `{{cedula}}` - Cédula de identidad
- `{{rif}}` - RIF del empleado
- `{{direccion}}` - Dirección del empleado
- `{{telefono}}` - Teléfono del empleado
- `{{email}}` - Correo electrónico
- `{{fechaNacimiento}}` - Fecha de nacimiento
- `{{nacionalidad}}` - Nacionalidad
- `{{estadoCivil}}` - Estado civil
- `{{genero}}` - Género

### Información Laboral
- `{{cargo}}` - Cargo o posición
- `{{departamento}}` - Departamento
- `{{area}}` - Área de trabajo
- `{{fechaIngreso}}` - Fecha de ingreso
- `{{tipoContrato}}` - Tipo de contrato
- `{{diasContrato}}` - Días de duración del contrato
- `{{fechaFinContrato}}` - Fecha de finalización del contrato

### Información Bancaria
- `{{banco}}` - Nombre del banco
- `{{numeroCuenta}}` - Número de cuenta bancaria
- `{{tipoCuenta}}` - Tipo de cuenta bancaria

### Contacto de Emergencia
- `{{contactoEmergencia}}` - Nombre del contacto de emergencia
- `{{telefonoEmergencia}}` - Teléfono del contacto de emergencia
- `{{relacionEmergencia}}` - Relación con el contacto de emergencia

### Otros
- `{{fechaActual}}` - Fecha actual (al generar el contrato)

## 📋 Cómo Usar

### 1. Subir una Plantilla de Contrato

1. Ve a **RRHH y Asistencia** → **Gestión de Contratos**
2. Haz clic en **"Subir Plantilla"**
3. Completa la información:
   - **Nombre de la Plantilla**: Ej. "Contrato Laboral Estándar"
   - **Descripción**: Breve descripción de cuándo usar esta plantilla
   - **Tipo de Contrato**: Selecciona el tipo (Determinado, Indeterminado, Prueba)
4. Arrastra y suelta tu archivo HTML o TXT, o haz clic para seleccionarlo
5. Revisa los marcadores detectados automáticamente
6. Haz clic en **"Guardar Plantilla"**

### 2. Generar un Contrato Individual

1. Ve a **RRHH y Asistencia** → **Gestión de Contratos**
2. Haz clic en **"Generar Contrato"**
3. Selecciona:
   - **Plantilla de Contrato**: Elige la plantilla que deseas usar
   - **Empleado**: Selecciona el empleado para quien generar el contrato
4. Haz clic en **"Ver Vista Previa"** para revisar el contrato generado
5. Opciones:
   - **Descargar HTML**: Descarga el contrato en formato HTML
   - **Generar y Guardar**: Guarda el contrato en el sistema

### 3. Gestionar Contratos Generados

En la sección **"Contratos Generados"** puedes:
- Ver el historial de todos los contratos generados
- Descargar contratos en formato HTML
- Eliminar contratos antiguos
- Ver el estado de cada contrato (Borrador, Firmado, Archivado)

## 📄 Plantilla de Ejemplo

Se incluye una plantilla de ejemplo en: `docs/plantilla_contrato_ejemplo.html`

Esta plantilla incluye:
- Formato profesional con estilos CSS
- Todas las cláusulas estándar de un contrato laboral
- Uso de todos los marcadores disponibles
- Sección de firmas
- Resumen de datos del trabajador

## 💡 Consejos y Mejores Prácticas

### ✅ Crear Plantillas Efectivas

1. **Usa HTML para mejor formato**: Los archivos HTML permiten estilos, tablas y mejor presentación
2. **Resalta los campos dinámicos**: Usa colores o negritas para los marcadores
3. **Incluye toda la información legal**: Asegúrate de cumplir con las leyes laborales locales
4. **Prueba antes de usar**: Genera un contrato de prueba para verificar que todo se vea bien

### ✅ Mantener Datos de Empleados Actualizados

Para que los contratos se generen correctamente, asegúrate de que los empleados tengan:
- Información personal completa (nombre, cédula, dirección)
- Datos laborales (cargo, departamento, fecha de ingreso)
- Información bancaria (para cláusulas de pago)
- Contacto de emergencia

### ✅ Organización de Plantillas

- Crea plantillas diferentes para cada tipo de contrato
- Usa nombres descriptivos para las plantillas
- Agrega descripciones detalladas para saber cuándo usar cada una
- Mantén las plantillas actualizadas con cambios legales

## 🔒 Seguridad y Privacidad

- Solo usuarios con acceso al módulo de RRHH pueden ver y generar contratos
- Los contratos se almacenan de forma segura en Firebase
- Se registra quién generó cada contrato y cuándo
- Los datos personales están protegidos según las políticas de la empresa

## 🆘 Solución de Problemas

### Los marcadores no se reemplazan
- Verifica que los marcadores estén escritos exactamente como se indica (con dobles llaves)
- Asegúrate de que el empleado tenga los datos correspondientes en su perfil

### La plantilla no se guarda
- Verifica que el archivo sea HTML o TXT
- Asegúrate de completar todos los campos requeridos (nombre y tipo de contrato)
- Revisa la consola del navegador para errores

### El contrato se ve mal al descargar
- Usa HTML con estilos CSS inline para mejor compatibilidad
- Prueba abrir el HTML descargado en diferentes navegadores
- Considera usar herramientas de conversión a PDF para el archivo final

## 📞 Soporte

Para asistencia adicional o reportar problemas, contacta al administrador del sistema.

---

**Última actualización**: Febrero 2026
**Versión**: 1.0
