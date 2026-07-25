// src/core/utils/confidentiality.ts

export interface ConfidentialityCheckInput {
  sourceIsConfidential: boolean;
  targetIsConfidential: boolean;
  userSelectedConfidential?: boolean;
}

/**
 * Bepaalt of een nieuwe relatie afgeschermd moet zijn.
 * Regel: Als minstens één object vertrouwelijk is, IS de relatie vertrouwelijk.
 * Zo niet, dan geldt de keuze van de gebruiker.
 */
export function determineRelationConfidentiality(input: ConfidentialityCheckInput): boolean {
  if (input.sourceIsConfidential || input.targetIsConfidential) {
    return true; // Geforceerd vertrouwelijk
  }
  return input.userSelectedConfidential ?? false;
}