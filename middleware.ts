// Middleware deshabilitado - La aplicación usa autenticación interna
// El sistema de login está en app/page.tsx

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Permitir acceso a todas las rutas - autenticación manejada por React
  return NextResponse.next();
}

// Comentado para deshabilitar la autenticación HTTP Basic
// export const config = {
//   matcher: "/:path*",
// };