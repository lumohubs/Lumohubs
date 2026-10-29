import React from "react";
import {
  Home, BookOpen, Compass, IdCard, Rocket, Briefcase, Building2, Wrench, ClipboardList, Mic, TrendingUp,
  Banknote, Landmark, Zap, Users, BarChart3, KanbanSquare, PlugZap, Hammer, HardHat, Sprout, Snowflake, Sun,
  Car, Flame, HeartPulse, PenLine, Palette, Code, Megaphone, Video, Gamepad2, Monitor, ShoppingCart,
  ShieldCheck, Camera, Lightbulb, FileText, X, Check, Circle,
} from "lucide-react";

// Line icons by name. Data files store the name, so the look stays in one place.
const ICONS = {
  Home, BookOpen, Compass, IdCard, Rocket, Briefcase, Building2, Wrench, ClipboardList, Mic, TrendingUp,
  Banknote, Landmark, Zap, Users, BarChart3, KanbanSquare, PlugZap, Hammer, HardHat, Sprout, Snowflake, Sun,
  Car, Flame, HeartPulse, PenLine, Palette, Code, Megaphone, Video, Gamepad2, Monitor, ShoppingCart,
  ShieldCheck, Camera, Lightbulb, FileText, X, Check,
};

// Decorative by default. Pass a label only when the icon is the only thing naming a control.
export function Icon({ name, size = 18, strokeWidth = 1.75, label, ...rest }) {
  const C = ICONS[name] || Circle;
  return label
    ? <C size={size} strokeWidth={strokeWidth} role="img" aria-label={label} focusable="false" {...rest} />
    : <C size={size} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" {...rest} />;
}

// Icon in a soft circle. Even positions get lilac and purple, odd positions get mint and teal.
export function IconBadge({ name, index = 0, size = 40 }) {
  const tone = index % 2 === 0 ? "plum" : "teal";
  return (
    <span className={"icon-badge " + tone} style={{ width: size, height: size }} aria-hidden="true">
      <Icon name={name} size={Math.round(size * 0.55)} />
    </span>
  );
}
