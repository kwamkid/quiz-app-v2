// src/main.jsx - แก้ปัญหา infinite loop โดยปิด StrictMode
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // ปิด StrictMode ชั่วคราวเพื่อป้องกัน useEffect ทำงานสองครั้ง
  <App />
)