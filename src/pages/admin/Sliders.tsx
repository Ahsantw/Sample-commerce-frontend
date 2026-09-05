import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Plus, Edit, Trash2, Image as ImageIcon, MoveUp, MoveDown, Upload } from 'lucide-react';

const Sliders = () => {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null as File | null,
    buttonText: '',
    buttonLink: '',
    active: true,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadSliders();
  }, [isAdmin, navigate]);

  const loadSliders = async () => {
    try {
      setLoading(true);
      const slidersData = await api.getSliders();
      setSliders(slidersData);
    } catch (error: any) {
      toast({
        title: 'Failed to load sliders',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('buttonText', formData.buttonText);
      submitData.append('buttonLink', formData.buttonLink);
      submitData.append('active', formData.active.toString());
      submitData.append('order', sliders.length.toString());

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (editingSlider) {
        await api.updateSlider(editingSlider._id, submitData);
        toast({ title: 'Slider updated successfully' });
      } else {
        await api.createSlider(submitData);
        toast({ title: 'Slider added successfully' });
      }

      setIsDialogOpen(false);
      resetForm();
      await loadSliders();
    } catch (error: any) {
      toast({
        title: editingSlider ? 'Update failed' : 'Creation failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (slider: Slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      description: slider.description,
      image: null,
      buttonText: slider.buttonText,
      buttonLink: slider.buttonLink,
      active: slider.active,
    });
    setImagePreview(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/sliders/${slider.image}`);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slider?')) {
      return;
    }

    try {
      await api.deleteSlider(id);
      toast({ title: 'Slider deleted successfully' });
      await loadSliders();
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const formData = new FormData();
      formData.append('active', active.toString());
      await api.updateSlider(id, formData);
      await loadSliders();
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const moveSlider = async (id: string, direction: 'up' | 'down') => {
    const index = sliders.findIndex(s => s._id === id);
    if (index === -1) return;

    let newOrder;
    if (direction === 'up' && index > 0) {
      newOrder = sliders[index - 1].order;
      await api.updateSliderOrder(sliders[index - 1]._id, sliders[index].order);
    } else if (direction === 'down' && index < sliders.length - 1) {
      newOrder = sliders[index + 1].order;
      await api.updateSliderOrder(sliders[index + 1]._id, sliders[index].order);
    } else {
      return;
    }

    await api.updateSliderOrder(id, newOrder);
    await loadSliders();
  };

  const resetForm = () => {
    setEditingSlider(null);
    setFormData({
      title: '',
      description: '',
      image: null,
      buttonText: '',
      buttonLink: '',
      active: true,
    });
    setImagePreview('');
  };

  const getImageUrl = (slider: Slider) => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/sliders/${slider.image}`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Manage Sliders</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Slider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSlider ? 'Edit Slider' : 'Add New Slider'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Image {!editingSlider && '*'}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!editingSlider}
                      />
                    </div>
                    {(imagePreview || editingSlider) && (
                      <div className="w-20 h-20 border rounded-lg overflow-hidden">
                        <img 
                          src={imagePreview || (editingSlider ? getImageUrl(editingSlider) : '')} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Button Text</label>
                  <Input
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Button Link</label>
                  <Input
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    required
                    placeholder="/products"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? 'Uploading...' : editingSlider ? 'Update' : 'Add'} Slider
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {sliders.map((slider, index) => (
            <Card key={slider._id} className="p-6 animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="flex gap-6">
                <div className="w-48 h-32 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={getImageUrl(slider)} 
                    alt={slider.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold">{slider.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{slider.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={slider.active}
                        onCheckedChange={(checked) => handleToggleActive(slider._id, checked)}
                      />
                      <span className="text-sm">{slider.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-sm text-muted-foreground">
                      Button: {slider.buttonText} → {slider.buttonLink}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Order: {slider.order}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => moveSlider(slider._id, 'up')}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => moveSlider(slider._id, 'down')}
                    disabled={index === sliders.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(slider)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(slider._id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {sliders.length === 0 && (
            <Card className="p-12 text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sliders yet. Add your first slider to get started!</p>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Sliders;