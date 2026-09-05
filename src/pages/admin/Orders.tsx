import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Order, User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { orderService } from '@/lib/orderService';
import { MessageCircle, Loader2, X, AlertTriangle, ShieldAlert } from 'lucide-react';
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

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadOrders();
  }, [isAdmin, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      if (Array.isArray(response)) {
        setOrders(response);
      } else if (response.orders && Array.isArray(response.orders)) {
        setOrders(response.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast({ title: 'Failed to load orders', variant: 'destructive' });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast({ title: 'Order status updated' });
      loadOrders(); 
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({ title: 'Failed to update order status', variant: 'destructive' });
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
      
      await orderService.adminCancelOrder(orderToCancel._id);
      toast({
        title: 'Order cancelled',
        description: 'Order has been cancelled successfully',
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

  const getUserName = (user: string | User) => {
    if (typeof user === 'string') return 'Loading...';
    return user.username || user.email;
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
    return order.status !== 'delivered' && order.status !== 'cancelled';
  };

  const canUpdateStatus = (order: Order) => {
    return order.status !== 'cancelled';
  };

  const handleWhatsAppContact = (mobile: string, orderNumber: string) => {
    const message = `Hello! This is regarding your order ${orderNumber}. How can we help you?`;
    window.open(`https://wa.me/${mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        <h1 className="text-4xl font-bold mb-8">Orders Management</h1>

        <div className="space-y-4">
          {orders.map((order, index) => (
            <Card key={order._id} className="p-6 animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">Order #{order._id.slice(-8)}</h3>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Customer: {getUserName(order.user)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-primary">Rs {order.total.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {canUpdateStatus(order) ? (
                      <Select value={order.status} onValueChange={(value) => handleStatusChange(order._id, value as Order['status'])}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="w-[150px] h-10 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50">
                        <span className="text-sm text-muted-foreground">Cancelled</span>
                      </div>
                    )}
                    
                    {canCancelOrder(order) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCancelDialog(order)}
                        disabled={cancellingOrder === order._id}
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-[150px] transition-colors duration-200"
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
              </div>

              <div className="border-t pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Order Items</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={item._id || index} className="flex justify-between text-sm">
                          <span>{item.name} x {item.quantity}</span>
                          <span className="font-medium">Rs {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Shipping Information</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.fullName}<br />
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                      {order.shippingAddress.country}<br />
                      {order.shippingAddress.mobile && (
                        <>
                          <span className="font-semibold">Mobile:</span> {order.shippingAddress.mobile}
                        </>
                      )}
                    </p>
                    {order.shippingAddress.mobile && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleWhatsAppContact(order.shippingAddress.mobile, order._id.slice(-8))}
                        className="mt-2"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Contact on WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {order.status === 'cancelled' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">
                    This order was cancelled on {new Date(order.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Cancelled orders cannot be reversed and will be automatically removed after 7 days.
                  </p>
                </div>
              )}
            </Card>
          ))}

          {orders.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No orders found</p>
            </Card>
          )}
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
                    <p className="text-sm font-medium text-amber-800">Administrative Action</p>
                    <p className="text-xs text-amber-700 mt-1">
                      You are about to cancel order <strong>#{orderToCancel?._id.slice(-8)}</strong>. 
                      This action cannot be undone and will notify the customer.
                    </p>
                  </div>
                </div>
              </div>

              {orderToCancel && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-sm font-medium text-gray-900 mb-2">Order Details</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-semibold">{getUserName(orderToCancel.user)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Total:</span>
                      <span className="font-semibold">Rs {orderToCancel.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span>{orderToCancel.items.length} product(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Status:</span>
                      <Badge className={`${getStatusColor(orderToCancel.status)} text-white text-xs`}>
                        {orderToCancel.status.charAt(0).toUpperCase() + orderToCancel.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Includes: {orderToCancel.items.slice(0, 2).map(item => item.name).join(', ')}
                      {orderToCancel.items.length > 2 && ` and ${orderToCancel.items.length - 2} more...`}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> This action will automatically restore product stock quantities and send a cancellation notification to the customer.
                </p>
              </div>
            </div>

            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel 
                onClick={closeCancelDialog}
                disabled={cancellingOrder !== null}
                className="mt-0 bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
              >
                Keep Order Active
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
                    Confirm Cancellation
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;