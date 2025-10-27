import { Routes, Route } from 'react-router-dom';

import HomePage from "../shared/components/HomePage"
import UsedItem from "../useditem/components/UsedItem"

const index = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/useditem" element={<UsedItem />} />
    </Routes>
  );
};

export default index;