# 🚀 Guía Rápida - 5 Minutos

## ✅ ¿Qué se ha hecho?

Se ha creado **`PartidaCard`**, un componente unificado que soluciona todos los problemas:

| Problema                | ✅ Solucionado |
| ----------------------- | -------------- |
| Tarjetas duplicadas     | Sí             |
| Imágenes no se muestran | Sí             |
| Diseño inconsistente    | Sí             |
| Preparado para API      | Sí             |

### 💡 Interacción con las Tarjetas

**Importante:** Las tarjetas usan **doble click** para navegar a los detalles:

- ✅ **Un click**: Permite arrastrar el carrusel sin abrir la partida
- ✅ **Doble click**: Navega a la vista de detalles de la partida
- ✅ **Botón "Ver más detalles"**: Un solo click lleva directamente a detalles

## 🎯 Uso en 3 Pasos

### Paso 1: Definir tus datos

```typescript
import PartidaCard, { Partida } from "./components/PartidaCard";

const partida: Partida = {
  id: 1, // ID único
  titulo: "La Cripta del Lich", // Título
  masterName: "Master Darius", // Nombre del Master
  sistemaJuego: "D&D 5e", // Sistema de juego
  imagenUrl: "/tu-imagen.png", // Ruta de la imagen
  tipoPartida: "digital", // digital | presencial | online
  rating: 4, // 0 a 5
  fecha: "28 Oct 2025", // Opcional
  descripcion: "Una aventura épica...", // Opcional
};
```

### Paso 2: Renderizar el componente

```typescript
<PartidaCard partida={partida} />
```

### Paso 3: ¡Listo!

Ya tienes tu tarjeta funcionando sin duplicados, con imagen y diseño unificado.

## 📍 Dónde está el código

### Componentes ya actualizados y funcionando:

**1. Partidas Digitales Destacadas**

```
src/components/UpcomingGamesCarousel.tsx
```

Líneas 10-71: Datos de ejemplo hardcodeados  
Líneas 127-133: Renderizado con el nuevo componente

**2. Próximas Partidas**

```
src/components/NextGames.tsx
```

Líneas 10-55: Datos de ejemplo hardcodeados  
Líneas 131-137: Renderizado con el nuevo componente

### Componente principal:

```
src/components/PartidaCard.tsx
```

El componente unificado - 200 líneas de código limpio

## 🔧 Personalizar los Datos

### Cambiar datos de "Partidas Digitales Destacadas"

Edita `src/components/UpcomingGamesCarousel.tsx`:

```typescript
// Línea 10 - Cambia estos datos
const partidasDestacadas: Partida[] = [
  {
    id: 1,
    titulo: "TU TÍTULO AQUÍ", // ← Cambia esto
    masterName: "TU MASTER AQUÍ", // ← Cambia esto
    sistemaJuego: "TU SISTEMA AQUÍ", // ← Cambia esto
    imagenUrl: "/TU-IMAGEN.png", // ← Cambia esto
    tipoPartida: "digital", // ← digital/presencial/online
    rating: 4, // ← 0 a 5
    descripcion: "Tu descripción...", // ← Cambia esto
  },
  // ... añade más partidas
];
```

### Cambiar datos de "Próximas Partidas"

Edita `src/components/NextGames.tsx`:

```typescript
// Línea 10 - Cambia estos datos
const proximasPartidas: Partida[] = [
  {
    id: 7,
    titulo: "TU TÍTULO AQUÍ",
    masterName: "TU MASTER AQUÍ",
    sistemaJuego: "TU SISTEMA AQUÍ",
    fecha: "28 Octubre 2025", // ← Añade fecha
    imagenUrl: "/TU-IMAGEN.png",
    tipoPartida: "presencial",
    rating: 5,
  },
  // ... añade más partidas
];
```

## 🎨 Props del Componente

```typescript
<PartidaCard
  partida={miPartida} // REQUERIDO
  mostrarDescripcion={true} // OPCIONAL (default: false)
  onClick={() => {}} // OPCIONAL (navegación custom)
  className="mi-clase" // OPCIONAL (CSS adicional)
/>
```

### Ejemplos de uso:

**Sin descripción (default):**

```typescript
<PartidaCard partida={partida} />
```

**Con descripción:**

```typescript
<PartidaCard partida={partida} mostrarDescripcion={true} />
```

**Con navegación personalizada:**

