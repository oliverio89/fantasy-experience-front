# 📋 Especificaciones de API y Backend - Sistema de Partidas

## 🎯 Objetivo

Este documento define las especificaciones, validaciones y limitaciones que debe implementar el backend para garantizar que las tarjetas de partidas se muestren correctamente en el frontend.

---

## 📏 Limitaciones de Caracteres

Para mantener un diseño consistente y evitar que las tarjetas tengan diferentes tamaños, se deben aplicar las siguientes limitaciones de caracteres:

### Campos de la Interface `Partida`

| Campo            | Límite Caracteres | Líneas Máx | Obligatorio | Notas                                                                   |
| ---------------- | ----------------- | ---------- | ----------- | ----------------------------------------------------------------------- |
| **titulo**       | 60 caracteres     | 2 líneas   | ✅ Sí       | El título se muestra en 2 líneas máximo. Si excede, se trunca con "..." |
| **masterName**   | 40 caracteres     | 1 línea    | ✅ Sí       | Nombre del Master. Se trunca si es muy largo                            |
| **sistemaJuego** | 30 caracteres     | 1 línea    | ✅ Sí       | Nombre del sistema de juego (ej: "D&D 5e", "Call of Cthulhu")           |
| **fecha**        | 20 caracteres     | 1 línea    | ❌ No       | Formato recomendado: "DD Mes YYYY" (ej: "28 Octubre 2025")              |
| **descripcion**  | 150 caracteres    | 2 líneas   | ❌ No       | Solo se muestra si `mostrarDescripcion=true`. Se trunca con "..."       |
| **imagenUrl**    | 500 caracteres    | -          | ✅ Sí       | URL completa de la imagen                                               |
| **tipoPartida**  | -                 | -          | ✅ Sí       | Enum: "digital" \| "presencial" \| "online"                             |
| **rating**       | -                 | -          | ✅ Sí       | Número entero de 0 a 5                                                  |
| **id**           | -                 | -          | ✅ Sí       | ID único (string o number)                                              |

---

## 🔒 Validaciones Requeridas en el Backend

### Validación del Título

```javascript
// Ejemplo en Node.js/Express con Joi
const partidaSchema = Joi.object({
  titulo: Joi.string().trim().min(3).max(60).required().messages({
    "string.max": "El título no puede exceder los 60 caracteres",
    "string.min": "El título debe tener al menos 3 caracteres",
    "any.required": "El título es obligatorio",
  }),

  masterName: Joi.string().trim().min(2).max(40).required().messages({
    "string.max": "El nombre del Master no puede exceder los 40 caracteres",
  }),

  sistemaJuego: Joi.string().trim().max(30).required().messages({
    "string.max": "El sistema de juego no puede exceder los 30 caracteres",
  }),

  fecha: Joi.string().trim().max(20).optional().allow(null, ""),

  descripcion: Joi.string().trim().max(150).optional().allow(null, ""),

  imagenUrl: Joi.string().uri().max(500).required(),

  tipoPartida: Joi.string().valid("digital", "presencial", "online").required(),

  rating: Joi.number().integer().min(0).max(5).required(),
});
```

---

## 📐 Dimensiones de las Tarjetas (Frontend)

Para referencia del backend, estas son las dimensiones finales de las tarjetas:

- **Ancho:** 360px (fijo)
- **Alto mínimo:** 520px (garantiza uniformidad)
- **Imagen de portada:** 360px x 240px
- **Área de contenido:** ~180px de alto mínimo
- **Botón:** ~40px de alto

---

## 🎨 Recomendaciones para Imágenes

| Aspecto                      | Especificación         |
| ---------------------------- | ---------------------- |
| **Ratio recomendado**        | 3:2 (ancho:alto)       |
| **Dimensiones mínimas**      | 720px x 480px          |
| **Dimensiones recomendadas** | 1080px x 720px         |
| **Peso máximo**              | 500KB                  |
| **Formatos aceptados**       | JPG, PNG, WebP         |
| **Orientación**              | Horizontal (landscape) |

### Procesamiento de Imágenes

Se recomienda que el backend:

1. ✅ Redimensione imágenes automáticamente a 1080x720px
2. ✅ Comprima imágenes para optimizar carga
3. ✅ Genere versiones responsive (@2x, @3x)
4. ✅ Valide que las imágenes no sean demasiado pesadas

---

## 🔢 Formato de Datos Recomendados

### Formato de Fecha

**Recomendado:**

```
"28 Octubre 2025"
"30 Oct 2025"
"1 Noviembre 2025"
```

**No recomendado:**

```
"2025-10-28" (muy técnico)
"Sábado 28 de Octubre de 2025" (muy largo, excederá el límite)
```

### Formato de Rating

```json
{
  "rating": 4 // Entero de 0 a 5
}
```

**Validación:**

- Debe ser un número entero
- Rango permitido: 0-5
- No usar decimales (4.5 ❌)

---

## 📤 Estructura de Respuesta de la API

### GET /api/partidas

```json
{
  "success": true,
  "data": {
    "partidas": [
      {
        "id": "uuid-1234-5678",
        "titulo": "La Cripta del Lich",
        "masterName": "Master Darius",
        "sistemaJuego": "D&D 5e",
        "fecha": "28 Octubre 2025",
        "descripcion": "Una aventura épica en las profundidades de una cripta maldita. Los héroes deberán enfrentar hordas de no-muertos.",
        "imagenUrl": "https://cdn.ejemplo.com/partidas/1234.jpg",
        "tipoPartida": "digital",
        "rating": 4,
        "createdAt": "2025-10-20T10:00:00Z",
        "updatedAt": "2025-10-25T15:30:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

### POST /api/partidas (Crear)

**Request Body:**

```json
{
  "titulo": "Mi Nueva Partida",
  "masterName": "Master Juan",
  "sistemaJuego": "Pathfinder 2e",
  "fecha": "15 Noviembre 2025",
  "descripcion": "Una aventura inolvidable en tierras lejanas.",
  "imagenUrl": "https://cdn.ejemplo.com/imagen.jpg",
  "tipoPartida": "presencial",
  "rating": 5
}
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-9876-5432",
    "titulo": "Mi Nueva Partida",
    // ... resto de campos
    "createdAt": "2025-10-25T20:00:00Z"
  },
  "message": "Partida creada exitosamente"
}
```

**Response (Error - Validación):**

```json
{
  "success": false,
  "errors": [
    {
      "field": "titulo",
      "message": "El título no puede exceder los 60 caracteres",
      "value": "Este es un título extremadamente largo que definitivamente excede el límite permitido de caracteres"
    }
  ]
}
```

---

## ⚠️ Casos de Error a Manejar

### 1. Título Demasiado Largo

```json
{
  "error": "VALIDATION_ERROR",
  "field": "titulo",
  "message": "El título excede el máximo de 60 caracteres",
  "maxLength": 60,
  "currentLength": 75
}
```

### 2. Rating Fuera de Rango

```json
{
  "error": "VALIDATION_ERROR",
  "field": "rating",
  "message": "El rating debe estar entre 0 y 5",
  "value": 7
}
```

### 3. Tipo de Partida Inválido

```json
{
  "error": "VALIDATION_ERROR",
  "field": "tipoPartida",
  "message": "El tipo de partida debe ser 'digital', 'presencial' u 'online'",
  "value": "hibrida",
  "allowedValues": ["digital", "presencial", "online"]
}
```

### 4. Imagen No Válida

```json
{
  "error": "VALIDATION_ERROR",
  "field": "imagenUrl",
  "message": "La URL de la imagen no es válida o la imagen es demasiado grande",
  "maxSize": "500KB"
}
```

---

## 🔐 Autenticación y Permisos

### Endpoints Públicos (Solo Lectura)

- `GET /api/partidas` - Listar partidas
- `GET /api/partidas/:id` - Ver detalle de partida
- `GET /api/partidas/destacadas` - Partidas destacadas
- `GET /api/partidas/proximas` - Próximas partidas

### Endpoints Protegidos (Requieren Auth)

- `POST /api/partidas` - Crear partida (Solo Masters)
- `PATCH /api/partidas/:id` - Actualizar partida (Solo el Master creador)
- `DELETE /api/partidas/:id` - Eliminar partida (Solo el Master creador o Admin)

---

## 🧪 Casos de Prueba Recomendados

### Test 1: Validar Límite de Caracteres en Título

```javascript
describe("POST /api/partidas", () => {
  it("debería rechazar títulos mayores a 60 caracteres", async () => {
    const partida = {
      titulo: "A".repeat(61), // 61 caracteres
      // ... resto de campos válidos
    };

    const response = await request(app).post("/api/partidas").send(partida);

    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe("titulo");
  });
});
```

### Test 2: Validar Rating

```javascript
it("debería rechazar ratings fuera del rango 0-5", async () => {
  const partida = {
    // ... campos válidos
    rating: 6,
  };

  const response = await request(app).post("/api/partidas").send(partida);

  expect(response.status).toBe(400);
  expect(response.body.errors[0].field).toBe("rating");
});
```

### Test 3: Truncamiento Automático (Opcional)

```javascript
it("debería truncar automáticamente los campos que excedan el límite", async () => {
  const partida = {
    titulo: "A".repeat(80),
    // ... resto de campos
  };

  const response = await request(app).post("/api/partidas").send(partida);

  expect(response.status).toBe(201);
  expect(response.body.data.titulo.length).toBeLessThanOrEqual(60);
});
```

---

## 📊 Base de Datos - Esquema Recomendado

### Mongoose (MongoDB)

```javascript
const partidaSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      minlength: [3, "El título debe tener al menos 3 caracteres"],
      maxlength: [60, "El título no puede exceder los 60 caracteres"],
    },
    masterName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [
        40,
        "El nombre del Master no puede exceder los 40 caracteres",
      ],
    },
    sistemaJuego: {
      type: String,
      required: true,
      trim: true,
      maxlength: [30, "El sistema de juego no puede exceder los 30 caracteres"],
    },
    fecha: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [150, "La descripción no puede exceder los 150 caracteres"],
    },
    imagenUrl: {
      type: String,
      required: true,
      maxlength: 500,
    },
    tipoPartida: {
      type: String,
      required: true,
      enum: {
        values: ["digital", "presencial", "online"],
        message: "{VALUE} no es un tipo de partida válido",
      },
    },
    rating: {
      type: Number,
      required: true,
      min: [0, "El rating mínimo es 0"],
      max: [5, "El rating máximo es 5"],
      validate: {
        validator: Number.isInteger,
        message: "El rating debe ser un número entero",
      },
    },
  },
  {
    timestamps: true,
  }
);
```

### Sequelize (PostgreSQL/MySQL)

```javascript
const Partida = sequelize.define("Partida", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  titulo: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: {
        args: [3, 60],
        msg: "El título debe tener entre 3 y 60 caracteres",
      },
    },
  },
  masterName: {
    type: DataTypes.STRING(40),
    allowNull: false,
  },
  sistemaJuego: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  fecha: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  descripcion: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  imagenUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  tipoPartida: {
    type: DataTypes.ENUM("digital", "presencial", "online"),
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 5,
      isInt: true,
    },
  },
});
```

---

## 🎯 Resumen de Implementación

### Checklist para el Backend

- [ ] Validar longitud máxima de todos los campos de texto
- [ ] Validar que rating esté en rango 0-5 y sea entero
- [ ] Validar que tipoPartida sea uno de los 3 valores permitidos
- [ ] Validar formato y tamaño de imágenes
- [ ] Implementar mensajes de error claros y descriptivos
- [ ] Agregar tests para validaciones
- [ ] Implementar paginación en listados
- [ ] Optimizar y comprimir imágenes automáticamente
- [ ] Documentar la API con Swagger/OpenAPI
- [ ] Implementar rate limiting para prevenir spam

---

## 📞 Contacto

Para dudas sobre estas especificaciones o ajustes necesarios, contactar al equipo de frontend.

**Última actualización:** 25 de Octubre, 2025  
**Versión:** 1.0.0  
**Estado:** Especificaciones definidas

---

**Nota Importante:** Estas limitaciones están optimizadas para el diseño actual de las tarjetas. Cualquier cambio en el diseño del frontend puede requerir ajustes en estos límites.
