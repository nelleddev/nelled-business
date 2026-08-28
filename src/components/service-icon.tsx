"use client";

import dynamicIconImports from "lucide-react/dynamicIconImports";
import { DynamicIcon } from "lucide-react/dynamic";

export type ServiceIconName =
  keyof typeof dynamicIconImports;

export const SERVICE_ICON_NAMES =
  Object.keys(
    dynamicIconImports,
  ) as ServiceIconName[];

export function isValidServiceIconName(
  name?: string | null,
): name is ServiceIconName {
  if (!name) {
    return false;
  }

  return name in dynamicIconImports;
}

type ServiceIconProps = {
  name?: string | null;
  className?: string;
};

export function ServiceIcon({
  name,
  className,
}: ServiceIconProps) {
  if (!isValidServiceIconName(name)) {
    return null;
  }

  return (
    <DynamicIcon
      name={name}
      className={className}
      aria-hidden="true"
    />
  );
}