"use client"
import React, { useEffect } from 'react'
import ShareLink from './ShareLink'
import Navbar from './Navbar'
import Pair from '@/components/HomePage/Pair.jsx'
import EnterName from './EnterName'
import Loading from '@/components/Ui/Loading'
import FilesList from '@/components/ReceivingPage/FilesList'
import ReceivingFilesHeading from '@/components/ReceivingPage/ReceivingFilesHeading'
import FilePicker from '@/components/HomePage/FileInput'
import SelectedFiles from '@/components/HomePage/SelectedFiles'
import PairingStatusSenderSide from './PairingStatusSenderSide.jsx'
import { SendFileDataProvider, useSendFileData } from '@/context/SendFileDataContext'
function HomePage() {
  return (
    <>
       <Navbar/> 
      <ShareLink  />  
      <FilePicker/>
      <SelectedFiles/>
      <PairingStatusSenderSide/> 

    </>
  )
}

export default HomePage
