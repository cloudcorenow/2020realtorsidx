import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Facebook, Instagram, Linkedin, Award } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/Card';
import { Agent } from '../data/agents';
import AgentAvatar from './AgentAvatar';

interface AgentCardProps {
  agent: Agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden group">
      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <AgentAvatar 
          name={agent.name}
          photo={agent.photo}
          size="xl"
          className="transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Subtle overlay for better visual hierarchy */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <CardContent className="text-center pt-6">
        <Link to={`/agents/${agent.id}`}>
          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-900 transition-colors mb-1">
            {agent.name}
          </h3>
        </Link>
        <p className="text-amber-600 font-medium mb-4">{agent.title}</p>
        
        {/* License Information */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Award size={14} className="mr-2 text-amber-500" />
            <span className="font-medium">License #{agent.licenseNumber}</span>
          </div>
        </div>
        
        {/* Experience & Listings Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-900">{agent.experience}</div>
            <div className="text-xs text-blue-600">Years Exp.</div>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg">
            <div className="text-lg font-bold text-amber-900">{agent.listings}</div>
            <div className="text-xs text-amber-600">Listings</div>
          </div>
        </div>
        
        <div className="flex justify-center mt-4 space-x-3">
          {agent.socialMedia.facebook && (
            <a 
              href={`https://facebook.com/${agent.socialMedia.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors"
              aria-label={`${agent.name}'s Facebook`}
            >
              <Facebook size={18} />
            </a>
          )}
          {agent.socialMedia.instagram && (
            <a 
              href={`https://instagram.com/${agent.socialMedia.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-600 transition-colors"
              aria-label={`${agent.name}'s Instagram`}
            >
              <Instagram size={18} />
            </a>
          )}
          {agent.socialMedia.linkedin && (
            <a 
              href={`https://linkedin.com/in/${agent.socialMedia.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-700 transition-colors"
              aria-label={`${agent.name}'s LinkedIn`}
            >
              <Linkedin size={18} />
            </a>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-100 mt-4 flex flex-col space-y-3 bg-gray-50/50">
        <a 
          href={`tel:${agent.phone}`}
          className="flex items-center justify-center w-full text-gray-700 hover:text-blue-900 transition-colors py-2 px-3 rounded-lg hover:bg-white"
        >
          <Phone size={16} className="mr-2" />
          <span className="font-medium">{agent.phone}</span>
        </a>
        <a 
          href={`mailto:${agent.email}`}
          className="flex items-center justify-center w-full text-gray-700 hover:text-blue-900 transition-colors py-2 px-3 rounded-lg hover:bg-white"
        >
          <Mail size={16} className="mr-2" />
          <span className="font-medium">{agent.email}</span>
        </a>
      </CardFooter>
    </Card>
  );
};

export default AgentCard;