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
import { useCMS, Service } from "@/contexts/CMSContext";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, Upload } from "lucide-react";

const colorOptions = [
  { value: "bg-slack-green", label: "Green", color: "bg-green-500" },
  { value: "bg-slack-yellow", label: "Yellow", color: "bg-yellow-500" },
  { value: "bg-pixora-500", label: "Purple", color: "bg-purple-500" },
  { value: "bg-blue-500", label: "Blue", color: "bg-blue-500" },
  { value: "bg-red-500", label: "Red", color: "bg-red-500" },
  { value: "bg-emerald-500", label: "Emerald", color: "bg-emerald-500" },
];

export const ServiceManager = () => {
  const { services, addService, updateService, deleteService, uploadImage } =
    useCMS();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    features: [""],
    color: "bg-slack-green",
    image: "",
    caseStudyLink: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      features: [""],
      color: "bg-slack-green",
      image: "",
      caseStudyLink: "",
      isActive: true,
    });
    setEditingService(null);
    setImageFile(null);
  };

  const openDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title,
        description: service.description,
        features: service.features,
        color: service.color,
        image: service.image || "",
        caseStudyLink: service.caseStudyLink || "",
        isActive: service.isActive,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
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

    const serviceData = {
      ...formData,
      features: formData.features.filter((f) => f.trim() !== ""),
    };

    if (editingService) {
      updateService(editingService.id, serviceData);
      toast({
        title: "Service updated",
        description: "Your service has been updated successfully.",
      });
    } else {
      addService(serviceData);
      toast({
        title: "Service created",
        description: "Your new service has been created successfully.",
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (service: Service) => {
    if (window.confirm(`Are you sure you want to delete "${service.title}"?`)) {
      deleteService(service.id);
      toast({
        title: "Service deleted",
        description: "The service has been deleted successfully.",
      });
    }
  };

  const toggleActive = (service: Service) => {
    updateService(service.id, { isActive: !service.isActive });
    toast({
      title: service.isActive ? "Service deactivated" : "Service activated",
      description: `The service has been ${service.isActive ? "deactivated" : "activated"}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service Management</h2>
          <p className="text-muted-foreground">
            Manage your services and their details
          </p>
        </div>
        <Button
          onClick={() => openDialog()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card
            key={service.id}
            className="relative group hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center text-white font-bold`}
                  >
                    {service.title.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(service)}
                  >
                    {service.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openDialog(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(service)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {service.description}
              </p>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Features:
                </p>
                <div className="flex flex-wrap gap-1">
                  {service.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {service.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{service.features.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              {service.image && (
                <div className="mt-3">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-24 object-cover rounded-md"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Update the service details below."
                : "Fill in the details for your new service."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Web Development"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color Theme</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) =>
                    setFormData({ ...formData, color: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your service..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image">Service Image</Label>
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
                    className="w-full h-24 object-cover rounded-md"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="caseStudyLink">Case Study Link</Label>
                <Input
                  id="caseStudyLink"
                  value={formData.caseStudyLink}
                  onChange={(e) =>
                    setFormData({ ...formData, caseStudyLink: e.target.value })
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
                {editingService ? "Update Service" : "Create Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
