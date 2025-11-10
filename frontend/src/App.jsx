import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './layouts/Navbar';
import HomePage from './pages/HomePage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import MBTITest from './pages/MBTITest';
import MBTIResults from './pages/MBTIResults';

function App() {
  const [userRole, setUserRole] = useState('student');
  const [userName, setUserName] = useState('John Doe');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar userRole={userRole} userName={userName} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/mbti-test" element={<MBTITest />} />
          <Route path="/student/my-results" element={<MBTIResults />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
