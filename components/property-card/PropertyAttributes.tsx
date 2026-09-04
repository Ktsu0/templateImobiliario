import { BedIcon, SuiteIcon, AreaIcon, ParkingIcon } from "@/components/ui/icons";
import { formatCount } from "@/lib/format-attributes";
import type { Property } from "@/lib/content/types";

interface PropertyAttributesProps {
  property: Property;
  size?: "compact" | "roomy";
}

export function PropertyAttributes({ property, size = "compact" }: PropertyAttributesProps) {
  const items = [
    { Icon: BedIcon, label: formatCount(property.bedrooms, "quarto", "quartos") },
    { Icon: SuiteIcon, label: formatCount(property.suites, "suíte", "suítes") },
    { Icon: AreaIcon, label: `${property.area} m²` },
    { Icon: ParkingIcon, label: formatCount(property.parkingSpots, "vaga", "vagas") },
  ];

  const textClass = size === "roomy" ? "text-sm" : "text-xs";
  const iconClass = size === "roomy" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <ul className={`flex flex-wrap gap-x-2 gap-y-1.5 font-body ${textClass} text-sand/85`}>
      {items.map(({ Icon, label }) => (
        <li
          key={label}
          className="flex items-center gap-1.5 rounded-full bg-ivory/5 px-2.5 py-1 ring-1 ring-ivory/10"
        >
          <Icon className={`${iconClass} shrink-0 text-brassLight`} />
          {label}
        </li>
      ))}
    </ul>
  );
}
