export function sumMoney(amounts: readonly number[]) {
  const cents = amounts.reduce((total, amount) => {
    if (!Number.isFinite(amount)) throw new Error('A financial amount is invalid.')
    return total + BigInt(Math.round(amount * 100))
  }, 0n)
  return Number(cents) / 100
}
