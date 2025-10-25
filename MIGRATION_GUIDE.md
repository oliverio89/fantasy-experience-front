# Guía de Migración - Sistema Unificado de Tarjetas de Partidas

## 📋 Resumen de Cambios

Se ha creado un **componente unificado** (`PartidaCard`) que reemplaza y mejora los componentes antiguos de tarjetas de partidas. Este nuevo sistema soluciona los problemas de duplicación, imágenes que no se muestran y mejora la consistencia del diseño.

## ✅ Problemas Resueltos

| Problema                           | Solución                                      |
| ---------------------------------- | --------------------------------------------- |
| ❌ Tarjetas duplicadas             | ✅ Keys únicas basadas en ID                  |
| ❌ Imágenes no se muestran         | ✅ URLs de imagen correctamente configuradas  |
| ❌ Diseño inconsistente            | ✅ Componente unificado con diseño único      |
| ❌ Datos hardcodeados desordenados | ✅ Estructura preparada para API              |
| ❌ Difícil de mantener             | ✅ Un solo componente para todas las tarjetas |

## 🔄 Componentes Afectados

### ✅ YA ACTUALIZADOS (Usando PartidaCard)

- `src/components/UpcomingGamesCarousel.tsx` - Partidas digitales destacadas
- `src/components/NextGames.tsx` - Próximas partidas

### 🔜 PENDIENTES DE ACTUALIZAR

- `src/pages/NextGames.tsx` - Página de listado de partidas
- `src/pages/MasterDetail.tsx` - Partidas del master
- Cualquier otro componente que use `GameCard` o `CardDigital`

### ❌ OBSOLETOS (No usar más)

- `src/components/CardDigital.tsx` - Reemplazado por `PartidaCard`

## 📦 Nuevos Archivos Creados

```
src/
├── components/
│   ├── PartidaCard.tsx                          ← NUEVO componente unificado
│   ├── README_PARTIDA_CARD.md                   ← Documentación del componente
│   ├── UpcomingGamesCarousel.FUTURE_API.tsx     ← Ejemplo con API
│   └── NextGames.FUTURE_API.tsx                 ← Ejemplo con API
├── services/
│   └── partidasService.ts                       ← Servicio para llamadas API
├── hooks/
│   └── usePartidas.ts                           ← Hooks personalizados
└── MIGRATION_GUIDE.md                           ← Esta guía
```

## 🚀 Cómo Usar el Nuevo Componente

### Uso Básico

```typescript
import PartidaCard, { Partida } from "./components/PartidaCard";

const partida: Partida = {
  id: 1,
  titulo: "La Cripta del Lich",
  masterName: "Master Darius",
  sistemaJuego: "D&D 5e",
  imagenUrl: "/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png",
  tipoPartida: "digital",
  rating: 4,
  descripcion: "Una aventura épica...",
};

// Renderizar la tarjeta
<PartidaCard partida={partida} />;
```

### Con Descripción

```typescript
<PartidaCard partida={partida} mostrarDescripcion={true} />
```

### En un Loop

```typescript
const partidas: Partida[] = [...]; // Array de partidas

return (
  <div className="flex flex-row gap-4">
    {partidas.map((partida) => (
      <PartidaCard
        key={partida.id}
        partida={partida}
      />
    ))}
  </div>
);
```

## 🔧 Migración Paso a Paso

### Para Componentes Existentes

#### Antes (con CardDigital):

```typescript
import CardDigital from "./CardDigital";

// ...

{
  [...Array(6)].map((_, index) => (
    <CardDigital propBackgroundImage="url('/imagen.png')" star1="/star-1.svg" />
  ));
}
```

#### Después (con PartidaCard):

```typescript
import PartidaCard, { Partida } from "./PartidaCard";

const partidas: Partida[] = [
  {
    id: 1,
    titulo: "La Cripta del Lich",
    masterName: "Master Darius",
    sistemaJuego: "D&D 5e",
    imagenUrl: "/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png",
    tipoPartida: "digital",
    rating: 4,
  },
  // ... más partidas
];

// ...

{
  partidas.map((partida) => <PartidaCard key={partida.id} partida={partida} />);
}
```

