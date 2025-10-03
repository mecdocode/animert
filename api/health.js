export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    const diagnostics = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      vercel: !!process.env.VERCEL,
      apiKeyConfigured: !!process.env.OPENROUTER_API_KEY,
      apiKeyLength: process.env.OPENROUTER_API_KEY?.length || 0,
      apiKeyPrefix: process.env.OPENROUTER_API_KEY?.substring(0, 10) + '...' || 'NOT_SET'
    }

    console.log('Health check diagnostics:', diagnostics)
    
    return res.status(200).json({
      message: 'Anime Recommendation Terminal API Health Check',
      ...diagnostics
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
