document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const resourceType = document.getElementById('resourceType');
  const videoSelector = document.getElementById('videoSelector');
  const videoPlayer = document.querySelector('.video-player');
  const resourceDescription = document.querySelector('.resource-description');
  const resourcesContainer = document.getElementById('resourcesContainer');
  
  // State variables
  let resources = [];
  let currentResource = null;
  
  // Get the base URL for API endpoints
  const getApiBase = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? '/api' // Development
      : '/.netlify/functions/api'; // Production on Netlify
  };
  
  // Fetch external resources
  const fetchResources = async () => {
    try {
      if (!resourcesContainer) return;
      
      // Show loading state
      resourcesContainer.innerHTML = `
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p>Loading resources...</p>
        </div>
      `;
      
      const response = await fetch(`${getApiBase()}/videos`);
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      
      const data = await response.json();
      displayResources(data.videos || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      
      if (resourcesContainer) {
        resourcesContainer.innerHTML = `
          <div class="alert alert-danger">
            Error loading resources. Please try again later.
          </div>
        `;
      }
    }
  };
  
  // Filter resources by type
  const filterResourcesByType = () => {
    if (!videoSelector || !resourceType) return;
    
    const selectedType = resourceType.value;
    
    // Clear existing options
    while (videoSelector.options.length > 1) {
      videoSelector.remove(1);
    }
    
    // Filter resources by type
    const filteredResources = selectedType 
      ? resources.filter(resource => resource.resourceType === selectedType)
      : resources;
    
    // Add filtered resources
    filteredResources.forEach(resource => {
      const option = document.createElement('option');
      option.value = resource.id;
      option.textContent = resource.title;
      videoSelector.appendChild(option);
    });
  };
  
  // Display selected resource
  const displayResource = async (resourceId) => {
    if (!resourceId || !videoPlayer || !resourceDescription) return;
    
    try {
      // Find in already loaded resources or fetch from API
      let resource = resources.find(r => r.id === resourceId);
      
      if (!resource) {
        const response = await fetch(`${getApiBase()}/video/${resourceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch resource');
        }
        resource = await response.json();
      }
      
      // Save current resource
      currentResource = resource;
      
      // Display resource based on type
      if (resource.resourceType === 'video' && resource.videoUrl.includes('youtube.com')) {
        // YouTube video
        videoPlayer.innerHTML = `
          <div class="ratio ratio-16x9">
            <iframe 
              src="${resource.videoUrl}" 
              title="${resource.title}" 
              allowfullscreen>
            </iframe>
          </div>
        `;
      } else {
        // Website or other resource
        videoPlayer.innerHTML = `
          <div class="resource-link p-4 text-center bg-light">
            <h5>${resource.title}</h5>
            <a href="${resource.videoUrl}" target="_blank" class="btn btn-primary mt-2">
              Open Resource <i class="bi bi-box-arrow-up-right ms-1"></i>
            </a>
          </div>
        `;
      }
      
      // Display description
      resourceDescription.innerHTML = `
        <h5>Resource Description</h5>
        <div class="transcript-content p-3 bg-light">
          <p>${resource.transcript}</p>
        </div>
      `;
    } catch (error) {
      console.error('Error displaying resource:', error);
      videoPlayer.innerHTML = `
        <div class="video-placeholder d-flex align-items-center justify-content-center bg-light">
          <p class="text-danger">Error loading resource</p>
        </div>
      `;
    }
  };
  
  // Function to display resources
  function displayResources(resources) {
    if (!resourcesContainer || !resources.length) {
      resourcesContainer.innerHTML = `
        <div class="alert alert-info">
          No resources available at this time.
        </div>
      `;
      return;
    }
    
    let html = '<div class="row">';
    
    resources.forEach(resource => {
      const isVideo = resource.resourceType === 'video';
      const icon = isVideo ? 
        '<i class="bi bi-play-circle-fill text-danger fs-1"></i>' : 
        '<i class="bi bi-globe fs-1 text-primary"></i>';
        
      html += `
        <div class="col-md-6 mb-4">
          <div class="card h-100">
            <div class="card-header d-flex align-items-center">
              <span class="me-2">${icon}</span>
              <h5 class="card-title mb-0">${resource.title}</h5>
            </div>
            <div class="card-body">
              <p class="card-text">${resource.transcript}</p>
              <div class="text-end">
                <a href="${resource.videoUrl}" class="btn btn-primary" target="_blank">
                  ${isVideo ? 'Watch Video' : 'Visit Website'}
                </a>
              </div>
            </div>
            <div class="card-footer text-muted">
              <small>Added: ${new Date(resource.dateAdded).toLocaleDateString()}</small>
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    resourcesContainer.innerHTML = html;
  }
  
  // Event listeners
  if (resourceType) {
    resourceType.addEventListener('change', filterResourcesByType);
  }
  
  if (videoSelector) {
    videoSelector.addEventListener('change', () => {
      const selectedResourceId = videoSelector.value;
      if (selectedResourceId) {
        displayResource(selectedResourceId);
      } else {
        // Reset display
        if (videoPlayer) {
          videoPlayer.innerHTML = `
            <div class="video-placeholder d-flex align-items-center justify-content-center bg-light">
              <p>Select a resource to view</p>
            </div>
          `;
        }
        
        if (resourceDescription) {
          resourceDescription.innerHTML = `
            <h5>Resource Description</h5>
            <div class="transcript-content p-3 bg-light">
              <p>Description will appear here when a resource is selected.</p>
            </div>
          `;
        }
      }
    });
  }
  
  // Initialize
  fetchResources();
}); 