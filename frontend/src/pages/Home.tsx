import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import LatestDestinationCard from "../components/LatestDestinationCard";

const Home = () => {
  const { data: hotels } = useQuery("fetchQuery", () =>
    apiClient.fetchHotels()
  );
  if (!hotels) {
    return <div>No hotels found</div>;
  }

  const topRowHotels = hotels.slice(0, 2) || [];
  const bottomRowHotels = hotels.slice(2) || [];
  return (
    <div className="spece-y-3">
      <h2 className="text-3xl font-bold">Latest destination</h2>
      <p>Most recent destination added by out hosts</p>
      <div className="grid gap-4">
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          {topRowHotels.map((hotel) => (
            <LatestDestinationCard key={hotel.pid} hotel={hotel} />
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {bottomRowHotels.map((hotel) => (
            <LatestDestinationCard key={hotel.pid} hotel={hotel} />
          ))}
        </div>
      </div>
    </div>
  );
};
export default Home;
