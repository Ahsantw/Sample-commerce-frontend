import { Product } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const navigate = useNavigate();

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5YzljOWMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/products/${imagePath}`;
  };

  const handleViewDetails = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product._id);
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-medium transition-all duration-300 cursor-pointer animate-fade-in h-full flex flex-col border border-gray-200 hover:border-primary/20">
      <div 
        className="relative overflow-hidden aspect-square bg-secondary flex-shrink-0"
        onClick={handleViewDetails}
      >
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5YzljOWMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
          }}
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.featured && (
            <Badge className="bg-accent text-accent-foreground text-xs px-1.5 py-0.5">
              Featured
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
              Out of Stock
            </Badge>
          )}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-1 text-xs"
            onClick={handleViewDetails}
          >
            <Eye className="h-3 w-3" />
            View
          </Button>
        </div>
      </div>
      
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="mb-2 flex-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium block mb-1">
            {product.category}
          </span>
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold text-primary">
              Rs {product.price.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          
          {onAddToCart && (
            <Button
              size="sm"
              onClick={handleAddToCartClick}
              className="gap-1 text-xs h-8 sm:h-9 px-2 sm:px-3"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Add</span>
            </Button>
          )}
        </div>
        
        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
          Added: {new Date(product.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
};