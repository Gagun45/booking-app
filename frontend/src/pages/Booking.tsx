import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import BookingForm from "../forms/BookingForm/BookingForm";
import { useParams } from "react-router-dom";
import BookingSummary from "../components/BookingSummary";
import { useEffect, useState } from "react";
import { useSearchContext } from "../contexts/SearchContext";
import { Elements } from "@stripe/react-stripe-js";
import { useAppContext } from "../contexts/AppContext";

const Booking = () => {
  const [numberOfNights, setNumberOfNights] = useState(0);
  const { stripePromise } = useAppContext();
  const { data: currentUser } = useQuery(
    "fetchCurrentUser",
    apiClient.fetchCurrentUser
  );

  const { checkIn, checkOut } = useSearchContext();

  const { pid } = useParams();
  const { data: hotel } = useQuery(
    "fetchHotelById",
    () => apiClient.fetchHotelById(pid as string),
    {
      enabled: !!pid,
    }
  );

  useEffect(() => {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setNumberOfNights(diffDays);
  }, [checkIn, checkOut]);

  const { data: paymentIntentData } = useQuery(
    "createPaymentIntent",
    () =>
      apiClient.createPaymentIntent(pid as string, numberOfNights.toString()),
    {
      enabled: !!pid && numberOfNights > 0,
    }
  );

  return (
    <div className="grid md:grid-cols-[1fr_2fr] gap-2">
      {hotel && (
        <BookingSummary hotel={hotel} numberOfNights={numberOfNights} />
      )}
      {currentUser && paymentIntentData && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: paymentIntentData.clientSecret,
          }}
        >
          <BookingForm
            currentUser={currentUser}
            paymentIntent={paymentIntentData}
          />
        </Elements>
      )}
    </div>
  );
};
export default Booking;