```typescript
<PartidaCard partida={partida} onClick={() => console.log("Click!")} />
```

## 🌐 Preparado para API

Cuando tengas tu API lista, usa los hooks:

```typescript
import { usePartidasDestacadas } from "../hooks/usePartidas";

const MiComponente = () => {
  const { partidas, loading, error } = usePartidasDestacadas(6);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {partidas.map((partida) => (
        <PartidaCard key={partida.id} partida={partida} />
      ))}
    </div>
  );
};
```

Todo el código está listo en:

- `src/services/partidasService.ts` - Servicio API
- `src/hooks/usePartidas.ts` - Hooks React
- `src/components/*.FUTURE_API.tsx` - Ejemplos completos

## 📱 Tipos de Partida

El badge se adapta automáticamente:

```typescript
tipoPartida: "digital"; // → Badge amarillo "Digital"
tipoPartida: "presencial"; // → Badge amarillo "Presencial"
tipoPartida: "online"; // → Badge amarillo "Online"
```

## ⭐ Rating

Muestra estrellas automáticamente:

```typescript
rating: 0; // → ☆☆☆☆☆
rating: 1; // → ★☆☆☆☆
rating: 2; // → ★★☆☆☆
rating: 3; // → ★★★☆☆
rating: 4; // → ★★★★☆
rating: 5; // → ★★★★★
```

## 🖼️ Imágenes

Las imágenes deben estar en la carpeta `public/`:

```
public/
├── cedericvandenberghe21dp3hytvhwunsplash-1@2x.png
├── konradkollerlctjo2d9-2cunsplash-1@2x.png
└── tu-imagen.png  ← Añade aquí
```

Luego usa en el componente:

```typescript
imagenUrl: "/tu-imagen.png";
```

## 🎯 Crear Nueva Partida

```typescript
const nuevaPartida: Partida = {
  id: 11, // ID único (siguiente número)
  titulo: "Mi Nueva Partida",
  masterName: "Master Nuevo",
  sistemaJuego: "Pathfinder",
  imagenUrl: "/nueva-imagen.png",
  tipoPartida: "presencial",
  rating: 4,
  fecha: "15 Noviembre 2025", // Opcional
  descripcion: "Una aventura increíble...", // Opcional
};

// Agrégala al array en UpcomingGamesCarousel.tsx o NextGames.tsx
const partidasDestacadas: Partida[] = [
  // ... partidas existentes
  nuevaPartida, // ← Añade aquí
];
```

## ✅ Verificar que Funciona

1. Ejecuta el proyecto:

```bash
npm start
```

2. Abre el navegador en `http://localhost:3000`

3. Navega a la sección "Partidas digitales destacadas"

4. Deberías ver:
   - ✅ 6 tarjetas sin duplicados
   - ✅ Imágenes mostradas correctamente
   - ✅ Badges de "Digital" en la esquina
   - ✅ Ratings con estrellas
   - ✅ Diseño unificado y moderno
   - ✅ Puedes arrastrar las tarjetas sin problemas
   - ✅ Doble click en una tarjeta lleva a los detalles
   - ✅ Click en el botón "Ver más detalles" también lleva a los detalles

## 📚 Más Información

Para detalles completos, revisa:

- `LEEME.md` - Resumen completo
- `src/components/README_PARTIDA_CARD.md` - Documentación del componente
- `MIGRATION_GUIDE.md` - Guía de migración
- `RESUMEN_CAMBIOS.md` - Análisis detallado

## 🆘 Solución de Problemas

### Las imágenes no se muestran

- Verifica que la imagen esté en `public/`
- Verifica que la ruta empiece con `/`
- Ejemplo: `imagenUrl: "/mi-imagen.png"`

### Las tarjetas se ven duplicadas

- Asegúrate de que cada partida tenga un `id` único
- Verifica que estés usando `key={partida.id}` en el map

### El rating no se muestra

- Verifica que `rating` sea un número entre 0 y 5
- No uses strings, solo números: `rating: 4` ✅, `rating: "4"` ❌

### Errores de TypeScript

- Asegúrate de que el objeto cumpla con la interface `Partida`
- Todos los campos requeridos deben estar presentes
- Usa el autocompletado del IDE para ayudarte

---

**¡Listo!** Ya puedes usar el nuevo sistema de tarjetas unificado. 🎉

**Próximo paso:** Conectar con tu API cuando esté lista.
