import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Navigation from './Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ExpenseArchive = ({ user, onLogout }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editExpense, setEditExpense] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API}/expenses`);
      setExpenses(response.data);
    } catch (error) {
      toast.error('Помилка завантаження архіву');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/expenses/${editExpense.id}`, {
        quantity: parseFloat(editQuantity)
      });
      toast.success('Списання оновлено');
      setEditExpense(null);
      fetchExpenses();
    } catch (error) {
      toast.error('Помилка оновлення');
    }
  };

  const handleDelete = (expenseId, expenseName) => {
    setDeleteDialog({ open: true, id: expenseId, name: expenseName });
  };

  const confirmDelete = async () => {
    const { id } = deleteDialog;
    setDeleteDialog({ open: false, id: null, name: '' });
    
    try {
      await axios.delete(`${API}/expenses/${id}`);
      toast.success('Списання видалено');
      fetchExpenses();
    } catch (error) {
      toast.error('Помилка видалення');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navigation user={user} onLogout={onLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }} className="shadow-lg">
          <CardHeader>
            <CardTitle style={{ color: 'var(--color-heading)' }}>Архів списань</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8" style={{ color: 'var(--color-text)' }}>Завантаження...</div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--color-text)' }} data-testid="no-expenses-message">
                Немає списань
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: 'var(--color-border)' }}>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Дата</TableHead>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Товар</TableHead>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Кількість</TableHead>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Користувач</TableHead>
                      {user.role === 'admin' && <TableHead style={{ color: 'var(--color-heading)' }}>Дії</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id} style={{ borderColor: 'var(--color-border)' }} data-testid={`expense-row-${expense.id}`}>
                        <TableCell style={{ color: 'var(--color-text)' }}>{formatDate(expense.date)}</TableCell>
                        <TableCell style={{ color: 'var(--color-text)' }}>{expense.product_name}</TableCell>
                        <TableCell style={{ color: 'var(--color-text)' }} data-testid={`expense-quantity-${expense.id}`}>{expense.quantity}</TableCell>
                        <TableCell style={{ color: 'var(--color-text)' }}>{expense.user_name}</TableCell>
                        {user.role === 'admin' && (
                          <TableCell className="space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditExpense(expense);
                                    setEditQuantity(expense.quantity.toString());
                                  }}
                                  data-testid={`edit-expense-${expense.id}`}
                                >
                                  Редагувати
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Редагувати списання</DialogTitle>
                                </DialogHeader>
                                {editExpense && (
                                  <form onSubmit={handleUpdate} className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium mb-2">Кількість</label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={editQuantity}
                                        onChange={(e) => setEditQuantity(e.target.value)}
                                        required
                                      />
                                    </div>
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
                              onClick={() => handleDelete(expense.id, expense.product_name)}
                              data-testid={`delete-expense-${expense.id}`}
                            >
                              Видалити
                            </Button>
                          </TableCell>
                        )}
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

export default ExpenseArchive;