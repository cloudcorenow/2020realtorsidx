export interface Agent {
  id: string;
  name: string;
  title: string;
  photo: string;
  phone: string;
  email: string;
  bio: string;
  specializations: string[];
  socialMedia: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  languages: string[];
  listings: number;
  experience: number;
  licenseNumber: string;
}

export const agents: Agent[] = [
  {
    id: 'ua1',
    name: 'Umberto Frank Autore Jr',
    title: 'Real Estate Agent',
    photo: 'placeholder',
    phone: '(714) 470-4444',
    email: 'umberto@2020realtors.com',
    bio: 'Umberto brings extensive experience in residential and commercial real estate with a focus on client satisfaction and market expertise.',
    specializations: ['Residential', 'Commercial', 'Investment Properties'],
    socialMedia: {
      linkedin: 'umberto-autore-realtor'
    },
    languages: ['English', 'Italian'],
    listings: 28,
    experience: 12,
    licenseNumber: '01436528'
  },
  {
    id: 'hf1',
    name: 'Henry Humberto Ferrufino',
    title: 'Real Estate Agent',
    photo: 'placeholder',
    phone: '(714) 470-4444',
    email: 'henry@2020realtors.com',
    bio: 'Henry specializes in helping families find their perfect homes with his deep understanding of local neighborhoods and market trends.',
    specializations: ['Residential', 'Family Homes', 'First-time Buyers'],
    socialMedia: {
      instagram: 'henryferrufino.homes'
    },
    languages: ['English', 'Spanish'],
    listings: 22,
    experience: 8,
    licenseNumber: '02086748'
  },
  {
    id: 'gg1',
    name: 'German Guzman',
    title: 'Real Estate Agent',
    photo: 'placeholder',
    phone: '(714) 470-4444',
    email: 'german@2020realtors.com',
    bio: 'German helps investors maximize their real estate portfolios with strategic market analysis and investment opportunities.',
    specializations: ['Investment Properties', 'Market Analysis', 'Multi-family'],
    socialMedia: {
      linkedin: 'german-guzman-realtor'
    },
    languages: ['English', 'Spanish'],
    listings: 19,
    experience: 15,
    licenseNumber: '01449730'
  },
  {
    id: 'eh1',
    name: 'Ernie Anthony Hermosillo',
    title: 'Real Estate Agent',
    photo: 'placeholder',
    phone: '(714) 470-4444',
    email: 'ernie@2020realtors.com',
    bio: 'Ernie specializes in luxury properties and high-end real estate transactions with a focus on exceptional service.',
    specializations: ['Luxury Homes', 'Estate Properties', 'High-end Marketing'],
    socialMedia: {
      instagram: 'erniehermosillo.luxury',
      linkedin: 'ernie-hermosillo'
    },
    languages: ['English', 'Spanish'],
    listings: 16,
    experience: 10,
    licenseNumber: '02159616'
  },
  {
    id: 'll1',
    name: 'Lina Levinthal',
    title: 'Real Estate Agent',
    photo: 'placeholder',
    phone: '(714) 470-4444',
    email: 'lina@2020realtors.com',
    bio: 'Lina brings expertise in luxury properties and high-end real estate transactions with international market knowledge.',
    specializations: ['Luxury Homes', 'Estate Properties', 'International Clients'],
    socialMedia: {
      instagram: 'linalevinthal.realestate',
      linkedin: 'linalevinthal'
    },
    languages: ['English', 'Hebrew', 'Russian'],
    listings: 24,
    experience: 18,
    licenseNumber: '01327698'
  },
  {
    id: 'rm1',
    name: 'Rogelio Martinez',
    title: 'Real Estate Agent',
    photo: 'placeholder',
    phone: '(714) 470-4444',
    email: 'rogelio@2020realtors.com',
    bio: 'Rogelio has over 15 years of experience helping clients navigate the real estate market with expertise in residential and investment properties.',
    specializations: ['Residential', 'Investment Properties', 'First-time Buyers'],
    socialMedia: {
      linkedin: 'rogelio-martinez-realtor'
    },
    languages: ['English', 'Spanish'],
    listings: 32,
    experience: 15,
    licenseNumber: '01758480'
  },
  {
    id: 'rm2',
    name: 'Rocio Medel',
    title: 'Real Estate Agent',
    photo: 'placeholder',
    phone: '(714) 470-4444',
    email: 'rocio@2020realtors.com',
    bio: 'Rocio specializes in residential sales with a passion for helping families find their dream homes in Southern California.',
    specializations: ['Residential', 'Family Homes', 'Relocation Services'],
    socialMedia: {
      instagram: 'rociomedel.homes'
    },
    languages: ['English', 'Spanish'],
    listings: 18,
    experience: 12,
    licenseNumber: '00924553'
  },
  {
    id: 'mr1',
    name: 'Maribel Ruiz Marin',
    title: 'Real Estate Agent',
    photo: 'placeholder',
    phone: '(714) 470-4444',
    email: 'maribel@2020realtors.com',
    bio: 'Maribel specializes in new construction and development properties, helping clients find modern homes with the latest amenities.',
    specializations: ['New Construction', 'Development', 'Modern Homes'],
    socialMedia: {
      linkedin: 'maribel-ruiz-marin'
    },
    languages: ['English', 'Spanish'],
    listings: 14,
    experience: 6,
    licenseNumber: '02143212'
  },
  {
    id: 'as1',
    name: 'America Sanchez',
    title: 'Real Estate Agent',
    photo: 'placeholder',
    phone: '(714) 470-4444',
    email: 'america@2020realtors.com',
    bio: 'America helps families navigate the home buying process with expertise in residential properties and neighborhood knowledge.',
    specializations: ['Residential', 'Family Homes', 'Neighborhood Expert'],
    socialMedia: {
      instagram: 'americasanchez.homes'
    },
    languages: ['English', 'Spanish'],
    listings: 20,
    experience: 9,
    licenseNumber: '01741699'
  },
  {
    id: 'ls1',
    name: 'Lisa Marie Schilling',
    title: 'Real Estate Agent',
    photo: 'placeholder',
    phone: '(714) 470-4444',
    email: 'lisa@2020realtors.com',
    bio: 'Lisa brings creative marketing strategies to showcase luxury properties with innovative approaches to high-end real estate.',
    specializations: ['Luxury Marketing', 'High-end Properties', 'Creative Marketing'],
    socialMedia: {
      instagram: 'lisamarie.luxury',
      linkedin: 'lisa-schilling-realtor'
    },
    languages: ['English'],
    listings: 17,
    experience: 11,
    licenseNumber: '01977038'
  },
  {
    id: 'js1',
    name: 'Javier Antonio Sosa',
    title: 'Real Estate Agent',
    photo: 'placeholder',
    phone: '(714) 470-4444',
    email: 'javier@2020realtors.com',
    bio: 'Javier specializes in commercial properties and business real estate solutions with extensive market knowledge.',
    specializations: ['Commercial', 'Retail Spaces', 'Office Properties'],
    socialMedia: {
      linkedin: 'javier-sosa-commercial'
    },
    languages: ['English', 'Spanish'],
    listings: 25,
    experience: 20,
    licenseNumber: '01711103'
  },
  {
    id: 'pz1',
    name: 'Porfirio Enrique Zapata',
    title: 'Real Estate Agent',
    photo: 'placeholder',
    phone: '(714) 470-4444',
    email: 'porfirio@2020realtors.com',
    bio: 'Porfirio brings decades of experience in real estate with a focus on providing exceptional client service and market expertise.',
    specializations: ['Residential', 'Investment Properties', 'Senior Consultant'],
    socialMedia: {
      linkedin: 'porfirio-zapata-realtor'
    },
    languages: ['English', 'Spanish'],
    listings: 30,
    experience: 25,
    licenseNumber: '01427100'
  }
];

export const getAgentById = (id: string): Agent | undefined => {
  return agents.find(agent => agent.id === id);
};

export const getAllAgents = (): Agent[] => {
  return agents;
};

export const getTopAgents = (count: number = 3): Agent[] => {
  return agents
    .sort((a, b) => b.listings - a.listings)
    .slice(0, count);
};