import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";

export default async function AdminRoute() {
  const projects = await prisma.project.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const pageContents = await prisma.pageContent.findMany();

  const plainProjects = projects.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString()
  }));

  const plainPageContents = pageContents.map(p => ({
    ...p,
    updatedAt: p.updatedAt.toISOString()
  }));

  return (
    <div style={{ paddingTop: "var(--spacing-xl)" }}>
      <AdminClient projects={plainProjects} pageContents={plainPageContents} />
    </div>
  );
}

