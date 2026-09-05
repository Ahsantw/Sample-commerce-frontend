import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Store, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount, loading } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setMobileMenuOpen(false);
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  const handleCartClick = () => {
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to login to view your cart',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    navigate('/cart');
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/products', label: 'Products' },
    { to: '/categories', label: 'Categories' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card border-b shadow-soft backdrop-blur-sm bg-opacity-90">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl">
            <Store className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="bg-gradient-hero bg-clip-text text-transparent">ModernStore</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to}
                className="text-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user && !isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={handleCartClick}
                disabled={loading}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-bounce">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
                {loading && (
                  <span className="absolute -top-1 -right-1 bg-muted text-muted-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    ...
                  </span>
                )}
              </Button>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover z-[100]">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {!isAdmin && (
                      <p className="text-xs text-primary mt-1">
                        {cartCount} item{cartCount !== 1 ? 's' : ''} in cart
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin ? (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/cart')}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        My Cart ({cartCount})
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/orders')}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        My Orders
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')} className="text-sm">
                  Login
                </Button>
                <Button onClick={() => navigate('/signup')} className="text-sm">
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Show Login/Signup buttons on mobile when NOT logged in */}
            {!user && (
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="h-9 px-3 text-xs"
                >
                  Login
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate('/signup')}
                  className="h-9 px-3 text-xs"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Show Cart button for logged-in non-admin users */}
            {user && !isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={handleCartClick}
                disabled={loading}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            )}

            {/* Mobile Menu Trigger - Show for all users */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[300px] p-0">
                {/* Mobile Menu Header - Single close button */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <Store className="h-5 w-5 text-primary" />
                    <span className="bg-gradient-hero bg-clip-text text-transparent">ModernStore</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mobile Navigation Links */}
                <div className="p-4 border-b">
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Button
                        key={link.to}
                        variant="ghost"
                        className="w-full justify-start text-left h-12"
                        onClick={() => handleNavigation(link.to)}
                      >
                        {link.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Mobile User Section */}
                <div className="p-4">
                  {user ? (
                    <div className="space-y-3">
                      {/* User Info */}
                      <div className="px-2">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {!isAdmin && (
                          <p className="text-xs text-primary mt-1">
                            {cartCount} item{cartCount !== 1 ? 's' : ''} in cart
                          </p>
                        )}
                      </div>
                      
                      {/* User Actions */}
                      <div className="space-y-1">
                        {isAdmin ? (
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleNavigation('/admin')}
                          >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => handleNavigation('/cart')}
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              My Cart ({cartCount})
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => handleNavigation('/orders')}
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              My Orders
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Show Login/Signup in mobile menu when not logged in */
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleNavigation('/login')}
                      >
                        Login
                      </Button>
                      <Button
                        className="w-full"
                        onClick={() => handleNavigation('/signup')}
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};