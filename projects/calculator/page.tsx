import AvgPriceCalculator from '@/components/AvgPriceCalculator';

export const metadata = {
    title: 'Average Purchase Price Calculator',
    description: 'Simulate buys to see new averages and export CSV logs.',
};

export default function CalculatorProjectPage() {
    return <AvgPriceCalculator />;
}
