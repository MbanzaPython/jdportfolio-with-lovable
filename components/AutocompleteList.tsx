import { useEffect, useState } from "react";


export type Option = { value: string; label: string };
export type AutocompleteListProps = {
    open: boolean;
    options: Option[];
    onPick: (opt: Option) => void;
};


export default function AutocompleteList({ open, options, onPick }: AutocompleteListProps) {
    const [index, setIndex] = useState<number>(-1);


    useEffect(() => {
        setIndex(options.length ? 0 : -1);
    }, [options]);


    if (!open || !options.length) return null;


    return (
        <ul
            role="listbox"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setIndex((i) => Math.min(i + 1, options.length - 1));
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter" && index >= 0) {
                    e.preventDefault();
                    onPick(options[index]);
                }
            }}
            className="mt-1 max-h-64 w-full overflow-auto rounded-2xl border p-1 text-sm"
        >
            {options.map((opt, i) => (
                <li
                    key={opt.value}
                    role="option"
                    aria-selected={i === index}
                    className={`cursor-pointer rounded-xl px-3 py-2 ${i === index ? "bg-accent" : ""}`}
                    onMouseEnter={() => setIndex(i)}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        onPick(opt);
                    }}
                >
                    {opt.label}
                </li>
            ))}
        </ul>
    );
}