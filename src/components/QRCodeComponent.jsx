import React from 'react'

const QRCodeComponent = () => {
  // Retro-styled QR code placeholder that matches the terminal aesthetic
  const qrCodeData = `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#1a1a2e"/>
      <rect x="10" y="10" width="180" height="180" fill="none" stroke="#00ff41" stroke-width="2"/>
      
      <!-- QR Code Pattern Simulation -->
      <rect x="20" y="20" width="20" height="20" fill="#00ff41"/>
      <rect x="50" y="20" width="10" height="10" fill="#00ff41"/>
      <rect x="70" y="20" width="10" height="10" fill="#00ff41"/>
      <rect x="90" y="20" width="20" height="20" fill="#00ff41"/>
      <rect x="120" y="20" width="10" height="10" fill="#00ff41"/>
      <rect x="140" y="20" width="10" height="10" fill="#00ff41"/>
      <rect x="160" y="20" width="20" height="20" fill="#00ff41"/>
      
      <rect x="20" y="50" width="10" height="10" fill="#00ff41"/>
      <rect x="40" y="50" width="10" height="10" fill="#00ff41"/>
      <rect x="60" y="50" width="20" height="20" fill="#00ff41"/>
      <rect x="90" y="50" width="10" height="10" fill="#00ff41"/>
      <rect x="110" y="50" width="20" height="20" fill="#00ff41"/>
      <rect x="140" y="50" width="10" height="10" fill="#00ff41"/>
      <rect x="160" y="50" width="10" height="10" fill="#00ff41"/>
      
      <!-- Center text -->
      <text x="100" y="90" text-anchor="middle" font-family="monospace" font-size="10" fill="#00ffff">
        SCAN TO DONATE
      </text>
      <text x="100" y="110" text-anchor="middle" font-family="monospace" font-size="12" fill="#dff9fb">
        dakxrawat@fam
      </text>
      <text x="100" y="130" text-anchor="middle" font-family="monospace" font-size="8" fill="#f3eba2">
        UPI Payment
      </text>
      
      <!-- More QR pattern -->
      <rect x="20" y="140" width="10" height="10" fill="#00ff41"/>
      <rect x="40" y="140" width="20" height="20" fill="#00ff41"/>
      <rect x="70" y="140" width="10" height="10" fill="#00ff41"/>
      <rect x="90" y="140" width="10" height="10" fill="#00ff41"/>
      <rect x="110" y="140" width="10" height="10" fill="#00ff41"/>
      <rect x="130" y="140" width="20" height="20" fill="#00ff41"/>
      <rect x="160" y="140" width="10" height="10" fill="#00ff41"/>
      
      <rect x="20" y="170" width="20" height="20" fill="#00ff41"/>
      <rect x="50" y="170" width="10" height="10" fill="#00ff41"/>
      <rect x="70" y="170" width="10" height="10" fill="#00ff41"/>
      <rect x="90" y="170" width="20" height="20" fill="#00ff41"/>
      <rect x="120" y="170" width="10" height="10" fill="#00ff41"/>
      <rect x="140" y="170" width="10" height="10" fill="#00ff41"/>
      <rect x="160" y="170" width="20" height="20" fill="#00ff41"/>
    </svg>
  `)}`

  return (
    <div className="bg-white p-4 inline-block border-2 border-crt-cyan">
      <img 
        src="/donation-qr.png"
        alt="UPI QR Code - dakxrawat@fam" 
        className="w-48 h-48 mx-auto"
        style={{ imageRendering: 'pixelated' }}
        onError={(e) => {
          // Fallback to placeholder if image not found
          e.target.src = qrCodeData
        }}
      />
    </div>
  )
}

export default QRCodeComponent
