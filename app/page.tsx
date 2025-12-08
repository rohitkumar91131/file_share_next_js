import React from 'react'
import HomePage from '@/components/HomePage/HomePage'
import {ReceivingStatusProvider} from '@/context/ReceivingSideStatusContext'
function page() {
  return (
    <ReceivingStatusProvider>
      <HomePage />
    </ReceivingStatusProvider>
  )
}

export default page
