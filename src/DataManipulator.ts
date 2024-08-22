import { ServerRespond } from './DataStreamer';

export interface Row {
  timestamp: Date,
  price_abc:number,
  price_def:number,
  ratio:number,
  upper_bound:number,
  lower_bound:number,
  crossing:number|undefined
}


export class DataManipulator {
  static historicalRatios: number[] = [];  // Store historical ratios

  static generateRow(serverResponds: ServerRespond[]) {
      // Calculate the prices for ABC and DEF
      const priceABC = (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price) / 2;
      const priceDEF = (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price) / 2;
      const ratio = priceABC / priceDEF;

      // Update historical ratios (you may want to limit this to a maximum size for memory reasons)
      this.historicalRatios.push(ratio);

      // Calculate the historical average ratio
      const historicalAverageRatio = this.historicalRatios.reduce((acc, curr) => acc + curr, 0) / this.historicalRatios.length;

      // Define the threshold based on the 12-month historical average ratio
      const upperBound = historicalAverageRatio * 1.1;  // 10% above the average
      const lowerBound = historicalAverageRatio * 0.9;  // 10% below the average
      
      return {
          price_abc: priceABC,
          price_def: priceDEF,
          ratio,
          
          timestamp: serverResponds[0].timestamp > serverResponds[1].timestamp ? serverResponds[0].timestamp : serverResponds[1].timestamp,
          upper_bound: upperBound,
          lower_bound: lowerBound,
          crossing: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
      };
  }
}
