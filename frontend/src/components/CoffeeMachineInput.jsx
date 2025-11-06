import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const CoffeeMachineInput = ({ product, beverages, machineData, onDataChange }) => {
  const productBeverages = beverages.filter(b => b.coffee_product_id === product.id);

  const handleChange = (field, value) => {
    onDataChange(product.id, {
      ...machineData,
      [field]: value
    });
  };

  const handleBeverageChange = (beverageId, field, value) => {
    const beverages_sold = machineData?.beverages_sold || {};
    const currentBeverage = beverages_sold[beverageId] || { initial: 0, final: 0, failed: 0 };
    
    onDataChange(product.id, {
      ...machineData,
      beverages_sold: {
        ...beverages_sold,
        [beverageId]: {
          ...currentBeverage,
          [field]: parseFloat(value) || 0
        }
      }
    });
  };

  const getBeverageData = (beverageId) => {
    return machineData?.beverages_sold?.[beverageId] || { initial: 0, final: 0, failed: 0 };
  };

  const calculateBeverageStats = (beverage) => {
    const data = getBeverageData(beverage.id);
    const difference = (data.final || 0) - (data.initial || 0) - (data.failed || 0);
    const sum = difference * beverage.price;
    return { difference, sum };
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base" style={{ color: 'var(--color-heading)' }}>
          Дані кавомашини для: {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {productBeverages.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: 'var(--color-border)' }}>
                  <TableHead style={{ color: 'var(--color-heading)' }}>Напій</TableHead>
                  <TableHead style={{ color: 'var(--color-heading)' }}>Ціна</TableHead>
                  <TableHead style={{ color: 'var(--color-heading)' }}>Початковий</TableHead>
                  <TableHead style={{ color: 'var(--color-heading)' }}>Кінцевий</TableHead>
                  <TableHead style={{ color: 'var(--color-heading)' }}>Списання</TableHead>
                  <TableHead style={{ color: 'var(--color-heading)' }}>Різниця</TableHead>
                  <TableHead style={{ color: 'var(--color-heading)' }}>Сума</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productBeverages.map((beverage) => {
                  const data = getBeverageData(beverage.id);
                  const stats = calculateBeverageStats(beverage);
                  
                  return (
                    <TableRow key={beverage.id} style={{ borderColor: 'var(--color-border)' }}>
                      <TableCell style={{ color: 'var(--color-text)' }}>{beverage.name}</TableCell>
                      <TableCell style={{ color: 'var(--color-text)' }}>{beverage.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={data.initial || 0}
                          onChange={(e) => handleBeverageChange(beverage.id, 'initial', e.target.value)}
                          className="w-24"
                          data-testid={`beverage-initial-${beverage.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={data.final || 0}
                          onChange={(e) => handleBeverageChange(beverage.id, 'final', e.target.value)}
                          className="w-24"
                          data-testid={`beverage-final-${beverage.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={data.failed || 0}
                          onChange={(e) => handleBeverageChange(beverage.id, 'failed', e.target.value)}
                          className="w-24"
                          data-testid={`beverage-failed-${beverage.id}`}
                        />
                      </TableCell>
                      <TableCell style={{ color: 'var(--color-text)' }} data-testid={`beverage-diff-${beverage.id}`}>
                        {stats.difference}
                      </TableCell>
                      <TableCell style={{ color: 'var(--color-text)' }} data-testid={`beverage-sum-${beverage.id}`}>
                        {stats.sum.toFixed(2)} грн
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoffeeMachineInput;
