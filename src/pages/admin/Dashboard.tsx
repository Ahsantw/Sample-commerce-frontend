import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: any[];
  lowStockProducts: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: [],
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, [isAdmin, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [productsData, usersData, orderStats, ordersData] = await Promise.all([
        api.getProducts(),
        api.getUsers(),
        api.getOrderStats(),
        api.getAllOrders('pending', 1, 5) 
      ]);

      // Calculate low stock products (stock < 10)
      const lowStockProducts = productsData.filter(product => product.stock < 10).length;

      setStats({
        totalProducts: productsData.length,
        totalUsers: usersData.length,
        totalOrders: orderStats.totalOrders,
        totalRevenue: orderStats.totalRevenue,
        pendingOrders: orderStats.pendingOrders,
        recentOrders: Array.isArray(ordersData) ? ordersData.slice(0, 5) : ordersData.orders?.slice(0, 5) || [],
        lowStockProducts
      });
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Products in store',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      description: `${stats.pendingOrders} pending`,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Registered users',
    },
    {
      title: 'Total Revenue',
      value: `Rs ${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      description: 'All time revenue',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      processing: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-0">Dashboard</h1>
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            Refresh Data
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((stat, index) => (
            <Card
              key={stat.title}
              className="p-4 sm:p-6 animate-scale-in hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                {stat.title === 'Total Orders' && stats.pendingOrders > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {stats.pendingOrders} pending
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Alerts Section */}
        {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {stats.pendingOrders > 0 && (
              <Card className="p-4 sm:p-6 border-orange-200 bg-orange-50">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-800">Pending Orders</h3>
                    <p className="text-sm text-orange-700">
                      You have {stats.pendingOrders} order{stats.pendingOrders !== 1 ? 's' : ''} waiting for processing
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/admin/orders')}
                    className="ml-auto bg-orange-600 hover:bg-orange-700"
                  >
                    View Orders
                  </Button>
                </div>
              </Card>
            )}
            
            {stats.lowStockProducts > 0 && (
              <Card className="p-4 sm:p-6 border-red-200 bg-red-50">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
                    <p className="text-sm text-red-700">
                      {stats.lowStockProducts} product{stats.lowStockProducts !== 1 ? 's' : ''} running low on stock
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/admin/products')}
                    variant="outline"
                    className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Manage Products
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Orders */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Orders</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/admin/orders')}
                className="text-primary"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">Order #{order._id.slice(-8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeof order.user === 'object' ? order.user.username : 'Customer'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
                        {order.status}
                      </Badge>
                      <p className="text-sm font-semibold mt-1">Rs {order.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent orders</p>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button
                onClick={() => navigate('/admin/products')}
                variant="outline"
                className="w-full justify-start h-12 text-left"
              >
                <Package className="h-4 w-4 mr-3" />
                Manage Products
              </Button>
              <Button
                onClick={() => navigate('/admin/categories')}
                variant="outline"
                className="w-full justify-start h-12 text-left"
              >
                <ShoppingCart className="h-4 w-4 mr-3" />
                Manage Categories
              </Button>
              <Button
                onClick={() => navigate('/admin/orders')}
                variant="outline"
                className="w-full justify-start h-12 text-left"
              >
                <ShoppingCart className="h-4 w-4 mr-3" />
                View Orders
              </Button>
              <Button
                onClick={() => navigate('/admin/users')}
                variant="outline"
                className="w-full justify-start h-12 text-left"
              >
                <Users className="h-4 w-4 mr-3" />
                Manage Users
              </Button>
            </div>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <Card className="p-4 sm:p-6 text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-3`}>
              <Package className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-1">Low Stock Items</h3>
            <p className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</p>
            <p className="text-xs text-muted-foreground mt-1">Products with stock &lt; 10</p>
          </Card>

          <Card className="p-4 sm:p-6 text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-3`}>
              <ShoppingCart className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-semibold mb-1">Pending Orders</h3>
            <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </Card>

          <Card className="p-4 sm:p-6 text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 mb-3`}>
              <DollarSign className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="font-semibold mb-1">Average Order</h3>
            <p className="text-2xl font-bold">
              Rs {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Average order value</p>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;