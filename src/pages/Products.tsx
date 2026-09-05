import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Product, Category } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadProducts();
    loadCategories();

    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await api.getProducts();
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await api.getCategories();
      setCategories(categoriesData);
    } catch (error: any) {
      console.error('Error loading categories:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId);
    } catch (error: any) {
      if (error.message === 'Please login to add items to cart') {
        toast({
          title: 'Please login',
          description: 'You need to login to add items to cart',
          variant: 'destructive',
        });
        navigate('/login');
      }
    }
  };

  const getProductsByCategory = () => {
    const grouped: { [key: string]: Product[] } = {};
    
    categories.forEach(cat => {
      grouped[cat.name] = [];
    });

    grouped['Other'] = [];

    filteredProducts.forEach(product => {
      const category = categories.find(cat => cat.name === product.category);
      if (category) {
        grouped[category.name].push(product);
      } else {
        grouped['Other'].push(product);
      }
    });

    Object.keys(grouped).forEach(category => {
      if (grouped[category].length === 0) {
        delete grouped[category];
      }
    });

    return grouped;
  };

  const showCategorizedView = searchQuery === '' && selectedCategory === 'all';
  const categorizedProducts = getProductsByCategory();

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
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
      
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-gray-800">Our Products</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Browse our collection of premium products</p>
        </div>

        {/* Search and Filter Section */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm border">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>

            <div className="hidden sm:block">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px] md:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[60vh]">
                  <SheetTitle className="text-left mb-4">Filters</SheetTitle>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={clearAllFilters} 
                      variant="outline" 
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {(searchQuery || selectedCategory !== 'all') && (
              <div className="hidden sm:block">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="whitespace-nowrap"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {(searchQuery || selectedCategory !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </Card>

        {!showCategorizedView && filteredProducts.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-muted-foreground">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        )}

        {/* Products Display */}
        {showCategorizedView ? (
          <div className="space-y-8 sm:space-y-12">
            {Object.entries(categorizedProducts).map(([categoryName, categoryProducts]) => (
              <section key={categoryName} className="animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                      {categoryName}
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {categoryProducts.length} product{categoryProducts.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategory(categoryName)}
                    size="sm"
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    View All {categoryName}
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {categoryProducts.slice(0, 8).map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={!isAdmin ? handleAddToCart : undefined}
                    />
                  ))}
                </div>

                {categoryProducts.length > 8 && (
                  <div className="text-center mt-4 sm:mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCategory(categoryName)}
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      View More {categoryName} Products ({categoryProducts.length - 8} more)
                    </Button>
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="animate-fade-in">
            {filteredProducts.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={!isAdmin ? handleAddToCart : undefined}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="max-w-md mx-auto px-4">
                  <Search className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">No products found</h3>
                  <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
                    {searchQuery 
                      ? `No products match your search for "${searchQuery}"`
                      : `No products found in ${selectedCategory} category`
                    }
                  </p>
                  <Button
                    onClick={clearAllFilters}
                    className="text-sm sm:text-base"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;