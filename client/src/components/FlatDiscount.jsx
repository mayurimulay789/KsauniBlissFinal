import { useNavigate } from "react-router-dom";
import discount from "../../public/discount (1).jpg";
const FlatDiscount = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/products"); // Navigates to all products page
  };
  return (
    <div className="w-full cursor-pointer px-2" onClick={handleClick}>
      <img
        src={discount} // Image from public folder
        alt="Discount Offer"
        className="w-full h-auto object-cover"
      />
    </div>
  );
};
export default FlatDiscount;