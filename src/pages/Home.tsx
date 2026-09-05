import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Product, Slider, Category } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { ArrowRight, Sparkles, Star, MapPin, Clock, Phone } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{ [key: string]: Product[] }>({});
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);

      const [productsData, categoriesData, slidersData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getActiveSliders()
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setSliders(slidersData);

      const groupedProducts: { [key: string]: Product[] } = {};
      categoriesData.forEach(category => {
        const categoryProds = productsData
          .filter(product => product.category === category.name)
          .slice(0, 6); 
        if (categoryProds.length > 0) {
          groupedProducts[category.name] = categoryProds;
        }
      });

      setCategoryProducts(groupedProducts);
    } catch (error: any) {
      console.error('Error loading home data:', error);
      toast({
        title: 'Error loading content',
        description: 'Please try refreshing the page',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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

  const getSliderImageUrl = (slider: Slider) => {
    if (slider.image.startsWith('http')) return slider.image;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/sliders/${slider.image}`;
  };

  const getProductImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/products/${imagePath}`;
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

      <section className="relative h-[600px] bg-gradient-hero overflow-hidden">
        {sliders.length > 0 ? (
          <Carousel
            plugins={[
              Autoplay({
                delay: 5000,
              }),
            ]}
            className="w-full h-full"
          >
            <CarouselContent>
              {sliders.map((slider) => (
                <CarouselItem key={slider._id}>
                  <div className="relative h-[600px]">
                    <div className="absolute inset-0">
                      <img
                        src={getSliderImageUrl(slider)}
                        alt={slider.title}
                        className="w-full h-full object-cover opacity-90"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNjAwIiB5PSIzMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2xpZGVyIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
                    <div className="relative container mx-auto px-4 h-full flex items-center">
                      <div className="max-w-2xl text-primary-foreground animate-fade-in">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="h-5 w-5" />
                          <span className="text-sm font-medium">Featured</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                          {slider.title}
                        </h1>
                        <p className="text-xl mb-8 text-primary-foreground/90">
                          {slider.description}
                        </p>
                        <div className="flex gap-4">
                          <Button
                            size="lg"
                            variant="secondary"
                            onClick={() => navigate(slider.buttonLink)}
                            className="gap-2 shadow-glow"
                          >
                            {slider.buttonText}
                            <ArrowRight className="h-5 w-5" />
                          </Button>
                          {!user && (
                            <Button
                              size="lg"
                              variant="outline"
                              onClick={() => navigate('/signup')}
                              className="border-primary-foreground text-black hover:bg-primary-foreground hover:text-primary"
                            >
                              Sign Up
                            </Button>

                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        ) : (
          <div className="relative h-full flex items-center justify-center bg-gradient-to-r from-primary to-primary/70">
            <div className="text-center text-primary-foreground">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Our Store</h1>
              <p className="text-xl mb-8">Discover amazing products at great prices</p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/products')}
                className="gap-2"
              >
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Category-wise Product Sections - Made Responsive */}
      {Object.keys(categoryProducts).length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-background">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Shop by Category</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-4">
                Explore our carefully curated collections across different categories
              </p>
            </div>

            {Object.entries(categoryProducts).map(([categoryName, categoryProds]) => (
              <div key={categoryName} className="mb-12 sm:mb-16 last:mb-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 px-2">
                  <div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      {categoryName} Collection
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Discover our premium {categoryName.toLowerCase()} products
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/products?category=${categoryName}`)}
                    className="gap-2 text-xs sm:text-sm"
                  >
                    View All {categoryName}
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 px-2">
                  {categoryProds.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={{
                        ...product,
                        image: getProductImageUrl(product.image)
                      }}
                      onAddToCart={!isAdmin ? handleAddToCart : undefined}
                    />
                  ))}
                </div>

                {categoryProds.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <p className="text-muted-foreground text-sm sm:text-base">No products available in this category yet</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Store Info Section - Made Responsive */}
      <section className="py-8 sm:py-12 md:py-16 bg-primary/5">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="px-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-800">
                Visit Our Store
              </h2>
              <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Experience the finest collection of premium products at our physical store.
                Our expert staff will help you choose the perfect items for your needs.
              </p>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Address</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      main street, Chak no. 60 RB, Balochani, District Faisalabad
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Store Hours</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      All Week: 9:00 AM - 7:00 PM<br />
                      Friday: 9:00 AM - 12:00 PM then 3:00 PM - 7:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Contact</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm">+92 344 0694754</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8">
                <Button
                  size="lg"
                  className="gap-2 text-sm sm:text-base"
                  onClick={() => navigate('/contact')}
                >
                  Get Directions
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Card className="p-4 sm:p-6 md:p-8 bg-white shadow-lg mx-2">
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center text-gray-800">
                Why Choose Us?
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 sm:mb-2">Premium Quality</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Finest products sourced directly from trusted suppliers
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 sm:mb-2">Competitive Prices</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Best value for your money with regular discounts and offers
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 sm:mb-2">Expert Service</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Professional guidance and support from our experienced team
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action - Made Responsive */}
      <section className="py-8 sm:py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Ready to Explore More?
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90 px-4">
            Discover our complete collection of amazing products
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/products')}
            className="gap-2 text-sm sm:text-base"
          >
            View All Products
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;