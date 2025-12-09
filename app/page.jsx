import React from 'react'
import HomePage from '@/components/HomePage/HomePage'
import {ReceivingStatusProvider} from '@/context/ReceivingSideStatusContext'
import { SendFileDataProvider } from '@/context/SendFileDataContext'
function page() {
  return (
    <ReceivingStatusProvider>
      <SendFileDataProvider>
        <HomePage />
      </SendFileDataProvider>
    </ReceivingStatusProvider>
  )
}

export default page
