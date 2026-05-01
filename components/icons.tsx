import React from 'react';
import {
  Home, Gift, Clock, Bell, BarChart2, User, Users, ChevronLeft, Trophy, LogOut, Check, X, Plus, Search, Star,
  Smartphone, MapPin, FileText, Info, Settings, MousePointerClick, Target, Camera, Download
} from 'lucide-react';

export const HMPLLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 12 12 17 22 12" />
    <polyline points="2 17 12 22 22 17" />
  </svg>
);

export const Icons = {
  home: Home,
  gift: Gift,
  clk: Clock,
  bel: Bell,
  bar: BarChart2,
  usr: User,
  usrs: Users,
  bk: ChevronLeft,
  trp: Trophy,
  out: LogOut,
  chk: Check,
  x: X,
  pls: Plus,
  sch: Search,
  cn: MousePointerClick,
  ar: ChevronLeft,
  up: Plus, // Using plus or arrow up for upload
  ph: Smartphone,
  tgt: Target,
  dl: Plus,
  map: MapPin,
  file: FileText,
  info: Info,
  set: Settings,
  star: Star,
  cam: Camera,
  down: Download
};
