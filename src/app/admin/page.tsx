import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";

export default async function AdminRoute() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pageContents = await prisma.pageContent.findMany();

  const plainProjects = projects.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString()
  }));

  return (
    <div style={{ paddingTop: "var(--spacing-xl)" }}>
      <AdminClient projects={plainProjects} pageContents={pageContents} />
    </div>
  );
}
