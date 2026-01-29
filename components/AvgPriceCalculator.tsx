"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, RotateCw, Download, Plus, Trash2, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* =========================
   Types
   ========================= */
type Mode = "invest" | "shares" | "target";
type Currency = "USD";

interface Nums {
    currentShares: number;
    currentAvg: number;
    price: number;
    investAmount: number;
    addShares: number;
    targetAvg: number;
}

interface CalcOk {
    newAvg: number;
    totalShares: number;
    totalCost: number;
    addedShares: number;
}

type ResultInvest = CalcOk & { kind: "invest" };
type ResultShares = CalcOk & { kind: "shares" };
type ResultTargetOk = CalcOk & { kind: "target"; needed: number };
type ResultTargetInvalid = {
    kind: "target";
    needed: number;
    newAvg: number;
    totalShares: number;
    totalCost: number;
    addedShares: number;
};
type Result = ResultInvest | ResultShares | ResultTargetOk | ResultTargetInvalid;

interface LogRow {
    mode: Mode;
    currentShares: number;
    currentAvg: number;
    price: number;
    investAmount: number | "";
    addShares: number | "";
    targetAvg: number | "";
    addedShares: number | "";
    totalShares: number | "";
    totalCost: number | "";
    newAvg: number | "";
    feeFixed: number; // in USD
    feePct: number;   // 0..100 percent
    timestamp: string;
}

/* =========================
   Utils / formatting
   ========================= */
const clampNum = (v: number): number => (Number.isFinite(v) ? v : NaN);
const toNum = (v: string): number => clampNum(parseFloat(v.replace(",", ".")));

const moneyFmtFor = (currency: Currency) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
const int0 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const oneDec = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const fmtShares = (x: number): string => {
    if (!Number.isFinite(x)) return "–";
    const nearInt = Math.abs(x - Math.round(x)) < 1e-9;
    if (nearInt) return int0.format(Math.round(x));
    const floored = Math.floor(x * 10) / 10;
    return oneDec.format(floored);
};

/* =========================
   Core math (with optional fees)
   ========================= */
function withFeesCost(tradeValue: number, feeFixed: number, feePct01: number) {
    return tradeValue + feeFixed + tradeValue * feePct01;
}

function newAvgAfterInvesting(
    currentShares: number,
    currentAvg: number,
    investAmount: number, // EXCLUDING fees
    price: number,
    feeFixed: number,
    feePct01: number,
): CalcOk {
    if (currentShares < 0 || currentAvg < 0 || investAmount < 0 || price <= 0)
        return { newAvg: NaN, totalShares: NaN, totalCost: NaN, addedShares: NaN };

    const addedShares = investAmount / price;
    const tradeValue = investAmount;
    const addCost = withFeesCost(tradeValue, feeFixed, feePct01);

    const totalCost = currentShares * currentAvg + addCost;
    const totalShares = currentShares + addedShares;
    const newAvg = totalShares === 0 ? NaN : totalCost / totalShares;
    return { newAvg, totalShares, totalCost, addedShares };
}

function newAvgAfterShares(
    currentShares: number,
    currentAvg: number,
    addShares: number,
    price: number,
    feeFixed: number,
    feePct01: number,
): CalcOk {
    const tradeValue = addShares * price;
    if (currentShares < 0 || currentAvg < 0 || addShares < 0 || price <= 0)
        return { newAvg: NaN, totalShares: NaN, totalCost: NaN, addedShares: NaN };

    const addCost = withFeesCost(tradeValue, feeFixed, feePct01);
    const totalCost = currentShares * currentAvg + addCost;
    const totalShares = currentShares + addShares;
    const newAvg = totalShares === 0 ? NaN : totalCost / totalShares;
    return { newAvg, totalShares, totalCost, addedShares: addShares };
}

// solve for trade value x that achieves target average, given fees
function tradeValueToReachTargetAvg(
    currentShares: number,
    currentAvg: number,
    targetAvg: number,
    price: number,
    feeFixed: number,
    feePct01: number,
): number {
    const S = currentShares, P = currentAvg, T = targetAvg, p = price, f = feeFixed, r = feePct01;
    if (S < 0 || P < 0 || p <= 0 || T <= 0) return NaN;
    // (SP + (1+r)x + f) / (S + x/p) = T  =>  ((1+r) - T/p) x = TS - SP - f
    const denom = (1 + r) - T / p;
    if (Math.abs(denom) < 1e-12) return Infinity;
    return (T * S - S * P - f) / denom;
}

