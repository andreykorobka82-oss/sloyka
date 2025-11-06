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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const IncomePage = ({ user, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/incomes`, {
        product_id: selectedProduct,
        quantity: parseFloat(quantity),
        user_id: user.id
      });
      toast.success('Надходження додано');
      setSelectedProduct('');
      setQuantity('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Помилка додавання надходження');
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
            <CardTitle style={{ color: 'var(--color-heading)' }}>Надходження товару</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Товар
                </label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct} required>
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
                  required
                />
              </div>

              <Button
                data-testid="submit-income-button"
                type="submit"
                className="w-full"
                style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                disabled={loading}
              >
                {loading ? 'Додавання...' : 'Додати надходження'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncomePage;