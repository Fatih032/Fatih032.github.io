import './App.css';
import * as React from "react";
import {  BrowserRouter as Router, Routes, Route} from "react-router-dom";
import FooterComponent from './components/FooterComponent';
import HeaderComponent from './components/HeaderComponent';
import ListSporcuComponent from './components/ListSporcuComponent';
import AddSporcuComponent from './components/AddSporcuComponent';
import UpdateSporcuComponent from './components/UpdateSporcuComponent';
import ViewSporcuComponent from './components/ViewSporcuComponent';

function App() { 
  return (
      <div>
        <Router>
          <HeaderComponent />
          <div className="container">
            <Routes>
              <Route path='/'  element = {<ListSporcuComponent />} ></Route>
              <Route path='/sporcu'  element={<ListSporcuComponent />} ></Route>
              <Route path='/sporcu-kayit'  element={<AddSporcuComponent />} ></Route>
              <Route path='/sporcu-guncelle/:id'  element={<UpdateSporcuComponent />} ></Route>
              <Route path='/sporcu-guruntule/:id'  element={<ViewSporcuComponent />} ></Route>
            </Routes>
          </div>
{/*           <FooterComponent /> */}
        </Router> 
      </div>
  );
}

export default App;
