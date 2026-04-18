import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import RoomPage from './components/RoomPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:id" element={<RoomPage />} />
      </Routes>
    </BrowserRouter>
  );
}
