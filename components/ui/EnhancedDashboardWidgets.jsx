import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Car, 
  Wrench, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

// Enhanced Stats Widget
export function StatsWidget({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  trend = 'up',
  loading = false 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-modern card-stats p-6"
      >
        <div className="skeleton-modern h-6 w-24 mb-2"></div>
        <div className="skeleton-modern h-8 w-16 mb-3"></div>
        <div className="skeleton-modern h-4 w-20"></div>
      </motion.div>
    );
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-error';
      case 'warning': return 'text-warning';
      default: return 'text-text-secondary';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="card-modern card-stats p-6 relative overflow-hidden group"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-success/20 to-success/30 border border-success/20">
          <Icon className="w-6 h-6 text-success" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${getChangeColor()}`}>
            {getTrendIcon()}
            <span className="font-medium">{change}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-text-secondary text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-text-primary mb-2">{value}</p>
        {change && (
          <div className={`flex items-center space-x-1 text-sm ${getChangeColor()}`}>
            {getTrendIcon()}
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* Hover effect line */}
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-success to-success-light group-hover:w-full transition-all duration-300 ease-out"></div>
    </motion.div>
  );
}

// Enhanced Job Status Widget
export function JobStatusWidget({ jobs = [], loading = false }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-modern p-6"
      >
        <div className="skeleton-modern h-6 w-32 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="skeleton-modern h-4 w-4 rounded-full"></div>
              <div className="skeleton-modern h-4 flex-1"></div>
              <div className="skeleton-modern h-4 w-16"></div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {});

  const statusColors = {
    'pending': 'text-warning',
    'in-progress': 'text-info',
    'completed': 'text-success',
    'cancelled': 'text-error',
    'on-hold': 'text-text-tertiary'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="card-modern p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-info/20 to-info/30 border border-info/20">
            <Wrench className="w-5 h-5 text-info" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Job Status</h3>
        </div>
        <Link 
          href="/office/job-management" 
          className="text-sm text-info hover:text-info/80 transition-colors duration-200 font-medium"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Link key={status} href={`/office/job-management?status=${status}`}>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full bg-current ${statusColors[status] || 'text-text-tertiary'}`}></div>
                <span className="text-sm font-medium text-text-secondary capitalize">
                  {status.replace('-', ' ')}
                </span>
              </div>
              <span className="text-lg font-bold text-text-primary">{count}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-text-tertiary mb-2">
          <span>Total Jobs</span>
          <span>{jobs.length}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(jobs.filter(j => j.status === 'completed').length / jobs.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-6">
          <Link 
            href="/office/jobs/new" 
            className="inline-block text-sm text-info hover:text-info/80 transition-colors duration-200 font-medium"
          >
            Create First Job
          </Link>
        </div>
      )}
    </motion.div>
  );
}

