import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Navigation from './Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const IncomePage = ({ user, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error('Помилка завантаження товарів');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    
    if (!selectedProduct || !quantity || parseFloat(quantity) <= 0) {
      toast.error('Оберіть товар та введіть кількість');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.product_id === selectedProduct);
    
    if (existingIndex >= 0) {
      // Update quantity
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += parseFloat(quantity);
      setCart(updatedCart);
      toast.success('Кількість оновлено в списку');
    } else {
      // Add new item
      setCart([...cart, {
        product_id: selectedProduct,
        product_name: product.name,
        quantity: parseFloat(quantity),
        price: product.price
      }]);
      toast.success('Товар додано до списку');
    }

    setSelectedProduct('');
    setQuantity('');
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
    toast.info('Товар видалено зі списку');
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    
    const updatedCart = cart.map(item => 
      item.product_id === productId 
        ? { ...item, quantity: parseFloat(newQuantity) }
        : item
    );
    setCart(updatedCart);
  };

  const handleConfirmIncomes = async () => {
    if (cart.length === 0) {
      toast.error('Список порожній');
      return;
    }

    setLoading(true);
    try {
      // Send all incomes
      for (const item of cart) {
        await axios.post(`${API}/incomes`, {
          product_id: item.product_id,
          quantity: item.quantity,
          user_id: user.id
        });
      }
      
      toast.success(`Надходження підтверджено: ${cart.length} товар(ів)`);
      setCart([]);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Помилка підтвердження надходження');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navigation user={user} onLogout={onLogout} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add to Cart Form */}
          <Card style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }} className="shadow-lg">
            <CardHeader>
              <CardTitle style={{ color: 'var(--color-heading)' }}>Додати товар</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddToCart} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Товар
                  </label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger data-testid="income-product-select">
                      <SelectValue placeholder="Оберіть товар" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Кількість
                  </label>
                  <Input
                    data-testid="income-quantity-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Введіть кількість"
                  />
                </div>

                <Button
                  data-testid="add-to-cart-button"
                  type="submit"
                  className="w-full"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Додати до списку
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Cart Preview */}
          <Card style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle style={{ color: 'var(--color-heading)' }}>
                Список надходжень ({cart.length})
              </CardTitle>
              {cart.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCart([])}
                  style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                  data-testid="clear-cart-button"
                >
                  Очистити
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'var(--color-text)' }}>
                  Список порожній. Додайте товари для надходження.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow style={{ borderColor: 'var(--color-border)' }}>
                          <TableHead style={{ color: 'var(--color-heading)' }}>Товар</TableHead>
                          <TableHead style={{ color: 'var(--color-heading)' }}>Кількість</TableHead>
                          <TableHead style={{ color: 'var(--color-heading)' }}>Дії</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.map((item) => (
                          <TableRow key={item.product_id} style={{ borderColor: 'var(--color-border)' }} data-testid={`cart-item-${item.product_id}`}>
                            <TableCell style={{ color: 'var(--color-text)' }}>{item.product_name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuantity(item.product_id, e.target.value)}
                                className="w-24"
                                data-testid={`cart-quantity-${item.product_id}`}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFromCart(item.product_id)}
                                style={{ color: 'var(--color-danger)' }}
                                data-testid={`remove-cart-${item.product_id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <Button
                    data-testid="confirm-incomes-button"
                    onClick={handleConfirmIncomes}
                    className="w-full"
                    style={{ backgroundColor: '#10b981', color: 'white' }}
                    disabled={loading}
                  >
                    {loading ? 'Підтвердження...' : `✓ Підтвердити надходження (${cart.length})`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IncomePage;