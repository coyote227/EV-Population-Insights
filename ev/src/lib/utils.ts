import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const numberFormatter = new Intl.NumberFormat("en-US");

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
