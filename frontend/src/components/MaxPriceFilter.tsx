import type { ChangeEvent } from "react";

type Props = {
  maxPrice: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const MaxPriceFilter = ({ maxPrice, onChange }: Props) => {
  return (
    <div className="borded-b border-slate-300 pb-5">
      <h4 className="text-md font-semibold mb-2">Max Price per Night</h4>
      <label className="flex items-center">
        <span>$</span>
        <input
          type="number"
          min={0}
          className="rounded w-fit"
          value={maxPrice}
          onChange={onChange}
        />
      </label>
    </div>
  );
};
export default MaxPriceFilter;
