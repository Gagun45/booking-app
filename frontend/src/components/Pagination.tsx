export type Props = {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({ page, pages, onPageChange }: Props) => {
  const pageNumbers = [];
  for (let i = 1; i <= pages; i++) {
    pageNumbers.push(i);
  }
  return (
    <div className="flex justify-center">
      <ul className="flex border border-slate-300">
        {pageNumbers.map((num) => (
          <li
            onClick={() => onPageChange(num)}
            className={`px-2 cursor-pointer py-1 ${
              page === num ? "bg-gray-200" : ""
            }`}
            key={num}
          >
            {num}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Pagination;
