import React from 'react'
import PairingStatusReceiverSide from './PairingStatusReceiverSide'
import FilesList from './FilesList'
import FileMetaViewer from '@/testing/filesend/ReceiveFile'

function ReceivingPage() {
  return (
    <div>
      <PairingStatusReceiverSide/>
      {/* <FilesList/> */}
      <FileMetaViewer/>
    </div>
  )
}

export default ReceivingPage
