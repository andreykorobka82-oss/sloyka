import requests
import sys
from datetime import datetime, timezone
import json

class SloykaAPITester:
    def __init__(self, base_url="https://sloykastore.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_user = None
        self.test_user = None
        self.test_category = None
        self.test_product = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_auth_login_admin(self):
        """Test admin login with PIN 5534"""
        success, response = self.run_test(
            "Admin Login (PIN: 5534)",
            "POST",
            "auth/login",
            200,
            data={"pin": "5534"}
        )
        if success and 'user' in response:
            self.admin_user = response['user']
            print(f"   Admin user: {self.admin_user['name']} (Role: {self.admin_user['role']})")
            return True
        return False

    def test_auth_login_invalid(self):
        """Test login with invalid PIN"""
        success, _ = self.run_test(
            "Invalid PIN Login",
            "POST",
            "auth/login",
            401,
            data={"pin": "0000"}
        )
        return success

    def test_create_user(self):
        """Create a test user"""
        test_pin = f"{datetime.now().strftime('%H%M')}"  # Use current time as PIN
        success, response = self.run_test(
            "Create Test User",
            "POST",
            "users",
            200,
            data={
                "name": f"Test User {test_pin}",
                "pin": test_pin,
                "role": "user"
            }
        )
        if success:
            self.test_user = response
            print(f"   Created user: {self.test_user['name']} (PIN: {self.test_user['pin']})")
            return True
        return False

    def test_get_users(self):
        """Get all users"""
        success, response = self.run_test(
            "Get All Users",
            "GET",
            "users",
            200
        )
        if success:
            print(f"   Found {len(response)} users")
            return True
        return False

    def test_create_category(self):
        """Create a test category"""
        success, response = self.run_test(
            "Create Test Category",
            "POST",
            "categories",
            200,
            data={"name": f"Test Category {datetime.now().strftime('%H%M%S')}"}
        )
        if success:
            self.test_category = response
            print(f"   Created category: {self.test_category['name']}")
            return True
        return False

    def test_get_categories(self):
        """Get all categories"""
        success, response = self.run_test(
            "Get All Categories",
            "GET",
            "categories",
            200
        )
        if success:
            print(f"   Found {len(response)} categories")
            return True
        return False

    def test_create_product(self):
        """Create a test product"""
        if not self.test_category:
            print("❌ Cannot create product - no test category available")
            return False
            
        success, response = self.run_test(
            "Create Test Product",
            "POST",
            "products",
            200,
            data={
                "name": f"Test Product {datetime.now().strftime('%H%M%S')}",
                "category_id": self.test_category['id'],
                "price": 100.50
            }
        )
        if success:
            self.test_product = response
            print(f"   Created product: {self.test_product['name']} (Price: {self.test_product['price']})")
            return True
        return False

    def test_get_products(self):
        """Get all products"""
        success, response = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        if success:
            print(f"   Found {len(response)} products")
            return True
        return False

    def test_create_income(self):
        """Create income transaction"""
        if not self.test_product or not self.admin_user:
            print("❌ Cannot create income - missing product or user")
            return False
            
        success, response = self.run_test(
            "Create Income Transaction",
            "POST",
            "incomes",
            200,
            data={
                "product_id": self.test_product['id'],
                "quantity": 10.0,
                "user_id": self.admin_user['id']
            }
        )
        if success:
            print(f"   Added income: {response['quantity']} units of {response['product_name']}")
            return True
        return False

    def test_get_incomes(self):
        """Get all incomes"""
        success, response = self.run_test(
            "Get All Incomes",
            "GET",
            "incomes",
            200
        )
        if success:
            print(f"   Found {len(response)} income records")
            return True
        return False

    def test_create_expense(self):
        """Create expense transaction"""
        if not self.test_product or not self.admin_user:
            print("❌ Cannot create expense - missing product or user")
            return False
            
        success, response = self.run_test(
            "Create Expense Transaction",
            "POST",
            "expenses",
            200,
            data={
                "product_id": self.test_product['id'],
                "quantity": 2.0,
                "user_id": self.admin_user['id']
            }
        )
        if success:
            print(f"   Added expense: {response['quantity']} units of {response['product_name']}")
            return True
        return False

    def test_get_expenses(self):
        """Get all expenses"""
        success, response = self.run_test(
            "Get All Expenses",
            "GET",
            "expenses",
            200
        )
        if success:
            print(f"   Found {len(response)} expense records")
            return True
        return False

    def test_create_revenue(self):
        """Create revenue record"""
        if not self.admin_user:
            print("❌ Cannot create revenue - missing user")
            return False
            
        success, response = self.run_test(
            "Create Revenue Record",
            "POST",
            "revenues",
            200,
            data={
                "date": datetime.now(timezone.utc).isoformat(),
                "amount": 500.75,
                "user_id": self.admin_user['id']
            }
        )
        if success:
            print(f"   Added revenue: {response['amount']} грн by {response['user_name']}")
            return True
        return False

    def test_get_revenues(self):
        """Get all revenues"""
        success, response = self.run_test(
            "Get All Revenues",
            "GET",
            "revenues",
            200
        )
        if success:
            print(f"   Found {len(response)} revenue records")
            return True
        return False

    def test_generate_recount(self):
        """Generate recount report"""
        if not self.test_product:
            print("❌ Cannot generate recount - missing product")
            return False
            
        start_date = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = datetime.now(timezone.utc)
        
        success, response = self.run_test(
            "Generate Recount Report",
            "POST",
            "recount/generate",
            200,
            data={
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "final_stocks": {self.test_product['id']: 8.0}  # Should be 10 - 2 = 8 after income/expense
            }
        )
        if success:
            print(f"   Generated recount with {len(response['products'])} products")
            print(f"   Total revenue: {response['total_revenue']} грн")
            print(f"   Total sales: {response['total_sales']} грн")
            return True
        return False

    def test_stock_verification(self):
        """Verify stock levels after transactions"""
        if not self.test_product:
            print("❌ Cannot verify stock - missing product")
            return False
            
        success, response = self.run_test(
            "Verify Product Stock",
            "GET",
            "products",
            200
        )
        if success:
            # Find our test product
            for product in response:
                if product['id'] == self.test_product['id']:
                    expected_stock = 8.0  # 10 (income) - 2 (expense) = 8
                    actual_stock = product['current_stock']
                    if actual_stock == expected_stock:
                        print(f"✅ Stock verification passed: {actual_stock} units (expected: {expected_stock})")
                        return True
                    else:
                        print(f"❌ Stock verification failed: {actual_stock} units (expected: {expected_stock})")
                        return False
            print("❌ Test product not found in products list")
            return False
        return False

def main():
    print("🚀 Starting Слойка API Testing...")
    print("=" * 60)
    
    tester = SloykaAPITester()
    
    # Test sequence
    tests = [
        # Authentication tests
        tester.test_auth_login_admin,
        tester.test_auth_login_invalid,
        
        # User management tests
        tester.test_create_user,
        tester.test_get_users,
        
        # Category management tests
        tester.test_create_category,
        tester.test_get_categories,
        
        # Product management tests
        tester.test_create_product,
        tester.test_get_products,
        
        # Transaction tests
        tester.test_create_income,
        tester.test_get_incomes,
        tester.test_create_expense,
        tester.test_get_expenses,
        
        # Stock verification
        tester.test_stock_verification,
        
        # Revenue tests
        tester.test_create_revenue,
        tester.test_get_revenues,
        
        # Recount tests
        tester.test_generate_recount,
    ]
    
    # Run all tests
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {str(e)}")
            tester.failed_tests.append({
                "test": test.__name__,
                "error": f"Test crashed: {str(e)}"
            })
    
    # Print results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS")
    print("=" * 60)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for i, failure in enumerate(tester.failed_tests, 1):
            print(f"{i}. {failure['test']}")
            if 'error' in failure:
                print(f"   Error: {failure['error']}")
            else:
                print(f"   Expected: {failure['expected']}, Got: {failure['actual']}")
                print(f"   Response: {failure['response']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())