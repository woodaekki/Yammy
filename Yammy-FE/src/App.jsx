import { Routes, Route } from 'react-router-dom';
import NavigationBarBottom from './shared/components/NavagationBarBottom'
import NavigationBarTop from './shared/components/NavigationBarTop'
import SNSPage from './sns/components/SNSPage'
import UsedItem from './useditem/components/UsedItem'
import "./App.css"

function App() {
  return (
    <div className="app-container">
      <NavigationBarTop />
      <Routes>
        <Route path="/" element={<SNSPage />} />
        <Route path="/useditem" element={<UsedItem />} />
      </Routes>
      <NavigationBarBottom />
    </div>
  );
}

export default App;
