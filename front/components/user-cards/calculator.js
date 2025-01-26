// function calculateFinancials(trades, balance) {
//     let margin = 0;
//     let floatingProfitLoss = 0;

//     trades.forEach(trade => {
//         if (trade.entry && trade.unit && trade.leverage) {
//             let leverage = trade.leverage || 500;
//             let tradeMargin = (trade.entry * trade.unit) / leverage;
//             margin += tradeMargin;
//         }

//         if (trade.profit) {
//             floatingProfitLoss += trade.profit;
//         }

//         if (trade.swap) {
//             floatingProfitLoss += trade.swap;
//         }

//         if (trade.commission) {
//             floatingProfitLoss -= trade.commission;
//         }
//     });

//     let equity = balance + floatingProfitLoss;
//     let freeMargin = equity - margin;
//     let marginLevel = margin > 0 ? (equity / margin) * 100 : 0;

//     return {
//         margin: margin,
//         equity: equity,
//         freeMargin: freeMargin,
//         marginLevel: marginLevel
//     };
// }
