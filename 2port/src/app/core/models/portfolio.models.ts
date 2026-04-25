export type PortfolioMode = 'design' | 'technical';

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  images?: string[]; // Optional array of additional images
  techStack: string[];
  links: ProjectLink[];
  featured?: boolean;
  date?: string;
}

export interface AboutContent {
  heading: string;
  intro: string;
  tags: string[];
  avatar: string;
  features?: FeatureItem[];
}

export interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  link?: string;
}

export interface ContactContent {
  email: string;
  socials: Array<{ label: string; url: string }>;
}

