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
import { Trash2, Plus, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ExpensePage = ({ user, onLogout }) => {
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

    // Check stock
    if (product.current_stock < parseFloat(quantity)) {
      toast.error(`Недостатньо товару на складі. Доступно: ${product.current_stock}`);
      return;
    }

    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.product_id === selectedProduct);
    
    if (existingIndex >= 0) {
      // Update quantity
      const newQuantity = cart[existingIndex].quantity + parseFloat(quantity);
      if (product.current_stock < newQuantity) {
        toast.error(`Недостатньо товару на складі. Доступно: ${product.current_stock}`);
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity = newQuantity;
      setCart(updatedCart);
      toast.success('Кількість оновлено в списку');
    } else {
      // Add new item
      setCart([...cart, {
        product_id: selectedProduct,
        product_name: product.name,
        quantity: parseFloat(quantity),
        current_stock: product.current_stock,
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

    const item = cart.find(i => i.product_id === productId);
    if (item && newQuantity > item.current_stock) {
      toast.error(`Недостатньо товару. Доступно: ${item.current_stock}`);
      return;
    }
    
    const updatedCart = cart.map(item => 
      item.product_id === productId 
        ? { ...item, quantity: parseFloat(newQuantity) }
        : item
    );
    setCart(updatedCart);
  };

  const handleConfirmExpenses = async () => {
    if (cart.length === 0) {
      toast.error('Список порожній');
      return;
    }

    setLoading(true);
    try {
      // Send all expenses
      for (const item of cart) {
        await axios.post(`${API}/expenses`, {
          product_id: item.product_id,
          quantity: item.quantity,
          user_id: user.id
        });
      }
      
      toast.success(`Списання підтверджено: ${cart.length} товар(ів)`);
      setCart([]);
      fetchProducts(); // Refresh products to update stock
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Помилка підтвердження списання');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navigation user={user} onLogout={onLogout} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }} className="shadow-lg">
          <CardHeader>
            <CardTitle style={{ color: 'var(--color-heading)' }}>Списання товару</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Товар
                </label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct} required>
                  <SelectTrigger data-testid="expense-product-select">
                    <SelectValue placeholder="Оберіть товар" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Залишок: {product.current_stock})
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
                  data-testid="expense-quantity-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Введіть кількість"
                  required
                />
              </div>

              <Button
                data-testid="submit-expense-button"
                type="submit"
                className="w-full"
                style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                disabled={loading}
              >
                {loading ? 'Додавання...' : 'Додати списання'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpensePage;