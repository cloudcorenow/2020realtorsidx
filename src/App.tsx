import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyPage from './pages/PropertyPage';
import ContactPage from './pages/ContactPage';
import AgentsPage from './pages/AgentsPage';
import { Toaster } from './components/ui/Toaster';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          {/* Additional routes will be added here */}
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;