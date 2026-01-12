import { useState } from 'react'

import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SenderComponent from './components/sender'
import ReceiverComponent from './components/receiver'

function App() {
 

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route></Route>
      <Route path='/sender' element={<SenderComponent/>}></Route>
      <Route path='/receiver' element={<ReceiverComponent/>}></Route>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
