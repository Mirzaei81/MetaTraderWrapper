function CalculateSummary(trades, id) {
    const result = {
        totalBuyVolume: 0,
        totalSellVolume: 0,
        totalBuyPrice: 0,
        totalSellPrice: 0,
        totalCommission: 0,
        totalSwap: 0,
        netProfitLoss: 0,
    };

    trades.forEach(trade => {
        if (trade.symbol_id === id) {
            const type = trade.type;

            if (type === 'buy') {
                result.totalBuyVolume += trade.unit;
                result.totalBuyPrice += trade.entry * trade.unit;
            } else if (type === 'sell') {
                result.totalSellVolume += trade.unit;
                result.totalSellPrice += trade.exit * trade.unit;
            }

            result.totalCommission += trade.commission;
            result.totalSwap += trade.swap;
            result.netProfitLoss += trade.profit;
        }
    });

    result.avgBuyPrice = result.totalBuyVolume > 0 ? (result.totalBuyPrice / result.totalBuyVolume) : 0;
    result.avgSellPrice = result.totalSellVolume > 0 ? (result.totalSellPrice / result.totalSellVolume) : 0;

    return result;
}

export default CalculateSummary;
