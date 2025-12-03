/**
 * Update Loan Use Case DTOs
 *
 * Request and Response data transfer objects for updating a loan.
 */

import { Loan } from '@/domain/entities/Loan';
import { Portfolio } from '@/domain/entities/Portfolio';

/**
 * Request to update a loan
 */
export class UpdateLoanRequest {
  constructor(
    public readonly loan: Loan
  ) {}
}

/**
 * Response from updating a loan
 */
export class UpdateLoanResponse {
  constructor(
    public readonly portfolio: Portfolio | null,
    public readonly success: boolean,
    public readonly errorMessage?: string
  ) {}
}
