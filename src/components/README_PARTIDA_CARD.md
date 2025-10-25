# PartidaCard - Componente Unificado de Tarjeta de Partida

## Descripción

`PartidaCard` es un componente React unificado y reutilizable para mostrar información de partidas de rol. Este componente reemplaza a `CardDigital` y consolida la funcionalidad de visualización de partidas en un solo lugar.

## Características

✅ **Unificado**: Un solo componente para todas las tarjetas de partidas  
✅ **TypeScript**: Completamente tipado con interfaces claras  
✅ **Preparado para API**: Diseñado para recibir datos de una API REST  
✅ **Accesible**: Incluye atributos ARIA y soporte de teclado  
✅ **Responsive**: Se adapta a diferentes tamaños de pantalla  
✅ **Configurable**: Props para controlar qué mostrar y cómo  
✅ **Navegación con doble click**: Requiere doble click para ir a detalles (no interfiere con arrastre)

## Tipos de Datos

### Interface `Partida`

```typescript
interface Partida {
  id: string | number; // ID único de la partida
  titulo: string; // Título de la partida (máx 60 caracteres, 2 líneas)
  masterName: string; // Nombre del Master/DM (máx 40 caracteres, 1 línea)
  sistemaJuego: string; // Sistema de juego (máx 30 caracteres, 1 línea)
  fecha?: string; // Fecha (opcional, máx 20 caracteres)
  descripcion?: string; // Descripción (opcional, máx 150 caracteres, 2 líneas)
  imagenUrl: string; // URL de la imagen de portada
  tipoPartida: TipoPartida; // "digital" | "presencial" | "online"
  rating: number; // Rating de 0 a 5 (entero)
}
```

### ⚠️ Limitaciones Importantes

Para garantizar que todas las tarjetas tengan el mismo tamaño y un diseño consistente:

| Campo          | Límite         | Comportamiento                                                                       |
| -------------- | -------------- | ------------------------------------------------------------------------------------ |
| `titulo`       | 60 caracteres  | Se muestra en máximo 2 líneas. El exceso se trunca con "..."                         |
| `masterName`   | 40 caracteres  | Se muestra en 1 línea. El exceso se trunca con "..."                                 |
| `sistemaJuego` | 30 caracteres  | Se muestra en 1 línea. El exceso se trunca con "..."                                 |
| `fecha`        | 20 caracteres  | Se muestra en 1 línea. El exceso se trunca                                           |
| `descripcion`  | 150 caracteres | Se muestra en 2 líneas (si `mostrarDescripcion=true`). El exceso se trunca con "..." |
| `rating`       | 0 a 5          | Debe ser un número entero                                                            |

**📋 Ver especificaciones completas:** `ESPECIFICACIONES_API_BACKEND.md`

### Type `TipoPartida`

```typescript
type TipoPartida = "digital" | "presencial" | "online";
```

## Uso Básico

```tsx
import PartidaCard from "./components/PartidaCard";

const MiComponente = () => {
  const partida = {
    id: 1,
    titulo: "La Cripta del Lich",
    masterName: "Master Darius",
    sistemaJuego: "D&D 5e",
    imagenUrl: "/imagenes/cripta.png",
    tipoPartida: "digital",
    rating: 4,
  };

  return <PartidaCard partida={partida} />;
};
```

## Props

| Prop                 | Tipo         | Default     | Descripción                          |
| -------------------- | ------------ | ----------- | ------------------------------------ |
| `partida`            | `Partida`    | _requerido_ | Objeto con los datos de la partida   |
| `mostrarDescripcion` | `boolean`    | `false`     | Muestra u oculta la descripción      |
| `onClick`            | `() => void` | `undefined` | Callback personalizado al hacer clic |
| `className`          | `string`     | `""`        | Clases CSS adicionales               |

## Integración con API (Futuro)

### Ejemplo con fetch

