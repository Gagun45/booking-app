import { useFormContext } from "react-hook-form";
import { type HotelFormData } from "./ManageHotelForm";

const GuestsSections = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<HotelFormData>();
  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Guests</h2>
      <div className="grid grid-cols-2 bg-gray-300 p-6 gap-5 rounded">
        <label className="text-gray-700 text-sm font-bold">
          Adults
          <input
            type="number"
            min={1}
            max={5}
            className="border rounded w-full bg-white py-2 px-3 font-normal"
            {...register("adultCount", { required: "This field is required" })}
          ></input>
          {errors.adultCount && (
            <span className="text-red-500">{errors.adultCount.message}</span>
          )}
        </label>

        <label className="text-gray-700 text-sm font-bold">
          Children
          <input
            type="number"
            min={0}
            max={5}
            className="border rounded bg-white w-full py-2 px-3 font-normal"
            {...register("childCount", { required: "This field is required" })}
          ></input>
          {errors.childCount && (
            <span className="text-red-500">{errors.childCount.message}</span>
          )}
        </label>
      </div>
    </div>
  );
};
export default GuestsSections;
