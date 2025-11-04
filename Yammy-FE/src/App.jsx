import { Routes, Route } from 'react-router-dom';
import NavigationBarBottom from './shared/components/NavigationBarBottom'
import NavigationBarTop from './shared/components/NavigationBarTop'
import AppRouter from './router/AppRouter'
import "./App.css"

function App() {
  return (
    <div className="app-container">
      <NavigationBarTop />
      <AppRouter /> 
      <NavigationBarBottom />
    </div>
  );
}

export default App;
