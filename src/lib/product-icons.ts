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
  Users,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  education: GraduationCap,
  social: Users,
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
