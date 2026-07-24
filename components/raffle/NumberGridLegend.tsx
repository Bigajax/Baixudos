import { CELL_LABEL, LEGEND_ITEMS, LEGEND_SWATCH } from "./status-meta";

export default function NumberGridLegend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {LEGEND_ITEMS.map((state) => (
        <li key={state} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-3.5 w-3.5 shrink-0 border ${LEGEND_SWATCH[state]}`}
          />
          <span className="text-xs text-smoke">{CELL_LABEL[state]}</span>
        </li>
      ))}
    </ul>
  );
}
