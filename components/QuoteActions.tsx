
export type QuoteActionsProps = {
    selectedSymbol: string | undefined;
    currentPrice: number | string | undefined;
    onUsePrice: () => void; // your existing handler
};


export default function QuoteActions({ selectedSymbol, currentPrice, onUsePrice }: QuoteActionsProps) {
    const priceNum = Number(currentPrice);


    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Existing action */}
            <button
                type="button"
                className="rounded-xl border px-3 py-2 text-sm shadow-sm hover:translate-y-[0.5px]"
                onClick={onUsePrice}
            >
                Use this price
            </button>
        </div>
    );
}