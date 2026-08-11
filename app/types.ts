import React from "react";

export interface MediaShowcaseProps {
  label: string;
  sublabel: string;
  minHeight?: number;
  src: string;
  type?: 'video' | 'image';
}

export interface TechnicalSpecVisualProps {
  label: string;
  badge: string;
  src: string;
}

export interface StructuralWrapperProps {
  children: React.ReactNode;
}

export interface SectionTitleProps {
  children: React.ReactNode;
  size?: string;
}

export interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export interface MetricSpecProps {
  latencyRef: React.RefObject<HTMLDivElement | null>;
  objectsRef: React.RefObject<HTMLDivElement | null>;
  powerRef: React.RefObject<HTMLDivElement | null>;
  rangeRef: React.RefObject<HTMLDivElement | null>;
  metricLatency: number;
  metricObjects: number;
  metricPower: number;
  metricRange: number;
}

export interface PillarItemProps {
  num: string;
  label: string;
  icon: React.ReactNode;
  body: string;
  tags: string[];
}

export interface SplitConfigProps {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  img: string;
  badge: string;
  reverse: boolean;
}