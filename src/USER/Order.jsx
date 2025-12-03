import React, { useState, useEffect } from 'react';
import { Package, Calendar, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '../supabase';

const Order = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        getCurrentUser();
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchOrders();
        }
    }, [currentUser]);

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const ordersData = data || [];

            let allItems = [];
            ordersData.forEach((order) => {
                if (!order.items) return;
                try {
                    const parsed = JSON.parse(order.items);
                    if (Array.isArray(parsed)) {
                        allItems = allItems.concat(parsed);
                    }
                } catch (parseError) {
                    console.error('Error parsing order items:', parseError);
                }
            });

            const productIds = [...new Set(allItems.map((item) => item.product_id).filter(Boolean))];

            let productsById = {};
            if (productIds.length > 0) {
                const { data: products, error: productsError } = await supabase
                    .from('products')
                    .select('id, image_url')
                    .in('id', productIds);

                if (!productsError && products) {
                    productsById = products.reduce((acc, product) => {
                        acc[product.id] = product.image_url;
                        return acc;
                    }, {});
                } else if (productsError) {
                    console.error('Error fetching product images for orders:', productsError);
                }
            }

            const enrichedOrders = ordersData.map((order) => {
                if (!order.items) return order;
                try {
                    const parsed = JSON.parse(order.items);
                    if (!Array.isArray(parsed)) return order;
                    const enhancedItems = parsed.map((item) => ({
                        ...item,
                        image_url: item.image_url || productsById[item.product_id] || null,
                    }));
                    return { ...order, items: JSON.stringify(enhancedItems) };
                } catch (parseError) {
                    console.error('Error enriching order items:', parseError);
                    return order;
                }
            });

            setOrders(enrichedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'pending':
                return <Clock className="text-yellow-500" size={20} />;
            case 'cancelled':
                return <XCircle className="text-red-500" size={20} />;
            default:
                return <Package className="text-gray-500" size={20} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                <p className="text-gray-600">Track and manage your orders</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                    <Package className="mx-auto text-gray-400 mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                    <p className="text-gray-600">You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(order.status)}
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                            <Calendar size={14} />
                                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-lg font-bold text-orange-500">
                                            <DollarSign size={18} />
                                            <span>₱{parseFloat(order.total_amount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {order.items && (
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <p className="text-sm text-gray-600 mb-2">Order Items</p>
                                    <div className="space-y-2">
                                        {JSON.parse(order.items).map((item, index) => (
                                            <div key={index} className="flex items-center justify-between py-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center">
                                                        {item.image_url ? (
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-2xl">🧦</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                                        <p className="text-xs text-gray-500">Qty {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    ₱{(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Order;
