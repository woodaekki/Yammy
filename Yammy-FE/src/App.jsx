import NavigationBarBottom from './shared/components/NavagationBarBottom'
import NavigationBarTop from './shared/components/NavigationBarTop'
import UsedItem from './useditem/components/UsedItem'
import "./App.css"

function App() {
  return (
    <div className="app-container">
      <NavigationBarTop />
      <UsedItem />
      <NavigationBarBottom />
    </div>
  );
}

export default App;
