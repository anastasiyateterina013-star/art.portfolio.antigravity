"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { writeFile } from "fs/promises";
import { join } from "path";
import { put } from "@vercel/blob";

export async function uploadImage(formData: FormData) {
  const file: File | null = formData.get("file") as unknown as File;
  if (!file) throw new Error("No file provided");

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(file.name, file, { access: "public" });
    return blob.url;
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const filePath = join(process.cwd(), "public", "uploads", filename);
  
  await writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}

export async function loginAction(password: string) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "anastasiya2024";
  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_token", "true", { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/" });
    return true;
  }
  return false;
}

export async function createProject(data: {
  title: string;
  title_et?: string;
  category: string;
  description?: string;
  description_et?: string;
  content?: string;
  content_et?: string;
  mainImage: string;
  gallery?: string;
}) {
  const maxSortProject = await prisma.project.findFirst({
    orderBy: { sortOrder: 'desc' },
  });
  const newSortOrder = maxSortProject ? maxSortProject.sortOrder + 1 : 0;

  await prisma.project.create({
    data: {
      title: data.title,
      title_et: data.title_et || null,
      category: data.category,
      description: data.description || "",
      description_et: data.description_et || null,
      content: data.content || "",
      content_et: data.content_et || null,
      mainImage: data.mainImage,
      gallery: data.gallery || "[]",
      sortOrder: newSortOrder,
    },
  });

  revalidatePath("/design");
  revalidatePath("/maal");
  revalidatePath("/admin");
}

export async function deleteProject(id: string) {
  await prisma.project.delete({
    where: { id },
  });

  revalidatePath("/design");
  revalidatePath("/maal");
  revalidatePath("/admin");
}

export async function updateProject(id: string, data: {
  title: string;
  title_et?: string;
  category: string;
  description?: string;
  description_et?: string;
  content?: string;
  content_et?: string;
  mainImage?: string;
  gallery?: string;
}) {
  const updateData: Record<string, string | null | undefined> = {
    title: data.title,
    title_et: data.title_et || null,
    category: data.category,
    description: data.description || "",
    description_et: data.description_et || null,
    content: data.content || "",
    content_et: data.content_et || null,
  };
  
  if (data.mainImage) updateData.mainImage = data.mainImage;
  if (data.gallery !== undefined) updateData.gallery = data.gallery;

  await prisma.project.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/design");
  revalidatePath("/maal");
  revalidatePath("/admin");
  revalidatePath(`/project/${id}`);
}

export async function updatePageContent(id: string, content: string, mainImage?: string, galleryString?: string) {
  const updateData: Record<string, string | null | undefined> = { content };
  if (mainImage) updateData.mainImage = mainImage;
  if (galleryString !== undefined) updateData.gallery = galleryString;

  await prisma.pageContent.upsert({
    where: { id },
    update: updateData,
    create: {
      id,
      content,
      mainImage: mainImage || null,
      gallery: galleryString || "[]",
    },
  });

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
}

export async function reorderProject(projectId: string, direction: "up" | "down") {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  // Get all projects sorted deterministically
  const allProjects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const currentIndex = allProjects.findIndex((p) => p.id === projectId);
  if (currentIndex === -1) return;

  const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (swapIndex < 0 || swapIndex >= allProjects.length) return;

  // Reorder the array
  const newOrder = [...allProjects];
  const [movedProject] = newOrder.splice(currentIndex, 1);
  newOrder.splice(swapIndex, 0, movedProject);

  // Update all projects with their new sequential sortOrder to fix any duplicates
  const updatePromises = newOrder.map((p, index) => {
    return prisma.project.update({
      where: { id: p.id },
      data: { sortOrder: index },
    });
  });

  await prisma.$transaction(updatePromises);

  revalidatePath("/design");
  revalidatePath("/maal");
  revalidatePath("/admin");
}
