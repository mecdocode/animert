import React from 'react'
import QRCodeComponent from './QRCodeComponent'

const DonationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle escape key to close modal
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  // Add event listener for escape key
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="crt-monitor max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="terminal-screen p-6 relative">
          {/* Close Button */}  
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-crt-magenta hover:text-crt-cyan font-terminal text-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-crt-cyan"
            aria-label="Close donation modal"
          >
            [X]
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="font-pixel text-xl text-crt-cyan mb-2 text-glow">
              SUPPORT MISSION
            </h2>
            <div className="font-terminal text-sm text-crt-amber">
              {'>'} OPERATION: CLEAR_BACKLOGS.EXE
            </div>
          </div>

          {/* Humorous Content */}
          <div className="space-y-4 mb-6">
            <div className="font-terminal text-sm text-crt-text">
              <div className="text-crt-green mb-2">STATUS REPORT:</div>
              <div className="text-crt-amber">
                • Anime recommendations: OPERATIONAL ✓<br/>
                • College grades: CRITICAL ERROR ✗<br/>
                • Ramen budget: DEPLETED ✗<br/>
                • Sleep schedule: NOT_FOUND ✗
              </div>
            </div>

            <div className="border-2 border-crt-green p-3 bg-terminal-dark">
              <div className="font-terminal text-sm text-crt-text">
                <div className="text-crt-cyan mb-1">MISSION BRIEFING:</div>
                Your donation helps fund my epic battle against college backlogs! 
                Every contribution goes toward:
              </div>
              <div className="font-terminal text-xs text-crt-green mt-2">
                • Coffee for all-nighters (99% of budget)<br/>
                • Textbooks I'll never open (1% of budget)<br/>
                • Maintaining this awesome terminal ({'<'}1% of budget)
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <div className="font-terminal text-sm text-crt-amber mb-3">
              SCAN TO SUPPORT THE CAUSE:
            </div>
            <QRCodeComponent />
            <div className="font-terminal text-xs text-crt-green mt-2">
              dakxrawat@fam • UPI Payment
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-6">
            <div className="font-terminal text-xs text-crt-magenta">
              "Helping weebs find anime while I find my GPA"
            </div>
            <div className="font-terminal text-xs text-crt-amber mt-1">
              - Anonymous Struggling Student (definitely not me)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonationModal
