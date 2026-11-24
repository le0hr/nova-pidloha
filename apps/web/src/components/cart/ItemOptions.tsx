export default function ItemOptions({ mods }: { mods?: string[] }) {
  if (!mods?.length) return null;
  return <ul className="flex min-w-0 flex-col gap-1 text-xs text-[#666]">
    {mods.map((mod, index) => <li key={`${index}-${mod}`} title={mod} className="truncate">{mod}</li>)}
  </ul>;
}
