import { useQuery } from "react-query";
import { useSearchContext } from "../contexts/SearchContext";
import * as apiClient from "../api-client";
import { useState, type ChangeEvent } from "react";
import SearchResultCard from "../components/SearchResultCard";
import Pagination from "../components/Pagination";
import StarRatingFilter from "../components/StarRatingFilter";
import TypeFilter from "../components/TypeFilter";
import FacilityFilter from "../components/FacilityFilter";
import MaxPriceFilter from "../components/MaxPriceFilter";
import { useDebounce } from "use-debounce";

type SortOptionType = "starRating" | "pricePerNightAsc" | "pricePerNightDesc";

const Search = () => {
  const search = useSearchContext();
  const [page, setPage] = useState<number>(1);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [selectedStars, setSelectedStars] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFacilites, setSelectedFacilites] = useState<string[]>([]);
  const [selectedSortOption, setSelectedSortOption] =
    useState<SortOptionType>("starRating");
  const searchParams: apiClient.SearchParams = {
    destination: search.destination,
    checkIn: search.checkIn.toISOString(),
    checkOut: search.checkOut.toISOString(),
    adultCount: search.adultCount.toString(),
    childCount: search.childCount.toString(),
    page: page.toString(),
    stars: selectedStars,
    types: selectedTypes,
    facilities: selectedFacilites,
    maxPrice: maxPrice ? maxPrice.toString() : "0",
    sortOption: selectedSortOption,
  };
  const notdbSP = {
    destination: search.destination,
    checkIn: search.checkIn.toISOString(),
    checkOut: search.checkOut.toISOString(),
    adultCount: search.adultCount.toString(),
    childCount: search.childCount.toString(),
    sortOption: selectedSortOption,
    page: page.toString(),
  };

  const [dbSP] = useDebounce(
    {
      stars: selectedStars,
      types: selectedTypes,
      facilities: selectedFacilites,
      maxPrice: maxPrice ? maxPrice.toString() : "0",
    },
    500
  );

  const { data: hotelData } = useQuery(
    ["searchHotels", notdbSP, dbSP],
    () => apiClient.searchHotels(searchParams),
    {
      cacheTime: 5000,
    }
  );

  const handleStarsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const starRating = e.target.value;
    setSelectedStars((prev) =>
      e.target.checked
        ? [...prev, starRating]
        : prev.filter((star) => star !== starRating)
    );
  };

  const handleTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const type = e.target.value;
    setSelectedTypes((prev) =>
      e.target.checked ? [...prev, type] : prev.filter((t) => t !== type)
    );
  };

  const handleFacilityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const facility = e.target.value;
    setSelectedFacilites((prev) =>
      e.target.checked
        ? [...prev, facility]
        : prev.filter((f) => f !== facility)
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
      <div className="rounded-lg border border-slate-300 p-5 h-fit lg:sticky top-10 max-h-[30vh] lg:max-h-[90vh] overflow-auto">
        <div className="space-y-5 grid grid-cols-1">
          <h3 className="text-lg font-semibold border-b border-slate-300 pb-5">
            Filter by:
          </h3>
          <StarRatingFilter
            onChange={handleStarsChange}
            selectedStars={selectedStars}
          />
          <TypeFilter
            onChange={handleTypeChange}
            selectedTypes={selectedTypes}
          />
          <FacilityFilter
            onChange={handleFacilityChange}
            selectedFacilites={selectedFacilites}
          />
          <MaxPriceFilter
            maxPrice={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
          />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">
            {hotelData?.pagination.total} Hotels found
            {search.destination ? ` in ${search.destination}` : ""}
          </span>

          <select
            value={selectedSortOption}
            onChange={(e) =>
              setSelectedSortOption(e.target.value as SortOptionType)
            }
          >
            <option value={"starRating"}>By Star Rating</option>
            <option value={"pricePerNightAsc"}> By Price (low to high)</option>
            <option value={"pricePerNightDesc"}>By Price (high to low)</option>
          </select>
        </div>
        {hotelData?.data.map((hotel) => (
          <SearchResultCard key={hotel.pid} hotel={hotel} />
        ))}

        <div>
          <Pagination
            page={hotelData?.pagination.page || 1}
            pages={hotelData?.pagination.pages || 1}
            onPageChange={(num) => setPage(num)}
          />
        </div>
      </div>
    </div>
  );
};
export default Search;
