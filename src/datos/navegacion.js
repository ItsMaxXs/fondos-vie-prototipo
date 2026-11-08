// ============================================================
// Datos · menú lateral y nombres de bandeja
// NAV: opciones del menú y roles que las ven. NOMBRE_BANDEJA: título de la bandeja de cada rol.
// ERS: RF-USR-06, RF-USR-07.
// ============================================================
import {
  Archive,
  Bell,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileText,
  House,
  Settings,
} from "lucide-react";

// ---------- Navegación por rol ----------
export const NAV = [
  { to: "/inicio", label: "Inicio", icon: House, roles: "*" },
  {
    to: "/convocatorias",
    label: "Convocatorias",
    icon: CalendarDays,
    roles: ["vie_publicacion", "investigador", "admin"],
  },
  {
    to: "/propuestas",
    label: "Propuestas",
    icon: FileText,
    roles: ["investigador", "gestora_vie", "direccion_investigacion", "cie", "admin"],
  },
  {
    to: "/bandeja",
    label: "Bandeja",
    icon: ClipboardCheck,
    roles: [
      "vinculacion",
      "comite_asistente",
      "comite_evaluador",
      "consejo_asistente",
      "consejo",
      "direccion_escuela",
      "gestora_vie",
      "cie",
      "direccion_investigacion",
      "admin",
    ],
  },
  {
    to: "/morosidad",
    label: "Informes pendientes",
    icon: ClipboardList,
    roles: ["direccion_investigacion", "gestora_vie", "admin"],
  },
  { to: "/historico", label: "Histórico y reportes", icon: Archive, roles: "*" },
  { to: "/notificaciones", label: "Notificaciones", icon: Bell, roles: "*" },
  { to: "/administracion", label: "Administración", icon: Settings, roles: ["admin"] },
];

export const NOMBRE_BANDEJA = {
  vinculacion: "Dictámenes de PI",
  comite_asistente: "Revisión y evaluación",
  comite_evaluador: "Mis evaluaciones",
  consejo_asistente: "Avales del Consejo",
  consejo: "Votación y aval",
  direccion_escuela: "Comunicación del aval",
  gestora_vie: "Revisión de expedientes",
  cie: "Resoluciones del CIE",
  direccion_investigacion: "Dictamen y notificación",
  admin: "Bandeja transversal",
};
