export interface Project {
  id: string;
  title: string;
  club?: string;
  description: string;
  techStack: string[];
  technologies?: string[];
  members?: number;
  likes?: number;
  views?: number;
  featured?: boolean;
  status?: string;
  image?: string;
  screenshots?: string[];
  github?: string;
  demo?: string;
  githubLink?: string;
  demoLink?: string;
}
