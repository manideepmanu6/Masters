import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Signup from './components/Signup';
import Login from './components/Login';
import UserProfileForm from './components/UserProfileForm';
import RecommendationsPage from './components/RecommendationsPage';
import HealthPredictionPage from './components/HealthPredictionPage';
import MealPlannerPage from './components/MealPlannerPage';
import DashboardPage from './components/DashboardPage';
import ChatbotPage from './components/ChatbotPage';
import ErrorPage from './components/ErrorPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<UserProfileForm />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/predict-deficiency" element={<HealthPredictionPage />} />
          
          {/* 🛠 MealPlannerPage route expects :profileId parameter */}
          <Route path="/meal-plan/:profileId" element={<MealPlannerPage />} />
          
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatbotPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
