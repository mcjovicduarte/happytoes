import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../supabase';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublicKey) {
    console.error('Stripe publishable key (pk_test_51SaCe52EasqBR5Su3o1poZoxP6gn9rZB8OnWGulMhql9ZO8C6hI0SdI68eTbFfJ04btyEF8b0vOGf816u2cMLQBe0073Jkhpd3) is not set. Checkout will be disabled.');
}

const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : Promise.resolve(null);

const Cart = ({ onBack }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        getCurrentUser();
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchCartItems();
        }
    }, [currentUser]);

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };

    const fetchCartItems = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            // Fetch cart items with product details using a join
            const { data, error } = await supabase
                .from('cart')
                .select(`
                    id,
                    quantity,
                    product_id,
                    products (
                        id,
                        name,
                        description,
                        price,
                        image_url,
                        category,
                        stock
                    )
                `)
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCartItems(data || []);
        } catch (error) {
            console.error('Error fetching cart items:', error);
            alert('Failed to load cart items');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            const { error } = await supabase
                .from('cart')
                .update({ quantity: newQuantity })
                .eq('id', cartItemId);

            if (error) throw error;

            // Update local state
            setCartItems(cartItems.map(item =>
                item.id === cartItemId ? { ...item, quantity: newQuantity } : item
            ));
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Failed to update quantity');
        }
    };

    const removeItem = async (cartItemId) => {
        if (!window.confirm('Remove this item from cart?')) return;

        try {
            const { error } = await supabase
                .from('cart')
                .delete()
                .eq('id', cartItemId);

            if (error) throw error;

            // Update local state
            setCartItems(cartItems.filter(item => item.id !== cartItemId));
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item');
        }
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        if (!currentUser) {
            alert('Please log in to checkout');
            return;
        }

        try {

            const orderItems = cartItems.map((item) => {
                const product = item.products;
                return {
                    product_id: item.product_id,
                    name: product?.name,
                    price: product?.price,
                    image_url: product?.image_url,
                    quantity: item.quantity,
                };
            });

            const { data: order, error } = await supabase
                .from('orders')
                .insert([
                    {
                        user_id: currentUser.id,
                        customer_email: currentUser.email,
                        total_amount: calculateTotal(),
                        status: 'pending',
                        items: JSON.stringify(orderItems),
                    },
                ])
                .select()
                .single();

            if (error) {
                throw error;
            }

            const response = await fetch('http://localhost:4242/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: order.id,
                    items: orderItems,
                    successUrl: `${window.location.origin}/dashboard?checkout=success`,
                    cancelUrl: `${window.location.origin}/dashboard?checkout=cancelled`,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to start checkout');
            }

            const session = await response.json();

            if (!session.url) {
                throw new Error('No checkout URL returned from server');
            }

            window.location.href = session.url;
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('Failed to start checkout: ' + error.message);
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => {
            const price = item.products?.price || 0;
            return sum + (price * item.quantity);
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = subtotal * 0.1; // 10% tax
        return subtotal + tax;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    <p className="text-gray-600 mt-4">Loading cart...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                            <p className="text-sm text-gray-600">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {cartItems.length === 0 ? (
                    /* Empty Cart State */
                    <div className="text-center py-20">
                        <ShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                        <p className="text-gray-600 mb-6">Add some products to get started!</p>
                        <button
                            onClick={onBack}
                            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    /* Cart Items */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => {
                                const product = item.products;
                                if (!product) return null;

                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex gap-4">
                                            {/* Product Image */}
                                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl">
                                                        🧦
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                            {product.name}
                                                        </h3>
                                                        {product.category && (
                                                            <p className="text-sm text-gray-600">{product.category}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>

                                                {product.description && (
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                )}

                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-600 mr-2">Quantity:</span>
                                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <Minus size={16} />
                                                            </button>
                                                            <span className="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                disabled={item.quantity >= product.stock}
                                                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">
                                                            ₱{parseFloat(product.price).toFixed(2)} each
                                                        </p>
                                                        <p className="text-xl font-bold text-orange-500">
                                                            ₱{(parseFloat(product.price) * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Stock Warning */}
                                                {item.quantity >= product.stock && (
                                                    <p className="text-sm text-red-500 mt-2">
                                                        Maximum stock reached ({product.stock} available)
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-medium">₱{calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax (10%)</span>
                                        <span className="font-medium">₱{(calculateSubtotal() * 0.1).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between text-lg font-bold text-gray-900">
                                            <span>Total</span>
                                            <span className="text-orange-500">₱{calculateTotal().toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
                                >
                                    <CreditCard size={20} />
                                    Proceed to Checkout
                                </button>

                                <button
                                    onClick={onBack}
                                    className="w-full mt-3 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
