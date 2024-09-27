import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './Components/Nav/Header'
import Main from './Pages/Main'
import Create_template from './Pages/Create_Template/Create_Template'
import ToBeApplied from './Pages/ToBeApplied/ToBeApplied'
import Qa_page from './Pages/Qa_Page/Qa_page'

function App() {
  return (
    <>
      <div className='App'>
      <BrowserRouter>
        <Header />
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/create-template" element={<Create_template />} />
              <Route path="/tobe-applied" element={<ToBeApplied />} />
              <Route path="/qa-check" element={<Qa_page />} />
            </Routes>
        </BrowserRouter>
		  </div>
    </>
  )
}

export default App
