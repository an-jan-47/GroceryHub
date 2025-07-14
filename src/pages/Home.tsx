
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Welcome to GroceryHub
          </h1>
          <p className="text-gray-600">
            Your one-stop shop for fresh groceries and household essentials.
          </p>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Home;
