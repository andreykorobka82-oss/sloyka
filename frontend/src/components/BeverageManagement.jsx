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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BeverageManagement = () => {
  const [beverages, setBeverages] = useState([]);
  const [products, setProducts] = useState([]);
  const [coffeeProducts, setCoffeeProducts] = useState([]);
  const [newBeverage, setNewBeverage] = useState({ name: '', price: '', coffee_product_id: '' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

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

  const handleDelete = (beverageId, beverageName) => {
    setDeleteDialog({ open: true, id: beverageId, name: beverageName });
  };

  const confirmDelete = async () => {
    const { id } = deleteDialog;
    setDeleteDialog({ open: false, id: null, name: '' });
    
    try {
      await axios.delete(`${API}/beverages/${id}`);
      toast.success('Напій видалено');
      fetchData();
    } catch (error) {
      toast.error('Помилка видалення');
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
                  onClick={() => handleDelete(beverage.id, beverage.name)}
                  data-testid={`delete-beverage-${beverage.id}`}
                >
                  Видалити
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, id: null, name: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Підтвердження видалення</AlertDialogTitle>
            <AlertDialogDescription>
              Ви впевнені, що хочете видалити напій <strong>"{deleteDialog.name}"</strong>?
              <br />
              Цю дію не можна буде скасувати.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              style={{ backgroundColor: 'var(--color-danger)' }}
            >
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BeverageManagement;
