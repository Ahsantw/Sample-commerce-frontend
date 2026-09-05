import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Category, Product } from '@/types';
import { FolderTree } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadCategoriesAndProducts();
  }, []);

  const loadCategoriesAndProducts = async () => {
    try {
      setLoading(true);
      
      const [categoriesData, productsData] = await Promise.all([
        api.getCategories(),
        api.getProducts()
      ]);

      setCategories(categoriesData);
      setProducts(productsData);

      const counts: Record<string, number> = {};
      categoriesData.forEach(cat => {
        counts[cat.name] = productsData.filter(p => p.category === cat.name).length;
      });
      setProductCounts(counts);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground">Browse products by category</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-8 bg-muted/50 rounded-lg max-w-md mx-auto">
              <FolderTree className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Categories Found</h3>
              <p className="text-muted-foreground mb-4">
                There are no categories available at the moment.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card
                key={category._id}
                className="p-6 cursor-pointer hover:shadow-medium transition-all duration-300 hover:scale-105 animate-scale-in group border-2 border-transparent hover:border-primary/20"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <FolderTree className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl mb-2 text-gray-800 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary">
                        {productCounts[category.name] || 0} product{productCounts[category.name] !== 1 ? 's' : ''}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Added: {new Date(category.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {products.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Category usage</span>
                      <span>{Math.round(((productCounts[category.name] || 0) / products.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${((productCounts[category.name] || 0) / products.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-12 p-6 bg-muted/30 rounded-lg animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Total Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{products.length}</div>
                <div className="text-sm text-muted-foreground">Total Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Object.values(productCounts).filter(count => count > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Categories</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Categories;