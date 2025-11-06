import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BeverageManagement = () => {
  const [beverages, setBeverages] = useState([]);
  const [products, setProducts] = useState([]);
  const [coffeeProducts, setCoffeeProducts] = useState([]);
  const [newBeverage, setNewBeverage] = useState({ name: '', price: '', coffee_product_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [beveragesRes, productsRes] = await Promise.all([
        axios.get(`${API}/beverages`),
        axios.get(`${API}/products`)
      ]);
      setBeverages(beveragesRes.data);
      setProducts(productsRes.data);
      
      // Filter coffee machine products
      const coffeeProds = productsRes.data.filter(p => p.product_type === 'coffee_machine');
      setCoffeeProducts(coffeeProds);
    } catch (error) {
      toast.error('Помилка завантаження даних');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/beverages`, {
        ...newBeverage,
        price: parseFloat(newBeverage.price)
      });
      toast.success('Напій додано');
      setNewBeverage({ name: '', price: '', coffee_product_id: '' });
      fetchData();
    } catch (error) {
      toast.error('Помилка створення напою');
    }
  };

  const handleDelete = async (beverageId) => {
    if (window.confirm('Ви впевнені, що хочете видалити напій?')) {
      try {
        await axios.delete(`${API}/beverages/${beverageId}`);
        toast.success('Напій видалено');
        fetchData();
      } catch (error) {
        toast.error('Помилка видалення');
      }
    }
  };

  const getCoffeeProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Невідомо';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Додати напій</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              data-testid="beverage-name-input"
              placeholder="Назва напою (напр. Американо (С))"
              value={newBeverage.name}
              onChange={(e) => setNewBeverage({ ...newBeverage, name: e.target.value })}
              required
            />
            <Input
              data-testid="beverage-price-input"
              type="number"
              step="0.01"
              placeholder="Вартість (грн)"
              value={newBeverage.price}
              onChange={(e) => setNewBeverage({ ...newBeverage, price: e.target.value })}
              required
            />
            <Select 
              value={newBeverage.coffee_product_id} 
              onValueChange={(value) => setNewBeverage({ ...newBeverage, coffee_product_id: value })}
            >
              <SelectTrigger data-testid="beverage-coffee-select">
                <SelectValue placeholder="Оберіть товар кави/какао" />
              </SelectTrigger>
              <SelectContent>
                {coffeeProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }} data-testid="add-beverage-button">
              Додати
            </Button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Назва</TableHead>
            <TableHead>Вартість</TableHead>
            <TableHead>Товар</TableHead>
            <TableHead>Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {beverages.map((beverage) => (
            <TableRow key={beverage.id}>
              <TableCell>{beverage.name}</TableCell>
              <TableCell>{beverage.price.toFixed(2)} грн</TableCell>
              <TableCell>{getCoffeeProductName(beverage.coffee_product_id)}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(beverage.id)}
                  data-testid={`delete-beverage-${beverage.id}`}
                >
                  Видалити
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BeverageManagement;
