import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Navigation from './Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ user, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds for multi-user support
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/products/in-stock`),
        axios.get(`${API}/categories`)
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Без категорії';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navigation user={user} onLogout={onLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }} className="shadow-lg">
          <CardHeader>
            <CardTitle style={{ color: 'var(--color-heading)' }}>Товари в наявності</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8" style={{ color: 'var(--color-text)' }}>Завантаження...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--color-text)' }} data-testid="no-products-message">
                Немає товарів в наявності
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: 'var(--color-border)' }}>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Назва</TableHead>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Категорія</TableHead>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Залишок</TableHead>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Вартість (грн)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} style={{ borderColor: 'var(--color-border)' }} data-testid={`product-row-${product.id}`}>
                        <TableCell style={{ color: 'var(--color-text)' }} data-testid={`product-name-${product.id}`}>{product.name}</TableCell>
                        <TableCell style={{ color: 'var(--color-text)' }}>{getCategoryName(product.category_id)}</TableCell>
                        <TableCell style={{ color: 'var(--color-text)' }} data-testid={`product-stock-${product.id}`}>{product.current_stock}</TableCell>
                        <TableCell style={{ color: 'var(--color-text)' }} data-testid={`product-price-${product.id}`}>{product.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;