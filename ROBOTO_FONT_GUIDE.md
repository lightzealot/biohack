# Guía de Fuente Roboto

Este archivo documenta la implementación de la fuente Google Fonts Roboto en el proyecto.

## ✨ Implementación Realizada

### 1. **Configuración en Layout** (`layout.tsx`)
- Agregado link a Google Fonts en el head
- Establecida clase `font-roboto` en el body

### 2. **Configuración de Tailwind** (`tailwind.config.ts`)
- Agregada familia de fuentes Roboto
- Configurada como fuente sans por defecto

### 3. **Estilos Globales** (`globals.css`)
- Import de Google Fonts
- Configuración de font-family en body
- Clases de utilidad para diferentes pesos

## 🎨 Clases de Utilidad Disponibles

### Pesos de Fuente Roboto
- `.font-roboto-thin` - Font weight 100
- `.font-roboto-light` - Font weight 300  
- `.font-roboto-regular` - Font weight 400 (por defecto)
- `.font-roboto-medium` - Font weight 500
- `.font-roboto-bold` - Font weight 700
- `.font-roboto-black` - Font weight 900

### Clases Generales
- `.font-roboto` - Fuente Roboto con peso normal
- `.font-sans` - Roboto como fuente sans por defecto

## 📝 Ejemplos de Uso

```jsx
// Título principal
<h1 className="text-3xl font-roboto-bold text-gradient">
  DuoProfits
</h1>

// Subtítulo
<p className="text-blue-200 font-roboto-light">
  Presupuesto de pareja
</p>

// Texto normal
<span className="font-roboto-regular">
  Contenido regular
</span>

// Botones
<button className="font-roboto-medium">
  Acción
</button>

// Títulos de sección
<h2 className="font-roboto-medium text-lg">
  Sección
</h2>
```

## 🔧 Configuración Técnica

### Google Fonts URL
```
https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap
```

### Tailwind Config
```js
fontFamily: {
  'roboto': ['Roboto', 'sans-serif'],
  'sans': ['Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
}
```

### CSS Base
```css
font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

## ✅ Beneficios

1. **Legibilidad mejorada** - Roboto es optimizada para pantallas
2. **Consistencia** - Fuente unificada en toda la aplicación  
3. **Múltiples pesos** - Jerarquía visual clara
4. **Optimización** - Carga eficiente con display=swap
5. **Accesibilidad** - Excelente legibilidad en temas oscuros

La fuente Roboto ahora está completamente integrada en el proyecto con soporte para todos los pesos y estilos, mejorando significativamente la tipografía de la aplicación.
