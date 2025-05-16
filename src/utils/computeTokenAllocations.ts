// import { NeedEntity } from "src/entities/need.entity";

// /**
//  * Compute normalized difficulty and token allocations for each need.
//  */
// export function computeTokenAllocations(needs: NeedEntity[]) {
//     // Determine global min and max for each field
//     const tcs = needs.map(n => n.t_c), tps = needs.map(n => n.t_p),
//           tos = needs.map(n => n.t_o), tds = needs.map(n => n.t_d),
//           prices = needs.map(n => n.price);
//     const minMax = (arr: number[]) => [Math.min(...arr), Math.max(...arr)];
//     const [min_t_c, max_t_c] = minMax(tcs);
//     const [min_t_p, max_t_p] = minMax(tps);
//     const [min_t_o, max_t_o] = minMax(tos);
//     const [min_t_d, max_t_d] = minMax(tds);
//     const [min_price, max_price] = minMax(prices);
  
//     // Count donor contributions for loyalty ratio
//     const donorTotalCount: Record<string, number> = {};
//     const donorChildCount: Record<string, Record<string, number>> = {};
//     for (const need of needs) {
//       for (const donor of need.donors) {
//         donorTotalCount[donor] = (donorTotalCount[donor] || 0) + 1;
//         donorChildCount[donor] = donorChildCount[donor] || {};
//         const childCounts = donorChildCount[donor];
//         childCounts[need.childId] = (childCounts[need.childId] || 0) + 1;
//       }
//     }
  
//     // Function to normalize a value
//     const normalize = (val: number, min: number, max: number) =>
//       max > min ? (val - min) / (max - min) : 0;
  
//     interface NeedAllocation { need: Need, tokens: number, allocations: Record<string, number> }
//     const results: NeedAllocation[] = [];
  
//     // Compute allocations per need
//     for (const need of needs) {
//       // Normalize durations and price
//       const ntc = normalize(need.t_c, min_t_c, max_t_c);
//       const ntp = normalize(need.t_p, min_t_p, max_t_p);
//       const nto = normalize(need.t_o, min_t_o, max_t_o);
//       const ntd = normalize(need.t_d, min_t_d, max_t_d);
//       const np = normalize(need.price, min_price, max_price);
  
//       // Difficulty = average of normalized metrics (in [0,1])
//       const difficulty = (ntc + ntp + nto + ntd + np) / 5;
  
//       // Collaboration bonus factor = 1 + 0.1*(num_donors - 1)
//       const numDonors = need.donors.length;
//       const collabFactor = 1 + 0.1 * Math.max(0, numDonors - 1);
  
//       // Tokens to mint = 100 * difficulty * collabFactor
//       const totalTokens = 100 * difficulty * collabFactor;
  
//       // **Token Allocation:**
//       // Social Worker: 20%
//       const swTokens = 0.20 * totalTokens;
  
//       // Auditor & Purchaser share 20%, split by relative speed (shorter time = larger share)
//       // Here, assume auditor task correlates with t_p, purchaser with t_o.
//       // Use inverse time (faster = higher weight).
//       const audScore = need.t_p > 0 ? 1 / need.t_p : 1;
//       const purScore = need.t_o > 0 ? 1 / need.t_o : 1;
//       const sumScore = audScore + purScore;
//       const audTokens = sumScore > 0 ? (audScore / sumScore) * 0.20 * totalTokens : 0;
//       const purTokens = sumScore > 0 ? (purScore / sumScore) * 0.20 * totalTokens : 0;
  
//       // Donors: 60%, split by loyalty weight w_i = 1 + (times donor supported this child / total donor contributions)
//       let totalWeight = 0;
//       const donorWeights: Record<string, number> = {};
//       for (const donor of need.donors) {
//         const childCount = donorChildCount[donor][need.childId] || 0;
//         const totalCount = donorTotalCount[donor] || 1;
//         const loyaltyRatio = childCount / totalCount;
//         const weight = 1 + loyaltyRatio;
//         donorWeights[donor] = weight;
//         totalWeight += weight;
//       }
//       const donorTokensPool = 0.60 * totalTokens;
//       const donorTokens: Record<string, number> = {};
//       for (const donor of need.donors) {
//         donorTokens[donor] = (donorWeights[donor] / totalWeight) * donorTokensPool;
//       }
  
//       // Compile allocations
//       const allocations: Record<string, number> = {
//         [need.socialWorker]: swTokens,
//         [need.auditor]: audTokens,
//         [need.purchaser]: purTokens
//       };
//       for (const donor of need.donors) {
//         allocations[donor] = donorTokens[donor];
//       }
  
//       results.push({ need, tokens: totalTokens, allocations });
//     }
  
//     // Summary per user (sum allocations across needs)
//     const userTotals: Record<string, number> = {};
//     for (const res of results) {
//       for (const [user, amt] of Object.entries(res.allocations)) {
//         userTotals[user] = (userTotals[user] || 0) + amt;
//       }
//     }
  
//     // Output summary (console and file)
//     console.log("Allocations per need:", results);
//     console.log("Total tokens per user:", userTotals);
  
//     fs.writeFileSync('token_allocations.json', JSON.stringify({ results, userTotals }, null, 2));
//   }
  