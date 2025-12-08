"use client"
import React from 'react'
import ShareLink from './ShareLink'
import Navbar from './Navbar'
import Pair from '@/components/HomePage/Pair.jsx'
import EnterName from './EnterName'
import Loading from '@/components/Ui/Loading'
import FilesList from '@/components/ReceivingPage/FilesList'
import ReceivingFilesHeading from '@/components/ReceivingPage/ReceivingFilesHeading'
import FilePicker from '@/components/HomePage/FilePicker'
import SelectedFiles from '@/components/HomePage/SelectedFileList'
import PairingStatusSenderSide from './PairingStatusSenderSide.jsx'
function HomePage() {
  return (
    <div>
       <Navbar/> 
      <ShareLink  />  
      <PairingStatusSenderSide/> 

    </div>
  )
}

export default HomePage
