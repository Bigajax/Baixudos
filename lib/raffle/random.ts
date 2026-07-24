/**
 * Seleção aleatória de números disponíveis (pura, compartilhável cliente).
 * Usa Math.random — é só conveniência de UI. O sorteio OFICIAL da campanha
 * nunca usa isto (ver M6: apuração conforme regulamento).
 */

/**
 * Escolhe até `count` números distintos entre 1..total que NÃO estão em
 * `unavailable` (números tomados ou já selecionados). Retorna menos que
 * `count` se não houver disponíveis suficientes.
 */
export function pickRandomAvailable(
  total: number,
  unavailable: ReadonlySet<number>,
  count: number,
): number[] {
  const pool: number[] = [];
  for (let n = 1; n <= total; n++) {
    if (!unavailable.has(n)) pool.push(n);
  }

  const take = Math.min(count, pool.length);
  const result: number[] = [];
  // Fisher-Yates parcial: embaralha só o necessário.
  for (let i = 0; i < take; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
    result.push(pool[i]);
  }
  return result;
}
