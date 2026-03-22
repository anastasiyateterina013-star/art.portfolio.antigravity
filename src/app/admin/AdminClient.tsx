"use client";

import { useState, useEffect } from "react";
import { createProject, updateProject, deleteProject, updatePageContent } from "../actions";
import styles from "./Admin.module.css";
import Image from "next/image";

export default function AdminClient({ projects = [], pageContents = [] }: { projects?: any[], pageContents?: any[] }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  
  const [selectedPageId, setSelectedPageId] = useState("home");
  const [pageGalleryUrls, setPageGalleryUrls] = useState<string[]>([]);

  useEffect(() => {
    const page = pageContents?.find((p) => p.id === selectedPageId);
    if (page && page.gallery) {
      try {
        setPageGalleryUrls(JSON.parse(page.gallery));
      } catch (e) {
        setPageGalleryUrls([]);
      }
    } else {
      setPageGalleryUrls([]);
    }
  }, [selectedPageId, pageContents]);

  const editingProject = projects.find((p) => p.id === editingProjectId);
  const selectedPageContent = pageContents?.find((p) => p.id === selectedPageId);

  const handleProjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    try {
      const formData = new FormData(form);
      const isEditing = !!editingProjectId;

      const mainFile = formData.get("file") as File;
      let mainImage = "";
      if (mainFile && mainFile.size > 0) {
        const uploadData = new FormData();
        uploadData.append("file", mainFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
        const uploadJson = await uploadRes.json();
        mainImage = uploadJson.url || "";
      }

      if (!isEditing && !mainImage) {
        alert("Please select a main cover image.");
        setLoading(false);
        return;
      }

      const galleryFiles = formData.getAll("galleryFiles") as File[];
      const galleryUrls: string[] = [];
      for (const file of galleryFiles) {
        if (file.size > 0) {
          const uploadData = new FormData();
          uploadData.append("file", file);
          const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
          const uploadJson = await uploadRes.json();
          if (uploadJson.url) galleryUrls.push(uploadJson.url);
        }
      }

      const projectData = {
        title: formData.get("title") as string,
        category: formData.get("category") as string,
        description: formData.get("description") as string,
        content: formData.get("content") as string,
        mainImage: mainImage || undefined,
      } as any;

      if (isEditing) {
        const existingGalleryUrlList = JSON.parse(editingProject?.gallery || "[]");
        const mergedGallery = [...existingGalleryUrlList, ...galleryUrls];
        if (mergedGallery.length > 0) {
          projectData.gallery = JSON.stringify(mergedGallery);
        }
      } else {
        if (galleryUrls.length > 0) {
          projectData.gallery = JSON.stringify(galleryUrls);
        }
      }

      if (mainImage === "") delete projectData.mainImage;

      if (isEditing) {
        await updateProject(editingProjectId, projectData);
        alert("Project updated successfully!");
        setEditingProjectId(null);
      } else {
        await createProject({ ...projectData, mainImage: projectData.mainImage! });
        alert("Project created successfully!");
      }

      form.reset();
    } catch (err) {
      console.error(err);
      alert("Error saving project");
    }
    setLoading(false);
  };

  const handlePageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    try {
      const formData = new FormData(form);
      const mainFile = formData.get("file") as File;
      let mainImage = "";
      if (mainFile && mainFile.size > 0) {
        const uploadData = new FormData();
        uploadData.append("file", mainFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
        const uploadJson = await uploadRes.json();
        mainImage = uploadJson.url || "";
      }

      const galleryFiles = formData.getAll("galleryFiles") as File[];
      const newGalleryUrls: string[] = [];
      for (const file of galleryFiles) {
        if (file.size > 0) {
          const uploadData = new FormData();
          uploadData.append("file", file);
          const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
          const uploadJson = await uploadRes.json();
          if (uploadJson.url) newGalleryUrls.push(uploadJson.url);
        }
      }

      const finalGalleryUrls = [...pageGalleryUrls, ...newGalleryUrls];

      await updatePageContent(
        selectedPageId,
        formData.get("content") as string,
        mainImage,
        JSON.stringify(finalGalleryUrls)
      );

      form.reset();
      alert("Page updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating page");
    }
    setLoading(false);
  };

  const removePageGalleryImage = (urlToRemove: string) => {
    setPageGalleryUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  return (
    <div className={styles.adminPage} style={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>
      <div style={{ flex: 2, minWidth: "300px" }}>
        <h1>Backoffice CRM</h1>

        <div className={styles.tabs}>
          <button
            className={activeTab === "projects" ? `${styles.tabBtn} ${styles.activeTab}` : styles.tabBtn}
            onClick={() => setActiveTab("projects")}
          >
            Manage Projects
          </button>
          <button
            className={activeTab === "pages" ? `${styles.tabBtn} ${styles.activeTab}` : styles.tabBtn}
            onClick={() => setActiveTab("pages")}
          >
            Edit Pages
          </button>
        </div>

        {activeTab === "projects" && (
          <form key={editingProjectId || "new"} className={styles.form} onSubmit={handleProjectSubmit}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>{editingProjectId ? `Editing: ${editingProject?.title}` : "New Project"}</h2>
              {editingProjectId && (
                <button type="button" onClick={() => setEditingProjectId(null)} style={{ cursor: "pointer", padding: "4px 8px" }}>
                  Cancel Edit
                </button>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Project Title</label>
              <input type="text" name="title" defaultValue={editingProject?.title} required />
            </div>
            
            <div className={styles.formGroup}>
              <label>Category</label>
              <select name="category" defaultValue={editingProject?.category} required>
                <option value="design">Design Works</option>
                <option value="painting">Drawings & Paintings</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Main Cover Image {editingProjectId && "(Leave empty to keep existing)"}</label>
              <input type="file" name="file" accept="image/*" required={!editingProjectId} />
            </div>
            
            <div className={styles.formGroup}>
              <label>Gallery Images (Optional - hold Ctrl/Cmd to select multiple) <br/> <small style={{color: 'green'}}>{editingProjectId && "(Uploading new images will add them to your existing gallery, it will not delete old ones)"}</small></label>
              <input type="file" name="galleryFiles" accept="image/*" multiple />
            </div>
            
            <div className={styles.formGroup}>
              <label>Short Description (Grid)</label>
              <textarea name="description" rows={3} defaultValue={editingProject?.description}></textarea>
            </div>
            
            <div className={styles.formGroup}>
              <label>Full Content (Detail Page)</label>
              <textarea name="content" rows={8} defaultValue={editingProject?.content}></textarea>
            </div>
            
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? "Saving..." : editingProjectId ? "Update Project" : "Create Project"}
            </button>
          </form>
        )}

        {activeTab === "pages" && (
          <form key={selectedPageId} className={styles.form} onSubmit={handlePageSubmit}>
            <h2>Edit Page Content</h2>
            <div className={styles.formGroup}>
              <label>Select Page</label>
              <select name="pageId" value={selectedPageId} onChange={(e) => setSelectedPageId(e.target.value)} required>
                <option value="home">Home Page</option>
                <option value="about">About Page</option>
                <option value="contacts">Contacts</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Page Main Image (Optional, e.g. for Home Profile Picture) <br/><small style={{color: 'green'}}>Selecting a new one replaces the old one</small></label>
              <input type="file" name="file" accept="image/*" />
            </div>
            
            {pageGalleryUrls.length > 0 && (
              <div className={styles.formGroup}>
                <label>Manage Existing Gallery (Click to remove)</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                  {pageGalleryUrls.map((url, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <Image src={url} alt={`Gallery ${i}`} width={80} height={80} style={{ objectFit: "cover", borderRadius: "4px" }} />
                      <button 
                        type="button" 
                        onClick={() => removePageGalleryImage(url)}
                        style={{ position: "absolute", top: -5, right: -5, background: "red", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontSize: "12px" }}>
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Add New Gallery Images (Optional - hold Ctrl/Cmd to select multiple)</label>
              <input type="file" name="galleryFiles" accept="image/*" multiple />
            </div>
            
            <div className={styles.formGroup}>
              <label>Page Text Content (Supports basic HTML like &lt;br&gt; or paragraphs)</label>
              <textarea name="content" rows={10} defaultValue={selectedPageContent?.content}></textarea>
            </div>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? "Saving..." : "Update Page"}
            </button>
          </form>
        )}
      </div>

      {activeTab === "projects" && (
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h2>Existing Projects</h2>
          <div className={styles.projectList}>
            {projects.map((p) => (
              <div key={p.id} className={styles.projectItem}>
                <div>
                  <strong>{p.title}</strong>
                  <br />
                  <small>({p.category})</small>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    onClick={() => setEditingProjectId(p.id)}
                    style={{ background: "#4caf50", color: "white", padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete this project?")) {
                        await deleteProject(p.id);
                        if (editingProjectId === p.id) setEditingProjectId(null);
                      }
                    }}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
