import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Navigation from './Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import BeverageManagement from './BeverageManagement';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanel = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newUser, setNewUser] = useState({ name: '', pin: '', role: 'user' });
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newProduct, setNewProduct] = useState({ name: '', category_id: '', price: '', product_type: 'normal' });
  const [editProduct, setEditProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: null, name: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, categoriesRes, productsRes] = await Promise.all([
        axios.get(`${API}/users`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/products`)
      ]);
      setUsers(usersRes.data);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      toast.error('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  // User Management
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (newUser.pin.length !== 4) {
      toast.error('ПІН-код повинен містити 4 цифри');
      return;
    }
    try {
      await axios.post(`${API}/users`, newUser);
      toast.success('Користувача додано');
      setNewUser({ name: '', pin: '', role: 'user' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Помилка створення користувача');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    setDeleteDialog({ open: true, type: 'user', id: userId, name: userName });
  };

  const confirmDelete = async () => {
    const { type, id } = deleteDialog;
    setDeletingId(id);
    setDeleteDialog({ open: false, type: '', id: null, name: '' });

    try {
      if (type === 'user') {
        await axios.delete(`${API}/users/${id}`);
        toast.success('Користувача видалено');
      } else if (type === 'category') {
        await axios.delete(`${API}/categories/${id}`);
        toast.success('Категорію видалено');
      } else if (type === 'product') {
        await axios.delete(`${API}/products/${id}`);
        toast.success('Товар видалено');
      }
      await fetchData();
    } catch (error) {
      toast.error('Помилка видалення');
    } finally {
      setDeletingId(null);
    }
  };

  // Category Management
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/categories`, newCategory);
      toast.success('Категорію додано');
      setNewCategory({ name: '' });
      fetchData();
    } catch (error) {
      toast.error('Помилка створення категорії');
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    setDeleteDialog({ open: true, type: 'category', id: categoryId, name: categoryName });
  };

  // Product Management
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/products`, {
        ...newProduct,
        price: parseFloat(newProduct.price)
      });
      toast.success('Товар додано');
      setNewProduct({ name: '', category_id: '', price: '' });
      fetchData();
    } catch (error) {
      toast.error('Помилка створення товару');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/products/${editProduct.id}`, {
        name: editProduct.name,
        category_id: editProduct.category_id,
        price: parseFloat(editProduct.price)
      });
      toast.success('Товар оновлено');
      setEditProduct(null);
      fetchData();
    } catch (error) {
      toast.error('Помилка оновлення');
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    setDeleteDialog({ open: true, type: 'product', id: productId, name: productName });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Без категорії';
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navigation user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center" style={{ color: 'var(--color-text)' }}>Завантаження...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navigation user={user} onLogout={onLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }} className="shadow-lg">
          <CardHeader>
            <CardTitle style={{ color: 'var(--color-heading)' }}>Панель адміністрування</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="users" data-testid="tab-users">Користувачі</TabsTrigger>
                <TabsTrigger value="categories" data-testid="tab-categories">Категорії</TabsTrigger>
                <TabsTrigger value="products" data-testid="tab-products">Товари</TabsTrigger>
                <TabsTrigger value="beverages" data-testid="tab-beverages">Напої</TabsTrigger>
              </TabsList>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Додати користувача</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <Input
                        data-testid="user-name-input"
                        placeholder="Ім'я користувача"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        required
                      />
                      <Input
                        data-testid="user-pin-input"
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="ПІН-код (4 цифри)"
                        value={newUser.pin}
                        onChange={(e) => setNewUser({ ...newUser, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        required
                      />
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                        <SelectTrigger data-testid="user-role-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Користувач</SelectItem>
                          <SelectItem value="admin">Адміністратор</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="submit" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }} data-testid="add-user-button">
                        Додати
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ім'я</TableHead>
                      <TableHead>ПІН-код</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.pin}</TableCell>
                        <TableCell>{u.role === 'admin' ? 'Адміністратор' : 'Користувач'}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            data-testid={`delete-user-${u.id}`}
                            disabled={deletingId === u.id}
                          >
                            {deletingId === u.id ? 'Видалення...' : 'Видалити'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Categories Tab */}
              <TabsContent value="categories" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Додати категорію</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                      <Input
                        data-testid="category-name-input"
                        placeholder="Назва категорії"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ name: e.target.value })}
                        required
                      />
                      <Button type="submit" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }} data-testid="add-category-button">
                        Додати
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Назва</TableHead>
                      <TableHead>Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell>{cat.name}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCategory(cat.id)}
                            data-testid={`delete-category-${cat.id}`}
                            disabled={deletingId === cat.id}
                          >
                            {deletingId === cat.id ? 'Видалення...' : 'Видалити'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Додати товар</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateProduct} className="space-y-4">
                      <Input
                        data-testid="product-name-input"
                        placeholder="Назва товару"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                      />
                      <Select value={newProduct.category_id} onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}>
                        <SelectTrigger data-testid="product-category-select">
                          <SelectValue placeholder="Оберіть категорію" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        data-testid="product-price-input"
                        type="number"
                        step="0.01"
                        placeholder="Вартість (грн)"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                      />
                      <Select value={newProduct.product_type} onValueChange={(value) => setNewProduct({ ...newProduct, product_type: value })}>
                        <SelectTrigger data-testid="product-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Звичайний товар</SelectItem>
                          <SelectItem value="weighted_loss">Ваговий (втрата 15%)</SelectItem>
                          <SelectItem value="coffee_machine">Кавомашина</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="submit" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }} data-testid="add-product-button">
                        Додати
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Назва</TableHead>
                      <TableHead>Категорія</TableHead>
                      <TableHead>Вартість</TableHead>
                      <TableHead>Залишок</TableHead>
                      <TableHead>Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{getCategoryName(product.category_id)}</TableCell>
                        <TableCell>{product.price.toFixed(2)} грн</TableCell>
                        <TableCell>{product.current_stock}</TableCell>
                        <TableCell className="space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditProduct({ ...product })}
                                data-testid={`edit-product-${product.id}`}
                              >
                                Редагувати
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Редагувати товар</DialogTitle>
                                <DialogDescription>Змініть інформацію про товар</DialogDescription>
                              </DialogHeader>
                              {editProduct && (
                                <form onSubmit={handleUpdateProduct} className="space-y-4">
                                  <Input
                                    placeholder="Назва товару"
                                    value={editProduct.name}
                                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                                    required
                                  />
                                  <Select value={editProduct.category_id} onValueChange={(value) => setEditProduct({ ...editProduct, category_id: value })}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Вартість"
                                    value={editProduct.price}
                                    onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                                    required
                                  />
                                  <Button type="submit" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
                                    Зберегти
                                  </Button>
                                </form>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            data-testid={`delete-product-${product.id}`}
                            disabled={deletingId === product.id}
                          >
                            {deletingId === product.id ? 'Видалення...' : 'Видалити'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Beverages Tab */}
              <TabsContent value="beverages" className="space-y-4">
                <BeverageManagement />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;