"use client";

/**
 * METER · icon registry
 * ---------------------------------------------------------------------------
 * A curated map of the Lucide icons the product uses, keyed by the string names
 * stored on categories and tools. Named imports let the bundler tree-shake to
 * just this set; an unknown name falls back to a neutral glyph rather than
 * throwing, so data can never break the UI.
 */

import {
  Activity, AlarmClock, AlignLeft, Apple, ArrowLeftRight, ArrowRightLeft, Atom,
  Banknote, BarChart3, Battery, BatteryCharging, Beaker, Bike, Binary, Bitcoin,
  Bone, Book, BookOpen, Box, Brain, Briefcase, Building, Building2, Bus,
  Calculator, Calendar, CalendarClock, CalendarDays, CalendarRange, Car, Carrot,
  ChefHat, CircleDollarSign, Clock, Cloud, CloudRain, Code, Coffee, Cog, Coins,
  Compass, Cpu, CreditCard, Database, Dice5, Divide, DollarSign, DoorOpen,
  Dna, Droplet, Droplets, Dumbbell, Egg, Equal, Factory, Fence, FileText,
  Flame, FlaskConical, FlaskRound, Footprints, Fuel, Gauge, Gem, Gift, Globe,
  GraduationCap, Grid3x3, Hammer, HardDrive, HardHat, Hash, Heart, HeartPulse,
  Hexagon, Home, Hourglass, Image, Infinity, Landmark, Layers, Leaf, Lightbulb,
  LineChart, MapPin, Magnet, Medal, MemoryStick, Microscope, Minus, Monitor,
  Moon, Move, Navigation, Network, Orbit, Package, PaintBucket, PaintRoller,
  Palette, Pencil, Percent, PersonStanding, PieChart, PiggyBank, Pill, Plane,
  Plus, Pyramid, QrCode, Radiation, Receipt, Recycle, Repeat, Rocket, Ruler,
  Scale, School, Server, Settings, Shapes, Ship, ShoppingBag, ShoppingCart,
  Shuffle, Sigma, Signal, Smartphone, Snowflake, Spline, Sprout, Square,
  Stethoscope, Sun, Sunrise, Sunset, Target, TestTube, TestTubes, Thermometer,
  Timer, TrendingDown, TrendingUp, Triangle, TreePine, Trophy, Type, Users,
  Utensils, Watch, Waves, Weight, Wheat, Wifi, Wind, Wine, Wrench, Zap,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Activity, AlarmClock, AlignLeft, Apple, ArrowLeftRight, ArrowRightLeft, Atom,
  Banknote, BarChart3, Battery, BatteryCharging, Beaker, Bike, Binary, Bitcoin,
  Bone, Book, BookOpen, Box, Brain, Briefcase, Building, Building2, Bus,
  Calculator, Calendar, CalendarClock, CalendarDays, CalendarRange, Car, Carrot,
  ChefHat, CircleDollarSign, Clock, Cloud, CloudRain, Code, Coffee, Cog, Coins,
  Compass, Cpu, CreditCard, Database, Dice5, Divide, DollarSign, DoorOpen,
  Dna, Droplet, Droplets, Dumbbell, Egg, Equal, Factory, Fence, FileText,
  Flame, FlaskConical, FlaskRound, Footprints, Fuel, Gauge, Gem, Gift, Globe,
  GraduationCap, Grid3x3, Hammer, HardDrive, HardHat, Hash, Heart, HeartPulse,
  Hexagon, Home, Hourglass, Image, Infinity, Landmark, Layers, Leaf, Lightbulb,
  LineChart, MapPin, Magnet, Medal, MemoryStick, Microscope, Minus, Monitor,
  Moon, Move, Navigation, Network, Orbit, Package, PaintBucket, PaintRoller,
  Palette, Pencil, Percent, PersonStanding, PieChart, PiggyBank, Pill, Plane,
  Plus, Pyramid, QrCode, Radiation, Receipt, Recycle, Repeat, Rocket, Ruler,
  Scale, School, Server, Settings, Shapes, Ship, ShoppingBag, ShoppingCart,
  Shuffle, Sigma, Signal, Smartphone, Snowflake, Spline, Sprout, Square,
  Stethoscope, Sun, Sunrise, Sunset, Target, TestTube, TestTubes, Thermometer,
  Timer, TrendingDown, TrendingUp, Triangle, TreePine, Trophy, Type, Users,
  Utensils, Watch, Waves, Weight, Wheat, Wifi, Wind, Wine, Wrench, Zap,
};

export interface IconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
}

export function Icon({ name, className, size = 20, strokeWidth = 1.9, ...rest }: IconProps) {
  const Cmp = ICONS[name] ?? Calculator;
  return <Cmp className={className} size={size} strokeWidth={strokeWidth} aria-hidden {...rest} />;
}

export function hasIcon(name: string): boolean {
  return name in ICONS;
}
