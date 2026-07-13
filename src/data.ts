import masterData from "./master.json";

export interface ProfileType {
  name: string;
  lastName: string;
  badge: string;
  title: string;
  portraitUrl: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface StatsItem {
  label: string;
  value: string;
  description: string;
}

export interface ProjectLab {
  id: string;
  title: string;
  status: "Completed" | "Active" | "Experimental";
  refId: string;
  author: string;
  description: string;
  metrics: string[];
  imageUrl: string;
  tags: string[];
  whitepaperUrl?: string;
  demoUrl?: string;
}

export interface ProductItem {
  title: string;
  status: string;
  imageUrl: string;
  description: string;
  bullets: string[];
  tags: string[];
  actionLabel: string;
}

export interface InsightItem {
  type: "Whitepaper" | "Case Study" | "Solution";
  title: string;
  cta: string;
}

export interface SearchItem {
  title: string;
  category: string;
  sectionId: "summary" | "solutions" | "labs" | "docs";
  description: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  location: string;
  period: string;
  context?: string;
  bullets: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  gpa?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year: string;
}

export const SOMASHEKAR_PROFILE: ProfileType = masterData.PROFILE;
export const LEADERSHIP_PHILOSOPHY: string = masterData.LEADERSHIP_PHILOSOPHY;
export const EXECUTIVE_HIGHLIGHTS: string[] = masterData.EXECUTIVE_HIGHLIGHTS;
export const LEADER_STATS: StatsItem[] = masterData.LEADER_STATS;
export const TECHNICAL_MATRIX: SkillGroup[] = masterData.TECHNICAL_MATRIX;
export const PROFESSIONAL_EXPERIENCE: ExperienceItem[] = masterData.PROFESSIONAL_EXPERIENCE as ExperienceItem[];
export const EDUCATION: EducationItem[] = masterData.EDUCATION as EducationItem[];
export const CERTIFICATIONS: CertificationItem[] = masterData.CERTIFICATIONS as CertificationItem[];
export const ARCHITECTURE_LABS: ProjectLab[] = masterData.ARCHITECTURE_LABS as ProjectLab[];
export const PRODUCTS_LIST: ProductItem[] = masterData.PRODUCTS_LIST;
export const ARCHITECTURE_INSIGHTS: InsightItem[] = masterData.ARCHITECTURE_INSIGHTS as InsightItem[];
export const SEARCHABLE_TOPICS: SearchItem[] = masterData.SEARCHABLE_TOPICS as SearchItem[];
