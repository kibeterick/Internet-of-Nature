import React from 'react';
import { ExternalLink, Cloud, Globe, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

interface Deployment {
  name: string;
  url: string;
  description: string;
  status: 'active' | 'maintenance' | 'offline';
  icon: React.ElementType;
}

export const DeploymentLinks = () => {
  const deployments: Deployment[] = [
    {
      name: 'Production Deployment',
      url: 'https://ais-dev-uf2zckfzzl2kn5ho55jvg4-1121535168.europe-west2.run.app',
      description: 'Main production environment on Google Cloud Run',
      status: 'active',
      icon: Cloud
    },
    {
      name: 'AI Studio App',
      url: 'https://ai.studio/apps/dd3944e5-67c8-42e3-ad1b-1c15ddd3520a',
      description: 'View and manage in Google AI Studio',
      status: 'active',
      icon: Rocket
    },
    {
      name: 'GitHub Repository',
      url: 'https://github.com/kibeterick/Internet-of-Nature',
      description: 'Source code and documentation',
      status: 'active',
      icon: Globe
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'maintenance': return 'bg-amber-100 text-amber-700';
      case 'offline': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'maintenance': return 'bg-amber-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div>
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Rocket size={24} className="text-blue-600" />
          Deployments & Resources
        </h3>
        <p className="text-nature-500 text-sm">Access different environments and resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deployments.map((deployment, i) => (
          <motion.a
            key={deployment.name}
            href={deployment.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="block p-6 bg-white/50 rounded-2xl border border-nature-100 hover:border-nature-300 hover:shadow-lg transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-nature-100 rounded-xl flex items-center justify-center text-nature-600 group-hover:bg-nature-900 group-hover:text-white transition-all">
                <deployment.icon size={24} />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${getStatusColor(deployment.status)}`}>
                <div className={`w-2 h-2 rounded-full ${getStatusDot(deployment.status)} animate-pulse`} />
                {deployment.status}
              </div>
            </div>

            <h4 className="font-bold text-lg mb-2 group-hover:text-nature-900 transition-colors">
              {deployment.name}
            </h4>
            <p className="text-sm text-nature-600 mb-4 line-clamp-2">
              {deployment.description}
            </p>

            <div className="flex items-center gap-2 text-nature-500 group-hover:text-nature-900 transition-colors">
              <span className="text-xs font-medium">Visit</span>
              <ExternalLink size={14} />
            </div>
          </motion.a>
        ))}
      </div>

      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
        <div className="flex items-start gap-3">
          <Cloud size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h5 className="font-bold text-blue-900 mb-2">Deployment Information</h5>
            <p className="text-sm text-blue-800 leading-relaxed">
              The production deployment is hosted on Google Cloud Run with automatic scaling and global CDN distribution. 
              All deployments are monitored 24/7 for uptime and performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};