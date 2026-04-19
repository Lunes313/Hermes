import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../layout/Navbar';
import { Hero } from './Hero';
import { Guide } from './Guide';
import { Footer } from '../layout/Footer';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-6 max-w-[1440px] mx-auto w-full">
        <Hero 
          onRadicarClick={() => navigate('/radicar')} // Esta puede ir a una vista de formulario si se prefiere
          onConsultarClick={() => navigate('/seguimiento')}
          onChatClick={() => navigate('/radicar')} // Esta va al asistente de IA
        />
        <Guide />
      </main>
      <Footer />
    </div>
  );
};
