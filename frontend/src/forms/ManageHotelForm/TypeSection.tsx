import { useFormContext } from "react-hook-form";
import { hotelTypes } from "../../config/hotel-options-config";
import { type HotelFormData } from "./ManageHotelForm";

const TypeSection = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<HotelFormData>();
  const typeWatch = watch("type");
  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Type</h2>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {hotelTypes.map((type) => (
          <label
            key={type}
            className={`
                flex items-center justify-center
                cursor-pointer bg-blue-300 text-sm rounded-full px-4 py-2 font-semibold
                ${typeWatch === type ? "bg-blue-300" : "bg-gray-300"}
                `}
          >
            <input
              type="radio"
              className="hidden"
              value={type}
              {...register("type", { required: "This field is required" })}
            />
            <span>{type}</span>
          </label>
        ))}
      </div>
      {errors.type && (
        <span className="text-red-500 font-bold text-sm">{errors.type.message}</span>
      )}
    </div>
  );
};
export default TypeSection;
