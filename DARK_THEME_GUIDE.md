# Guía de Estilos Oscuros con Degradados

Este archivo documenta las nuevas clases CSS y colores oscuros disponibles en el proyecto.

## Clases de Degradado Disponibles

### Degradados de Fondo
- `bg-gradient-dark`: Degradado oscuro básico (azul oscuro a gris)
- `bg-gradient-midnight`: Degradado de medianoche (negro a azul profundo)
- `bg-gradient-charcoal`: Degradado carbón (grises oscuros)
- `bg-gradient-cosmic`: Degradado cósmico (colores vibrantes)
- `bg-gradient-radial`: Degradado radial desde el centro

### Clases de Componentes
- `card-gradient`: Para tarjetas con degradado sutil y backdrop blur
- `text-gradient`: Texto con degradado de colores
- `border-gradient`: Bordes con degradado

## Paleta de Colores Personalizados

### Slate (Tonos Pizarra)
- `slate-50` a `slate-900`: Tonos de azul-gris oscuro

### Charcoal (Tonos Carbón)
- `charcoal-50` a `charcoal-900`: Tonos de gris muy oscuro

### Midnight (Tonos Medianoche)
- `midnight-50` a `midnight-900`: Tonos de azul profundo a dorado

## Ejemplos de Uso

```jsx
// Tarjeta con degradado
<Card className="card-gradient border-gradient">
  <CardContent>
    <h2 className="text-gradient">Título con degradado</h2>
  </CardContent>
</Card>

// Fondo de página
<div className="min-h-screen bg-gradient-cosmic">
  {/* Contenido */}
</div>

// Botón con degradado
<Button className="bg-gradient-cosmic hover:opacity-90">
  Acción
</Button>
```

## Variables CSS Personalizadas

El tema oscuro utiliza variables CSS personalizadas que se pueden modificar en `globals.css`:

- `--background`: Color de fondo principal
- `--foreground`: Color de texto principal  
- `--card`: Color de fondo de tarjetas
- `--border`: Color de bordes
- `--muted-foreground`: Color de texto secundario

## Modo Oscuro por Defecto

El proyecto está configurado para usar el modo oscuro por defecto:
- `className="dark"` en el elemento `<html>`
- `defaultTheme="dark"` en el ThemeProvider
- Degradados aplicados automáticamente al body
