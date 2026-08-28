import {
  Briefcase,
  Columns3,
  Grid2X2,
  Hammer,
  House,
  Settings,
  Sparkles,
  Wrench,
} from "lucide-react";

export const SERVICE_ICON_OPTIONS = [
  { value: "briefcase", label: "Serviço" },
  { value: "grid", label: "Estrutura" },
  { value: "columns", label: "Divisória" },
  { value: "sparkles", label: "Acabamento" },
  { value: "wrench", label: "Reparo" },
  { value: "hammer", label: "Obra" },
  { value: "house", label: "Residencial" },
  { value: "settings", label: "Manutenção" },
] as const;

type ServiceIconProps = {
  name: string | null | undefined;
  className?: string;
};

export function ServiceIcon({
  name,
  className = "h-7 w-7 stroke-[1.6]",
}: ServiceIconProps) {
  const props = {
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "grid":
      return <Grid2X2 {...props} />;
    case "columns":
      return <Columns3 {...props} />;
    case "sparkles":
      return <Sparkles {...props} />;
    case "wrench":
      return <Wrench {...props} />;
    case "hammer":
      return <Hammer {...props} />;
    case "house":
      return <House {...props} />;
    case "settings":
      return <Settings {...props} />;
    case "briefcase":
      return <Briefcase {...props} />;
    default:
      return null;
  }
}
