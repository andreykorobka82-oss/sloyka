import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const CoffeeMachineInput = ({ product, beverages, machineData, onDataChange }) => {
  const productBeverages = beverages.filter(b => b.coffee_product_id === product.id);

  const handleChange = (field, value) => {
    onDataChange(product.id, {
      ...machineData,
      [field]: value
    });
  };

  const handleBeverageChange = (beverageId, quantity) => {
    onDataChange(product.id, {
      ...machineData,
      beverages_sold: {
        ...(machineData.beverages_sold || {}),
        [beverageId]: parseFloat(quantity) || 0
      }
    });
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base" style={{ color: 'var(--color-heading)' }}>
          Дані кавомашини для: {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Початковий лічильник
            </label>
            <Input
              type="number"
              value={machineData?.initial_counter || 0}
              onChange={(e) => handleChange('initial_counter', parseInt(e.target.value) || 0)}
              data-testid={`coffee-initial-${product.id}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Кінцевий лічильник
            </label>
            <Input
              type="number"
              value={machineData?.final_counter || 0}
              onChange={(e) => handleChange('final_counter', parseInt(e.target.value) || 0)}
              data-testid={`coffee-final-${product.id}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Списання невдалих порцій
            </label>
            <Input
              type="number"
              value={machineData?.failed_portions || 0}
              onChange={(e) => handleChange('failed_portions', parseInt(e.target.value) || 0)}
              data-testid={`coffee-failed-${product.id}`}
            />
          </div>
        </div>

        {productBeverages.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-heading)' }}>
              Кількість проданих порцій за напоями:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productBeverages.map((beverage) => (
                <div key={beverage.id}>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    {beverage.name} ({beverage.price} грн)
                  </label>
                  <Input
                    type="number"
                    value={machineData?.beverages_sold?.[beverage.id] || 0}
                    onChange={(e) => handleBeverageChange(beverage.id, e.target.value)}
                    data-testid={`beverage-sold-${beverage.id}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoffeeMachineInput;