/* =========================
   CSV helpers
   ========================= */
function toCsv(rows: Array<Record<string, string | number>>): string {
    if (!rows.length) return "";
    const headers: string[] = Object.keys(rows[0]);
    const escapeCell = (v: unknown): string => {
        if (v === null || v === undefined) return "";
        const s = String(v);
        if (s.includes('"') || s.includes(",") || s.includes("\n")) return '"' + s.replace(/"/g, '""') + '"';
        return s;
    };
    const headerLine = headers.join(",");
    const dataLines = rows.map((r) => headers.map((h) => escapeCell((r as Record<string, unknown>)[h])).join(","));
    return [headerLine, ...dataLines].join("\n");
}

/* =========================
   Component
   ========================= */
export default function AvgPriceCalculator() {
    // USD only
    const currency: Currency = "USD";
    const money = useMemo(() => moneyFmtFor(currency), []);
    const moneyStr = (x: number) => (Number.isFinite(x) ? money.format(x) : "–");

    // Inputs (blank start)
    const [currentShares, setCurrentShares] = useState("");
    const [currentAvg, setCurrentAvg] = useState("");
    const [price, setPrice] = useState("");

    const [mode, setMode] = useState<Mode>("invest");
    const [investAmount, setInvestAmount] = useState("");
    const [addShares, setAddShares] = useState("");
    const [targetAvg, setTargetAvg] = useState("");

    // Fees (optional, persisted)
    const [feeFixed, setFeeFixed] = useState(""); // in USD
    const [feePct, setFeePct] = useState("");     // percent 0..100

    // Load persisted state
    useEffect(() => {
        try {
            const raw = localStorage.getItem("avgcalc-state");
            if (raw) {
                const s = JSON.parse(raw) as Record<string, string>;
                setCurrentShares(s.currentShares ?? "");
                setCurrentAvg(s.currentAvg ?? "");
                setPrice(s.price ?? "");
                setMode((s.mode as Mode) ?? "invest");
                setInvestAmount(s.investAmount ?? "");
                setAddShares(s.addShares ?? "");
                setTargetAvg(s.targetAvg ?? "");
                setFeeFixed(s.feeFixed ?? "");
                setFeePct(s.feePct ?? "");
            }
            const rawLog = localStorage.getItem("avgcalc-log");
            if (rawLog) setLog(JSON.parse(rawLog) as LogRow[]);
        } catch { }
    }, []);

    // Persist state
    useEffect(() => {
        try {
            const s = { currentShares, currentAvg, price, mode, investAmount, addShares, targetAvg, feeFixed, feePct };
            localStorage.setItem("avgcalc-state", JSON.stringify(s));
        } catch { }
    }, [currentShares, currentAvg, price, mode, investAmount, addShares, targetAvg, feeFixed, feePct]);

    // Numbers
    const nums: Nums = useMemo(
        () => ({
            currentShares: toNum(currentShares),
            currentAvg: toNum(currentAvg),
            price: toNum(price),
            investAmount: toNum(investAmount),
            addShares: toNum(addShares),
            targetAvg: toNum(targetAvg),
        }),
        [currentShares, currentAvg, price, investAmount, addShares, targetAvg],
    );

    const feeFixedNum = toNum(feeFixed) || 0;
    const feePct01 = (toNum(feePct) || 0) / 100; // 0..1

    // Field-level validation
    const fieldErr = {
        currentShares: currentShares !== "" && (!Number.isFinite(nums.currentShares) || nums.currentShares < 0) ? "Enter a non-negative number." : null,
        currentAvg: currentAvg !== "" && (!Number.isFinite(nums.currentAvg) || nums.currentAvg < 0) ? "Enter a non-negative number." : null,
        price: price !== "" && (!Number.isFinite(nums.price) || nums.price <= 0) ? "Enter a positive number." : null,
        investAmount: mode === "invest" && investAmount !== "" && (!Number.isFinite(nums.investAmount) || nums.investAmount < 0) ? "Enter a non-negative amount." : null,
        addShares: mode === "shares" && addShares !== "" && (!Number.isFinite(nums.addShares) || nums.addShares < 0) ? "Enter a non-negative number." : null,
        targetAvg: mode === "target" && targetAvg !== "" && (!Number.isFinite(nums.targetAvg) || nums.targetAvg <= 0) ? "Enter a positive price." : null,
        feeFixed: feeFixed !== "" && (!Number.isFinite(feeFixedNum) || feeFixedNum < 0) ? "Enter a non-negative fee." : null,
        feePct: feePct !== "" && (!Number.isFinite(feePct01) || feePct01 < 0) ? "Enter a non-negative percent." : null,
    } as const;

    const anyFieldErr = Object.values(fieldErr).some(Boolean);

    // Result (fee-aware)
    const result: Result | null = useMemo(() => {
        const { currentShares: S, currentAvg: P, price: P2, investAmount: M, addShares: A, targetAvg: T } = nums;
        if (!Number.isFinite(S) || !Number.isFinite(P) || !Number.isFinite(P2)) return null;

        if (mode === "invest") {
            const r = newAvgAfterInvesting(S, P, M, P2, feeFixedNum, feePct01);
            return { ...r, kind: "invest" };
        }
        if (mode === "shares") {
            const r = newAvgAfterShares(S, P, A, P2, feeFixedNum, feePct01);
            return { ...r, kind: "shares" };
        }
        // target: solve for trade value, then apply
        const x = tradeValueToReachTargetAvg(S, P, T, P2, feeFixedNum, feePct01); // trade value (excl fees)
        if (!Number.isFinite(x) || x < 0) {
            return { kind: "target", needed: x, newAvg: NaN, totalShares: NaN, totalCost: NaN, addedShares: NaN };
        }
        const addedShares = x / P2;
        const addCost = withFeesCost(x, feeFixedNum, feePct01);
        const totalCost = S * P + addCost;
        const totalShares = S + addedShares;
        const newAvg = totalCost / totalShares;
        return { kind: "target", needed: x, addedShares, totalShares, totalCost, newAvg } as ResultTargetOk;
    }, [nums, mode, feeFixedNum, feePct01]);

    // Scenario log & CSV
    const [log, setLog] = useState<LogRow[]>([]);
    useEffect(() => {
        try {
            localStorage.setItem("avgcalc-log", JSON.stringify(log));
        } catch { }
    }, [log]);

    function addToLog() {
        if (!result || anyFieldErr) return;

        let addedShares: number | "" = "";
        let totalShares: number | "" = "";
        let totalCost: number | "" = "";
        let newAvg: number | "" = "";

        if (result.kind === "target") {
            const ok = Number.isFinite(result.needed) && result.needed >= 0;
            if (ok) {
                addedShares = result.addedShares;
                totalShares = result.totalShares;
                totalCost = Number.isFinite(result.totalCost) ? Number(result.totalCost.toFixed(6)) : "";
                newAvg = Number.isFinite(result.newAvg) ? Number(result.newAvg.toFixed(6)) : "";
            }
        } else {
            addedShares = result.addedShares;
            totalShares = result.totalShares;
            totalCost = Number.isFinite(result.totalCost) ? Number(result.totalCost.toFixed(6)) : "";
            newAvg = Number.isFinite(result.newAvg) ? Number(result.newAvg.toFixed(6)) : "";
        }

        const row: LogRow = {
            mode,
            currentShares: nums.currentShares,
            currentAvg: nums.currentAvg,
            price: nums.price,
            investAmount: mode === "invest" ? nums.investAmount : "",
            addShares: mode === "shares" ? nums.addShares : "",
            targetAvg: mode === "target" ? nums.targetAvg : "",
            addedShares,
            totalShares,
            totalCost,
            newAvg,
            feeFixed: feeFixedNum,
            feePct: feePct01 * 100 || 0,
            timestamp: new Date().toISOString(),
        };
        setLog((prev) => [row, ...prev]);
    }

    function clearLog() {
        if (typeof window !== "undefined" && !window.confirm("Clear all saved scenarios? This cannot be undone.")) return;
        setLog([]);
    }

    const displayRowForCsv = (row: LogRow): Record<string, string> => ({
        mode: row.mode,
        currentShares: fmtShares(row.currentShares),
        currentAvg: moneyStr(row.currentAvg),
        price: moneyStr(row.price),
        investAmount: typeof row.investAmount === "number" ? moneyStr(row.investAmount) : "",
        addShares: typeof row.addShares === "number" ? fmtShares(row.addShares) : "",
        targetAvg: typeof row.targetAvg === "number" ? moneyStr(row.targetAvg) : "",
        addedShares: typeof row.addedShares === "number" ? fmtShares(row.addedShares) : "",
        totalShares: typeof row.totalShares === "number" ? fmtShares(row.totalShares) : "",
        totalCost: typeof row.totalCost === "number" ? moneyStr(row.totalCost) : "",
        newAvg: typeof row.newAvg === "number" ? moneyStr(row.newAvg) : "",
        feeFixed: moneyStr(row.feeFixed),
        feePct: `${row.feePct}%`,
        timestamp: row.timestamp,
    });

    function downloadCsv() {
        const displayRows = log.map(displayRowForCsv);
        const csvBody = toCsv(displayRows);
        const bom = "\uFEFF";
        const blob = new Blob([bom + csvBody], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `avg-price-scenarios-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Dev sanity tests (unchanged + fee edge)
    useEffect(() => {
        if (process.env.NODE_ENV === "production") return;
        const approx = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) <= eps;
        try {
            const r1 = newAvgAfterInvesting(0, 0, 100, 2, 0, 0);
            console.assert(approx(r1.newAvg, 2), "Test1 avg");
            console.assert(approx(r1.totalShares, 50), "Test1 shares");
            console.assert(approx(r1.totalCost, 100), "Test1 cost");

            const r2 = newAvgAfterShares(10, 5, 10, 4, 0, 0);
            console.assert(approx(r2.newAvg, 4.5), "Test2 avg");

            const need = tradeValueToReachTargetAvg(10, 5, 4.5, 4, 0, 0);
            console.assert(approx(need, 40), "Test3 need");

            const r3 = newAvgAfterInvesting(10, 5, need, 4, 0, 0);
            console.assert(approx(r3.newAvg, 4.5), "Test3 avg");

            const r4 = newAvgAfterInvesting(0, 0, 100, 10, 2, 0.01);
            console.assert(approx(r4.addedShares, 10), "Test4 shares with fee");
            console.assert(approx(r4.totalCost, 103), "Test4 total cost with fee");

            const csv = toCsv([{ a: "plain", b: "x,y" }, { a: "A\nB", b: 'He said "hi"' }]);
            const expected = 'a,b\nplain,"x,y"\n"A\nB","He said ""hi"""';
            console.assert(csv === expected, "Test CSV escape");
        } catch (e) {
            console.error("Self-tests failed:", e);
        }
    }, []);

    return (
        <TooltipProvider>
            <div className="grid gap-6">
                {/* Toolbar */}
                <div className="flex items-center justify-between">
                    <div />
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setCurrentShares("");
                            setCurrentAvg("");
                            setPrice("");
                            setInvestAmount("");
                            setAddShares("");
                            setTargetAvg("");
                            setFeeFixed("");
                            setFeePct("");
                        }}
                        className="gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        <RotateCw className="h-4 w-4" />
                        Reset
                    </Button>
                </div>

                {/* Live Quote */}
                <QuotePanel
                    onUsePrice={(usdPrice) => {
                        setPrice(String(usdPrice));
                    }}
                    money={(x) => moneyStr(x)}
                />

                {/* Current Position */}
                <Card className="shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg dark:text-white">Your Current Position</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-3">
                            <Label className="dark:text-zinc-300">Current owned amount of shares</Label>
                            <Input
                                inputMode="decimal"
                                value={currentShares}
                                onChange={(e) => setCurrentShares(e.target.value)}
                                placeholder="e.g. 2228"
                                className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                            />
                            {fieldErr.currentShares && <p className="text-xs text-red-600 dark:text-red-400">{fieldErr.currentShares}</p>}
                        </div>
                        <div className="space-y-3">
                            <Label className="dark:text-zinc-300">Current average price per share (USD)</Label>
                            <Input
                                inputMode="decimal"
                                value={currentAvg}
                                onChange={(e) => setCurrentAvg(e.target.value)}
                                placeholder="e.g. 0.92"
                                className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                            />
                            {fieldErr.currentAvg && <p className="text-xs text-red-600 dark:text-red-400">{fieldErr.currentAvg}</p>}
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Label className="dark:text-zinc-300">Price per share for the new purchase (USD)</Label>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>This is the market price where you plan to buy more shares.</TooltipContent>
                                </Tooltip>
                            </div>
                            <Input
                                inputMode="decimal"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="e.g. 0.75"
                                className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                            />
                            {fieldErr.price && <p className="text-xs text-red-600 dark:text-red-400">{fieldErr.price}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Fees */}
                <Card className="shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg dark:text-white">Fees (optional)</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <Label className="dark:text-zinc-300">Fixed fee per order (USD)</Label>
                            <Input
                                inputMode="decimal"
                                value={feeFixed}
                                onChange={(e) => setFeeFixed(e.target.value)}
                                placeholder="e.g. 2.50"
                                className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                            />
                            {fieldErr.feeFixed && <p className="text-xs text-red-600 dark:text-red-400">{fieldErr.feeFixed}</p>}
                        </div>
                        <div className="space-y-3">
                            <Label className="dark:text-zinc-300">Fee (% of trade value)</Label>
                            <Input
                                inputMode="decimal"
                                value={feePct}
                                onChange={(e) => setFeePct(e.target.value)}
                                placeholder="e.g. 0.25"
                                className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                            />
                            {fieldErr.feePct && <p className="text-xs text-red-600 dark:text-red-400">{fieldErr.feePct}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Modes */}
                <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="invest">Invest cash</TabsTrigger>
                        <TabsTrigger value="shares">Buy shares</TabsTrigger>
                        <TabsTrigger value="target">Reach target average</TabsTrigger>
                    </TabsList>
                    <TabsContent value="invest">
                        <Card className="shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg dark:text-white">Invest a cash amount</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label className="dark:text-zinc-300">
                                        How much money will you invest (USD)? <span className="text-muted-foreground">(excludes fees)</span>
                                    </Label>
                                    <Input
                                        inputMode="decimal"
                                        value={investAmount}
                                        onChange={(e) => setInvestAmount(e.target.value)}
                                        placeholder="e.g. 500"
                                        className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                                    />
                                    {fieldErr.investAmount && <p className="text-xs text-red-600 dark:text-red-400">{fieldErr.investAmount}</p>}
                                    <div className="mt-2 flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setInvestAmount("250")} className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none">
                                            250
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setInvestAmount("500")} className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none">
                                            500
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setInvestAmount("1000")} className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none">
                                            1000
                                        </Button>
                                    </div>
                                </div>
                                {result && <SummaryBlock mode="invest" nums={nums} result={result} money={moneyStr} feeFixed={feeFixedNum} feePct01={feePct01} />}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="shares">
                        <Card className="shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg dark:text-white">Buy a number of shares</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label className="dark:text-zinc-300">How many shares will you buy?</Label>
                                    <Input
                                        inputMode="decimal"
                                        value={addShares}
                                        onChange={(e) => setAddShares(e.target.value)}
                                        placeholder="e.g. 1000"
                                        className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                                    />
                                    {fieldErr.addShares && <p className="text-xs text-red-600 dark:text-red-400">{fieldErr.addShares}</p>}
                                </div>
                                {result && <SummaryBlock mode="shares" nums={nums} result={result} money={moneyStr} feeFixed={feeFixedNum} feePct01={feePct01} />}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="target">
                        <Card className="shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg dark:text-white">Reach a target average</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label className="dark:text-zinc-300">What is your target average price (USD)?</Label>
                                    <Input
                                        inputMode="decimal"
                                        value={targetAvg}
                                        onChange={(e) => setTargetAvg(e.target.value)}
                                        placeholder="e.g. 0.85"
                                        className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                                    />
                                    {fieldErr.targetAvg && <p className="text-xs text-red-600 dark:text-red-400">{fieldErr.targetAvg}</p>}
                                </div>
                                {result && <SummaryBlock mode="target" nums={nums} result={result} money={moneyStr} feeFixed={feeFixedNum} feePct01={feePct01} />}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Log */}
                <Card className="shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg dark:text-white">Scenario Log</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={addToLog}
                                disabled={!result || anyFieldErr}
                                aria-disabled={!result || anyFieldErr}
                                className="gap-2 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                <Plus className="h-4 w-4" />
                                Add current scenario
                            </Button>
                            <Button variant="outline" onClick={downloadCsv} className="gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none">
                                <Download className="h-4 w-4" />
                                Download CSV
                            </Button>
                            <Button variant="outline" onClick={clearLog} className="gap-2 text-red-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none">
                                <Trash2 className="h-4 w-4" />
                                Clear log
                            </Button>
                        </div>
                        {log.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No scenarios yet. Calculate something and click <em>Add current scenario</em>.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/40">
                                            {Object.keys(log[0]).map((h) => (
                                                <th key={h} className="px-3 py-2 text-left font-medium">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {log.map((r, i) => (
                                            <tr key={i} className="border-t">
                                                {Object.values(r).map((v, j) => (
                                                    <td key={j} className="px-3 py-2">
                                                        {String(v)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
}

/* =========================
   Subcomponents
   ========================= */
function SummaryBlock({
    mode,
    nums,
    result,
    money,
    feeFixed,
    feePct01,
}: {
    mode: Mode;
    nums: Nums;
    result: Result;
    money: (x: number) => string;
    feeFixed: number;
    feePct01: number;
}) {
    const S = nums.currentShares;
    const P = nums.currentAvg;
    const P2 = nums.price;

    const feeLine = (tradeValue: number) => `fees ${money(feeFixed + tradeValue * feePct01)}`;

    if (mode === "target") {
        if (result.kind !== "target") return null;
        const needed = result.needed;
        const impractical = needed === Infinity || needed > 1e15;
        const negative = Number.isFinite(needed) && needed < 0;

        return (
            <div className="grid gap-3">
                <KV label="Current" value={`${fmtShares(S)} shares @ ${money(P)}`} />
                <KV label="Price (new)" value={`${money(P2)}`} />
                <KV label="Target average" value={`${money(nums.targetAvg)}`} />
                {impractical && <Warn text="At this price, the target average is asymptotic; you'd need an impractically large investment." />}
                {negative && <Warn text="Given your target and this price, you'd need to SELL to reach that average." />}
                {!impractical && !negative && (
                    <>
                        <KV label="Invest required" value={`${money(needed)} (${feeLine(needed)})`} />
                        <KV label="Added shares" value={`${fmtShares(needed / P2)}`} />
                        <KV label="New total shares" value={`${fmtShares(result.totalShares)}`} />
                        <KV label="Total cost" value={`${money(result.totalCost)}`} />
                        <StrongKV label="New average" value={`${money(result.newAvg)}`} />
                    </>
                )}
            </div>
        );
    }

    if (result.kind === "invest" || result.kind === "shares") {
        const tradeValue = result.kind === "invest" ? nums.investAmount : nums.addShares * P2;
        const addDescriptor =
            mode === "invest"
                ? `${money(nums.investAmount)} @ ${money(P2)} (${feeLine(tradeValue)})`
                : `${fmtShares(nums.addShares)} @ ${money(P2)} (cost ${money(nums.addShares * P2)} + ${feeLine(tradeValue)})`;

        return (
            <div className="grid gap-3">
                <KV label="Current" value={`${fmtShares(S)} shares @ ${money(P)}`} />
                <KV label={mode === "invest" ? "Add (cash)" : "Add (shares)"} value={addDescriptor} />
                <KV label="Added shares" value={`${fmtShares(result.addedShares)}`} />
                <KV label="New total shares" value={`${fmtShares(result.totalShares)}`} />
                <KV label="Total cost" value={`${money(result.totalCost)}`} />
                <StrongKV label="New average" value={`${money(result.newAvg)}`} />
            </div>
        );
    }

    return null;
}

function KV({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between rounded-xl border bg-white/50 px-4 py-2 dark:bg-zinc-800/60 dark:border-zinc-700">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="font-medium dark:text-white">{value}</span>
        </div>
    );
}
function StrongKV({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between rounded-xl border px-4 py-3 shadow-sm dark:bg-zinc-800/60 dark:border-zinc-700">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-lg font-semibold tracking-tight dark:text-white">{value}</span>
        </div>
    );
}
function Warn({ text }: { text: string }) {
    return (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-800 dark:bg-yellow-100/10 dark:text-yellow-300 dark:border-yellow-400">
            {text}
        </div>
    );
}

/* =========================
   Live Quote (client) – uses /api/quote and /api/symbols with debounce & autocomplete
   ========================= */
function QuotePanel({
    onUsePrice,
    money,
}: {
    onUsePrice: (usdPrice: number) => void;
    money: (x: number) => string;
}) {
    const [symbol, setSymbol] = useState("AAPL");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [data, setData] = useState<
        | null
        | {
            symbol: string;
            price: number | null;
            change: number | null;
            changePct: number | null;
            prevClose: number | null;
            name: string | null;
            exchange: string | null;
            ts: number | null;
        }
    >(null);

    // Autocomplete state
    const [q, setQ] = useState("");
    const [suggestions, setSuggestions] = useState<Array<{ symbol: string; description: string }>>([]);
    const [openSug, setOpenSug] = useState(false);
    const sugTimer = useRef<number | null>(null);

    function scheduleSearch(next: string) {
        setQ(next);
        setOpenSug(true);
        if (sugTimer.current) window.clearTimeout(sugTimer.current);
        sugTimer.current = window.setTimeout(async () => {
            if (!next || next.length < 1) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await fetch(`/api/symbols?q=${encodeURIComponent(next)}`);
                const json = await res.json();
                if (Array.isArray(json?.items)) setSuggestions(json.items.slice(0, 6));
                else setSuggestions([]);
            } catch {
                setSuggestions([]);
            }
        }, 250);
    }

    async function fetchQuote() {
        setLoading(true);
        setErr(null);
        try {
            const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to fetch");
            setData({
                symbol: json.symbol ?? symbol,
                price: Number.isFinite(json.price) ? json.price : null,
                change: Number.isFinite(json.change) ? json.change : null,
                changePct: Number.isFinite(json.changePct) ? json.changePct : null,
                prevClose: Number.isFinite(json.prevClose) ? json.prevClose : null,
                name: json.name ?? null,
                exchange: json.exchange ?? null,
                ts: Number.isFinite(json.ts) ? json.ts : null,
            });
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Error");
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    const hasDelta = data?.change !== null && data?.changePct !== null;

    return (
        <Card className="shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base dark:text-white flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Get Live Quote
                </CardTitle>
                <div className="relative flex items-center gap-2">
                    <Input
                        value={q}
                        onChange={(e) => scheduleSearch(e.target.value.toUpperCase())}
                        className="h-8 w-40 pr-10"
                        placeholder="Type ticker…"
                        aria-label="Search symbol"
                        onFocus={() => setOpenSug(true)}
                    />
                    <Button onClick={fetchQuote} variant="outline" className="h-8 px-3">
                        {loading ? "Loading…" : "Lookup"}
                    </Button>
                    {/* suggestions dropdown */}
                    {openSug && suggestions.length > 0 && (
                        <div className="absolute left-0 top-9 z-20 w-72 rounded-md border bg-white shadow-lg dark:bg-zinc-900 dark:border-zinc-700">
                            {suggestions.map((s, i) => (
                                <button
                                    key={s.symbol + i}
                                    className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        setSymbol(s.symbol);
                                        setQ(s.symbol);
                                        setOpenSug(false);
                                    }}
                                >
                                    <div className="text-sm font-medium dark:text-white">{s.symbol}</div>
                                    <div className="text-xs text-muted-foreground truncate">{s.description}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </CardHeader>

            {err && <div className="px-4 pb-3 text-xs text-red-600 dark:text-red-400">{err}</div>}

            {data && (
                <CardContent className="pt-0">
                    <div className="grid gap-1 text-sm">
                        <div className="font-medium dark:text-white">
                            {data.name ?? data.symbol} <span className="text-xs text-muted-foreground">({data.exchange ?? "—"})</span>
                        </div>
                        <div>
                            <span className="font-semibold">{data.price !== null ? money(data.price) : "—"}</span>{" "}
                            {hasDelta ? (
                                <span className={data!.change! >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                    {data!.change! >= 0 ? "+" : ""}
                                    {data!.change!.toFixed(2)} ({data!.changePct!.toFixed(2)}%)
                                </span>
                            ) : (
                                <span className="text-muted-foreground">Not available</span>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Prev close {data.prevClose !== null ? money(data.prevClose) : "—"} · {data.ts ? `Updated ${new Date(data.ts).toLocaleTimeString()}` : "Time unknown"}
                        </div>
                        <div className="mt-1">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                                disabled={data.price === null}
                                onClick={() => {
                                    if (data?.price !== null) onUsePrice(data.price);
                                }}
                            >
                                Use this price
                            </Button>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
