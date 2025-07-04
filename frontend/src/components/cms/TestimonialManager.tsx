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
import { useCMS, Testimonial } from "@/contexts/CMSContext";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Upload } from "lucide-react";

export const TestimonialManager = () => {
  const {
    testimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    uploadImage,
  } = useCMS();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    company: "",
    content: "",
    avatar: "",
    rating: 5,
    isActive: true,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      company: "",
      content: "",
      avatar: "",
      rating: 5,
      isActive: true,
    });
    setEditingTestimonial(null);
    setAvatarFile(null);
  };

  const openDialog = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        name: testimonial.name,
        role: testimonial.role,
        company: testimonial.company,
        content: testimonial.content,
        avatar: testimonial.avatar || "",
        rating: testimonial.rating,
        isActive: testimonial.isActive,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleAvatarUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const avatarUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
      toast({
        title: "Avatar uploaded successfully",
        description: "The avatar has been uploaded and is ready to use.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          "There was an error uploading the avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (avatarFile) {
      await handleAvatarUpload(avatarFile);
    }

    if (editingTestimonial) {
      updateTestimonial(editingTestimonial.id, formData);
      toast({
        title: "Testimonial updated",
        description: "The testimonial has been updated successfully.",
      });
    } else {
      addTestimonial(formData);
      toast({
        title: "Testimonial created",
        description: "The new testimonial has been created successfully.",
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (testimonial: Testimonial) => {
    if (
      window.confirm(
        `Are you sure you want to delete the testimonial from "${testimonial.name}"?`,
      )
    ) {
      deleteTestimonial(testimonial.id);
      toast({
        title: "Testimonial deleted",
        description: "The testimonial has been deleted successfully.",
      });
    }
  };

  const toggleActive = (testimonial: Testimonial) => {
    updateTestimonial(testimonial.id, { isActive: !testimonial.isActive });
    toast({
      title: testimonial.isActive
        ? "Testimonial deactivated"
        : "Testimonial activated",
      description: `The testimonial has been ${testimonial.isActive ? "deactivated" : "activated"}.`,
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testimonial Management</h2>
          <p className="text-muted-foreground">
            Manage client testimonials and reviews
          </p>
        </div>
        <Button
          onClick={() => openDialog()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <Card
            key={testimonial.id}
            className="relative group hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {testimonial.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(testimonial.rating)}
                    </div>
                    <Badge
                      variant={testimonial.isActive ? "default" : "secondary"}
                      className="mt-2"
                    >
                      {testimonial.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(testimonial)}
                  >
                    {testimonial.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openDialog(testimonial)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(testimonial)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <blockquote className="text-sm text-muted-foreground italic line-clamp-4">
                &quot;{testimonial.content}&quot;
              </blockquote>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
            </DialogTitle>
            <DialogDescription>
              {editingTestimonial
                ? "Update the testimonial details below."
                : "Fill in the details for the new testimonial."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., John Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role/Position</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="e.g., CEO"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="e.g., TechCorp Inc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Testimonial Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Write the testimonial content here..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Avatar Image</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {isUploading && (
                    <Button disabled size="sm">
                      <Upload className="h-4 w-4 animate-spin" />
                    </Button>
                  )}
                </div>
                {formData.avatar && (
                  <img
                    src={formData.avatar}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select
                  value={formData.rating.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, rating: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(rating)}</div>
                          <span>
                            {rating} Star{rating !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                {editingTestimonial
                  ? "Update Testimonial"
                  : "Create Testimonial"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
