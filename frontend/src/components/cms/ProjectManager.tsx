import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCMS, Project } from "@/contexts/CMSContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  ExternalLink,
} from "lucide-react";

const categoryOptions = [
  { value: "web", label: "Web Development", color: "bg-green-500" },
  { value: "uiux", label: "UI/UX Design", color: "bg-yellow-500" },
  { value: "social", label: "Social Media", color: "bg-purple-500" },
];

export const ProjectManager = () => {
  const { projects, addProject, updateProject, deleteProject, uploadImage } =
    useCMS();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "web" as "web" | "uiux" | "social",
    description: "",
    fullDescription: "",
    image: "",
    tags: [""],
    clientName: "",
    projectUrl: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      title: "",
      category: "web",
      description: "",
      fullDescription: "",
      image: "",
      tags: [""],
      clientName: "",
      projectUrl: "",
      isActive: true,
    });
    setEditingProject(null);
    setImageFile(null);
  };

  const openDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        category: project.category,
        description: project.description,
        fullDescription: project.fullDescription || "",
        image: project.image,
        tags: project.tags,
        clientName: project.clientName || "",
        projectUrl: project.projectUrl || "",
        isActive: project.isActive,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({ ...formData, tags: newTags });
  };

  const addTag = () => {
    setFormData({ ...formData, tags: [...formData.tags, ""] });
  };

  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: newTags });
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast({
        title: "Image uploaded successfully",
        description: "Your image has been uploaded and is ready to use.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          "There was an error uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (imageFile) {
      await handleImageUpload(imageFile);
    }

    const projectData = {
      ...formData,
      tags: formData.tags.filter((t) => t.trim() !== ""),
    };

    if (editingProject) {
      updateProject(editingProject.id, projectData);
      toast({
        title: "Project updated",
        description: "Your project has been updated successfully.",
      });
    } else {
      addProject(projectData);
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (project: Project) => {
    if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      deleteProject(project.id);
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });
    }
  };

  const toggleActive = (project: Project) => {
    updateProject(project.id, { isActive: !project.isActive });
    toast({
      title: project.isActive ? "Project deactivated" : "Project activated",
      description: `The project has been ${project.isActive ? "deactivated" : "activated"}.`,
    });
  };

  const getCategoryColor = (category: string) => {
    const option = categoryOptions.find((opt) => opt.value === category);
    return option?.color || "bg-gray-500";
  };

  const getCategoryLabel = (category: string) => {
    const option = categoryOptions.find((opt) => opt.value === category);
    return option?.label || category;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Management</h2>
          <p className="text-muted-foreground">
            Manage your portfolio projects
          </p>
        </div>
        <Button
          onClick={() => openDialog()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="relative group hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getCategoryColor(project.category)}`}
                    />
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(project.category)}
                    </Badge>
                    <Badge variant={project.isActive ? "default" : "secondary"}>
                      {project.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {project.title}
                  </CardTitle>
                  {project.clientName && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Client: {project.clientName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(project)}
                  >
                    {project.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openDialog(project)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(project)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {project.image && (
                <div className="mb-3">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {project.description}
              </p>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.tags.length - 3}
                    </Badge>
                  )}
                </div>
                {project.projectUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Project
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "Add New Project"}
            </DialogTitle>
            <DialogDescription>
              {editingProject
                ? "Update the project details below."
                : "Fill in the details for your new project."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., E-Commerce Website"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: "web" | "uiux" | "social") =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${option.color}`}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the project..."
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDescription">Full Description</Label>
              <Textarea
                id="fullDescription"
                value={formData.fullDescription}
                onChange={(e) =>
                  setFormData({ ...formData, fullDescription: e.target.value })
                }
                placeholder="Detailed description of the project..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Project Image</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                {isUploading && (
                  <Button disabled size="sm">
                    <Upload className="h-4 w-4 animate-spin" />
                  </Button>
                )}
              </div>
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={tag}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    placeholder={`Tag ${index + 1}`}
                  />
                  {formData.tags.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTag(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  placeholder="e.g., TechCorp Inc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectUrl">Project URL</Label>
                <Input
                  id="projectUrl"
                  value={formData.projectUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, projectUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active (visible on website)</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {editingProject ? "Update Project" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
