import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Search, Filter } from 'lucide-react';
import { supabase } from '../supabase';
import Cart from './Cart';
import NavBar from './NavBar';
import Profile from './Profile';
import Order from './Order';
import happyLogo from '../assets/happy.png';

// Helper function to get category color
const getCategoryColor = (category) => {
  const colors = {
    'Cotton': 'bg-blue-100 text-blue-700 border-blue-300',
    'Sports': 'bg-purple-100 text-purple-700 border-purple-300',
    'Wool': 'bg-green-100 text-green-700 border-green-300',
    'Eco': 'bg-pink-100 text-pink-700 border-pink-300',
    'Athletic': 'bg-indigo-100 text-indigo-700 border-indigo-300',
    'Casual': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'Formal': 'bg-red-100 text-red-700 border-red-300',
    'Winter': 'bg-teal-100 text-teal-700 border-teal-300',
  };

  return colors[category] || 'bg-gray-100 text-gray-700 border-gray-300';
};


const UserDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('home');
  const [cartCount, setCartCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCart, setShowCart] = useState(false);

  // Get current user and fetch data
  useEffect(() => {
    getCurrentUser();
    fetchProducts();
  }, []);

  // Fetch cart count when user changes
  useEffect(() => {
    if (currentUser) {
      fetchCartCount();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');

    if (!checkoutStatus) return;

    if (checkoutStatus === 'success') {
      const handleSuccess = async () => {
        try {
          await supabase
            .from('cart')
            .delete()
            .eq('user_id', currentUser.id);

          await fetchCartCount();
          setActiveTab('order');
        } catch (error) {
          console.error('Error handling checkout success:', error);
        } finally {
          window.history.replaceState(null, '', window.location.pathname);
        }
      };

      handleSuccess();
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [currentUser]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', currentUser.id);

      if (error) throw error;

      // Sum up all quantities
      const total = data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const addToCart = async (product) => {
    if (!currentUser) {
      alert('Please log in to add items to cart');
      return;
    }

    try {
      // Check if product already exists in cart
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('product_id', product.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingItem) {
        // Update quantity if item already exists
        const { error: updateError } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('cart')
          .insert([{
            user_id: currentUser.id,
            product_id: product.id,
            quantity: 1
          }]);

        if (insertError) throw insertError;
      }

      // Refresh cart count
      await fetchCartCount();

      // Show success message
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart: ' + error.message);
    }
  };

  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Show Cart view if showCart is true
  if (showCart) {
    return <Cart onBack={() => {
      setShowCart(false);
      fetchCartCount(); // Refresh cart count when returning from cart
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'profile' ? (
        <Profile />
      ) : (
        <>
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden">
                    <img
                      src={happyLogo}
                      alt="Happy Toes logo"
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Happy Toes</h1>
                    <p className="text-sm text-gray-600">Shop Premium Socks</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowCart(true)}
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ShoppingCart size={24} className="text-gray-600" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
            {activeTab === 'order' ? (
              <Order />
            ) : (
              <>
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter size={20} className="text-gray-600 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${selectedCategory === category
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="text-gray-600 mt-4">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== 'All'
                ? 'No products match your search criteria.'
                : 'Products will appear here once the admin adds them.'}
            </p>
          </div>
        ) : (
          /* Products Grid */
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:border-orange-300 transition-all duration-300 group"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-6xl">🧦</div>
                    )}

                    {/* Stock Badge */}
                    {product.stock > 0 ? (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        In Stock
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-gray-900 font-semibold mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors">
                        {product.name}
                      </h3>
                      {product.category && (
                        <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full border ${getCategoryColor(product.category)}`}>
                          {product.category}
                        </span>
                      )}
                    </div>

                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-orange-500">
                          ₱{parseFloat(product.price).toFixed(2)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {product.stock || 0} left
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.stock || product.stock === 0}
                      className={`w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${product.stock > 0
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      <ShoppingCart size={18} />
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
              </>
            )}
          </div>
      </>
      )}
    </div>
  );
};

export default UserDashboard;
