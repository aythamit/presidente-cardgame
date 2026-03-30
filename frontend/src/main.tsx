import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router";
import App from './App.tsx'
import Room from "./components/Room.tsx";
import Rules from "./pages/Rules.tsx";
import Settings from "./pages/Settings.tsx";
import UserProvider from './providers/UserProvider.tsx';

createRoot(document.getElementById('root')!).render(
    <UserProvider>
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<App />} />
              <Route path="room">
                  <Route path=":idRoom" element={<Room />} />
              </Route>
              <Route path="rules" element={<Rules />} />
              <Route path="settings" element={<Settings />} />
          </Routes>
      </BrowserRouter>
    </UserProvider>
)
