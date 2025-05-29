import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "../api-client";
import { AiFillStar } from "react-icons/ai";
import GuestInfoForm from "../forms/GuestInfoForm/GuestInfoForm";

const HotelPage = () => {
  const { pid } = useParams();
  const { data: hotel, isLoading } = useQuery(
    "fetchHotel",
    () => apiClient.fetchHotelById(pid as string),
    {
      enabled: !!pid,
      onSuccess: () => {
        console.log(hotel);
      },
      cacheTime: 30000,
    }
  );
  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (!hotel) {
    return <></>;
  }
  return (
    <div className="space-y-6">
      <div>
        <span className="flex ">
          {Array.from({ length: hotel.starRating }).map((_, index) => (
            <AiFillStar key={index} className="fill-yellow-400" />
          ))}
        </span>
        <h1 className="text-3xl font-bold">{hotel.name}</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {hotel.imageUrls.map((url) => (
          <div key={url} className="h-[300px]">
            <img
              src={url}
              alt={hotel.name}
              className="rounded-md size-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        {hotel.facilities.map((facility) => (
          <div
            key={facility}
            className="border border-slate-300 rounded-sm p-3"
          >
            {facility}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
        <div className="whitespace-pre-line">{hotel.description}</div>
        <div className="h-fit">
          <GuestInfoForm pid={hotel.pid} pricePerNight={hotel.pricePerNight} />
        </div>
      </div>
    </div>
  );
};
export default HotelPage;
