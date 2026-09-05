import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/lib/orderService';
import { Package, Loader2, X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const userOrders = await orderService.getMyOrders();
      setOrders(userOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCancelDialog = (order: Order) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  const closeCancelDialog = () => {
    if (cancellingOrder) return; 
    setCancelDialogOpen(false);
    setOrderToCancel(null);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      setCancellingOrder(orderToCancel._id);
      
      await orderService.cancelOrder(orderToCancel._id);
      toast({
        title: 'Order cancelled',
        description: 'Your order has been cancelled successfully',
        variant: 'default',
      });
      loadOrders(); 
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel order',
        variant: 'destructive',
      });
    } finally {
      setCancellingOrder(null);
      setOrderToCancel(null);
      setCancelDialogOpen(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-500',
      processing: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500',
    };
    return colors[status];
  };

  const canCancelOrder = (order: Order) => {
    // Users can only cancel orders that are in pending status
    return order.status === 'pending';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground">Start shopping to see your orders here!</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 animate-fade-in">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order, index) => (
            <Card key={order._id} className="p-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Order #{order._id.slice(-8)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-2 md:mt-0">
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  {canCancelOrder(order) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCancelDialog(order)}
                      disabled={cancellingOrder === order._id}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                    >
                      {cancellingOrder === order._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      <span className="ml-1">Cancel Order</span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, itemIndex) => (
                  <div key={item._id || itemIndex} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span className="font-medium">Rs {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Shipping Address</p>
                  <p className="text-sm">
                    {order.shippingAddress.fullName} - {order.shippingAddress.address}, {order.shippingAddress.city}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mobile: {order.shippingAddress.mobile}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-primary">Rs {order.total.toFixed(2)}</p>
                </div>
              </div>

              {order.status === 'cancelled' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">
                    This order was cancelled on {new Date(order.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Cancelled orders cannot be reversed.
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Cancel Order Confirmation Dialog */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <AlertDialogTitle className="text-lg">Cancel Order Confirmation</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm mt-1">
                    Please confirm your cancellation request
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>

            <div className="py-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Important Notice</p>
                    <p className="text-xs text-amber-700 mt-1">
                      You are about to cancel order <strong>#{orderToCancel?._id.slice(-8)}</strong>. 
                      This action cannot be undone and your order will be permanently cancelled.
                    </p>
                  </div>
                </div>
              </div>

              {orderToCancel && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-sm font-medium text-gray-900 mb-2">Order Summary</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Total:</span>
                      <span className="font-semibold">Rs {orderToCancel.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span>{orderToCancel.items.length} product(s)</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Includes: {orderToCancel.items.slice(0, 2).map(item => item.name).join(', ')}
                      {orderToCancel.items.length > 2 && ` and ${orderToCancel.items.length - 2} more...`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel 
                onClick={closeCancelDialog}
                disabled={cancellingOrder !== null}
                className="mt-0 bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
              >
                Keep My Order
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelOrder}
                disabled={cancellingOrder !== null}
                className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600 focus:ring-offset-2"
              >
                {cancellingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Yes, Cancel Order
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;