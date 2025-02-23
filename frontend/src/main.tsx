import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router";
import App from './App.tsx'
import Room from "./components/Room.tsx";
import UserProvider from './providers/UserProvider.tsx';


// @ts-ignore
createRoot(document.getElementById('root')!).render(
    <UserProvider>
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<App />} />
              <Route path="room">
                  <Route path=":idRoom" element={<Room />} />
              </Route>
          </Routes>
      </BrowserRouter>
    </UserProvider>
        ,
)
