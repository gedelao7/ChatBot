exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };
  
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  try {
    // Make sure this is a GET request
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Get the path
    const path = event.path.split('/').pop();
    
    if (path === 'topics') {
      // Return topics
      const topics = [
        { id: 'intro', name: 'Introduction to the Course' },
        { id: 'basics', name: 'Machine Learning Basics' },
        { id: 'supervised', name: 'Supervised Learning' },
        { id: 'unsupervised', name: 'Unsupervised Learning' }
      ];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ topics })
      };
    } 
    else if (path === 'videos') {
      // Return videos/resources
      const resources = {
        videos: [
          {
            id: "youtube1",
            title: "Introduction to Machine Learning",
            videoUrl: "https://www.youtube.com/embed/mJeNghZXtMo",
            transcript: "This video provides an introduction to machine learning concepts, supervised and unsupervised learning, and practical applications.",
            resourceType: "video",
            dateAdded: new Date().toISOString()
          },
          {
            id: "website1",
            title: "Machine Learning Documentation",
            videoUrl: "https://scikit-learn.org/stable/getting_started.html",
            transcript: "Official documentation for scikit-learn, a popular machine learning library that implements various algorithms.",
            resourceType: "website",
            dateAdded: new Date().toISOString()
          }
        ]
      };
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(resources)
      };
    }
    else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Endpoint not found' })
      };
    }
  } catch (error) {
    console.error('API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 