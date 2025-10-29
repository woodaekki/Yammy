import { useNavigate } from "react-router-dom";
import { useUsedItems } from "../useditem/hooks/useUsedItems";
import UsedItemList from "../useditem/components/UsedItemList";
import "../useditem/styles/usedItem.css";

export default function UsedItemPage() {
  const navigate = useNavigate();
  const { items } = useUsedItems();

  return (
    <div className="useditem-page-container">
      <UsedItemList items={items} />
      <button
        className="floating-add-btn"
        onClick={() => navigate("/useditem/create")}
      >
        ＋
      </button>
    </div>
  );
}
