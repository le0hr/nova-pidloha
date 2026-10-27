type Characteristic = {
  label: string;
  value: string;
};

type Props = {
  data: Characteristic[];
};

export default function CharacteristicsTable({ data }: Props) {
  if (!data?.length) return null;

  return (
    <div className="overflow-hidden">
      <table className="w-full border border-[#E0E0E0]">
        <tbody>
          {data.map((row, index) => (
            <tr
              key={`${row.label}-${index}`}
              className={index % 2 === 0 ? "bg-[#F7F7F7] border border-[#E0E0E0]" : "bg-white border border-[#E0E0E0]"}
            >
              <td className="py-3.5 px-4 w-[42%] md:w-[280px] font-['Outfit',sans-serif] text-[14px] text-[#666] align-middle">
                {row.label}
              </td>
              <td className="py-3.5 px-4 font-['Outfit',sans-serif] text-[14px] text-[#1a1a1a] font-medium align-middle">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}