```typescript
import { useState, useEffect } from "react";
import PartidaCard, { Partida } from "./components/PartidaCard";

const ListaPartidas = () => {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartidas = async () => {
      try {
        const response = await fetch(
          "https://api.fantasy-experience.com/partidas"
        );
        const data = await response.json();
        setPartidas(data);
      } catch (error) {
        console.error("Error al cargar partidas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartidas();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="flex flex-row gap-4">
      {partidas.map((partida) => (
        <PartidaCard
          key={partida.id}
          partida={partida}
          mostrarDescripcion={true}
        />
      ))}
    </div>
  );
};
```

### Ejemplo con React Query

```typescript
import { useQuery } from "@tanstack/react-query";
import PartidaCard, { Partida } from "./components/PartidaCard";

const fetchPartidas = async (): Promise<Partida[]> => {
  const response = await fetch("https://api.fantasy-experience.com/partidas");
  if (!response.ok) throw new Error("Error al cargar partidas");
  return response.json();
};

const ListaPartidas = () => {
  const {
    data: partidas,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["partidas"],
    queryFn: fetchPartidas,
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-row gap-4">
      {partidas?.map((partida) => (
        <PartidaCard
          key={partida.id}
          partida={partida}
          mostrarDescripcion={true}
        />
      ))}
    </div>
  );
};
```

### Ejemplo con filtrado y búsqueda

```typescript
const PartidaFilter = () => {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState<TipoPartida | "todas">("todas");

  useEffect(() => {
    const fetchPartidas = async () => {
      const url =
        tipoFiltro === "todas"
          ? "https://api.fantasy-experience.com/partidas"
          : `https://api.fantasy-experience.com/partidas?tipo=${tipoFiltro}`;

      const response = await fetch(url);
      const data = await response.json();
      setPartidas(data);
    };

    fetchPartidas();
  }, [tipoFiltro]);

  return (
    <div>
      {/* Filtros */}
      <div className="mb-4">
        <button onClick={() => setTipoFiltro("todas")}>Todas</button>
        <button onClick={() => setTipoFiltro("digital")}>Digital</button>
        <button onClick={() => setTipoFiltro("presencial")}>Presencial</button>
        <button onClick={() => setTipoFiltro("online")}>Online</button>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-3 gap-4">
        {partidas.map((partida) => (
          <PartidaCard key={partida.id} partida={partida} />
        ))}
      </div>
    </div>
  );
};
```

## Estructura de Respuesta de API Esperada

```json
{
  "partidas": [
    {
      "id": 1,
      "titulo": "La Cripta del Lich",
      "masterName": "Master Darius",
      "sistemaJuego": "D&D 5e",
      "fecha": "28 Octubre 2025",
      "descripcion": "Una aventura épica...",
      "imagenUrl": "https://cdn.fantasy-experience.com/imagenes/partida-1.jpg",
      "tipoPartida": "digital",
      "rating": 4
    },
    ...
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

## Componentes Relacionados

- `UpcomingGamesCarousel`: Muestra partidas digitales destacadas en un carrusel
- `NextGames`: Muestra las próximas partidas en un carrusel

## Notas de Migración

### Componentes reemplazados:

- ❌ `CardDigital` (obsoleto)
- ✅ `PartidaCard` (usar este)

### Ventajas del nuevo componente:

1. **Sin duplicaciones**: Key único basado en ID
2. **Imágenes funcionan correctamente**: backgroundImage con URL correcta
3. **Diseño unificado**: Un solo estilo consistente
4. **Mejor accesibilidad**: ARIA labels, soporte de teclado
5. **Preparado para escalar**: Fácil integrar con API

## Personalización

### Cambiar navegación al hacer doble click

**Importante:** La tarjeta requiere **doble click** para navegar. Esto evita interferencias con el arrastre del carrusel.

```tsx
<PartidaCard
  partida={partida}
  onClick={() => {
    // Tu lógica personalizada al hacer doble click
    console.log("Doble click en partida:", partida.id);
    navigate(`/mi-ruta-custom/${partida.id}`);
  }}
/>
```

**Nota:** También puedes usar el botón "Ver más detalles" que funciona con un solo click.

### Estilos personalizados

```tsx
<PartidaCard partida={partida} className="my-custom-class hover:shadow-2xl" />
```

## Soporte

Para dudas o mejoras, contacta al equipo de desarrollo.
