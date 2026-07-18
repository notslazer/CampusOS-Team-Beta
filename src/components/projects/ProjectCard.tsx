import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  Eye,
  Users,
  ExternalLink,
  Star,
  Github,
  Globe,
} from "lucide-react";

import type { Project } from "../../types/project";

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const techStack = project.techStack?.length
    ? project.techStack
    : project.technologies || [];
  const imageUrl = project.image || project.screenshots?.[0] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3";
  const githubUrl = project.githubLink || project.github || "";
  const demoUrl = project.demoLink || project.demo || "";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-xl"
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={project.title}
          className="h-52 w-full object-cover"
        />

        {project.featured && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-black">
            <Star size={14} />
            Featured
          </span>
        )}

        <span className="absolute right-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
          {project.status || "Active"}
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {project.title}
          </h2>

          <p className="text-sm font-medium text-indigo-600">
            {project.club || "Student Project"}
          </p>
        </div>

        <p className="line-clamp-3 text-sm text-gray-600">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Heart size={16} />
            {project.likes ?? 0}
          </div>

          <div className="flex items-center gap-1">
            <Eye size={16} />
            {project.views ?? 0}
          </div>

          <div className="flex items-center gap-1">
            <Users size={16} />
            {project.members ?? 0}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/app/projects/${project.id}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            View Project
            <ExternalLink size={18} />
          </Link>

          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center rounded-xl border border-gray-200 px-3 py-3 text-gray-700 transition hover:bg-gray-100"
              aria-label={`Open GitHub for ${project.title}`}
            >
              <Github size={18} />
            </a>
          )}

          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center rounded-xl border border-gray-200 px-3 py-3 text-gray-700 transition hover:bg-gray-100"
              aria-label={`Open demo for ${project.title}`}
            >
              <Globe size={18} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
