import { useSearchContext } from "../contexts/SearchContext";
import type { HotelType } from "../../../backend/src/shared/types";

const BookingSummary = ({
  hotel,
  numberOfNights,
}: {
  hotel: HotelType;
  numberOfNights: number;
}) => {
  const search = useSearchContext();

  return (
    <div className="flex flex-col gap-4 h-fit border border-slate-300 rounded-lg p-5">
      <span className="text-2xl font-bold">Your Booking Details</span>
      <div>
        <span className="text-sm text-gray-700">Location:</span>
        <div className="font-bold w-full">
          {hotel?.name}, {hotel?.city}, {hotel?.country}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="flex-1">
          <span className="text-sm text-gray-700">Check-in:</span>
          <div className="font-bold">{search.checkIn.toDateString()}</div>
        </div>
        <div className="flex-1">
          <span className="text-sm text-gray-700">Check-out:</span>
          <div className="font-bold">{search.checkOut.toDateString()}</div>
        </div>
      </div>

      <div>
        <span className="text-sm text-gray-700">Total lenght of stay:</span>
        <div className="font-bold w-full">{numberOfNights} nights</div>
      </div>

      <div>
        <span className="text-sm text-gray-700">Guests:</span>
        <div className="font-bold w-full">
          {search.adultCount} adults & {search.childCount} children
        </div>
      </div>
    </div>
  );
};
export default BookingSummary;
