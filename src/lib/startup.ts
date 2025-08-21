import { setupCronJobs } from './rss-fetcher';

export async function initializeSystem() {
  try {
    console.log('🚀 Initializing Palestine Pulse System...');
    
    // Setup RSS cron jobs
    setupCronJobs();
    
    console.log('✅ System initialization completed');
  } catch (error) {
    console.error('❌ System initialization failed:', error);
  }
}

// Auto-initialize when this module is imported
if (typeof window === 'undefined') {
  // Only run on server side
  initializeSystem();
}