// Enhanced Revenue Widget
export function RevenueWidget({ revenue = 0, target = 0, loading = false }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-modern card-stats p-6"
      >
        <div className="skeleton-modern h-6 w-24 mb-2"></div>
        <div className="skeleton-modern h-8 w-32 mb-3"></div>
        <div className="skeleton-modern h-4 w-full mb-2"></div>
        <div className="skeleton-modern h-4 w-3/4"></div>
      </motion.div>
    );
  }

  const percentage = target > 0 ? (revenue / target) * 100 : 0;
  const isOnTrack = percentage >= 80;
  const isBehind = percentage < 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`card-modern p-6 ${isOnTrack ? 'card-success' : isBehind ? 'card-warning' : 'card-info'}`}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-3 rounded-xl ${
          isOnTrack ? 'bg-success/20 border-success/20' : 
          isBehind ? 'bg-warning/20 border-warning/20' : 
          'bg-info/20 border-info/20'
        } border`}>
          <DollarSign className={`w-6 h-6 ${
            isOnTrack ? 'text-success' : 
            isBehind ? 'text-warning' : 
            'text-info'
          }`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Revenue</h3>
          <p className="text-sm text-text-tertiary">Monthly Target</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-text-primary mb-1">
          £{revenue.toLocaleString()}
        </div>
        <div className="text-sm text-text-secondary">
          Target: £{target.toLocaleString()}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-text-tertiary mb-2">
          <span>Progress</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-fill ${
              isOnTrack ? 'bg-gradient-to-r from-success to-success-light' :
              isBehind ? 'bg-gradient-to-r from-warning to-warning-light' :
              'bg-gradient-to-r from-info to-info-light'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Status indicator */}
      <div className={`flex items-center space-x-2 text-sm ${
        isOnTrack ? 'text-success' : 
        isBehind ? 'text-warning' : 
        'text-info'
      }`}>
        {isOnTrack ? (
          <CheckCircle className="w-4 h-4" />
        ) : isBehind ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <Clock className="w-4 h-4" />
        )}
        <span className="font-medium">
          {isOnTrack ? 'On Track' : isBehind ? 'Behind Target' : 'In Progress'}
        </span>
      </div>
    </motion.div>
  );
}

// Enhanced Quick Actions Widget
export function QuickActionsWidget({ actions = [], loading = false }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-modern p-6"
      >
        <div className="skeleton-modern h-6 w-32 mb-4"></div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-modern h-20 rounded-lg"></div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="card-modern p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/30 border border-primary/20">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            className="p-4 rounded-lg bg-gradient-to-br from-surface-secondary to-surface-tertiary border border-border-primary hover:border-primary/30 transition-all duration-200 group"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/30 border border-primary/20 group-hover:border-primary/40 transition-colors">
                {action.icon}
              </div>
              <span className="text-sm font-medium text-text-secondary text-center">
                {action.label}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// Enhanced Vehicle Overview Widget
export function VehicleOverviewWidget({ vehicles = [], loading = false }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-modern p-6"
      >
        <div className="skeleton-modern h-6 w-32 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="skeleton-modern h-12 w-12 rounded-lg"></div>
              <div className="flex-1">
                <div className="skeleton-modern h-4 w-24 mb-1"></div>
                <div className="skeleton-modern h-3 w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  const upcomingServices = vehicles.filter(v => {
    if (!v.service_date) return false;
    const serviceDate = new Date(v.service_date);
    const now = new Date();
    const diffTime = serviceDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="card-modern p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/30 border border-accent/20">
            <Car className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Vehicle Overview</h3>
        </div>
        <Link 
          href="/office/vehicles" 
          className="text-sm text-accent hover:text-accent/80 transition-colors duration-200 font-medium"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {upcomingServices.slice(0, 3).map((vehicle, index) => {
          const serviceDate = new Date(vehicle.service_date);
          const now = new Date();
          const diffTime = serviceDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return (
            <Link key={vehicle.id} href={`/office/vehicles/${vehicle.id}`}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-br from-surface-secondary to-surface-tertiary border border-border-primary hover:border-accent/30 hover:bg-surface-tertiary transition-all duration-200 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-accent/30 border border-accent/20 flex items-center justify-center">
                  <Car className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-text-primary">{vehicle.registration}</div>
                  <div className="text-sm text-text-tertiary">
                    Service due in {diffDays} day{diffDays !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  diffDays <= 7 ? 'bg-error/20 text-error border border-error/30' :
                  diffDays <= 14 ? 'bg-warning/20 text-warning border border-warning/30' :
                  'bg-success/20 text-success border border-success/30'
                }`}>
                  {diffDays <= 7 ? 'Urgent' : diffDays <= 14 ? 'Soon' : 'Upcoming'}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {upcomingServices.length === 0 && (
        <div className="text-center py-8 text-text-tertiary">
          <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No upcoming services</p>
          <Link 
            href="/office/vehicles/new" 
            className="inline-block mt-3 text-sm text-accent hover:text-accent/80 transition-colors duration-200 font-medium"
          >
            Add Vehicle
          </Link>
        </div>
      )}
    </motion.div>
  );
}

// Enhanced Team Status Widget
export function TeamStatusWidget({ team = [], loading = false }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-modern p-6"
      >
        <div className="skeleton-modern h-6 w-32 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="skeleton-modern h-10 w-10 rounded-full"></div>
              <div className="flex-1">
                <div className="skeleton-modern h-4 w-20 mb-1"></div>
                <div className="skeleton-modern h-3 w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="card-modern p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/30 border border-primary/20">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary">Team Status</h3>
      </div>

      <div className="space-y-4">
        {team.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-br from-surface-secondary to-surface-tertiary border border-border-primary hover:border-primary/30 transition-all duration-200"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 border border-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface-primary ${
                member.status === 'online' ? 'bg-success' :
                member.status === 'busy' ? 'bg-warning' :
                'bg-text-tertiary'
              }`}></div>
            </div>
            <div className="flex-1">
              <div className="font-medium text-text-primary">{member.name}</div>
              <div className="text-sm text-text-tertiary">{member.role}</div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              member.status === 'online' ? 'bg-success/20 text-success border border-success/30' :
              member.status === 'busy' ? 'bg-warning/20 text-warning border border-warning/30' :
              'bg-text-tertiary/20 text-text-tertiary border border-text-tertiary/30'
            }`}>
              {member.status}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 