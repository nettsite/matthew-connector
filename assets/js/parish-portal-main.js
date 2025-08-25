/**
 * Parish Portal Main Entry Point
 * Coordinates initialization of all modules
 */

jQuery(document).ready(function($) {
    'use strict';
    
    // Ensure all required modules are loaded
    function checkDependencies() {
        const requiredModules = ['Utils', 'API', 'Auth', 'Household', 'Members'];
        const missingModules = [];
        
        requiredModules.forEach(module => {
            if (!window.ParishPortal || !window.ParishPortal[module]) {
                missingModules.push(module);
            }
        });
        
        if (missingModules.length > 0) {
            console.error('Missing ParishPortal modules:', missingModules);
            return false;
        }
        
        return true;
    }
    
    // Initialize all modules in the correct order
    function initializeModules() {
        console.log('Initializing Parish Portal modules...');
        
        // Initialize modules that don't depend on others first
        if (window.ParishPortal.Utils) {
            console.log('Utils module ready');
        }
        
        if (window.ParishPortal.API) {
            console.log('API module ready');
        }
        
        // Initialize authentication module
        if (window.ParishPortal.Auth) {
            window.ParishPortal.Auth.init();
            console.log('Auth module initialized');
        }
        
        // Initialize household management
        if (window.ParishPortal.Household) {
            window.ParishPortal.Household.init();
            console.log('Household module initialized');
        }
        
        // Initialize member management
        if (window.ParishPortal.Members) {
            window.ParishPortal.Members.init();
            console.log('Members module initialized');
        }
        
        console.log('All Parish Portal modules initialized successfully');
    }
    
    // Main initialization
    function init() {
        console.log('Parish Portal main initialization starting...');
        
        // Check if parishPortalAjax is available
        if (typeof parishPortalAjax === 'undefined') {
            console.error('parishPortalAjax not found. Make sure the script is properly enqueued.');
            return;
        }
        
        // Check dependencies
        if (!checkDependencies()) {
            console.error('Cannot initialize Parish Portal due to missing dependencies');
            return;
        }
        
        // Initialize all modules
        initializeModules();
        
        console.log('Parish Portal initialization complete');
    }
    
    // Start initialization
    init();
});
