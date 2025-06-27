import React from 'react';
import { getAllAgents } from '../data/agents';
import AgentCard from '../components/AgentCard';
import Hero from '../components/Hero';

const AgentsPage: React.FC = () => {
  const agents = getAllAgents();

  return (
    <div>
      <Hero 
        title="Meet Our Expert Team"
        subtitle="Dedicated professionals ready to help you achieve your real estate goals"
        imageUrl="https://images.pexels.com/photos/1560065/pexels-photo-1560065.jpeg"
        showSearch={false}
      />
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AgentsPage;