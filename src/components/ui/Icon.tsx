import {
  Cable,
  Wrench,
  Factory,
  Flame,
  Gauge,
  ShieldCheck,
  type LucideProps,
} from "lucide-react";

const icons = {
  pipe: Cable,
  wrench: Wrench,
  factory: Factory,
  flame: Flame,
  gauge: Gauge,
  shield: ShieldCheck,
} satisfies Record<string, React.ComponentType<LucideProps>>;

export type ServiceIcon = keyof typeof icons;

interface IconProps extends LucideProps {
  name: ServiceIcon;
}

export function Icon({ name, ...props }: IconProps) {
  const Component = icons[name];
  return <Component aria-hidden="true" {...props} />;
}
