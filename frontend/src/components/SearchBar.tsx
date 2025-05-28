import { useState, type FormEvent } from "react";
import { useSearchContext } from "../contexts/SearchContext";
import { MdTravelExplore } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "react-query";

const SearchBar = () => {
  const navigate = useNavigate();
  const search = useSearchContext();
  const [destination, setDestination] = useState<string>(search.destination);
  const [checkIn, setCheckIn] = useState<Date>(search.checkIn);
  const [checkOut, setCheckOut] = useState<Date>(search.checkOut);
  const [adultCount, setAdultCount] = useState<number>(search.adultCount);
  const [childCount, setChildCount] = useState<number>(search.childCount);
  const qclient = useQueryClient();

  const clearSearchBar = () => {
    setDestination("");
    setCheckIn(new Date());
    setCheckOut(new Date());
    setAdultCount(1);
    setChildCount(0);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    search.saveSearchValues(
      destination,
      checkIn,
      checkOut,
      adultCount,
      childCount
    );

    qclient.invalidateQueries(["searchHotels"]);

    navigate("/search");
  };

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  return (
    <form
      onSubmit={handleSubmit}
      className="-mt-8 p-3 bg-orange-400 rounded shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 items-center gap-4"
    >
      <div className="flex flex-row items-center flex-1 bg-white p-2">
        <MdTravelExplore size={25} className="mr-2" />
        <input
          placeholder="Where are you going?"
          className="text-md w-full focus:outline-none"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center bg-white px-2 py-1">
          Adults:{" "}
          <input
            className="w-full p-1 focus:outline-none font-bold"
            type="number"
            min={1}
            max={5}
            value={adultCount}
            onChange={(e) => setAdultCount(parseInt(e.target.value))}
          />
        </label>

        <label className="flex items-center bg-white px-2 py-1">
          Children:{" "}
          <input
            className="w-full p-1 focus:outline-none font-bold"
            type="number"
            min={0}
            max={5}
            value={childCount}
            onChange={(e) => setChildCount(parseInt(e.target.value))}
          />
        </label>
      </div>

      <div>
        <DatePicker
          selected={checkIn}
          onChange={(date) => setCheckIn(date as Date)}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText="Check-In Date"
          className="min-w-full bg-white p-2 focus:outline-none"
          wrapperClassName="min-w-full"
        />
      </div>

      <div>
        <DatePicker
          selected={new Date(Math.max(checkOut.getTime(), checkIn.getTime()))}
          onChange={(date) => setCheckOut(date as Date)}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          minDate={new Date(Math.max(minDate.getTime(), checkIn.getTime()))}
          maxDate={maxDate}
          placeholderText="Check-Out Date"
          className="min-w-full bg-white p-2 focus:outline-none"
          wrapperClassName="min-w-full"
        />
      </div>
      <div className="flex items-center gap-1">
        <button className="w-2/3 bg-blue-600 text-white h-full p-2 font-bold text-xl hover:bg-blue-500">
          Search
        </button>
        <button
          onClick={clearSearchBar}
          type="button"
          className="w-1/3 bg-red-600 text-white h-full p-2 font-bold text-xl hover:bg-red-500"
        >
          Clear
        </button>
      </div>
    </form>
  );
};
export default SearchBar;
