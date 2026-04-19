"use client";

import { useState, useEffect } from "react";
import { createProject, updateProject, deleteProject, updatePageContent, uploadImage } from "../actions";
import styles from "./Admin.module.css";
import Image from "next/image";

export default function AdminClient({ projects = [], pageContents = [] }: { projects?: { id: string; title?: string | null; title_et?: string | null; category?: string | null; description?: string | null; description_et?: string | null; content?: string | null; content_et?: string | null; mainImage?: string | null; gallery?: string | null; }[], pageContents?: { id: string; content?: string | null; mainImage?: string | null; gallery?: string | null; }[] }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  
  const [selectedPageId, setSelectedPageId] = useState("home");
  const [pageGalleryUrls, setPageGalleryUrls] = useState<string[]>([]);
  const [projectGalleryUrls, setProjectGalleryUrls] = useState<string[]>([]);

  useEffect(() => {
    const project = projects.find((p) => p.id === editingProjectId);
    const timeoutId = setTimeout(() => {
      if (project && project.gallery) {
        try {
          setProjectGalleryUrls(JSON.parse(project.gallery));
        } catch {
          setProjectGalleryUrls([]);
        }
      } else {
        setProjectGalleryUrls([]);
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [editingProjectId, projects]);

  useEffect(() => {
    const page = pageContents?.find((p) => p.id === selectedPageId);
    const timeoutId = setTimeout(() => {
      if (page && page.gallery) {
        try {
          setPageGalleryUrls(JSON.parse(page.gallery));
        } catch {
          setPageGalleryUrls([]);
        }
      } else {
        setPageGalleryUrls([]);
      }
    }, 0);
    return () => clearTimeout(timeoutId);
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
        try {
          mainImage = await uploadImage(uploadData);
        } catch {
          throw new Error("Main image upload failed. The file might be larger than 50MB.");
        }
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
          try {
            const uploadedUrl = await uploadImage(uploadData);
            galleryUrls.push(uploadedUrl);
          } catch {
            throw new Error("One of your gallery images failed to upload. The file might be larger than 50MB.");
          }
        }
      }

      const projectData = {
        title: formData.get("title") as string,
        title_et: formData.get("title_et") as string,
        category: formData.get("category") as string,
        description: formData.get("description") as string,
        description_et: formData.get("description_et") as string,
        content: formData.get("content") as string,
        content_et: formData.get("content_et") as string,
        mainImage: mainImage || undefined,
      } as {
        title: string;
        title_et?: string;
        category: string;
        description?: string;
        description_et?: string;
        content?: string;
        content_et?: string;
        mainImage?: string;
        gallery?: string;
      };

      if (isEditing) {
        const mergedGallery = [...projectGalleryUrls, ...galleryUrls];
        projectData.gallery = JSON.stringify(mergedGallery);
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
      alert(err instanceof Error ? err.message : "Error saving project");
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
        try {
          mainImage = await uploadImage(uploadData);
        } catch {
          throw new Error("Main image upload failed. The file might be larger than 50MB.");
        }
      }

      const galleryFiles = formData.getAll("galleryFiles") as File[];
      const newGalleryUrls: string[] = [];
      for (const file of galleryFiles) {
        if (file.size > 0) {
          const uploadData = new FormData();
          uploadData.append("file", file);
          try {
            const uploadedUrl = await uploadImage(uploadData);
            newGalleryUrls.push(uploadedUrl);
          } catch {
            throw new Error("Gallery image upload failed. The file might be larger than 50MB.");
          }
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
      alert(err instanceof Error ? err.message : "Error updating page");
    }
    setLoading(false);
  };

  const removePageGalleryImage = (urlToRemove: string) => {
    setPageGalleryUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const removeProjectGalleryImage = (urlToRemove: string) => {
    setProjectGalleryUrls(prev => prev.filter(url => url !== urlToRemove));
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

            <div style={{ display: "flex", gap: "15px" }}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>Project Title (EN)</label>
                <input type="text" name="title" defaultValue={editingProject?.title || ""} required />
              </div>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>Project Title (ET)</label>
                <input type="text" name="title_et" defaultValue={editingProject?.title_et || ""} />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Category</label>
              <select name="category" defaultValue={editingProject?.category || ""} required>
                <option value="design">Design Works</option>
                <option value="painting">Drawings & Paintings</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Main Cover Image {editingProjectId && "(Leave empty to keep existing)"}</label>
              <input type="file" name="file" accept="image/*" required={!editingProjectId} />
            </div>
            
            {editingProjectId && projectGalleryUrls.length > 0 && (
              <div className={styles.formGroup}>
                <label>Manage Existing Gallery (Click to remove)</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                  {projectGalleryUrls.map((url, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <Image src={url} alt={`Gallery ${i}`} width={80} height={80} style={{ objectFit: "cover", borderRadius: "4px" }} unoptimized={url.toLowerCase().endsWith('.gif')} />
                      <button 
                        type="button" 
                        onClick={() => removeProjectGalleryImage(url)}
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
            
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <div className={styles.formGroup} style={{ flex: "1 1 calc(50% - 15px)", minWidth: "250px" }}>
                <label>Short Description (Grid - EN)</label>
                <textarea name="description" rows={3} defaultValue={editingProject?.description || ""}></textarea>
              </div>
              <div className={styles.formGroup} style={{ flex: "1 1 calc(50% - 15px)", minWidth: "250px" }}>
                <label>Short Description (Grid - ET)</label>
                <textarea name="description_et" rows={3} defaultValue={editingProject?.description_et || ""}></textarea>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Full Content (Detail Page - EN)</label>
              <textarea name="content" rows={6} defaultValue={editingProject?.content || ""}></textarea>
            </div>

            <div className={styles.formGroup}>
              <label>Full Content (Detail Page - ET)</label>
              <textarea name="content_et" rows={6} defaultValue={editingProject?.content_et || ""}></textarea>
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
                <option value="home">Home Page (EN)</option>
                <option value="home_et">Home Page (ET)</option>
                <option value="about">About Page (EN)</option>
                <option value="about_et">About Page (ET)</option>
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
                      <Image src={url} alt={`Gallery ${i}`} width={80} height={80} style={{ objectFit: "cover", borderRadius: "4px" }} unoptimized={url.toLowerCase().endsWith('.gif')} />
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
              <label>
                Page Text Content
                <span style={{ display: "block", marginTop: "6px", padding: "8px 12px", background: "#f0f0f0", borderRadius: "6px", fontWeight: "normal", fontSize: "13px", lineHeight: "1.7", color: "#333", fontFamily: "monospace" }}>
                  ✍️ <strong>Formatting Guide:</strong><br/>
                  <code>## Section Heading</code> → BLUE UPPERCASE HEADING<br/>
                  <code>### Smaller Heading</code> → smaller blue heading<br/>
                  <code>**bold text**</code> → <strong>bold</strong><br/>
                  <code>*italic text*</code> → <em>italic</em><br/>
                  <code>[Click Here](https://example.com)</code> → <span style={{textDecoration: "underline", color: "blue"}}>Click Here</span><br/>
                  <code>https://example.com</code> → Automatic Link<br/>
                  Blank line = paragraph break
                </span>
              </label>
              <textarea name="content" rows={14} defaultValue={selectedPageContent?.content || ""} style={{ fontFamily: "monospace", fontSize: "14px" }}></textarea>
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
