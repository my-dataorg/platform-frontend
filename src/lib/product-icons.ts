import {
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  Heart,
  MessageCircle,
  PartyPopper,
  Receipt,
  Briefcase,
  Spade,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  education: GraduationCap,
  social: Users,
  "poker-world": Spade,
  business: Briefcase,
  analytics: BarChart3,
  calendar: Calendar,
  messaging: MessageCircle,
  billing: Receipt,
  library: BookOpen,
  wellness: Heart,
  events: PartyPopper,
  forms: ClipboardList,
};

export function productIcon(slug: string): LucideIcon {
  return ICONS[slug] || GraduationCap;
}