## 🌐 Integración con API (Futuro)

### Opción 1: Usando Hooks Personalizados

```typescript
import { usePartidasDestacadas } from "../hooks/usePartidas";
import PartidaCard from "./PartidaCard";

const MiComponente = () => {
  const { partidas, loading, error } = usePartidasDestacadas(6);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-row gap-4">
      {partidas.map((partida) => (
        <PartidaCard key={partida.id} partida={partida} />
      ))}
    </div>
  );
};
```

### Opción 2: Usando el Servicio Directamente

```typescript
import { useEffect, useState } from "react";
import PartidasService from "../services/partidasService";
import PartidaCard, { Partida } from "./PartidaCard";

const MiComponente = () => {
  const [partidas, setPartidas] = useState<Partida[]>([]);

  useEffect(() => {
    const cargarPartidas = async () => {
      const data = await PartidasService.obtenerPartidasDestacadas(6);
      setPartidas(data);
    };
    cargarPartidas();
  }, []);

  return (
    <div className="flex flex-row gap-4">
      {partidas.map((partida) => (
        <PartidaCard key={partida.id} partida={partida} />
      ))}
    </div>
  );
};
```

## 📝 Checklist de Migración

Para migrar un componente existente:

- [ ] Importar `PartidaCard` y el tipo `Partida`
- [ ] Crear un array de objetos `Partida` con los datos hardcodeados
- [ ] Reemplazar `CardDigital` o `GameCard` por `PartidaCard`
- [ ] Asegurarse de pasar `key={partida.id}` en el loop
- [ ] Verificar que las imágenes se muestran correctamente
- [ ] Probar la navegación al hacer clic
- [ ] Verificar el diseño responsive

## 🔮 Próximos Pasos

1. **Fase 1** (COMPLETADO ✅)

   - Crear componente unificado `PartidaCard`
   - Actualizar `UpcomingGamesCarousel` y `NextGames`
   - Crear servicio y hooks para API

2. **Fase 2** (PENDIENTE)

   - Actualizar páginas que usan `GameCard`
   - Migrar todos los componentes a `PartidaCard`
   - Deprecar componentes antiguos

3. **Fase 3** (FUTURO)
   - Integrar con API real
   - Reemplazar datos hardcodeados con llamadas a API
   - Usar archivos `.FUTURE_API.tsx` como referencia

## 🆘 Soporte

Si tienes dudas durante la migración:

1. Revisa `src/components/README_PARTIDA_CARD.md` para documentación detallada
2. Mira los ejemplos en `UpcomingGamesCarousel.tsx` y `NextGames.tsx`
3. Consulta los archivos `.FUTURE_API.tsx` para ver cómo integrar con API

## 📊 Comparación Visual

### Antes

```
[CardDigital] → Componente antiguo
├─ Imágenes rotas ❌
├─ Duplicaciones ❌
├─ Diseño inconsistente ❌
└─ Difícil de mantener ❌
```

### Después

```
[PartidaCard] → Componente nuevo unificado
├─ Imágenes funcionan ✅
├─ Keys únicas ✅
├─ Diseño consistente ✅
├─ Fácil de mantener ✅
└─ Preparado para API ✅
```

## 💡 Consejos

1. **No mezclar componentes antiguos con nuevos** en la misma página
2. **Usar siempre el tipo `Partida`** para mantener consistencia
3. **Pasar props completas** no omitir campos opcionales si tienes los datos
4. **Preparar datos en formato API** incluso si son hardcodeados
5. **Revisar la consola** para warnings sobre keys duplicadas

---

**Última actualización:** 25 de Octubre, 2025  
**Versión:** 1.1.0  
**Estado:** En Producción (Fase 1 completada)

**Changelog:**

- v1.1.0 - Tarjetas tamaño uniforme + Doble click + Especificaciones backend
- v1.0.0 - Sistema unificado inicial
