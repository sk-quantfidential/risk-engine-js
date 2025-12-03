/**
 * Delete Loan Use Case DTOs
 *
 * Request and Response data transfer objects for deleting a loan.
 */

import { Portfolio } from '@/domain/entities/Portfolio';

/**
 * Request to delete a loan
 */
export class DeleteLoanRequest {
  constructor(
    public readonly loanId: string
  ) {}
}

/**
 * Response from deleting a loan
 */
export class DeleteLoanResponse {
  constructor(
    public readonly portfolio: Portfolio | null,
    public readonly success: boolean,
    public readonly errorMessage?: string
  ) {}
}
